package e_learning.server.gamification.xp.service;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activitysession.entity.ActivityQuestionResolution;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.gamification.xp.dto.ActivityXpQuestionEvaluation;
import e_learning.server.gamification.xp.entity.XpQuestionOutcome;
import e_learning.server.question.enums.Difficulty;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.util.EnumMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class ActivityXpCalculatorImplTest {
    private static final BigDecimal FULL_MULTIPLIER = new BigDecimal("1.00");

    private final ActivityXpCalculator calculator = new ActivityXpCalculatorImpl();

    @Test
    void evaluatesTheFullOutcomeByDifficultyMatrix() {
        Map<XpQuestionOutcome, int[]> matrix = new EnumMap<>(XpQuestionOutcome.class);
        matrix.put(XpQuestionOutcome.CORRECT_FIRST_TRY, new int[]{8, 10, 12});
        matrix.put(XpQuestionOutcome.CORRECT_RETRY, new int[]{6, 8, 10});
        matrix.put(XpQuestionOutcome.CORRECT_WITH_HINT, new int[]{4, 5, 6});
        matrix.put(XpQuestionOutcome.WRONG_EXHAUSTED, new int[]{0, 0, 0});
        matrix.put(XpQuestionOutcome.TRY_HARD_WRONG, new int[]{0, 0, 0});
        matrix.put(XpQuestionOutcome.TIMEOUT, new int[]{0, 0, 0});
        matrix.put(XpQuestionOutcome.NO_INTERACTION, new int[]{0, 0, 0});

        long questionId = 1;
        for (Map.Entry<XpQuestionOutcome, int[]> entry : matrix.entrySet()) {
            int difficultyIndex = 0;
            for (Difficulty difficulty : Difficulty.values()) {
                ActivityXpQuestionEvaluation evaluation = calculator.evaluateQuestion(
                        questionId++, difficulty, entry.getKey(), FULL_MULTIPLIER);
                assertEquals(entry.getValue()[difficultyIndex], evaluation.baseXp());
                assertEquals(entry.getValue()[difficultyIndex], evaluation.finalXp());
                assertNull(evaluation.resolvedAt());
                difficultyIndex++;
            }
        }
    }

    @Test
    void mapsResolvedOutcomesWithHintTakingPrecedenceOverRetry() {
        assertEquals(XpQuestionOutcome.CORRECT_FIRST_TRY, calculator.mapResolvedOutcome(
                ActivityMode.LEARNING, ActivityQuestionResolution.CORRECT, 1, false, true));
        assertEquals(XpQuestionOutcome.CORRECT_RETRY, calculator.mapResolvedOutcome(
                ActivityMode.LEARNING, ActivityQuestionResolution.CORRECT, 2, false, true));
        assertEquals(XpQuestionOutcome.CORRECT_WITH_HINT, calculator.mapResolvedOutcome(
                ActivityMode.LEARNING, ActivityQuestionResolution.CORRECT, 1, true, true));
        assertEquals(XpQuestionOutcome.CORRECT_WITH_HINT, calculator.mapResolvedOutcome(
                ActivityMode.LEARNING, ActivityQuestionResolution.CORRECT, 2, true, true));
        assertEquals(XpQuestionOutcome.WRONG_EXHAUSTED, calculator.mapResolvedOutcome(
                ActivityMode.LEARNING, ActivityQuestionResolution.WRONG, 2, true, false));
        assertEquals(XpQuestionOutcome.TRY_HARD_WRONG, calculator.mapResolvedOutcome(
                ActivityMode.TRY_HARD, ActivityQuestionResolution.WRONG, 1, false, false));
        assertEquals(XpQuestionOutcome.TIMEOUT, calculator.mapResolvedOutcome(
                ActivityMode.TRY_HARD, ActivityQuestionResolution.TIMEOUT, 0, false, false));
    }

    @Test
    void rejectsMissingOrInconsistentResolvedOutcomeState() {
        assertThrows(IllegalArgumentException.class, () -> calculator.mapResolvedOutcome(
                ActivityMode.LEARNING, null, 1, false, true));
        assertThrows(IllegalArgumentException.class, () -> calculator.mapResolvedOutcome(
                ActivityMode.LEARNING, ActivityQuestionResolution.CORRECT, 1, false, null));
        assertThrows(IllegalArgumentException.class, () -> calculator.mapResolvedOutcome(
                ActivityMode.BOTH, ActivityQuestionResolution.CORRECT, 1, false, true));
        assertThrows(IllegalArgumentException.class, () -> calculator.mapResolvedOutcome(
                ActivityMode.LEARNING, ActivityQuestionResolution.WRONG, 1, false, false));
        assertThrows(IllegalArgumentException.class, () -> calculator.mapResolvedOutcome(
                ActivityMode.TRY_HARD, ActivityQuestionResolution.TIMEOUT, 1, false, false));
        assertThrows(IllegalArgumentException.class, () -> calculator.mapResolvedOutcome(
                ActivityMode.TRY_HARD, ActivityQuestionResolution.CORRECT, 1, true, true));
        assertThrows(IllegalArgumentException.class, () -> calculator.mapResolvedOutcome(
                ActivityMode.LEARNING, ActivityQuestionResolution.CORRECT, 1, false, false));
    }

    @Test
    void derivesMultiplierAtLevelGroupBoundariesAndFloor() {
        assertEquals(new BigDecimal("1.00"), calculator.levelMultiplier(5));
        assertEquals(new BigDecimal("0.90"), calculator.levelMultiplier(6));
        assertEquals(new BigDecimal("0.90"), calculator.levelMultiplier(10));
        assertEquals(new BigDecimal("0.80"), calculator.levelMultiplier(11));
        assertEquals(new BigDecimal("0.30"), calculator.levelMultiplier(40));
        assertEquals(new BigDecimal("0.20"), calculator.levelMultiplier(41));
        assertEquals(new BigDecimal("0.20"), calculator.levelMultiplier(Integer.MAX_VALUE));
    }

    @Test
    void scalesEachQuestionWithHalfUpRoundingAndKeepsZeroAtZero() {
        ActivityXpQuestionEvaluation levelSixEasy = calculator.evaluateQuestion(
                1, Difficulty.EASY, XpQuestionOutcome.CORRECT_FIRST_TRY,
                calculator.levelMultiplier(6));
        assertEquals(7, levelSixEasy.finalXp());

        ActivityXpQuestionEvaluation halfUp = calculator.evaluateQuestion(
                2, Difficulty.MEDIUM, XpQuestionOutcome.CORRECT_WITH_HINT,
                calculator.levelMultiplier(26));
        assertEquals(3, halfUp.finalXp());

        ActivityXpQuestionEvaluation positiveMinimum = calculator.evaluateQuestion(
                3, Difficulty.EASY, XpQuestionOutcome.CORRECT_WITH_HINT,
                calculator.levelMultiplier(41));
        assertEquals(1, positiveMinimum.finalXp());

        ActivityXpQuestionEvaluation levelFloorHard = calculator.evaluateQuestion(
                4, Difficulty.HARD, XpQuestionOutcome.CORRECT_FIRST_TRY,
                calculator.levelMultiplier(41));
        assertEquals(2, levelFloorHard.finalXp());

        ActivityXpQuestionEvaluation zero = calculator.evaluateQuestion(
                5, Difficulty.HARD, XpQuestionOutcome.TIMEOUT,
                calculator.levelMultiplier(41));
        assertEquals(0, zero.finalXp());
    }

    @Test
    void roundsMixedQuestionAwardsIndividually() {
        BigDecimal multiplier = calculator.levelMultiplier(6);
        int first = calculator.evaluateQuestion(
                1, Difficulty.EASY, XpQuestionOutcome.CORRECT_WITH_HINT, multiplier).finalXp();
        int second = calculator.evaluateQuestion(
                2, Difficulty.MEDIUM, XpQuestionOutcome.CORRECT_WITH_HINT, multiplier).finalXp();

        assertEquals(9, first + second);
        assertEquals(8, new BigDecimal("9").multiply(multiplier)
                .setScale(0, java.math.RoundingMode.HALF_UP).intValueExact());
    }

    @Test
    void calculatesCompletionBonusAtRequiredBoundaries() {
        int[] questionCounts = {5, 6, 10, 11, 20, 21};
        int[] expectedBonuses = {2, 4, 4, 6, 8, 10};
        for (int index = 0; index < questionCounts.length; index++) {
            assertEquals(expectedBonuses[index], calculator.completionBonus(
                    questionCounts[index], ActivitySessionStatus.COMPLETED, FULL_MULTIPLIER));
        }
        assertEquals(10, calculator.completionBonus(
                Integer.MAX_VALUE, ActivitySessionStatus.COMPLETED, FULL_MULTIPLIER));
    }

    @Test
    void onlyCompletedReceivesScaledCompletionBonusEvenWhenQuestionXpIsZero() {
        BigDecimal multiplier = calculator.levelMultiplier(26);
        int wrongQuestionXp = calculator.evaluateQuestion(
                1, Difficulty.HARD, XpQuestionOutcome.WRONG_EXHAUSTED, multiplier).finalXp();

        assertEquals(0, wrongQuestionXp);
        assertEquals(2, calculator.completionBonus(
                10, ActivitySessionStatus.COMPLETED, multiplier));
        assertEquals(0, calculator.completionBonus(
                10, ActivitySessionStatus.GAME_OVER, multiplier));
        assertEquals(0, calculator.completionBonus(
                10, ActivitySessionStatus.ABANDONED, multiplier));
        assertEquals(0, calculator.completionBonus(
                10, ActivitySessionStatus.IN_PROGRESS, multiplier));
    }

    @Test
    void calculatesLevelThresholdsAndSupportsMultipleLevelJumps() {
        assertEquals(100, calculator.xpToNext(1));
        assertEquals(120, calculator.xpToNext(2));
        assertEquals(0, calculator.lifetimeXpRequiredForLevel(1));
        assertEquals(5_320, calculator.lifetimeXpRequiredForLevel(20));
        assertEquals(11_020, calculator.lifetimeXpRequiredForLevel(30));
        assertEquals(28_420, calculator.lifetimeXpRequiredForLevel(50));

        assertEquals(1, calculator.levelForLifetimeXp(0));
        assertEquals(1, calculator.levelForLifetimeXp(99));
        assertEquals(2, calculator.levelForLifetimeXp(100));
        assertEquals(19, calculator.levelForLifetimeXp(5_319));
        assertEquals(20, calculator.levelForLifetimeXp(5_320));
        assertEquals(50, calculator.levelForLifetimeXp(28_420));
        assertEquals(960_383_879, calculator.levelForLifetimeXp(Long.MAX_VALUE));
    }

    @Test
    void rejectsInvalidParametersAndReportsThresholdOverflow() {
        assertThrows(IllegalArgumentException.class, () -> calculator.levelMultiplier(0));
        assertThrows(IllegalArgumentException.class, () -> calculator.levelForLifetimeXp(-1));
        assertThrows(IllegalArgumentException.class, () -> calculator.completionBonus(
                0, ActivitySessionStatus.COMPLETED, FULL_MULTIPLIER));
        assertThrows(IllegalArgumentException.class, () -> calculator.evaluateQuestion(
                0, Difficulty.EASY, XpQuestionOutcome.CORRECT_FIRST_TRY, FULL_MULTIPLIER));
        assertThrows(IllegalArgumentException.class, () -> calculator.evaluateQuestion(
                1, null, XpQuestionOutcome.CORRECT_FIRST_TRY, FULL_MULTIPLIER));
        assertThrows(IllegalArgumentException.class, () -> calculator.evaluateQuestion(
                1, Difficulty.EASY, XpQuestionOutcome.CORRECT_FIRST_TRY, new BigDecimal("0.85")));
        assertThrows(ArithmeticException.class, () -> calculator.lifetimeXpRequiredForLevel(Integer.MAX_VALUE));
    }

    @Test
    void returnsIdenticalEvaluationForIdenticalInputs() {
        ActivityXpQuestionEvaluation first = calculator.evaluateQuestion(
                42, Difficulty.HARD, XpQuestionOutcome.CORRECT_RETRY, new BigDecimal("0.70"));
        ActivityXpQuestionEvaluation second = calculator.evaluateQuestion(
                42, Difficulty.HARD, XpQuestionOutcome.CORRECT_RETRY, new BigDecimal("0.70"));

        assertEquals(first, second);
    }
}
