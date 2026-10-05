package e_learning.server.assignment.service;

import e_learning.server.assignment.dto.*;
import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.entity.AssignmentTarget;
import e_learning.server.assignment.enums.AssignmentStatus;
import e_learning.server.assignment.enums.AssignmentTargetType;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.assignment.repository.AssignmentQuestionRepository;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssignmentService {
    private final AssignmentRepository assignmentRepository;
    private final AssignmentQuestionRepository assignmentQuestionRepository;
    private final ClassRepository classRepository;

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
        if (assignmentRepository.existsByGradeLevelAndAcademicYearAndNameIgnoreCase(
                request.gradeLevel(), request.academicYear().trim(), name)) {
            throw new AppException(ErrorCode.ASSIGNMENT_INVALID_CONFIGURATION);
        }
        validateSchedule(request.startAt(), request.dueAt(), request.timeLimitSeconds());

        Assignment assignment = new Assignment();
        assignment.setGradeLevel(request.gradeLevel());
        assignment.setAcademicYear(request.academicYear().trim());
        assignment.setName(name);
        assignment.setDescription(trimToNull(request.description()));
        assignment.setStartAt(request.startAt());
        assignment.setDueAt(request.dueAt());
        assignment.setTimeLimitSeconds(request.timeLimitSeconds());
        assignment.replaceTargets(resolveTargets(request.targets(), request.gradeLevel(), request.academicYear(), teacherId));
        return AssignmentResponse.from(assignmentRepository.save(assignment), 0);
    }

    public AssignmentResponse update(Long id, CreateAssignmentRequest request, Long teacherId) {
        Assignment assignment = find(id);

        String name = request.name().trim();
        String academicYear = request.academicYear().trim();

        boolean changedIdentity =
                !assignment.getName().equalsIgnoreCase(name)
                        || !assignment.getAcademicYear().equalsIgnoreCase(academicYear)
                        || !assignment.getGradeLevel().equals(request.gradeLevel());

        if (changedIdentity
                && assignmentRepository.existsByGradeLevelAndAcademicYearAndNameIgnoreCase(
                request.gradeLevel(),
                academicYear,
                name
        )) {
            throw new AppException(ErrorCode.ASSIGNMENT_INVALID_CONFIGURATION);
        }

        validateSchedule(request.startAt(), request.dueAt(), request.timeLimitSeconds());

        assignment.setGradeLevel(request.gradeLevel());
        assignment.setAcademicYear(academicYear);
        assignment.setName(name);
        assignment.setDescription(trimToNull(request.description()));
        assignment.setStartAt(request.startAt());
        assignment.setDueAt(request.dueAt());
        assignment.setTimeLimitSeconds(request.timeLimitSeconds());

        // Update targets
        assignment.replaceTargets(resolveTargets(request.targets(), request.gradeLevel(), request.academicYear(), teacherId));
        Assignment saved = assignmentRepository.save(assignment);
        return AssignmentResponse.from(saved, (int) assignmentQuestionRepository.countByAssignmentId(saved.getId()));
    }

    public AssignmentResponse updateStatus(Long id, AssignmentStatus status) {
        Assignment assignment = find(id);
        assignment.setStatus(status);
        Assignment saved = assignmentRepository.save(assignment);
        return AssignmentResponse.from(saved, (int) assignmentQuestionRepository.countByAssignmentId(saved.getId()));
    }


    private List<AssignmentTarget> resolveTargets(
            List<AssignmentTargetRequest> requests,
            Integer gradeLevel,
            String academicYear,
            Long teacherId
    ) {
        if (requests == null || requests.isEmpty()) throw new AppException(ErrorCode.ASSIGNMENT_TARGET_REQUIRED);
        boolean hasGrade = requests.stream().anyMatch(target -> target.type() == AssignmentTargetType.GRADE);
        if (hasGrade && requests.size() > 1) throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);

        List<AssignmentTarget> targets = new ArrayList<>();
        for (AssignmentTargetRequest request : requests) {
            AssignmentTarget target = new AssignmentTarget();
            target.setTargetType(request.type());
            if (request.type() == AssignmentTargetType.CLASS) {
                if (request.classId() == null) throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
                ClassEntity classEntity = classRepository.findById(request.classId())
                        .filter(item -> item.getTeacher().getId().equals(teacherId))
                        .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID));
                if (!classEntity.getGrade().getDisplayOrder().equals(gradeLevel)
                        || !classEntity.getAcademicYear().equals(academicYear)) {
                    throw new AppException(ErrorCode.ASSIGNMENT_TARGET_INVALID);
                }
                target.setClassEntity(classEntity);
            }
            targets.add(target);
        }
        return targets;
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
