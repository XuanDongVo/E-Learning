package e_learning.server.gamification.leaderboard.service;

import e_learning.server.gamification.leaderboard.dto.StudentLeaderboardHonorsResponse;
import e_learning.server.gamification.leaderboard.dto.StudentLeaderboardResponse;
import e_learning.server.gamification.leaderboard.dto.StudentLearningActivityResponse;
import e_learning.server.gamification.leaderboard.repository.StudentLeaderboardQueryRepository;
import e_learning.server.gamification.streak.service.StudentStreakPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.List;

/** Read-only, server-authoritative rankings. Does not create or award XP. */
@Service
@RequiredArgsConstructor
public class StudentLeaderboardService {
    private final StudentLeaderboardQueryRepository leaderboardRepository;

    private LocalDateTime boundary(LocalDate day) {
        ZonedDateTime hcmMidnight = day.atStartOfDay(StudentStreakPolicy.ZONE);
        return hcmMidnight.withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
    }

    @Transactional(readOnly = true)
    public StudentLeaderboardResponse leaderboard(long me, String metric, String period) {
        String m = metric == null ? "XP" : metric.toUpperCase(java.util.Locale.ROOT);
        String p = period == null ? "ALL" : period.toUpperCase(java.util.Locale.ROOT);
        if (!m.equals("XP") && !m.equals("STREAK")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported ranking metric");
        }
        if (!List.of("TODAY", "WEEK", "MONTH", "ALL").contains(p)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported XP period");
        }
        if (m.equals("STREAK")) p = "ALL";

        LocalDate today = LocalDate.now(StudentStreakPolicy.ZONE);
        LocalDate from = switch (p) {
            case "TODAY" -> today;
            case "WEEK" -> today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
            case "MONTH" -> today.withDayOfMonth(1);
            default -> null;
        };
        LocalDate until = switch (p) {
            case "TODAY" -> today.plusDays(1);
            case "WEEK" -> today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).plusDays(7);
            case "MONTH" -> today.withDayOfMonth(1).plusMonths(1);
            default -> null;
        };
        List<StudentLeaderboardQueryRepository.LeaderboardProjection> rows =
                leaderboardRepository.findRankings(
                        m,
                        today.minusDays(1),
                        boundary(from == null ? LocalDate.of(1970, 1, 1) : from),
                        boundary(until == null ? LocalDate.of(9999, 1, 1) : until),
                        me);
        List<StudentLeaderboardResponse.Ranking> entries = rows.stream()
                .map(row -> new StudentLeaderboardResponse.Ranking(
                        row.getStudentId(), row.getFullName(),null, row.getPosition(), row.getScore(),
                        row.getStudentLevel(), row.getStudentId() == me))
                .toList();
        long total = leaderboardRepository.countActiveStudents();
        List<StudentLeaderboardResponse.Ranking> top = entries.stream()
                .filter(entry -> entry.rank() <= 50).toList();
        StudentLeaderboardResponse.Ranking self = entries.stream()
                .filter(StudentLeaderboardResponse.Ranking::currentStudent).findFirst().orElse(null);
        return new StudentLeaderboardResponse(m, p, top, self,
                self != null && self.rank() <= 50, total);
    }

    @Transactional(readOnly = true)
    public StudentLeaderboardHonorsResponse honors(long me) {
        // Honor records are historical bests, not necessarily the currently-active streak.
        var xp = leaderboardRepository.findXpChampion().stream()
                .map(row -> toHonorRanking(row, me)).toList();
        var streak = leaderboardRepository.findStreakChampion().stream()
                .map(row -> toHonorRanking(row, me)).toList();
        return new StudentLeaderboardHonorsResponse(
                xp.isEmpty() ? null : xp.get(0), streak.isEmpty() ? null : streak.get(0));
    }

    @Transactional(readOnly = true)
    public StudentLearningActivityResponse recentActivity(int limit) {
        if (limit < 1 || limit > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "limit must be from 1 to 20");
        }
        var items = leaderboardRepository.findRecentActivity(limit).stream().map(row -> {
            int xp = row.getEarnedXp() == null ? 0 : row.getEarnedXp().intValue();
            return new StudentLearningActivityResponse.Item(
                    row.getSessionId(), row.getStudentId(),
                    row.getFullName(), row.getActivityName(),
                    row.getStatus(), row.getCompletedAt(),
                    xp > 0 ? xp : null);
        }).toList();
        return new StudentLearningActivityResponse(items);
    }

    private StudentLeaderboardResponse.Ranking toHonorRanking(
            StudentLeaderboardQueryRepository.HonorProjection row, long me) {
        return new StudentLeaderboardResponse.Ranking(
                row.getStudentId(), row.getFullName(), null,1, row.getValue(),
                row.getStudentLevel(), row.getStudentId() == me);
    }
}
