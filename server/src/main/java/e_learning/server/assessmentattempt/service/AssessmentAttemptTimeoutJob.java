package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.repository.AssessmentAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Periodically finalizes IN_PROGRESS attempts whose deadline has passed.
 * Grace minutes keep a short window so a late manual submit can still win the race.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AssessmentAttemptTimeoutJob {
    private final AssessmentAttemptRepository attemptRepository;
    private final AssessmentAttemptSubmitService submitService;

    @Value("${assessment-attempt.timeout.grace-minutes:5}")
    private long graceMinutes;

    @Scheduled(fixedDelayString = "${assessment-attempt.timeout.scan-ms:60000}")
    public void scanTimeouts() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(Math.max(0, graceMinutes));
        List<Long> ids = attemptRepository.findIdsDueForTimeout(cutoff);
        if (ids.isEmpty()) {
            return;
        }

        log.info("AssessmentAttempt timeout scan: {} candidate(s) (graceMinutes={})", ids.size(), graceMinutes);
        for (Long id : ids) {
            try {
                submitService.finalizeTimeoutIfDue(id);
            } catch (Exception ex) {
                log.warn("Failed to finalize timed-out attempt id={}: {}", id, ex.getMessage());
            }
        }
    }
}
