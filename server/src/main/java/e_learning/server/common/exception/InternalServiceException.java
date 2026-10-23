package e_learning.server.common.exception;

/**
 * Signals an unexpected failure inside an application/infrastructure component.
 *
 * This exception is intentionally not exposed to API clients. The global
 * exception boundary maps it to INTERNAL_ERROR while retaining the cause for
 * server-side diagnostics.
 */
public class InternalServiceException extends RuntimeException {

    public InternalServiceException(String message) {
        super(message);
    }

    public InternalServiceException(String message, Throwable cause) {
        super(message, cause);
    }
}
