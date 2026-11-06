package e_learning.server.gamification.service;

import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.ZoneId;
import java.util.List;

/** Pure calendar-date policy; daily qualification is performed by the service. */
@Component
public class StudentStreakPolicy {
    public static final ZoneId ZONE = ZoneId.of("Asia/Ho_Chi_Minh");
    public static final String VERSION = "STREAK_V1";
    public static final List<Integer> MILESTONES = List.of(3, 7, 14, 30);

    public int nextStreak(LocalDate previous, int previousLength, LocalDate today) {
        if (previous == null) return 1;
        if (previous.isEqual(today)) return previousLength;
        if (previous.isAfter(today)) {
            throw new IllegalArgumentException("A Streak day cannot precede the previous qualification");
        }
        return previous.plusDays(1).equals(today) ? Math.addExact(previousLength, 1) : 1;
    }

    public int effectiveStreak(LocalDate lastDate, int length, LocalDate today) {
        if (lastDate == null || lastDate.isBefore(today.minusDays(1))) return 0;
        return length;
    }

    public int milestoneXp(int days) {
        return switch (days) {
            case 3 -> 10;
            case 7 -> 20;
            case 14 -> 40;
            case 30 -> 80;
            default -> 0;
        };
    }

    public String awardKey(long studentId, LocalDate runStart, int days) {
        return "STREAK_BONUS:" + studentId + ":" + runStart + ":" + days;
    }
}
