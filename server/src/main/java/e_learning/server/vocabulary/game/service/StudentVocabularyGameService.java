package e_learning.server.vocabulary.game.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.media.enums.MediaStatus;
import e_learning.server.content.media.repository.MediaRepository;
import e_learning.server.content.media.service.CloudinaryMediaService;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.repository.UnitRepository;
import e_learning.server.gamification.profile.entity.StudentGamificationProfile;
import e_learning.server.gamification.profile.repository.StudentGamificationProfileRepository;
import e_learning.server.gamification.xp.entity.XpSourceType;
import e_learning.server.gamification.xp.entity.XpTransaction;
import e_learning.server.gamification.xp.repository.XpTransactionRepository;
import e_learning.server.grades.repository.GradeRepository;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import e_learning.server.vocabulary.entity.VocabularyWord;
import e_learning.server.vocabulary.game.dto.*;
import e_learning.server.vocabulary.game.entity.VocabularyGameAnswer;
import e_learning.server.vocabulary.game.entity.VocabularyGameSession;
import e_learning.server.vocabulary.game.enums.GameMode;
import e_learning.server.vocabulary.game.enums.GameSessionStatus;
import e_learning.server.vocabulary.game.enums.GameType;
import e_learning.server.vocabulary.game.repository.VocabularyGameAnswerRepository;
import e_learning.server.vocabulary.game.repository.VocabularyGameSessionRepository;
import e_learning.server.vocabulary.repository.VocabularyWordRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class StudentVocabularyGameService {

    private final GradeRepository gradeRepository;
    private final UnitRepository unitRepository;
    private final VocabularyWordRepository vocabularyWordRepository;
    private final VocabularyGameSessionRepository gameSessionRepository;
    private final VocabularyGameAnswerRepository gameAnswerRepository;
    private final UserRepository userRepository;
    private final StudentGamificationProfileRepository gamificationProfileRepository;
    private final XpTransactionRepository xpTransactionRepository;
    private final MediaRepository mediaRepository;
    private final CloudinaryMediaService cloudinaryMediaService;

    @Transactional(readOnly = true)
    public List<GameGradeDto> getGrades() {
        return gradeRepository.findAllByStatusOrderByDisplayOrderAsc(e_learning.server.grades.entity.GradeStatus.ACTIVE)
                .stream()
                .map(g -> GameGradeDto.builder()
                        .id(g.getId())
                        .code(g.getCode())
                        .name(g.getName())
                        .build())
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GameUnitSummaryDto> getUnitsByGrade(Long gradeId) {
        List<Unit> units = unitRepository.findAllByGradeIdAndStatusOrderByDisplayOrderAsc(gradeId, e_learning.server.content.common.enums.ContentStatus.PUBLISHED);
        return units.stream().map(u -> {
            long count = vocabularyWordRepository.countByUnitIdAndStatus(u.getId(), "ACTIVE");
            String coverUrl = null;
            if (u.getCoverMediaId() != null) {
                try {
                    coverUrl = mediaRepository.findById(u.getCoverMediaId())
                            .filter(media -> media.getStatus() == MediaStatus.READY)
                            .map(media -> cloudinaryMediaService.generatedUrl(
                                    media.getPublicId(),
                                    media.getResourceType(),
                                    media.getFormat()
                            ))
                            .orElse(null);
                } catch (Exception e) {
                    log.warn("Failed to get cover image for unit {}: {}", u.getId(), e.getMessage());
                }
            }
            return GameUnitSummaryDto.builder()
                    .id(u.getId())
                    .code(u.getCode())
                    .name(u.getName())
                    .description(u.getDescription())
                    .coverMediaId(u.getCoverMediaId())
                    .coverUrl(coverUrl)
                    .displayOrder(u.getDisplayOrder())
                    .vocabularyCount(count)
                    .build();
        }).toList();
    }

    @Transactional
    public StartGameSessionResponse startSession(Long studentId, StartGameSessionRequest request) {
        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));

        Unit unit = unitRepository.findById(request.unitId())
                .orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));

        List<VocabularyWord> words = vocabularyWordRepository.findByUnitIdAndStatusOrderByDisplayOrderAsc(unit.getId(), "ACTIVE");
        if (words.isEmpty()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        GameMode mode = request.mode() != null ? request.mode() : GameMode.PRACTICE;

        VocabularyGameSession session = VocabularyGameSession.builder()
                .student(student)
                .unit(unit)
                .gameType(request.gameType())
                .mode(mode)
                .status(GameSessionStatus.IN_PROGRESS)
                .totalWords(words.size())
                .build();

        session = gameSessionRepository.save(session);

        // Prepare distractors for Bubble Pop
        List<String> allOtherWords = words.stream().map(VocabularyWord::getWord).collect(Collectors.toList());
        List<GamePlayWordDto> playWords = new ArrayList<>();

        for (VocabularyWord vw : words) {
            List<String> distractors = new ArrayList<>();
            if (request.gameType() == GameType.BUBBLE_POP) {
                List<String> pool = new ArrayList<>(allOtherWords);
                pool.remove(vw.getWord());
                Collections.shuffle(pool);
                distractors = pool.stream().limit(3).collect(Collectors.toList());
            }

            playWords.add(GamePlayWordDto.builder()
                    .id(vw.getId())
                    .word(vw.getWord())
                    .meaningVi(vw.getMeaningVi())
                    .pronunciation(vw.getPronunciation())
                    .partOfSpeech(vw.getPartOfSpeech())
                    .exampleSentence(vw.getExampleSentence())
                    .exampleMeaningVi(vw.getExampleMeaningVi())
                    .audioUrl(vw.getAudioUrl())
                    .imageUrl(vw.getImageUrl())
                    .distractors(distractors)
                    .build());
        }

        Collections.shuffle(playWords);

        return StartGameSessionResponse.builder()
                .sessionId(session.getId())
                .unitId(unit.getId())
                .unitName(unit.getName())
                .unitCode(unit.getCode())
                .gameType(session.getGameType())
                .mode(session.getMode())
                .words(playWords)
                .build();
    }

    @Transactional
    public FinishGameSessionResponse finishSession(Long studentId, Long sessionId, FinishGameSessionRequest request) {
        VocabularyGameSession session = gameSessionRepository.findByIdAndStudentId(sessionId, studentId)
                .orElseThrow(() -> new AppException(ErrorCode.INVALID_REQUEST));

        if (session.getStatus() != GameSessionStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }

        int firstTryCount = 0;
        int totalScore = 0;
        List<WordSummaryDto> wordsMastered = new ArrayList<>();
        List<WordSummaryDto> wordsToReview = new ArrayList<>();

        Map<Long, WordAnswerResultDto> answersMap = new HashMap<>();
        if (request.answers() != null) {
            for (WordAnswerResultDto ans : request.answers()) {
                answersMap.put(ans.wordId(), ans);
            }
        }

        List<VocabularyWord> unitWords = vocabularyWordRepository.findByUnitIdAndStatusOrderByDisplayOrderAsc(session.getUnit().getId(), "ACTIVE");

        for (VocabularyWord vw : unitWords) {
            WordAnswerResultDto ans = answersMap.get(vw.getId());
            boolean firstTry = ans != null && Boolean.TRUE.equals(ans.firstTryCorrect());
            int attempts = ans != null && ans.attemptsCount() != null ? ans.attemptsCount() : 1;
            int responseTime = ans != null ? ans.responseTimeMs() : 0;

            VocabularyGameAnswer gameAnswer = VocabularyGameAnswer.builder()
                    .session(session)
                    .word(vw)
                    .firstTryCorrect(firstTry)
                    .attemptsCount(attempts)
                    .responseTimeMs(responseTime)
                    .build();
            gameAnswerRepository.save(gameAnswer);

            if (firstTry) {
                firstTryCount++;
                totalScore += 10;
                wordsMastered.add(WordSummaryDto.builder()
                        .id(vw.getId())
                        .word(vw.getWord())
                        .meaningVi(vw.getMeaningVi())
                        .pronunciation(vw.getPronunciation())
                        .audioUrl(vw.getAudioUrl())
                        .firstTryCorrect(true)
                        .build());
            } else {
                totalScore += 5; // partial score for practicing
                wordsToReview.add(WordSummaryDto.builder()
                        .id(vw.getId())
                        .word(vw.getWord())
                        .meaningVi(vw.getMeaningVi())
                        .pronunciation(vw.getPronunciation())
                        .audioUrl(vw.getAudioUrl())
                        .firstTryCorrect(false)
                        .build());
            }
        }

        int totalWords = unitWords.size();
        BigDecimal accuracy = totalWords > 0
                ? BigDecimal.valueOf((firstTryCount * 100.0) / totalWords).setScale(2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        // Calculate XP reward: Base completion (10 XP) + First try bonus (2 XP each)
        int earnedXp = 10 + (firstTryCount * 2);

        session.setStatus(GameSessionStatus.COMPLETED);
        session.setTotalWords(totalWords);
        session.setFirstTryCorrect(firstTryCount);
        session.setAccuracyPercentage(accuracy);
        session.setTotalScore(totalScore);
        session.setEarnedXp(earnedXp);
        session.setTimeSpentSeconds(request.timeSpentSeconds() != null ? request.timeSpentSeconds() : 0);
        session.setFinishedAt(LocalDateTime.now());
        gameSessionRepository.save(session);

        // Idempotent XP grant via profile
        awardGameXp(studentId, session.getId(), earnedXp, session.getGameType());

        return FinishGameSessionResponse.builder()
                .sessionId(session.getId())
                .unitId(session.getUnit().getId())
                .unitName(session.getUnit().getName())
                .gameType(session.getGameType())
                .totalWords(totalWords)
                .firstTryCorrect(firstTryCount)
                .accuracyPercentage(accuracy)
                .totalScore(totalScore)
                .earnedXp(earnedXp)
                .timeSpentSeconds(session.getTimeSpentSeconds())
                .wordsMastered(wordsMastered)
                .wordsToReview(wordsToReview)
                .build();
    }

    private void awardGameXp(Long studentId, Long sessionId, int earnedXp, GameType gameType) {
        if (earnedXp <= 0) return;
        try {
            gamificationProfileRepository.insertIfAbsent(studentId);
            Optional<StudentGamificationProfile> profileOpt = gamificationProfileRepository.findWithLockByStudentId(studentId);
            if (profileOpt.isPresent()) {
                StudentGamificationProfile profile = profileOpt.get();
                profile.setLifetimeXp(profile.getLifetimeXp() + earnedXp);
                gamificationProfileRepository.save(profile);

                String idempotencyKey = "VOCAB_GAME_SESSION_" + sessionId;
                XpTransaction tx = new XpTransaction(
                        studentId,
                        XpSourceType.OTHER,
                        sessionId,
                        earnedXp,
                        idempotencyKey
                );
                xpTransactionRepository.save(tx);
            }
        } catch (Exception e) {
            log.warn("Failed to credit game XP for student {} session {}: {}", studentId, sessionId, e.getMessage());
        }
    }
}
