package e_learning.server.knowledge.student.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.content.topic.repository.TopicRepository;
import e_learning.server.content.unit.service.StudentUnitService;
import e_learning.server.grades.entity.Grade;
import e_learning.server.knowledge.entity.KnowledgeNote;
import e_learning.server.knowledge.enums.KnowledgeNoteStatus;
import e_learning.server.knowledge.repository.KnowledgeNoteRepository;
import e_learning.server.knowledge.repository.KnowledgeNoteTopicLinkRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class StudentKnowledgeNoteServiceTest {
    private final KnowledgeNoteRepository notes = mock(KnowledgeNoteRepository.class);
    private final TopicRepository topics = mock(TopicRepository.class);
    private final KnowledgeNoteTopicLinkRepository links = mock(KnowledgeNoteTopicLinkRepository.class);
    private final StudentUnitService studentUnits = mock(StudentUnitService.class);
    private final StudentKnowledgeNoteService service =
            new StudentKnowledgeNoteService(notes, topics, links, studentUnits);
    private KnowledgeNote note;

    @BeforeEach
    void setUp() {
        when(studentUnits.getStudentGradeId(7L)).thenReturn(2L);
        Grade grade = mock(Grade.class);
        when(grade.getId()).thenReturn(2L);
        note = new KnowledgeNote();
        note.setId(10L);
        note.setTitle("Present Simple");
        note.setGrade(grade);
        note.setStatus(KnowledgeNoteStatus.PUBLISHED);
        note.setDocumentJson(Map.of("type", "doc", "content", List.of()));
        when(notes.findById(10L)).thenReturn(Optional.of(note));
    }

    @Test
    void readsPublishedNoteWithinCurrentGrade() {
        var response = service.get(7L, 10L);
        assertEquals("Present Simple", response.title());
        assertEquals(10L, response.id());
    }

    @Test
    void hidesUnpublishedNoteEvenWithKnownId() {
        note.setStatus(KnowledgeNoteStatus.UNPUBLISHED);
        assertThrows(AppException.class, () -> service.get(7L, 10L));
    }

    @Test
    void hidesPublishedNoteFromOtherGrade() {
        Grade other = mock(Grade.class);
        when(other.getId()).thenReturn(3L);
        note.setGrade(other);
        assertThrows(AppException.class, () -> service.get(7L, 10L));
    }

    @Test
    @SuppressWarnings("unchecked")
    void includesPublishedUnlinkedNotesInLibrary() {
        when(notes.findAll(any(Specification.class), any(Pageable.class)))
                .thenReturn(new PageImpl<>(List.of(note)));
        when(links.findByNoteId(10L)).thenReturn(List.of());
        var page = service.list(7L, null, null, null, 1, 12);
        assertEquals(1, page.items().size());
        assertTrue(page.items().getFirst().units().isEmpty());
    }

    @Test
    void refusesInvalidPagination() {
        assertThrows(AppException.class, () -> service.list(7L, null, null, null, 0, 12));
        assertThrows(AppException.class, () -> service.list(7L, null, null, null, 1, 51));
        verify(notes, never()).findAll(any(Specification.class), any(Pageable.class));
    }
}
