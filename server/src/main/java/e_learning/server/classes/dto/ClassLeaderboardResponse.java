package e_learning.server.classes.dto;

import java.util.List;

public record ClassLeaderboardResponse(
        Long classId,
        String metric,
        String period,
        String xpScope,
        String completedScope,
        long totalStudents,
        long totalElements,
        int page,
        int size,
        List<Item> items
) {
    public record Item(
            Long studentId,
            String fullName,
            String avatarKey,
            int rank,
            long xp,
            long completedSessions,
            int currentStreak
    ) {}
}
