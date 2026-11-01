package e_learning.server.assignmentanalysis.service;

import e_learning.server.assignment.entity.Assignment;
import e_learning.server.assignment.repository.AssignmentRepository;
import e_learning.server.assignmentanalysis.dto.AssignmentAnalysisOverviewResponse;
import e_learning.server.assignmentanalysis.dto.AssignmentAnalysisSummaryDto;
import e_learning.server.assignmentanalysis.dto.AttemptReviewResponse;
import e_learning.server.assignmentanalysis.dto.ClassComparisonRowDto;
import e_learning.server.assignmentanalysis.dto.PageMetaDto;
import e_learning.server.assignmentanalysis.dto.ProgressCountsDto;
import e_learning.server.assignmentanalysis.dto.QuestionAnalysisListResponse;
import e_learning.server.assignmentanalysis.dto.ScoreBucketDto;
import e_learning.server.assignmentanalysis.dto.ScoreSummaryDto;
import e_learning.server.assignmentanalysis.dto.StudentResultsPageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * Teacher Assignment Analysis aggregates.
 * MVP skeleton: validates assignment access and returns empty/structure-stable payloads.
 * Real aggregation (roster + attempts + part results) is the next implementation slice.
 */
@Service
@RequiredArgsConstructor
public class AssignmentAnalysisService {

    private final AssignmentRepository assignmentRepository;

    @Transactional(readOnly = true)
    public AssignmentAnalysisOverviewResponse getOverview(Long assignmentId, Long teacherId) {
        Assignment assignment = requireAssignment(assignmentId);
        // Single-teacher deployment: presence of assignment is enough for MVP auth.

        List<ScoreBucketDto> buckets = new ArrayList<>();
        for (int i = 0; i < 10; i++) {
            buckets.add(new ScoreBucketDto(i * 10, i * 10 + 10, 0));
        }

        return new AssignmentAnalysisOverviewResponse(
                new AssignmentAnalysisSummaryDto(
                        assignment.getId(),
                        assignment.getName(),
                        assignment.getStatus() != null ? assignment.getStatus().name() : "UNKNOWN",
                        assignment.getDueAt() != null ? assignment.getDueAt().toString() : null,
                        assignment.getTimeLimitMinutes(),
                        BigDecimal.ZERO,
                        0,
                        assignment.getClassIds() != null ? assignment.getClassIds().size() : 0
                ),
                new ProgressCountsDto(0, 0, 0, 0, 0, 0, 0, null),
                new ScoreSummaryDto(0, null, null, null, null, buckets),
                List.<ClassComparisonRowDto>of()
        );
    }

    @Transactional(readOnly = true)
    public StudentResultsPageResponse getStudents(
            Long assignmentId,
            Long teacherId,
            int page,
            int size,
            String lifecycleStatus,
            String deadlineState,
            Long classId,
            String search
    ) {
        requireAssignment(assignmentId);
        int safePage = Math.max(0, page);
        int safeSize = Math.min(100, Math.max(1, size));
        return new StudentResultsPageResponse(
                List.of(),
                new PageMetaDto(safePage, safeSize, 0, 0)
        );
    }

    @Transactional(readOnly = true)
    public QuestionAnalysisListResponse getQuestions(Long assignmentId, Long teacherId) {
        requireAssignment(assignmentId);
        return new QuestionAnalysisListResponse(List.of());
    }

    @Transactional(readOnly = true)
    public AttemptReviewResponse getAttemptReview(Long assignmentId, Long studentId, Long teacherId) {
        requireAssignment(assignmentId);
        throw new AppException(ErrorCode.ASSESSMENT_ATTEMPT_NOT_FOUND);
    }

    private Assignment requireAssignment(Long assignmentId) {
        return assignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new AppException(ErrorCode.ASSIGNMENT_NOT_FOUND));
    }
}
