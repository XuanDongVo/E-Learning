package e_learning.server.activitysession.dto;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activity.enums.SelectionStrategy;
import java.util.List;

public record ActivitySessionOptionsResponse(
        Long activityId, ActivityMode activityMode, List<SelectionStrategy> selectionStrategies,
        Integer timeLimitSeconds, Integer lives) {}
