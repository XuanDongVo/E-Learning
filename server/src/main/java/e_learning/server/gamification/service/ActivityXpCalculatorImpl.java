package e_learning.server.gamification.service;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activitysession.entity.ActivityQuestionResolution;
import e_learning.server.activitysession.enums.ActivitySessionStatus;
import e_learning.server.gamification.dto.ActivityXpQuestionEvaluation;
import e_learning.server.gamification.entity.XpQuestionOutcome;
import e_learning.server.question.enums.Difficulty;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.BigInteger;
import java.math.RoundingMode;

/** Pure implementation of the accepted Activity XP v2.2 policy. */
@Component
public final class ActivityXpCalculatorImpl implements ActivityXpCalculator {
    private static final BigDecimal ONE = new BigDecimal("1.00");
    private static final BigDecimal LEVEL_GROUP_REDUCTION = new BigDecimal("0.10");
    private static final BigDecimal MINIMUM_MULTIPLIER = new BigDecimal("0.20");
    private static final BigInteger ONE_HUNDRED = BigInteger.valueOf(100L);
    private static final BigInteger TEN = BigInteger.TEN;

    @Override
    public XpQuestionOutcome mapResolvedOutcome(
            ActivityMode mode,
            ActivityQuestionResolution resolutionReason,
            int answerAttempts,
            boolean hintUsed,
            Boolean finalCorrect) {
        requireNonNull(mode, "mode");
        requireNonNull(resolutionReason, "resolutionReason");
        requireNonNull(finalCorrect, "finalCorrect");
        if (mode == ActivityMode.BOTH) {
            throw new IllegalArgumentException("mode must be a concrete ActivitySession mode");
        }
        if (mode == ActivityMode.TRY_HARD && hintUsed) {
            throw new IllegalArgumentException("Try Hard questions cannot use a Hint");
        }
        if (answerAttempts < 0 || answerAttempts > 2) {
            throw new IllegalArgumentException("answerAttempts must be between 0 and 2");
        }

        return switch (resolutionReason) {
            case TIMEOUT -> mapTimeout(mode, answerAttempts, hintUsed, finalCorrect);
            case WRONG -> mapWrong(mode, answerAttempts, finalCorrect);
            case CORRECT -> mapCorrect(mode, answerAttempts, hintUsed, finalCorrect);
        };
    }

    @Override
    public ActivityXpQuestionEvaluation evaluateQuestion(
            long sessionQuestionId,
            Difficulty difficulty,
            XpQuestionOutcome outcome,
            BigDecimal sessionMultiplier) {
        if (sessionQuestionId <= 0) {
            throw new IllegalArgumentException("sessionQuestionId must be positive");
        }
        requireNonNull(difficulty, "difficulty");
        requireNonNull(outcome, "outcome");
        validateMultiplier(sessionMultiplier);

        int baseXp = baseXp(difficulty, outcome);
        int finalXp = scale(baseXp, sessionMultiplier);
        // Resolution time belongs to the Phase 2 persistence workflow. Keeping it
        // null here makes this calculator deterministic for identical inputs.
        return new ActivityXpQuestionEvaluation(
                sessionQuestionId, difficulty, outcome, baseXp, finalXp, null);
    }

    @Override
    public int completionBonus(
            int totalQuestions,
            ActivitySessionStatus status,
            BigDecimal sessionMultiplier) {
        if (totalQuestions <= 0) {
            throw new IllegalArgumentException("totalQuestions must be positive");
        }
        requireNonNull(status, "status");
        validateMultiplier(sessionMultiplier);
        if (status != ActivitySessionStatus.COMPLETED) {
            return 0;
        }

        long groupsOfFive = ((long) totalQuestions + 4L) / 5L;
        int baseBonus = (int) Math.min(10L, 2L * groupsOfFive);
        return scale(baseBonus, sessionMultiplier);
    }

    @Override
    public BigDecimal levelMultiplier(int level) {
        validateLevel(level);
        long group = ((long) level - 1L) / 5L;
        BigDecimal multiplier = ONE.subtract(LEVEL_GROUP_REDUCTION.multiply(BigDecimal.valueOf(group)));
        return multiplier.max(MINIMUM_MULTIPLIER).setScale(2, RoundingMode.UNNECESSARY);
    }

    @Override
    public long xpToNext(int level) {
        validateLevel(level);
        return Math.addExact(100L, Math.multiplyExact(20L, (long) level - 1L));
    }

    @Override
    public long lifetimeXpRequiredForLevel(int level) {
        validateLevel(level);
        return lifetimeXpRequiredForLevelExact(level).longValueExact();
    }

    @Override
    public int levelForLifetimeXp(long lifetimeXp) {
        if (lifetimeXp < 0) {
            throw new IllegalArgumentException("lifetimeXp must not be negative");
        }

        BigInteger targetXp = BigInteger.valueOf(lifetimeXp);
        int low = 1;
        int high = Integer.MAX_VALUE;
        while (low < high) {
            int middle = low + (int) ((((long) high - low) + 1L) / 2L);
            if (lifetimeXpRequiredForLevelExact(middle).compareTo(targetXp) <= 0) {
                low = middle;
            } else {
                high = middle - 1;
            }
        }
        return low;
    }

    private static XpQuestionOutcome mapTimeout(
            ActivityMode mode, int answerAttempts, boolean hintUsed, boolean finalCorrect) {
        if (mode != ActivityMode.TRY_HARD || answerAttempts != 0 || hintUsed || finalCorrect) {
            throw new IllegalArgumentException("TIMEOUT state is inconsistent with Try Hard gameplay");
        }
        return XpQuestionOutcome.TIMEOUT;
    }

    private static XpQuestionOutcome mapWrong(
            ActivityMode mode, int answerAttempts, boolean finalCorrect) {
        if (finalCorrect) {
            throw new IllegalArgumentException("WRONG resolution cannot be finally correct");
        }
        if (mode == ActivityMode.LEARNING && answerAttempts == 2) {
            return XpQuestionOutcome.WRONG_EXHAUSTED;
        }
        if (mode == ActivityMode.TRY_HARD && answerAttempts == 1) {
            return XpQuestionOutcome.TRY_HARD_WRONG;
        }
        throw new IllegalArgumentException("WRONG state has an invalid attempt count for the session mode");
    }

    private static XpQuestionOutcome mapCorrect(
            ActivityMode mode, int answerAttempts, boolean hintUsed, boolean finalCorrect) {
        if (!finalCorrect) {
            throw new IllegalArgumentException("CORRECT resolution must be finally correct");
        }
        if (mode == ActivityMode.TRY_HARD) {
            if (answerAttempts != 1 || hintUsed) {
                throw new IllegalArgumentException("CORRECT state is inconsistent with Try Hard gameplay");
            }
            return XpQuestionOutcome.CORRECT_FIRST_TRY;
        }
        if (answerAttempts < 1 || answerAttempts > 2) {
            throw new IllegalArgumentException("CORRECT Learning state must have one or two attempts");
        }
        if (hintUsed) {
            return XpQuestionOutcome.CORRECT_WITH_HINT;
        }
        return answerAttempts == 1
                ? XpQuestionOutcome.CORRECT_FIRST_TRY
                : XpQuestionOutcome.CORRECT_RETRY;
    }

    private static int baseXp(Difficulty difficulty, XpQuestionOutcome outcome) {
        return switch (outcome) {
            case CORRECT_FIRST_TRY -> switch (difficulty) {
                case EASY -> 8;
                case MEDIUM -> 10;
                case HARD -> 12;
            };
            case CORRECT_RETRY -> switch (difficulty) {
                case EASY -> 6;
                case MEDIUM -> 8;
                case HARD -> 10;
            };
            case CORRECT_WITH_HINT -> switch (difficulty) {
                case EASY -> 4;
                case MEDIUM -> 5;
                case HARD -> 6;
            };
            case WRONG_EXHAUSTED, TRY_HARD_WRONG, TIMEOUT, NO_INTERACTION -> 0;
        };
    }

    private static int scale(int baseXp, BigDecimal multiplier) {
        if (baseXp == 0) {
            return 0;
        }
        int rounded = BigDecimal.valueOf(baseXp)
                .multiply(multiplier)
                .setScale(0, RoundingMode.HALF_UP)
                .intValueExact();
        return Math.max(1, rounded);
    }

    private static void validateMultiplier(BigDecimal multiplier) {
        requireNonNull(multiplier, "sessionMultiplier");
        if (multiplier.compareTo(MINIMUM_MULTIPLIER) < 0 || multiplier.compareTo(ONE) > 0) {
            throw new IllegalArgumentException("sessionMultiplier must be between 0.20 and 1.00");
        }
        BigDecimal steps = ONE.subtract(multiplier).movePointRight(1);
        try {
            steps.setScale(0, RoundingMode.UNNECESSARY);
        } catch (ArithmeticException exception) {
            throw new IllegalArgumentException(
                    "sessionMultiplier must use an Activity XP v2.2 0.10 step", exception);
        }
    }

    private static void validateLevel(int level) {
        if (level < 1) {
            throw new IllegalArgumentException("level must be at least 1");
        }
    }

    private static <T> T requireNonNull(T value, String parameterName) {
        if (value == null) {
            throw new IllegalArgumentException(parameterName + " must not be null");
        }
        return value;
    }

    private static BigInteger lifetimeXpRequiredForLevelExact(int level) {
        BigInteger levelsCompleted = BigInteger.valueOf((long) level - 1L);
        return ONE_HUNDRED.multiply(levelsCompleted)
                .add(TEN.multiply(levelsCompleted).multiply(levelsCompleted.subtract(BigInteger.ONE)));
    }
}
