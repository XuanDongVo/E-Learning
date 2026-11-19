package e_learning.server.content.knowledge.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;

/** Explicit fail-closed feature gate using the application's standard error contract. */
public final class KnowledgeNotePhaseGate {
    private KnowledgeNotePhaseGate() {}

    public static <T> T notImplemented() {
        throw new AppException(ErrorCode.KNOWLEDGE_NOTE_NOT_IMPLEMENTED);
    }
}
