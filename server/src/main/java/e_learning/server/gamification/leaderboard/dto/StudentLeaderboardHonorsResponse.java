package e_learning.server.gamification.leaderboard.dto;

public record StudentLeaderboardHonorsResponse(
        StudentLeaderboardResponse.Ranking xpChampion,
        StudentLeaderboardResponse.Ranking streakChampion) {
}
