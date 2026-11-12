package e_learning.server.vocabulary.review.service;

import e_learning.server.vocabulary.review.dto.VocabularyProgressDashboardResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Read-only aggregation service for the student Vocabulary Progress dashboard.
 *
 * Implementation checklist (no business logic is implemented here):
 * 1. Resolve the student's visible/accessible Units, then scope all word counts
 *    and progress queries to those Units. Never accept a studentId from the client.
 * 2. Count distinct vocabulary words rated HARD/GOOD/EASY per student-local day
 *    from VocabularyReviewLog. AGAIN and game answers do not qualify.
 * 3. Compute current/longest streak from qualifying days (>= 5 distinct words).
 *    Derive tree milestone 0/3/7/14/30 from the longest streak; it never shrinks.
 * 4. Aggregate the 7-day FSRS due schedule from StudentVocabularyProgress,
 *    including overdue words in today's "due now" figure.
 * 5. Aggregate 84 days of learning activity and visible Unit progress.
 * 6. Rank attention words from recent review ratings; do not modify FSRS data.
 *
 * Follow the contract in VocabularyProgressDashboardResponse.
 * Avoid loading an unbounded review history into memory: prefer DB projections.
 */
@Service
@RequiredArgsConstructor
public class StudentVocabularyProgressService {

    @Transactional(readOnly = true)
    public VocabularyProgressDashboardResponse getDashboard(Long studentId) {
        // TODO: Implement student-scoped dashboard aggregation.
        // A deliberate 501 is safer than returning invented or partial progress data.
        throw new ResponseStatusException(
                HttpStatus.NOT_IMPLEMENTED,
                "Vocabulary Progress aggregation is not implemented yet"
        );
    }
}
