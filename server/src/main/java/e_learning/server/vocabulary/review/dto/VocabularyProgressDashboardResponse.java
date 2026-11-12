package e_learning.server.vocabulary.review.dto;

import java.time.LocalDate;
import java.time.Instant;
import java.util.List;

/**
 * Future read-only /v1/student/vocabulary/progress contract.
 * No controller, repository, migration, or persistence is implemented in the UI preview phase.
 *
 * Daily qualification: >= 5 DISTINCT words with HARD/GOOD/EASY ratings, based on the
 * student's local date (timeZone). AGAIN and game answers do not qualify.
 * Tree milestone is derived from the longest historical vocabulary streak and never
 * resets just because the current streak breaks.
 */
public record VocabularyProgressDashboardResponse(
        LocalDate asOfDate,
        String timeZone,
        Today today,
        Overview overview,
        MemoryTree tree,
        List<ReviewDay> upcomingReviews,
        List<ActivityDay> activityDays,
        List<UnitProgress> units,
        List<AttentionWord> attentionWords
) {
    public record Today(
            int completedDistinctWords,
            int dailyTarget,
            boolean qualifiedToday,
            long dueNow
    ) {}

    /** Learned here means an FSRS card exists; it does NOT mean mastered. */
    public record Overview(
            long totalWords,
            long learnedWords,
            long newWords
    ) {}

    /** Milestones: 0/3/7/14/30. nextMilestone is nullable once fully unlocked. */
    public record MemoryTree(
            int currentStreak,
            int longestStreak,
            int totalQualifiedDays,
            int highestUnlockedMilestone,
            Integer nextMilestone
    ) {}

    /** Upcoming FSRS due dates are projections and may change after a review. */
    public record ReviewDay(LocalDate date, long dueCount) {}

    /** null qualifiedWordCount means the date has not occurred yet. */
    public record ActivityDay(LocalDate date, Integer qualifiedWordCount, boolean qualifiedDay) {}

    public record UnitProgress(
            Long unitId,
            String code,
            String name,
            long totalCount,
            long learnedCount,
            long newCount,
            long dueCount
    ) {}

    /** Suggested candidates: recent AGAIN/HARD reviews, not a mastery score. */
    public record AttentionWord(
            Long wordId,
            String word,
            String meaningVi,
            Long unitId,
            String unitName,
            int againCount,
            int hardCount,
            Instant dueAt
    ) {}
}
