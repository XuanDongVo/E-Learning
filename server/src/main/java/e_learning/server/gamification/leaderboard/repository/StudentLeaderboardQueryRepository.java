package e_learning.server.gamification.leaderboard.repository;

import e_learning.server.user.entity.User;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.Repository;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public interface StudentLeaderboardQueryRepository extends Repository<User, Long> {
    String BASE_RANKING = """
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

    @Query(value = BASE_RANKING + """
            select student_id, full_name, student_level, score, position
            from ranked
            where position <= 50 or student_id = :studentId
            order by position
            """, nativeQuery = true)
    List<LeaderboardProjection> findRankings(
            @Param("metric") String metric,
            @Param("yesterday") LocalDate yesterday,
            @Param("startAt") LocalDateTime startAt,
            @Param("endAt") LocalDateTime endAt,
            @Param("studentId") long studentId);

    @Query(value = """
            select count(*)
            from users
            where role = 'STUDENT' and status = 'ACTIVE'
            """, nativeQuery = true)
    long countActiveStudents();

    @Query(value = """
            with scores as (
                select u.id as student_id, u.full_name,
                       coalesce(p.current_level, 1) as student_level,
                       coalesce(p.lifetime_xp, 0) as xp,
                       coalesce(p.longest_streak, 0) as best_streak
                from users u
                left join student_gamification_profiles p on p.student_id = u.id
                where u.role = 'STUDENT' and u.status = 'ACTIVE'
            )
            select student_id, full_name, student_level, xp as value
            from scores
            order by xp desc, student_id asc
            limit 1
            """, nativeQuery = true)
    List<HonorProjection> findXpChampion();

    @Query(value = """
            with scores as (
                select u.id as student_id, u.full_name,
                       coalesce(p.current_level, 1) as student_level,
                       coalesce(p.lifetime_xp, 0) as xp,
                       coalesce(p.longest_streak, 0) as best_streak
                from users u
                left join student_gamification_profiles p on p.student_id = u.id
                where u.role = 'STUDENT' and u.status = 'ACTIVE'
            )
            select student_id, full_name, student_level, best_streak as value
            from scores
            order by best_streak desc, student_id asc
            limit 1
            """, nativeQuery = true)
    List<HonorProjection> findStreakChampion();

    @Query(value = """
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
            """, nativeQuery = true)
    List<RecentActivityProjection> findRecentActivity(@Param("limit") int limit);

    interface LeaderboardProjection {
        Long getStudentId();

        String getFullName();

        String getAvatarKey();

        Integer getStudentLevel();

        Long getScore();

        Long getPosition();
    }

    interface HonorProjection {
        Long getStudentId();

        String getFullName();

        Integer getStudentLevel();

        Long getValue();
    }

    interface RecentActivityProjection {
        Long getSessionId();

        Long getStudentId();

        String getFullName();

        String getActivityName();

        String getStatus();

        LocalDateTime getCompletedAt();

        Long getEarnedXp();
    }
}
