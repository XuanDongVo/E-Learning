package e_learning.server.gamification.level.dto;

public record StudentLevelResponse(
        long lifetimeXp,
        int currentLevel,
        long currentLevelStartXp,
        long nextLevelRequiredXp,
        long xpIntoCurrentLevel,
        long xpToNextLevel) {
}
