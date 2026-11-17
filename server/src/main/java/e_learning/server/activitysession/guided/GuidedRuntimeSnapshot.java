package e_learning.server.activitysession.guided;

import e_learning.server.question.guided.GuidedDefinitionPayload;

/** Server-only snapshot containing Step answer keys and policy. */
public record GuidedRuntimeSnapshot(int schemaVersion, GuidedDefinitionPayload definition) {}
