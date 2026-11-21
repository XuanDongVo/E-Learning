package e_learning.server.knowledge.student.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.content.topic.repository.TopicRepository;
import e_learning.server.content.unit.service.StudentUnitService;
import e_learning.server.grades.entity.Grade;
import e_learning.server.knowledge.entity.KnowledgeNote;
import e_learning.server.knowledge.entity.KnowledgeNoteTopicLink;
import e_learning.server.content.topic.entity.Topic;
import e_learning.server.content.section.entity.Section;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.common.enums.ContentStatus;
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
        assertEquals(1, page.getItems().size());
        assertTrue(page.getItems().getFirst().units().isEmpty());
    }

    @Test
    void extractsOnlyMarkedPrimaryKnowledgeForPublishedVisibleTopic() {
        var topic = mock(Topic.class);
        var section = mock(Section.class);
        var unit = mock(Unit.class);
        var grade = mock(Grade.class);
        when(grade.getId()).thenReturn(2L);
        when(topic.getSection()).thenReturn(section);
        when(section.getUnit()).thenReturn(unit);
        when(unit.getGrade()).thenReturn(grade);
        when(unit.getId()).thenReturn(99L);
        when(topic.getStatus()).thenReturn(ContentStatus.PUBLISHED);
        when(section.getStatus()).thenReturn(ContentStatus.PUBLISHED);
        when(unit.getStatus()).thenReturn(ContentStatus.PUBLISHED);
        when(topics.findById(3L)).thenReturn(Optional.of(topic));
        when(studentUnits.requireVisibleUnit(7L, 99L)).thenReturn(unit);

        var block = Map.<String, Object>of(
                "type", "learningBlock", "attrs", Map.of("isKeyPoint", true),
                "content", List.of(Map.of("type", "text", "text", "Ví dụ")));
        note.setDocumentJson(Map.of("type", "doc", "content", List.of(
                Map.of("type", "heading", "attrs", Map.of("level", 2),
                        "content", List.of(Map.of("type", "text", "text", "Công thức"))),
                Map.of("type", "paragraph", "content", List.of(
                        Map.of("type", "text", "text", "Not marked"))),
                block)));
        var link = mock(KnowledgeNoteTopicLink.class);
        when(link.getNote()).thenReturn(note);
        when(link.isPrimary()).thenReturn(true);
        when(links.findByTopicIdOrderByDisplayOrderAsc(3L)).thenReturn(List.of(link));
        var result = service.forTopic(7L, 3L);
        assertNotNull(result.primary());
        assertEquals(1, result.primary().totalKeyPoints());
        var excerpt = (List<?>) result.primary().summaryDocument().get("content");
        assertEquals(2, excerpt.size());
        assertFalse(excerpt.toString().contains("Not marked"));
    }

    @Test
    void rejectsUnpublishedTopicWithoutReadingLinks() {
        var topic = mock(Topic.class);
        when(topic.getSection()).thenReturn(mock(Section.class));
        var section = topic.getSection();
        var unit = mock(Unit.class);
        var grade = mock(Grade.class);
        when(section.getUnit()).thenReturn(unit);
        when(unit.getGrade()).thenReturn(grade);
        when(grade.getId()).thenReturn(2L);
        when(topic.getStatus()).thenReturn(ContentStatus.DRAFT);
        when(topics.findById(3L)).thenReturn(Optional.of(topic));
        assertThrows(AppException.class, () -> service.forTopic(7L, 3L));
        verify(links, never()).findByTopicIdOrderByDisplayOrderAsc(any());
    }

    @Test
    void refusesInvalidPagination() {
        assertThrows(AppException.class, () -> service.list(7L, null, null, null, 0, 12));
        assertThrows(AppException.class, () -> service.list(7L, null, null, null, 1, 51));
        verify(notes, never()).findAll(any(Specification.class), any(Pageable.class));
    }
}
