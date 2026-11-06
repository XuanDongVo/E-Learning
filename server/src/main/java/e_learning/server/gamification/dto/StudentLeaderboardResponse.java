package e_learning.server.gamification.dto;

import java.util.List;

public record StudentLeaderboardResponse(
        String metric,
        String period,
        List<Ranking> top,
        Ranking currentStudent,
        boolean currentStudentInTop,
        long totalStudents) {

    public record Ranking(long studentId, String fullName, long rank, long value, int level, boolean currentStudent) {
    }
}
