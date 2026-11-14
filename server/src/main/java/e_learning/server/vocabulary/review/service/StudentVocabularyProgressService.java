package e_learning.server.vocabulary.review.service;

import e_learning.server.content.unit.dto.student.StudentUnitSummaryResponse;
import e_learning.server.content.unit.service.StudentUnitService;
import e_learning.server.vocabulary.enums.VocabularyStatus;
import e_learning.server.vocabulary.repository.VocabularyWordRepository;
import e_learning.server.vocabulary.review.dto.VocabularyProgressDashboardResponse;
import e_learning.server.vocabulary.review.entity.StudentVocabularyProgress;
import e_learning.server.vocabulary.review.repository.StudentVocabularyProgressRepository;
import e_learning.server.vocabulary.review.repository.VocabularyReviewLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.LocalDate;
import java.time.ZoneId;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

/**
 * Read-only aggregation service for the student Vocabulary Progress dashboard.
 *
 * The dashboard is scoped to the student's published, grade-visible Units. Review
 * history is aggregated by the database; only the student's current FSRS cards are
 * loaded for due-date and learned-card projections.
 */
@Service
@RequiredArgsConstructor
public class StudentVocabularyProgressService {
    private static final ZoneId STUDENT_ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    private static final int DAILY_TARGET = 5;
    private static final int UPCOMING_REVIEW_DAYS = 7;
    private static final int ACTIVITY_DAYS = 84;
    private static final int UNIT_PROGRESS_LIMIT = 3;
    private static final int ATTENTION_WORD_LIMIT = 12;

    private final StudentUnitService studentUnitService;
    private final VocabularyWordRepository wordRepository;
    private final StudentVocabularyProgressRepository progressRepository;
    private final VocabularyReviewLogRepository reviewLogRepository;

    @Transactional(readOnly = true)
    public VocabularyProgressDashboardResponse getDashboard(Long studentId) {
        List<StudentUnitSummaryResponse> visibleUnits = studentUnitService.getMyUnits(studentId);
        if (visibleUnits.isEmpty()) {
            return emptyDashboard();
        }

        List<Long> visibleUnitIds = visibleUnits.stream()
                .map(StudentUnitSummaryResponse::id)
                .toList();
        Instant now = Instant.now();
        LocalDate today = now.atZone(STUDENT_ZONE).toLocalDate();

        List<StudentVocabularyProgress> progress = progressRepository
                .findAllByStudentIdAndWordUnitIdIn(studentId, visibleUnitIds);
        Set<Long> visibleUnitIdSet = new HashSet<>(visibleUnitIds);
        List<StudentVocabularyProgress> activeProgress = progress.stream()
                .filter(value -> value.getWord().getStatus() == VocabularyStatus.ACTIVE)
                .filter(value -> visibleUnitIdSet.contains(value.getWord().getUnit().getId()))
                .toList();

        Map<Long, VocabularyWordRepository.StudentUnitVocabularyCounts> countsByUnit =
                wordRepository.countStudentUnitVocabulary(studentId, visibleUnitIds, now)
                        .stream()
                        .collect(Collectors.toMap(
                                VocabularyWordRepository.StudentUnitVocabularyCounts::getUnitId,
                                value -> value));

        List<VocabularyReviewLogRepository.QualifiedDayCount> dayCounts =
                reviewLogRepository.findQualifiedDayCounts(studentId, visibleUnitIds);
        Map<LocalDate, Integer> qualifiedWordCounts = dayCounts.stream()
                .collect(Collectors.toMap(
                        VocabularyReviewLogRepository.QualifiedDayCount::getReviewDate,
                        value -> value.getDistinctWordCount().intValue()));

        List<LocalDate> qualifiedDates = qualifiedWordCounts.entrySet().stream()
                .filter(entry -> entry.getValue() >= DAILY_TARGET)
                .map(Map.Entry::getKey)
                .sorted()
                .toList();
        StreakSummary streak = calculateStreak(qualifiedDates, today);

        return new VocabularyProgressDashboardResponse(
                today,
                STUDENT_ZONE.getId(),
                new VocabularyProgressDashboardResponse.Today(
                        qualifiedWordCounts.getOrDefault(today, 0),
                        DAILY_TARGET,
                        qualifiedWordCounts.getOrDefault(today, 0) >= DAILY_TARGET,
                        countDueNow(activeProgress, now)),
                buildOverview(visibleUnits, countsByUnit, activeProgress),
                buildMemoryTree(streak),
                buildUpcomingReviews(activeProgress, today),
                buildActivityDays(qualifiedWordCounts, today),
                buildUnitProgress(studentId, visibleUnits, countsByUnit),
                buildAttentionWords(studentId, visibleUnitIds)
        );
    }

    private VocabularyProgressDashboardResponse.Overview buildOverview(
            List<StudentUnitSummaryResponse> visibleUnits,
            Map<Long, VocabularyWordRepository.StudentUnitVocabularyCounts> countsByUnit,
            List<StudentVocabularyProgress> activeProgress) {
        long total = 0;
        long newWords = 0;
        for (StudentUnitSummaryResponse unit : visibleUnits) {
            VocabularyWordRepository.StudentUnitVocabularyCounts counts = countsByUnit.get(unit.id());
            if (counts != null) {
                total += counts.getTotalCount();
                newWords += counts.getNewCount();
            }
        }
        return new VocabularyProgressDashboardResponse.Overview(
                total,
                activeProgress.stream().map(progress -> progress.getWord().getId()).distinct().count(),
                newWords);
    }

    private List<VocabularyProgressDashboardResponse.UnitProgress> buildUnitProgress(
            Long studentId,
            List<StudentUnitSummaryResponse> visibleUnits,
            Map<Long, VocabularyWordRepository.StudentUnitVocabularyCounts> countsByUnit) {
        List<Long> visibleUnitIds = visibleUnits.stream()
                .map(StudentUnitSummaryResponse::id)
                .toList();
        Map<Long, StudentUnitSummaryResponse> unitsById = visibleUnits.stream()
                .collect(Collectors.toMap(StudentUnitSummaryResponse::id, value -> value));

        return reviewLogRepository.findRecentlyReviewedUnits(
                        studentId,
                        visibleUnitIds,
                        PageRequest.of(0, UNIT_PROGRESS_LIMIT))
                .stream()
                .map(recent -> {
                    StudentUnitSummaryResponse unit = unitsById.get(recent.getUnitId());
                    VocabularyWordRepository.StudentUnitVocabularyCounts counts =
                            countsByUnit.get(recent.getUnitId());
                    if (unit == null || counts == null) {
                        return null;
                    }
                    return new VocabularyProgressDashboardResponse.UnitProgress(
                            unit.id(),
                            unit.code(),
                            unit.name(),
                            counts.getTotalCount(),
                            counts.getTotalCount() - counts.getNewCount(),
                            counts.getNewCount(),
                            counts.getDueCount());
                })
                .filter(value -> value != null)
                .toList();
    }

    private List<VocabularyProgressDashboardResponse.AttentionWord> buildAttentionWords(
            Long studentId, List<Long> visibleUnitIds) {
        return reviewLogRepository.findAttentionWords(
                        studentId,
                        visibleUnitIds,
                        PageRequest.of(0, ATTENTION_WORD_LIMIT))
                .stream()
                .map(value -> new VocabularyProgressDashboardResponse.AttentionWord(
                        value.getWordId(),
                        value.getWord(),
                        value.getMeaningVi(),
                        value.getUnitId(),
                        value.getUnitName(),
                        value.getAgainCount().intValue(),
                        value.getHardCount().intValue(),
                        value.getDueAt()))
                .toList();
    }

    private List<VocabularyProgressDashboardResponse.ReviewDay> buildUpcomingReviews(
            List<StudentVocabularyProgress> progress, LocalDate today) {
        Map<LocalDate, Long> counts = new HashMap<>();
        for (StudentVocabularyProgress value : progress) {
            if (value.getDueAt() == null) {
                continue;
            }
            LocalDate dueDate = value.getDueAt().atZone(STUDENT_ZONE).toLocalDate();
            if (!dueDate.isBefore(today) && dueDate.isBefore(today.plusDays(UPCOMING_REVIEW_DAYS))) {
                counts.merge(dueDate, 1L, Long::sum);
            }
        }
        List<VocabularyProgressDashboardResponse.ReviewDay> result = new ArrayList<>();
        for (int offset = 0; offset < UPCOMING_REVIEW_DAYS; offset++) {
            LocalDate date = today.plusDays(offset);
            result.add(new VocabularyProgressDashboardResponse.ReviewDay(
                    date, counts.getOrDefault(date, 0L)));
        }
        return result;
    }

    private List<VocabularyProgressDashboardResponse.ActivityDay> buildActivityDays(
            Map<LocalDate, Integer> qualifiedWordCounts, LocalDate today) {
        List<VocabularyProgressDashboardResponse.ActivityDay> result = new ArrayList<>();
        for (int offset = ACTIVITY_DAYS - 1; offset >= 0; offset--) {
            LocalDate date = today.minusDays(offset);
            Integer count = qualifiedWordCounts.get(date);
            result.add(new VocabularyProgressDashboardResponse.ActivityDay(
                    date, count, count != null && count >= DAILY_TARGET));
        }
        return result;
    }

    private VocabularyProgressDashboardResponse.MemoryTree buildMemoryTree(StreakSummary streak) {
        int highest = 0;
        Integer next = null;
        for (int milestone : List.of(3, 7, 14, 30)) {
            if (streak.longestStreak >= milestone) {
                highest = milestone;
            } else if (next == null) {
                next = milestone;
            }
        }
        return new VocabularyProgressDashboardResponse.MemoryTree(
                streak.currentStreak,
                streak.longestStreak,
                streak.qualifiedDays,
                highest,
                next);
    }

    private long countDueNow(List<StudentVocabularyProgress> progress, Instant now) {
        return progress.stream()
                .filter(value -> value.getDueAt() != null && !value.getDueAt().isAfter(now))
                .count();
    }

    private StreakSummary calculateStreak(List<LocalDate> dates, LocalDate today) {
        if (dates.isEmpty()) {
            return new StreakSummary(0, 0, 0);
        }

        int longest = 1;
        int run = 1;
        for (int index = 1; index < dates.size(); index++) {
            if (dates.get(index - 1).plusDays(1).equals(dates.get(index))) {
                run++;
                longest = Math.max(longest, run);
            } else {
                run = 1;
            }
        }

        LocalDate last = dates.get(dates.size() - 1);
        int current = 0;
        if (!last.isBefore(today.minusDays(1))) {
            current = 1;
            for (int index = dates.size() - 1; index > 0; index--) {
                if (!dates.get(index - 1).plusDays(1).equals(dates.get(index))) {
                    break;
                }
                current++;
            }
        }
        return new StreakSummary(current, longest, dates.size());
    }

    private VocabularyProgressDashboardResponse emptyDashboard() {
        LocalDate today = LocalDate.now(STUDENT_ZONE);
        List<VocabularyProgressDashboardResponse.ActivityDay> activityDays = new ArrayList<>();
        for (int offset = ACTIVITY_DAYS - 1; offset >= 0; offset--) {
            activityDays.add(new VocabularyProgressDashboardResponse.ActivityDay(
                    today.minusDays(offset), null, false));
        }
        List<VocabularyProgressDashboardResponse.ReviewDay> reviewDays = new ArrayList<>();
        for (int offset = 0; offset < UPCOMING_REVIEW_DAYS; offset++) {
            reviewDays.add(new VocabularyProgressDashboardResponse.ReviewDay(
                    today.plusDays(offset), 0));
        }
        return new VocabularyProgressDashboardResponse(
                today,
                STUDENT_ZONE.getId(),
                new VocabularyProgressDashboardResponse.Today(0, DAILY_TARGET, false, 0),
                new VocabularyProgressDashboardResponse.Overview(0, 0, 0),
                new VocabularyProgressDashboardResponse.MemoryTree(0, 0, 0, 0, 3),
                reviewDays,
                activityDays,
                List.of(),
                List.of());
    }

    private record StreakSummary(int currentStreak, int longestStreak, int qualifiedDays) {
    }
}
