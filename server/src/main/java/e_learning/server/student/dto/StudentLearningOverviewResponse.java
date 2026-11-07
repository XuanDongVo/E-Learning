package e_learning.server.student.dto;

import java.time.LocalDateTime;
import java.util.List;

/** Student-owned learning history. Session metrics are database-derived. */
public record StudentLearningOverviewResponse(
        long sessionTotal,
        long sessionsCompleted,
        List<RecentSession> activities
) {
    public record RecentSession(
            Long id, String name, String unit, String mode, String status,
            int correct, int total, LocalDateTime date, Integer xp
    ) {}
}
