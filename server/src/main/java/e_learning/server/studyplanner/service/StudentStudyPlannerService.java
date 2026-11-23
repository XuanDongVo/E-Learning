package e_learning.server.studyplanner.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.studyplanner.dto.StudyTaskCompletionRequest;
import e_learning.server.studyplanner.dto.StudyTaskResponse;
import e_learning.server.studyplanner.dto.StudyTaskUpsertRequest;
import e_learning.server.studyplanner.entity.StudentStudyTask;
import e_learning.server.studyplanner.repository.StudentStudyTaskRepository;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentStudyPlannerService {
    private final StudentStudyTaskRepository tasks;
    private final UserRepository users;

    @Transactional(readOnly = true)
    public List<StudyTaskResponse> list(Long studentId) {
        return tasks.findByStudentIdOrderByCompletedAscPlannedDateAscCreatedAtDesc(studentId)
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public StudyTaskResponse create(Long studentId, StudyTaskUpsertRequest request) {
        User student = users.findById(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        StudentStudyTask task = new StudentStudyTask();
        task.setStudent(student);
        apply(task, request);
        return toResponse(tasks.saveAndFlush(task));
    }

    @Transactional
    public StudyTaskResponse update(Long studentId, Long taskId, StudyTaskUpsertRequest request) {
        StudentStudyTask task = owned(studentId, taskId);
        apply(task, request);
        return toResponse(tasks.saveAndFlush(task));
    }

    @Transactional
    public StudyTaskResponse setCompletion(Long studentId, Long taskId, StudyTaskCompletionRequest request) {
        StudentStudyTask task = owned(studentId, taskId);
        task.setCompletion(request.completed());
        return toResponse(tasks.saveAndFlush(task));
    }

    @Transactional
    public void delete(Long studentId, Long taskId) {
        tasks.delete(owned(studentId, taskId));
    }

    private StudentStudyTask owned(Long studentId, Long taskId) {
        return tasks.findByIdAndStudentId(taskId, studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDY_TASK_NOT_FOUND));
    }

    private void apply(StudentStudyTask task, StudyTaskUpsertRequest request) {
        String title = request.title() == null ? "" : request.title().trim();
        if (title.isEmpty()) throw new AppException(ErrorCode.INVALID_REQUEST, "Task title is required");
        task.setTitle(title);
        task.setNotes(request.notes() == null || request.notes().isBlank() ? null : request.notes().trim());
        task.setPlannedDate(request.plannedDate());
    }

    private StudyTaskResponse toResponse(StudentStudyTask task) {
        return new StudyTaskResponse(task.getId(), task.getTitle(), task.getNotes(),
                task.getPlannedDate(), task.isCompleted(), task.getCompletedAt(),
                task.getCreatedAt(), task.getUpdatedAt());
    }
}
