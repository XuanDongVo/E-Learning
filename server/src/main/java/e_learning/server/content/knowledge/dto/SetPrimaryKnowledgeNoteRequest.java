package e_learning.server.content.knowledge.dto;

/** A null knowledgeNoteId intentionally clears a Topic's optional Primary. */
public record SetPrimaryKnowledgeNoteRequest(Long knowledgeNoteId) {}
