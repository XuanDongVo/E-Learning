package e_learning.server.question.engine.exception;

/**
 * Signals a violated invariant or impossible state inside the question engine.
 *
 * The engine remains independent from API-level AppException semantics. The
 * global exception boundary maps this exception to INTERNAL_ERROR when it
 * escapes the application layer.
 */
public class QuestionEngineException extends RuntimeException {

    public QuestionEngineException(String message) {
        super(message);
    }

    public QuestionEngineException(String message, Throwable cause) {
        super(message, cause);
    }
}
