package e_learning.server.gamification.streak.dto;

import java.time.LocalDate;
import java.util.List;

public record StudentStreakResponse(
        int currentStreak,
        int longestStreak,
        boolean qualifiedToday,
        LocalDate runStartDate,
        LocalDate lastQualifiedDate,
        String timezone,
        List<Milestone> milestones,
        LocalDate todayDate,
        LocalDate weekStartDate,
        List<LocalDate> qualifiedDates) {

    public record Milestone(int days, int xp, boolean awarded) {
    }
}
