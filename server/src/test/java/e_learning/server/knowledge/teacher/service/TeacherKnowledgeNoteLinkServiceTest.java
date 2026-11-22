package e_learning.server.knowledge.teacher.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.section.entity.Section;
import e_learning.server.content.topic.entity.Topic;
import e_learning.server.content.topic.repository.TopicRepository;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.grades.entity.Grade;
import e_learning.server.knowledge.entity.KnowledgeNote;
import e_learning.server.knowledge.entity.KnowledgeNoteTopicLink;
import e_learning.server.knowledge.enums.KnowledgeNoteStatus;
import e_learning.server.knowledge.repository.KnowledgeNoteRepository;
import e_learning.server.knowledge.repository.KnowledgeNoteTopicLinkRepository;
import e_learning.server.knowledge.teacher.validation.KnowledgeNoteContentValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.argThat;
import static org.mockito.Mockito.*;

class TeacherKnowledgeNoteLinkServiceTest {
    private final TopicRepository topics = mock(TopicRepository.class);
    private final KnowledgeNoteRepository notes = mock(KnowledgeNoteRepository.class);
    private final KnowledgeNoteTopicLinkRepository links = mock(KnowledgeNoteTopicLinkRepository.class);
    private final KnowledgeNoteContentValidator validator = mock(KnowledgeNoteContentValidator.class);
    private final TeacherKnowledgeNoteLinkService service =
            new TeacherKnowledgeNoteLinkService(topics, notes, links, validator);

    private Topic topic;
    private KnowledgeNote note;

    @BeforeEach
    void setup() {
        Grade grade = mock(Grade.class);
        when(grade.getId()).thenReturn(7L);
        Unit unit = new Unit();
        unit.setGrade(grade);
        Section section = new Section();
        section.setUnit(unit);
        topic = new Topic();
        topic.setId(3L);
        topic.setSection(section);
        topic.setStatus(ContentStatus.DRAFT);
        note = new KnowledgeNote();
        note.setId(11L);
        note.setGrade(grade);
        note.setStatus(KnowledgeNoteStatus.PUBLISHED);
        note.setDocumentJson(Map.of("type", "doc", "content", List.of()));
        when(topics.findByIdForUpdate(3L)).thenReturn(Optional.of(topic));
        when(topics.findById(3L)).thenReturn(Optional.of(topic));
        when(notes.findById(11L)).thenReturn(Optional.of(note));
        when(links.findByTopicIdOrderByDisplayOrderAsc(3L)).thenReturn(List.of());
        when(validator.hasHeading(any())).thenReturn(true);
        when(validator.hasKeyPoint(any())).thenReturn(true);
    }

    @Test
    void attachesPublishedSupplementary() {
        service.link(3L, 11L, false);
        verify(links).saveAndFlush(argThat(item -> item.getNote().getId().equals(11L)
                && !item.isPrimary()));
    }

    @Test
    void rejectsDifferentGrade() {
        Grade different = mock(Grade.class);
        when(different.getId()).thenReturn(8L);
        note.setGrade(different);
        assertThrows(AppException.class, () -> service.link(3L, 11L, false));
        verify(links, never()).saveAndFlush(any());
    }

    @Test
    void rejectsUnpublishedNote() {
        note.setStatus(KnowledgeNoteStatus.UNPUBLISHED);
        assertThrows(AppException.class, () -> service.link(3L, 11L, false));
        verify(links, never()).saveAndFlush(any());
    }

    @Test
    void rejectsPrimaryWithoutKeyPoint() {
        when(validator.hasKeyPoint(any())).thenReturn(false);
        assertThrows(AppException.class, () -> service.link(3L, 11L, true));
        verify(links, never()).saveAndFlush(any());
    }

    @Test
    void demotesOldPrimaryBeforeSavingNewOne() {
        KnowledgeNote previousNote = new KnowledgeNote();
        previousNote.setId(9L);
        previousNote.setGrade(note.getGrade());
        previousNote.setTitle("Previously linked");
        KnowledgeNoteTopicLink previousLink = new KnowledgeNoteTopicLink();
        previousLink.setId(100L);
        previousLink.setNote(previousNote);
        previousLink.setPrimary(true);
        previousLink.setDisplayOrder(0);
        when(links.findByTopicIdOrderByDisplayOrderAsc(3L))
                .thenReturn(List.of(previousLink));
        service.link(3L, 11L, true);
        assertFalse(previousLink.isPrimary());
        var order = inOrder(links);
        order.verify(links).flush();
        order.verify(links).saveAndFlush(any(KnowledgeNoteTopicLink.class));
    }

    @Test
    void promotesExistingSupplementaryWithoutCreatingDuplicateLink() {
        KnowledgeNoteTopicLink existing = new KnowledgeNoteTopicLink();
        existing.setId(30L);
        existing.setNote(note);
        existing.setTopic(topic);
        existing.setPrimary(false);
        existing.setDisplayOrder(2);
        when(links.findByTopicIdOrderByDisplayOrderAsc(3L)).thenReturn(List.of(existing));

        var result = service.link(3L, 11L, true);

        assertTrue(existing.isPrimary());
        assertEquals(2, existing.getDisplayOrder());
        assertEquals(1, result.size());
        assertTrue(result.getFirst().primary());
        verify(links).saveAndFlush(existing);
    }

    @Test
    void cannotModifyArchivedTopic() {
        topic.setStatus(ContentStatus.ARCHIVED);
        assertThrows(AppException.class, () -> service.link(3L, 11L, true));
        assertThrows(AppException.class, () -> service.unlink(3L, 11L));
        assertThrows(AppException.class, () -> service.reorderSupplementary(3L, List.of()));
    }

    @Test
    void reorderRejectsMissingSupplementary() {
        KnowledgeNoteTopicLink supplement = new KnowledgeNoteTopicLink();
        supplement.setNote(note);
        supplement.setDisplayOrder(1);
        when(links.findByTopicIdOrderByDisplayOrderAsc(3L)).thenReturn(List.of(supplement));
        assertThrows(AppException.class, () -> service.reorderSupplementary(3L, List.of()));
    }
}
