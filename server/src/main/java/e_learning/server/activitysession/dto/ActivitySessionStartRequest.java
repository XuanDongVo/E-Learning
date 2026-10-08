package e_learning.server.activitysession.dto;

import e_learning.server.activity.enums.ActivityMode;
import e_learning.server.activity.enums.SelectionStrategy;

public record ActivitySessionStartRequest(ActivityMode mode, SelectionStrategy selectionStrategy) {}
