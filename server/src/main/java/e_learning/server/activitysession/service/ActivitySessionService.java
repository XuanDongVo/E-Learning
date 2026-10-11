package e_learning.server.activitysession.service;


import e_learning.server.activity.entity.*;
import e_learning.server.activity.enums.*;
import e_learning.server.activity.repository.*;
import e_learning.server.activity.service.ActivityReadinessService;
import e_learning.server.activitysession.dto.*;
import e_learning.server.activitysession.entity.*;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.activitysession.repository.*;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.exception.*;
import e_learning.server.content.question.entity.ContentQuestion;
import e_learning.server.content.question.repository.ContentQuestionRepository;
import e_learning.server.question.entity.*;
import e_learning.server.question.repository.*;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.JsonNode;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ActivitySessionService {
    private static final int NETWORK_GRACE_SECONDS = 5;
    private final ActivityRepository activityRepository;
    private final ActivityBankRepository activityBankRepository;
    private final ActivityReadinessService readinessService;
    private final ContentQuestionRepository contentQuestionRepository;
    private final ActivitySessionRepository sessionRepository;
    private final ActivitySessionQuestionRepository sessionQuestionRepository;
    private final ClassMemberRepository classMemberRepository;
    private final UserRepository userRepository;
    private final QuestionOptionRepository optionRepository;
    private final QuestionAnswerRepository answerRepository;

    @Transactional(readOnly = true)
    public ActivitySessionOptionsResponse options(Long activityId, Long studentId) {
        User student = userRepository.findById(studentId).orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        Activity activity = activityRepository.findById(activityId).orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
        if (activity.getStatus() != ActivityStatus.PUBLISHED
                || !readinessService.validateForPublish(activity).isReady()
                || !hasCurrentGradeAccess(student.getId(), activity.getUnit().getGrade().getId())) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACCESSIBLE);
        }
        return new ActivitySessionOptionsResponse(activity.getId(), activity.getMode(), activity.getQuestionDifficulty(),
                activity.getAvailableSelectionStrategies(), activity.getTimeLimitSeconds(), activity.getLives());
    }

    @Transactional
    public ActivitySessionResponse start(Long activityId, Long studentId, ActivitySessionStartRequest request) {
        User student = userRepository.findById(studentId).orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        Activity activity = activityRepository.findById(activityId).orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_NOT_FOUND));
        if (activity.getStatus() != ActivityStatus.PUBLISHED
                || !readinessService.validateForPublish(activity).isReady()
                || !hasCurrentGradeAccess(studentId, activity.getUnit().getGrade().getId())) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACCESSIBLE);
        }

        ActivityMode mode = resolveMode(activity, request == null ? null : request.mode());
        SelectionStrategy strategy = resolveStrategy(activity, request == null ? null : request.selectionStrategy());
        sessionRepository.findAllByStudentIdAndStatusIn(studentId,
                        List.of(ActivitySessionStatus.IN_PROGRESS))
                .forEach(open -> abandon(open));

        List<Question> selected = selectQuestions(activity);
        ActivitySession session = new ActivitySession(student, activity, mode, strategy, selected.size(),
                mode == ActivityMode.TRY_HARD ? activity.getLives() : null);
        for (int i = 0; i < selected.size(); i++) session.addQuestion(new ActivitySessionQuestion(selected.get(i), i));
        ActivitySession saved = sessionRepository.save(session);
        serveCurrent(saved);
        return toResponse(saved);
    }

    @Transactional
    public ActivitySessionResponse get(Long sessionId, Long studentId) {
        ActivitySession session = ownSession(sessionId, studentId);
        if (session.getStatus() == ActivitySessionStatus.IN_PROGRESS) {
            requireCurrentGradeAccess(session, studentId);
            serveCurrent(session);
        }
        return toResponse(session);
    }

    @Transactional
    public ActivitySessionAnswerResponse answer(Long sessionId, Long questionId, Long studentId,
                                                ActivitySessionAnswerRequest request) {
        ActivitySession session = ownSession(sessionId, studentId);
        requireActive(session);
        requireCurrentGradeAccess(session, studentId);
        ActivitySessionQuestion item = question(sessionId, questionId);
        if (item.isResolved()) throw new AppException(ErrorCode.ACTIVITY_SESSION_RETRY_EXHAUSTED);
        serve(item, session.getActivity());
        boolean timedOut = isTimedOut(item);
        boolean correct = !timedOut && isCorrect(item.getQuestion(), request.answer());
        int attempt = item.getAnswerAttempts() + 1;
        item.setAnswerAttempts(attempt);
        boolean retry = session.getMode() == ActivityMode.LEARNING && !correct && attempt == 1;
        boolean reveal = false;
        if (attempt == 1 && correct) {
            item.setFirstCorrect(true);
            item.setFinalCorrect(true);
            item.setResolved(true);
            session.setFirstCorrectCount(session.getFirstCorrectCount() + 1);
            session.setFinalCorrectCount(session.getFinalCorrectCount() + 1);
        } else if (retry) {
            item.setFirstCorrect(false);
        } else {
            item.setFinalCorrect(correct);
            item.setResolved(true);
            reveal = !correct;
            if (Boolean.FALSE.equals(item.getFirstCorrect())) {
                // A correct retry is final-correct but is not first-correct.
                if (correct) session.setFinalCorrectCount(session.getFinalCorrectCount() + 1);
            } else if (correct) {
                session.setFinalCorrectCount(session.getFinalCorrectCount() + 1);
            }
            if (session.getMode() == ActivityMode.TRY_HARD && !correct && !timedOut) {
                session.setLives(session.getLives() - 1);
                if (session.getLives() <= 0) {
                    session.setStatus(ActivitySessionStatus.GAME_OVER);
                    session.setCompletedAt(LocalDateTime.now());
                    session.setScore(score(session));
                }
            }
        }
        if (session.getStatus() == ActivitySessionStatus.IN_PROGRESS
                && session.getQuestions().stream().allMatch(ActivitySessionQuestion::isResolved)) complete(session);
        sessionRepository.save(session);
        String correctAnswer = reveal ? correctAnswer(item.getQuestion()) : null;
        String explanation = reveal ? item.getQuestion().getExplanation() : null;
        return new ActivitySessionAnswerResponse(toResponse(session), correct, retry, reveal, correctAnswer, explanation);
    }

    @Transactional
    public ActivitySessionHintResponse hint(Long sessionId, Long questionId, Long studentId) {
        ActivitySession session = ownSession(sessionId, studentId);
        requireActive(session);
        requireCurrentGradeAccess(session, studentId);
        if (session.getMode() != ActivityMode.LEARNING)
            throw new AppException(ErrorCode.ACTIVITY_SESSION_HINT_UNAVAILABLE);
        ActivitySessionQuestion item = question(sessionId, questionId);
        if (item.isResolved() || item.getQuestion().getHint() == null || item.getQuestion().getHint().isBlank()) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_HINT_UNAVAILABLE);
        }
        if (!item.isHintUsed()) {
            item.setHintUsed(true);
            session.setHintUsedCount(session.getHintUsedCount() + 1);
            sessionRepository.save(session);
        }
        return new ActivitySessionHintResponse(toResponse(session), item.getQuestion().getHint());
    }

    @Transactional
    public ActivitySessionResponse finish(Long sessionId, Long studentId) {
        ActivitySession session = ownSession(sessionId, studentId);
        requireActive(session);
        requireCurrentGradeAccess(session, studentId);
        if (session.getQuestions().stream().allMatch(ActivitySessionQuestion::isResolved)) complete(session);
        else abandon(session);
        sessionRepository.save(session);
        return toResponse(session);
    }

    @Transactional(readOnly = true)
    public ActivitySessionResultResponse result(Long sessionId, Long studentId) {
        ActivitySession session = ownSession(sessionId, studentId);
        if (session.getStatus() == ActivitySessionStatus.IN_PROGRESS)
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACTIVE);
        return new ActivitySessionResultResponse(session.getId(), session.getStatus(), session.getMode(),
                session.getSelectionStrategy(), session.getTotalQuestions(), session.getFirstCorrectCount(),
                session.getFinalCorrectCount(), session.getHintUsedCount(), session.getScore(), session.getLives());
    }

    private List<Question> selectQuestions(Activity activity) {
        List<ActivityBank> banks = activityBankRepository.findByActivityIdOrderByDisplayOrderAsc(activity.getId());
        Map<Long, Integer> allocations = e_learning.server.activity.distribution.ActivityDistributionCalculator.calculate(activity, banks);
        List<Question> result = new ArrayList<>();
        for (ActivityBank bank : banks) {
            List<Question> pool = contentQuestionRepository
                    .findAllByQuestionBankIdAndQuestionCompleteTrueOrderByQuestionIdAsc(bank.getQuestionBank().getId())
                    .stream().map(ContentQuestion::getQuestion)
                    .filter(question -> activity.getQuestionDifficulty() == ActivityDifficulty.MIXED
                            || question.getDifficulty().name().equals(activity.getQuestionDifficulty().name()))
                    .collect(java.util.stream.Collectors.toCollection(ArrayList::new));
            Collections.shuffle(pool);
            int count = allocations.getOrDefault(bank.getQuestionBank().getId(), 0);
            if (pool.size() < count) throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_READY);
            result.addAll(pool.subList(0, count));
        }
        Collections.shuffle(result);
        return result;
    }

    private ActivityMode resolveMode(Activity activity, ActivityMode requested) {
        if (activity.getMode() == ActivityMode.BOTH) {
            if (requested == null || requested == ActivityMode.BOTH)
                throw new AppException(ErrorCode.ACTIVITY_SESSION_INVALID_MODE);
            return requested;
        }
        if (requested != null && requested != activity.getMode())
            throw new AppException(ErrorCode.ACTIVITY_SESSION_INVALID_MODE);
        return activity.getMode();
    }

    private SelectionStrategy resolveStrategy(Activity activity, SelectionStrategy requested) {
        List<SelectionStrategy> available = activity.getAvailableSelectionStrategies();
        if (available.size() > 1 && requested == null)
            throw new AppException(ErrorCode.ACTIVITY_SESSION_INVALID_STRATEGY);
        SelectionStrategy selected = requested == null ? available.get(0) : requested;
        if (!available.contains(selected)) throw new AppException(ErrorCode.ACTIVITY_SESSION_INVALID_STRATEGY);
        return selected;
    }

    private void serveCurrent(ActivitySession session) {
        session.getQuestions().stream().filter(q -> !q.isResolved()).findFirst()
                .ifPresent(q -> serve(q, session.getActivity()));
    }

    private void serve(ActivitySessionQuestion item, Activity activity) {
        if (item.getServedAt() != null) return;
        LocalDateTime now = LocalDateTime.now();
        item.setServedAt(now);
        if (activity.getMode() != ActivityMode.LEARNING && item.getSession().getMode() == ActivityMode.TRY_HARD)
            item.setDeadlineAt(now.plusSeconds(activity.getTimeLimitSeconds()));
    }

    private boolean isTimedOut(ActivitySessionQuestion item) {
        return item.getDeadlineAt() != null && LocalDateTime.now().isAfter(item.getDeadlineAt().plusSeconds(NETWORK_GRACE_SECONDS));
    }

    private boolean isCorrect(Question question, JsonNode node) {
        if (node == null) return false;
        if (question.getType() == e_learning.server.question.enums.QuestionType.MULTIPLE_CHOICE) {
            Set<String> submitted = new TreeSet<>();
            node.forEach(n -> submitted.add(n.asText().trim().toUpperCase()));
            Set<String> expected = optionRepository.findByQuestionId(question.getId()).stream().filter(QuestionOption::isCorrect)
                    .map(QuestionOption::getOptionKey).collect(java.util.stream.Collectors.toCollection(TreeSet::new));
            return submitted.equals(expected);
        }
        String value = node.isArray() ? node.toString() : node.asText().trim();
        if (question.getType() == e_learning.server.question.enums.QuestionType.SINGLE_CHOICE) {
            return optionRepository.findByQuestionId(question.getId()).stream()
                    .anyMatch(o -> o.getOptionKey().equalsIgnoreCase(value) && o.isCorrect());
        }
        return answerRepository.findByQuestionId(question.getId()).stream()
                .anyMatch(a -> a.getNormalizedValue().equals(value.toLowerCase(Locale.ROOT)));
    }

    private String correctAnswer(Question question) {
        if (question.getType() == e_learning.server.question.enums.QuestionType.SINGLE_CHOICE
                || question.getType() == e_learning.server.question.enums.QuestionType.MULTIPLE_CHOICE)
            return optionRepository.findByQuestionId(question.getId()).stream().filter(QuestionOption::isCorrect)
                    .map(QuestionOption::getOptionKey).sorted().collect(java.util.stream.Collectors.joining(","));
        return answerRepository.findByQuestionId(question.getId()).stream().map(QuestionAnswer::getRawValue)
                .collect(java.util.stream.Collectors.joining(", "));
    }

    private void complete(ActivitySession session) {
        session.setStatus(ActivitySessionStatus.COMPLETED);
        session.setCompletedAt(LocalDateTime.now());
        session.setScore(score(session));
    }

    private BigDecimal score(ActivitySession session) {
        return BigDecimal.valueOf(session.getFinalCorrectCount() * 100.0 / session.getTotalQuestions())
                .setScale(2, RoundingMode.HALF_UP);
    }

    private void abandon(ActivitySession session) {
        session.setStatus(ActivitySessionStatus.ABANDONED);
        session.setCompletedAt(LocalDateTime.now());
    }

    private ActivitySession ownSession(Long id, Long studentId) {
        ActivitySession session = sessionRepository.findById(id).orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_SESSION_NOT_FOUND));
        if (!session.getStudent().getId().equals(studentId)) throw new AppException(ErrorCode.FORBIDDEN);
        return session;
    }

    private ActivitySessionQuestion question(Long sessionId, Long questionId) {
        return sessionQuestionRepository.findByIdAndSessionId(questionId, sessionId)
                .orElseThrow(() -> new AppException(ErrorCode.ACTIVITY_SESSION_QUESTION_NOT_FOUND));
    }

    private boolean hasCurrentGradeAccess(Long studentId, Long gradeId) {
        return classMemberRepository.findActiveMembershipByUserId(studentId)
                .map(member -> member.getClassEntity().getGrade().getId().equals(gradeId))
                .orElse(false);
    }

    private void requireCurrentGradeAccess(ActivitySession session, Long studentId) {
        if (!hasCurrentGradeAccess(studentId, session.getActivity().getUnit().getGrade().getId())) {
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACCESSIBLE);
        }
    }

    private void requireActive(ActivitySession session) {
        if (session.getStatus() != ActivitySessionStatus.IN_PROGRESS)
            throw new AppException(ErrorCode.ACTIVITY_SESSION_NOT_ACTIVE);
    }

    private ActivitySessionResponse toResponse(ActivitySession session) {
        return new ActivitySessionResponse(session.getId(), session.getStatus(), session.getMode(), session.getSelectionStrategy(),
                session.getStartedAt(), session.getCompletedAt(), session.getTotalQuestions(), session.getFirstCorrectCount(),
                session.getFinalCorrectCount(), session.getHintUsedCount(), session.getScore(), session.getLives(),
                session.getQuestions().stream().map(this::toQuestionResponse).toList());
    }

    private ActivitySessionQuestionResponse toQuestionResponse(ActivitySessionQuestion item) {
        List<ActivitySessionQuestionResponse.Option> options = optionRepository.findByQuestionId(item.getQuestion().getId()).stream()
                .map(o -> new ActivitySessionQuestionResponse.Option(o.getOptionKey(), o.getContent())).toList();
        return new ActivitySessionQuestionResponse(item.getId(), item.getPosition(), item.getQuestion().getType(),
                item.getQuestion().getContent(), options, item.getDeadlineAt(), item.isResolved(),
                item.getAnswerAttempts(), item.getFirstCorrect(), item.getFinalCorrect(), item.isHintUsed(), item.getQuestion().getHint() != null && !item.getQuestion().getHint().isBlank());
    }
}
