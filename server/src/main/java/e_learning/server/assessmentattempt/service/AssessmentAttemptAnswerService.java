package e_learning.server.assessmentattempt.service;

import e_learning.server.assessmentattempt.dto.request.SaveAttemptAnswerRequest;
import e_learning.server.assessmentattempt.dto.response.SaveAttemptAnswerResponse;
import org.springframework.stereotype.Service;

/**
 * Answer autosave implementation scaffold.
 *
 * This class deliberately contains no business logic. Implement the TODOs in order,
 * and add tests before considering the endpoint ready for use.
 */
@Service
public class AssessmentAttemptAnswerService {

    /**
     * TODO 1: Define transaction boundary and lock the AssessmentAttempt.
     * TODO 2: Resolve/replay idempotency using requestId and canonical payload hash.
     * TODO 3: Verify student ownership, activeSessionId, attempt state and deadline.
     * TODO 4: Verify attemptQuestionId belongs to attemptId.
     * TODO 5: Validate draft payload against the immutable question snapshot.
     * TODO 6: Compare expectedRevision with the current answer revision.
     * TODO 7: Persist answer + idempotency mutation atomically and update last activity.
     * TODO 8: Return a SaveAttemptAnswerResponse acknowledgement without grading data.
     *
     * Not implemented intentionally. The endpoint must not be considered usable yet.
     */
    public SaveAttemptAnswerResponse saveAnswer(
            Long attemptId,
            Long attemptQuestionId,
            Long studentId,
            SaveAttemptAnswerRequest request
    ) {
        throw new UnsupportedOperationException(
                "Answer autosave scaffold only: implement saveAnswer business logic first"
        );
    }
}
