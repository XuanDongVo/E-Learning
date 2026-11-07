package e_learning.server.gamification.leaderboard.dto;

import java.time.LocalDateTime;
import java.util.List;

public record StudentLearningActivityResponse(List<Item> items) {
    public record Item(long sessionId, long studentId, String fullName,
                       String activityName, String status, LocalDateTime completedAt,
                       Integer earnedXp) {
    }
}
