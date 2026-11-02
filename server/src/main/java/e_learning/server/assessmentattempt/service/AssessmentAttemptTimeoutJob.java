package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Periodically finalizes IN_PROGRESS attempts whose deadline has passed.
 * Job is a fallback only: saveAnswer and submit also enforce deadline_at (ADR 0009).
 * Candidates are deadline_at &lt;= now — no grace window.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AssessmentAttemptTimeoutJob {
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAttemptSubmitService submitService;

    @Scheduled(fixedDelayString = "${assessment-attempt.timeout.scan-ms:60000}")
    public void scanTimeouts() {
        LocalDateTime cutoff = LocalDateTime.now();
        List<Long> ids = attemptRepository.findIdsDueForTimeout(cutoff);
        if (ids.isEmpty()) {
            return;
        }

        log.info("AssessmentAttempt timeout scan: {} candidate(s)", ids.size());
        for (Long id : ids) {
            try {
                submitService.finalizeTimeoutIfDue(id);
            } catch (Exception ex) {
                log.warn("Failed to finalize timed-out attempt id={}: {}", id, ex.getMessage());
            }
        }
    }
}
