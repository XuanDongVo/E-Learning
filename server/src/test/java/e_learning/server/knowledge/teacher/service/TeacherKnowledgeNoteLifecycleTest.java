package e_learning.server.knowledge.teacher.service;

import tools.jackson.databind.ObjectMapper;
import e_learning.server.common.exception.AppException;
import e_learning.server.grades.entity.Grade;
import e_learning.server.grades.repository.GradeRepository;
import e_learning.server.knowledge.entity.KnowledgeNote;
import e_learning.server.knowledge.entity.KnowledgeNoteTopicLink;
import e_learning.server.knowledge.enums.KnowledgeNoteStatus;
import e_learning.server.knowledge.repository.KnowledgeNoteRepository;
import e_learning.server.knowledge.repository.KnowledgeNoteTopicLinkRepository;
import e_learning.server.knowledge.teacher.mapper.KnowledgeNoteMapper;
import e_learning.server.knowledge.teacher.validation.KnowledgeNoteContentValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class TeacherKnowledgeNoteLifecycleTest {
    private final KnowledgeNoteRepository noteRepository = mock(KnowledgeNoteRepository.class);
    private final KnowledgeNoteTopicLinkRepository links = mock(KnowledgeNoteTopicLinkRepository.class);
    private final GradeRepository grades = mock(GradeRepository.class);
    private final TeacherKnowledgeNoteService service = new TeacherKnowledgeNoteService(
            noteRepository, links, grades, new KnowledgeNoteMapper(),
            new KnowledgeNoteContentValidator(new ObjectMapper()));

    private KnowledgeNote note;

    @BeforeEach
    void setup() {
        note = new KnowledgeNote();
        note.setId(12L);
        note.setStatus(KnowledgeNoteStatus.DRAFT);
        Grade grade = mock(Grade.class);
        when(grade.getId()).thenReturn(7L);
        note.setGrade(grade);
        note.setDocumentJson(Map.of("type", "doc", "content",
                List.of(Map.of("type", "paragraph", "content",
                        List.of(Map.of("type", "text", "text", "Present Simple"))))));
        when(noteRepository.findById(12L)).thenReturn(Optional.of(note));
        when(noteRepository.saveAndFlush(any(KnowledgeNote.class))).thenAnswer(a -> a.getArgument(0));
    }

    @Test
    void publishesAndThenUnpublishesWithoutDeletingDocument() {
        var published = service.publish(12L);
        assertEquals(KnowledgeNoteStatus.PUBLISHED, published.status());
        assertNotNull(published.publishedAt());
        var unpublished = service.unpublish(12L);
        assertEquals(KnowledgeNoteStatus.UNPUBLISHED, unpublished.status());
        assertNotNull(note.getDocumentJson());
        verify(noteRepository, times(2)).saveAndFlush(note);
    }

    @Test
    void refusesPublishingAnEmptyArticle() {
        note.setDocumentJson(Map.of("type", "doc", "content", List.of()));
        assertThrows(AppException.class, () -> service.publish(12L));
        assertEquals(KnowledgeNoteStatus.DRAFT, note.getStatus());
    }

    @Test
    void requiresHeadingAndKeypointWhenLinkedAsPrimary() {
        KnowledgeNoteTopicLink primary = new KnowledgeNoteTopicLink();
        primary.setPrimary(true);
        when(links.findByNoteId(12L)).thenReturn(List.of(primary));
        assertThrows(AppException.class, () -> service.publish(12L));
        assertEquals(KnowledgeNoteStatus.DRAFT, note.getStatus());
    }

    @Test
    void archivedNotesCannotBeRepublished() {
        note.setStatus(KnowledgeNoteStatus.ARCHIVED);
        assertThrows(AppException.class, () -> service.publish(12L));
        assertThrows(AppException.class, () -> service.unpublish(12L));
    }

    @Test
    void archivingPublishedNoteHidesItWithoutErasingContent() {
        note.setStatus(KnowledgeNoteStatus.PUBLISHED);
        var result = service.archive(12L);
        assertEquals(KnowledgeNoteStatus.ARCHIVED, result.status());
        assertNotNull(note.getDocumentJson());
    }

    @Test
    void cannotSavePublishedDocument() {
        note.setStatus(KnowledgeNoteStatus.PUBLISHED);
        assertThrows(AppException.class, () -> service.saveContent(12L,
                new e_learning.server.knowledge.teacher.dto.request.SaveKnowledgeNoteContentRequest(
                        Map.of("type", "doc", "content", List.of()))));
        verify(noteRepository, never()).saveAndFlush(any(KnowledgeNote.class));
    }
}
