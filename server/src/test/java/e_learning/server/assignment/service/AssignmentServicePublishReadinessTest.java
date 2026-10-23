package e_learning.server.assignment.service;

import e_learning.server.assignment.dto.AssignmentResponse;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.entity.AssignmentItem;
import e_learning.server.assignment.entity.AssignmentQuestion;
import e_learning.server.assignment.entity.AssignmentSection;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.AssignmentItemRepository;
import e_learning.server.assignment.repository.AssignmentQuestionRepository;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.assignment.repository.AssignmentSectionRepository;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.grades.entity.Grade;
import e_learning.server.grades.repository.GradeRepository;
import e_learning.server.question.entity.Question;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AssignmentServicePublishReadinessTest {
    private AssignmentRepository assignmentRepository;
    private AssignmentQuestionRepository questionRepository;
    private AssignmentSectionRepository sectionRepository;
    private AssignmentItemRepository itemRepository;
    private ClassRepository classRepository;
    private GradeRepository gradeRepository;
    private AssignmentService service;

    private Assignment assignment;
    private Grade grade;
    private ClassEntity targetClass;
    private AssignmentSection section;
    private AssignmentQuestion ownership;
    private Question question;
    private AssignmentItem item;

    @BeforeEach
    void setUp() {
        assignmentRepository = mock(AssignmentRepository.class);
        questionRepository = mock(AssignmentQuestionRepository.class);
        sectionRepository = mock(AssignmentSectionRepository.class);
        itemRepository = mock(AssignmentItemRepository.class);
        classRepository = mock(ClassRepository.class);
        gradeRepository = mock(GradeRepository.class);
        service = new AssignmentService(
                assignmentRepository, questionRepository, sectionRepository, itemRepository,
                classRepository, gradeRepository
        );

        grade = mock(Grade.class);
        when(grade.getId()).thenReturn(6L);
        when(grade.getCode()).thenReturn("6");
        when(grade.getName()).thenReturn("Grade 6");
        when(grade.getDisplayOrder()).thenReturn(6);

        assignment = mock(Assignment.class);
        when(assignment.getId()).thenReturn(10L);
        when(assignment.getStatus()).thenReturn(AssignmentStatus.DRAFT);
        when(assignment.getName()).thenReturn("Unit 1 Assignment");
        when(assignment.getGrade()).thenReturn(grade);
        when(assignment.getAcademicYear()).thenReturn("2026-2027");
        when(assignment.getClassIds()).thenReturn(List.of(20L));
        when(assignment.getStartAt()).thenReturn(LocalDateTime.now().minusMinutes(1));
        when(assignment.getDueAt()).thenReturn(LocalDateTime.now().plusDays(1));
        when(assignment.getTimeLimitMinutes()).thenReturn(30);
        when(assignment.getClassIds()).thenReturn(List.of(20L));
        when(assignment.isShowAnswersAfterSubmit()).thenReturn(true);

        targetClass = mock(ClassEntity.class);
        when(targetClass.getId()).thenReturn(20L);
        when(targetClass.getGrade()).thenReturn(grade);
        when(targetClass.getAcademicYear()).thenReturn("2026-2027");
        when(classRepository.findAllById(anySet())).thenReturn(List.of(targetClass));

        question = mock(Question.class);
        when(question.isComplete()).thenReturn(true);
        ownership = mock(AssignmentQuestion.class);
        when(ownership.getQuestionId()).thenReturn(30L);
        when(ownership.getQuestion()).thenReturn(question);
        when(questionRepository.findAllByAssignmentIdOrderByQuestionIdAsc(10L)).thenReturn(List.of(ownership));
        when(questionRepository.countByAssignmentId(10L)).thenReturn(1L);

        section = mock(AssignmentSection.class);
        when(section.getId()).thenReturn(40L);
        when(section.getPosition()).thenReturn(1);
        when(section.getTitle()).thenReturn("Section 1");
        when(sectionRepository.findAllByAssignmentIdOrderByPositionAscIdAsc(10L)).thenReturn(List.of(section));

        item = mock(AssignmentItem.class);
        when(item.getId()).thenReturn(50L);
        when(item.getAssignment()).thenReturn(assignment);
        when(item.getSection()).thenReturn(section);
        when(item.getPosition()).thenReturn(1);
        when(item.getItemType()).thenReturn("QUESTION");
        when(item.getQuestionId()).thenReturn(30L);
        when(item.getPossiblePoints()).thenReturn(BigDecimal.ONE);
        when(item.isExample()).thenReturn(false);
        when(item.getBlockPayload()).thenReturn(null);
        when(item.getParentItem()).thenReturn(null);
        when(itemRepository.findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc(10L))
                .thenReturn(List.of(item));

        when(assignmentRepository.findById(10L)).thenReturn(Optional.of(assignment));
        when(assignmentRepository.save(assignment)).thenReturn(assignment);
    }

    @Test
    void publishesWhenMetadataCompositionQuestionsAndScoringAreValid() {
        assertDoesNotThrow(() -> service.updateStatus(10L, AssignmentStatus.PUBLISHED));
        verify(assignment).setStatus(AssignmentStatus.PUBLISHED);
    }

    @Test
    void rejectsPublishWhenTimeLimitIsNotGreaterThanOneMinute() {
        when(assignment.getTimeLimitMinutes()).thenReturn(1);

        AppException error = assertThrows(
                AppException.class,
                () -> service.updateStatus(10L, AssignmentStatus.PUBLISHED)
        );

        assertEquals(ErrorCode.ASSIGNMENT_NOT_READY, error.getErrorCode());
        assertTrue(error.getMessage().contains("time limit"));
        verify(assignment, never()).setStatus(AssignmentStatus.PUBLISHED);
    }

    @Test
    void rejectsPublishWhenQuestionIsIncomplete() {
        when(question.isComplete()).thenReturn(false);

        AppException error = assertThrows(
                AppException.class,
                () -> service.updateStatus(10L, AssignmentStatus.PUBLISHED)
        );

        assertEquals(ErrorCode.ASSIGNMENT_NOT_READY, error.getErrorCode());
        assertTrue(error.getMessage().contains("Question 30"));
    }

    @Test
    void rejectsPublishWhenAllScoredPointsAreZero() {
        when(item.isExample()).thenReturn(true);
        when(item.getPossiblePoints()).thenReturn(BigDecimal.ZERO);

        AppException error = assertThrows(
                AppException.class,
                () -> service.updateStatus(10L, AssignmentStatus.PUBLISHED)
        );

        assertEquals(ErrorCode.ASSIGNMENT_NOT_READY, error.getErrorCode());
        assertTrue(error.getMessage().contains("zero possible scored points"));
    }

    @Test
    void rejectsPublishWhenOwnedQuestionIsMissingFromComposition() {
        when(itemRepository.findAllByAssignmentIdOrderBySectionIdAscParentItemIdAscPositionAscIdAsc)
                .thenReturn(List.of());

        AppException error = assertThrows(
                AppException.class,
                () -> service.updateStatus(10L, AssignmentStatus.PUBLISHED)
        );

        assertEquals(ErrorCode.ASSIGNMENT_NOT_READY, error.getErrorCode());
        assertTrue(error.getMessage().contains("at least one item"));
    }
}
