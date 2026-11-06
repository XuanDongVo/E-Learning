package e_learning.server.gamification.service;

import e_learning.server.gamification.dto.StudentLeaderboardHonorsResponse;
import e_learning.server.gamification.dto.StudentLeaderboardResponse;
import e_learning.server.gamification.dto.StudentLearningActivityResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;

import java.sql.Timestamp;
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
    private final NamedParameterJdbcTemplate jdbc;

    private static final String BASE_RANKING = """
            with scores as (
                select u.id as student_id, u.full_name,
                       coalesce(p.current_level, 1) as student_level,
                       case when :metric = 'XP' then
                           coalesce(sum(x.amount), 0)
                       else
                           case when p.last_qualified_date >= :yesterday
                                then coalesce(p.current_streak, 0)
                                else 0 end
                       end as score
                from users u
                left join student_gamification_profiles p on p.student_id = u.id
                left join xp_transactions x on x.student_id = u.id
                    and :metric = 'XP'
                    and x.earned_at >= :startAt
                    and x.earned_at < :endAt
                where u.role = 'STUDENT' and u.status = 'ACTIVE'
                group by u.id, u.full_name, p.current_level, p.current_streak, p.last_qualified_date
            ), ranked as (
                select student_id, full_name, student_level, score,
                       row_number() over (order by score desc, student_id asc) as position
                from scores
            )
            """;

    private LocalDateTime boundary(LocalDate day) {
        // Existing xp_transactions.earned_at is LocalDateTime.now() in server local time.
        // Convert the Vietnam calendar boundary to that same wall-clock convention.
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
        MapSqlParameterSource args = new MapSqlParameterSource()
                .addValue("metric", m).addValue("yesterday", today.minusDays(1))
                .addValue("startAt", Timestamp.valueOf(boundary(from == null ? LocalDate.of(1970, 1, 1) : from)))
                .addValue("endAt", Timestamp.valueOf(boundary(until == null ? LocalDate.of(9999, 1, 1) : until)))
                .addValue("me", me);
        List<StudentLeaderboardResponse.Ranking> entries = jdbc.query(
                BASE_RANKING + """
                        select * from ranked
                        where position <= 50 or student_id = :me
                        order by position
                        """, args,
                (rs, row) -> new StudentLeaderboardResponse.Ranking(
                        rs.getLong("student_id"), rs.getString("full_name"),
                        rs.getLong("position"), rs.getLong("score"),
                        rs.getInt("student_level"), rs.getLong("student_id") == me));
        long total = jdbc.queryForObject(
                "select count(*) from users where role = 'STUDENT' and status = 'ACTIVE'",
                new MapSqlParameterSource(), Long.class);
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
        String sql = """
                with scores as (
                    select u.id as student_id, u.full_name,
                           coalesce(p.current_level, 1) as student_level,
                           coalesce(p.lifetime_xp, 0) as xp,
                           coalesce(p.longest_streak, 0) as best_streak
                    from users u
                    left join student_gamification_profiles p on p.student_id = u.id
                    where u.role = 'STUDENT' and u.status = 'ACTIVE'
                )
                select * from scores order by %s desc, student_id asc limit 1
                """;
        var args = new MapSqlParameterSource();
        var xp = jdbc.query(sql.formatted("xp"), args, (rs, row) ->
                new StudentLeaderboardResponse.Ranking(rs.getLong("student_id"),
                        rs.getString("full_name"), 1, rs.getLong("xp"),
                        rs.getInt("student_level"), rs.getLong("student_id") == me));
        var streak = jdbc.query(sql.formatted("best_streak"), args, (rs, row) ->
                new StudentLeaderboardResponse.Ranking(rs.getLong("student_id"),
                        rs.getString("full_name"), 1, rs.getLong("best_streak"),
                        rs.getInt("student_level"), rs.getLong("student_id") == me));
        return new StudentLeaderboardHonorsResponse(
                xp.isEmpty() ? null : xp.get(0), streak.isEmpty() ? null : streak.get(0));
    }

    @Transactional(readOnly = true)
    public StudentLearningActivityResponse recentActivity(int limit) {
        if (limit < 1 || limit > 20) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "limit must be from 1 to 20");
        }
        var args = new MapSqlParameterSource().addValue("limit", limit);
        var items = jdbc.query("""
                select s.id as session_id, s.student_id, u.full_name, a.name as activity_name,
                       s.status, s.completed_at,
                       (select coalesce(sum(x.amount), 0) from xp_transactions x
                        where x.activity_session_id = s.id and x.source_type = 'PRACTICE') as earned_xp
                from activity_sessions s
                join users u on u.id = s.student_id
                join activities a on a.id = s.activity_id
                where s.status in ('COMPLETED', 'GAME_OVER')
                  and u.role = 'STUDENT' and u.status = 'ACTIVE'
                order by s.completed_at desc, s.id desc
                limit :limit
                """, args, (rs, row) -> {
            int xp = rs.getInt("earned_xp");
            return new StudentLearningActivityResponse.Item(
                    rs.getLong("session_id"), rs.getLong("student_id"),
                    rs.getString("full_name"), rs.getString("activity_name"),
                    rs.getString("status"), rs.getTimestamp("completed_at").toLocalDateTime(),
                    xp > 0 ? xp : null);
        });
        return new StudentLearningActivityResponse(items);
    }
}
