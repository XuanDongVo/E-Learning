package e_learning.server.gamification.dto;

public record StudentLeaderboardHonorsResponse(
        StudentLeaderboardResponse.Ranking xpChampion,
        StudentLeaderboardResponse.Ranking streakChampion) {
}
