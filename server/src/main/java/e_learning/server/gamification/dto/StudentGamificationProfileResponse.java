package e_learning.server.gamification.dto;

import java.time.LocalDate;

public record StudentGamificationProfileResponse(
        long lifetimeXp,
        int currentLevel,
        long currentLevelStartXp,
        long nextLevelRequiredXp,
        long xpIntoCurrentLevel,
        long xpToNextLevel,
        int currentStreak,
        int longestStreak,
        LocalDate lastQualifiedDate,
        boolean qualifiedToday) {
}
