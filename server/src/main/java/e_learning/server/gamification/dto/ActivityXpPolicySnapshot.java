package e_learning.server.gamification.dto;

import java.math.BigDecimal;

/** Server-owned, immutable snapshot captured at ActivitySession start. */
public record ActivityXpPolicySnapshot(
        int level, String policyVersion, BigDecimal multiplier
) {}
