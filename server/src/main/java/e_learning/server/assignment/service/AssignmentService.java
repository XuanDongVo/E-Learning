package e_learning.server.assignment.service;

import e_learning.server.assignment.dto.*;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.assignment.repository.AssignmentQuestionRepository;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.grades.entity.Grade;
import e_learning.server.grades.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final AssignmentQuestionRepository assignmentQuestionRepository;
    private final ClassRepository classRepository;
    private final GradeRepository gradeRepository;

    @Transactional(readOnly = true)
    public List<AssignmentResponse> list() {
        return assignmentRepository.findAllByStatusNotOrderByDueAtAscIdAsc(AssignmentStatus.ARCHIVED)
                .stream().map(assignment -> AssignmentResponse.from(assignment, (int) assignmentQuestionRepository.countByAssignmentId(assignment.getId()))).toList();
    }

    @Transactional(readOnly = true)
    public AssignmentResponse get(Long id) {
        Assignment assignment = find(id);
        return AssignmentResponse.from(assignment, (int) assignmentQuestionRepository.countByAssignmentId(assignment.getId()));
    }

    public AssignmentResponse create(CreateAssignmentRequest request, Long teacherId) {
        String name = request.name().trim();
        String academicYear = request.academicYear().trim();
        Grade grade = resolveGrade(request.gradeId());
        List<Long> classIds = validateClassIds(request.classIds(), grade, academicYear, teacherId);
        if (assignmentRepository.existsByGrade_IdAndAcademicYearAndNameIgnoreCase(
                grade.getId(), academicYear, name)) {
            throw new AppException(ErrorCode.ASSIGNMENT_INVALID_CONFIGURATION);
        }
        validateSchedule(request.startAt(), request.dueAt(), request.timeLimitMinutes());

        Assignment assignment = new Assignment();
        assignment.setGrade(grade);
        assignment.setAcademicYear(academicYear);
        assignment.setClassIds(classIds);
        assignment.setName(name);
        assignment.setDescription(trimToNull(request.description()));
        assignment.setStartAt(request.startAt());
        assignment.setDueAt(request.dueAt());
        assignment.setTimeLimitMinutes(request.timeLimitMinutes());
        assignment.setShowAnswersAfterSubmit(request.showAnswersAfterSubmit() == null || request.showAnswersAfterSubmit());
        return AssignmentResponse.from(assignmentRepository.save(assignment), 0);
    }

    public AssignmentResponse update(Long id, CreateAssignmentRequest request, Long teacherId) {
        Assignment assignment = find(id);

        String name = request.name().trim();
        String academicYear = request.academicYear().trim();
        Grade grade = resolveGrade(request.gradeId());
        List<Long> classIds = validateClassIds(request.classIds(), grade, academicYear, teacherId);

        boolean changedIdentity =
                        !assignment.getName().equalsIgnoreCase(name)
                        || !assignment.getAcademicYear().equalsIgnoreCase(academicYear)
                        || !assignment.getGrade().getId().equals(grade.getId());

        if (changedIdentity
                        && assignmentRepository.existsByGrade_IdAndAcademicYearAndNameIgnoreCase(
                        grade.getId(),
                        academicYear,
                        name
        )) {
            throw new AppException(ErrorCode.ASSIGNMENT_INVALID_CONFIGURATION);
        }

        validateSchedule(request.startAt(), request.dueAt(), request.timeLimitMinutes());

        assignment.setGrade(grade);
        assignment.setAcademicYear(academicYear);
        assignment.setClassIds(classIds);
        assignment.setName(name);
        assignment.setDescription(trimToNull(request.description()));
        assignment.setStartAt(request.startAt());
        assignment.setDueAt(request.dueAt());
        assignment.setTimeLimitMinutes(request.timeLimitMinutes());
        assignment.setShowAnswersAfterSubmit(request.showAnswersAfterSubmit() == null || request.showAnswersAfterSubmit());

        Assignment saved = assignmentRepository.save(assignment);
        return AssignmentResponse.from(saved, (int) assignmentQuestionRepository.countByAssignmentId(saved.getId()));
    }

    public AssignmentResponse updateStatus(Long id, AssignmentStatus status) {
        Assignment assignment = find(id);
        AssignmentStatus current = assignment.getStatus();
        AssignmentStatus next = status;

        // State machine: chỉ cho phép các transition hợp lệ
        boolean allowed = (current == AssignmentStatus.DRAFT && (next == AssignmentStatus.PUBLISHED || next == AssignmentStatus.ARCHIVED))
                || (current == AssignmentStatus.PUBLISHED && next == AssignmentStatus.ARCHIVED)
                || (current == AssignmentStatus.ARCHIVED && next == AssignmentStatus.DRAFT);
        if (!allowed) {
            throw new AppException(ErrorCode.ASSIGNMENT_STATUS_TRANSITION_INVALID);
        }

        if (next == AssignmentStatus.PUBLISHED) {
            validateReadyForPublish(assignment);
        }

        assignment.setStatus(next);
        Assignment saved = assignmentRepository.save(assignment);
        return AssignmentResponse.from(saved, (int) assignmentQuestionRepository.countByAssignmentId(saved.getId()));
    }

    /**
     * Kiểm tra điều kiện để publish một Assignment:
     * 1. Phải có ít nhất 1 câu hỏi.
     * 2. Tất cả câu hỏi phải hoàn chỉnh (complete = true) — không được có câu nào chưa xong.
     * 3. dueAt phải trong tương lai (assignment chưa hết hạn).
     */
    private void validateReadyForPublish(Assignment assignment) {
        long total = assignmentQuestionRepository.countByAssignmentId(assignment.getId());
        if (total == 0) {
            throw new AppException(ErrorCode.ASSIGNMENT_NOT_READY);
        }

        long complete = assignmentQuestionRepository.countByAssignmentIdAndQuestionCompleteTrue(assignment.getId());
        if (complete != total) {
            throw new AppException(ErrorCode.ASSIGNMENT_NOT_READY);
        }

        if (!assignment.getDueAt().isAfter(LocalDateTime.now())) {
            throw new AppException(ErrorCode.ASSIGNMENT_NOT_READY);
        }
    }


    private Grade resolveGrade(Long gradeId) {
        if (gradeId == null) {
            throw new AppException(ErrorCode.GRADE_NOT_FOUND);
        }
        return gradeRepository.findById(gradeId)
                .orElseThrow(() -> new AppException(ErrorCode.GRADE_NOT_FOUND));
    }

    private List<Long> validateClassIds(
            List<Long> classIds,
            Grade grade,
            String academicYear,
            Long teacherId
    ) {
        if (classIds == null || classIds.isEmpty()) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_REQUIRED);
        }
        if (classIds.stream().anyMatch(id -> id == null)) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
        }
        Set<Long> uniqueIds = new HashSet<>(classIds);
        if (uniqueIds.size() != classIds.size()) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
        }

        List<ClassEntity> classes = classRepository.findAllById(uniqueIds);
        if (classes.size() != uniqueIds.size()) {
            throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
        }
        for (ClassEntity classEntity : classes) {
            if (!classEntity.getTeacher().getId().equals(teacherId)
                    || !classEntity.getGrade().getId().equals(grade.getId())
                    || !classEntity.getAcademicYear().trim().equals(academicYear)) {
                throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
            }
        }
        return List.copyOf(classIds);
    }

    private Assignment find(Long id) {
        return assignmentRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
    }

    private void validateSchedule(LocalDateTime startAt, LocalDateTime dueAt, Integer timeLimitSeconds) {
        if (dueAt == null || (startAt != null && !startAt.isBefore(dueAt))) {
            throw new AppException(ErrorCode.ASSIGNMENT_SCHEDULE_INVALID);
        }
        if (timeLimitSeconds != null && timeLimitSeconds <= 0) {
            throw new AppException(ErrorCode.ASSIGNMENT_TIME_LIMIT_INVALID);
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.trim().isEmpty()) return null;
        return value.trim();
    }
}
