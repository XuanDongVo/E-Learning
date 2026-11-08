package e_learning.server.gamification.streak.service;

import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;

class StudentStreakPolicyTest {
    private final StudentStreakPolicy policy = new StudentStreakPolicy();

    @Test
    void firstDaySameDayNextDayAndGap() {
        LocalDate day = LocalDate.of(2026, 11, 6);
        assertEquals(1, policy.nextStreak(null, 0, day));
        assertEquals(3, policy.nextStreak(day, 3, day));
        assertEquals(4, policy.nextStreak(day, 3, day.plusDays(1)));
        assertEquals(1, policy.nextStreak(day, 3, day.plusDays(2)));
        assertThrows(IllegalArgumentException.class, () -> policy.nextStreak(day, 3, day.minusDays(1)));
    }

    @Test
    void displayRemainsActiveYesterdayButExpiresAfterMissedDay() {
        LocalDate day = LocalDate.of(2026, 11, 6);
        assertEquals(0, policy.effectiveStreak(null, 0, day));
        assertEquals(7, policy.effectiveStreak(day, 7, day));
        assertEquals(7, policy.effectiveStreak(day, 7, day.plusDays(1)));
        assertEquals(0, policy.effectiveStreak(day, 7, day.plusDays(2)));
    }

    @Test
    void rewardsExactlyFourMilestonesAndKeysVaryByRun() {
        Map<Integer, Integer> expected = Map.of(3, 10, 7, 20, 14, 40, 30, 80);
        expected.forEach((day, xp) -> assertEquals(xp, policy.milestoneXp(day)));
        assertEquals(0, policy.milestoneXp(1));
        assertEquals(0, policy.milestoneXp(31));
        assertEquals(0, policy.milestoneXp(60));
        assertNotEquals(policy.awardKey(5, LocalDate.of(2026, 11, 1), 3),
                policy.awardKey(5, LocalDate.of(2026, 11, 8), 3));
    }
}
