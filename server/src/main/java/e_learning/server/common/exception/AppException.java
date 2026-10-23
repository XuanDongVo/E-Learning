package e_learning.server.common.exception;

public class AppException extends RuntimeException {

    private final ErrorCode errorCode;

    public AppException(ErrorCode errorCode) {
        super(errorCode.message());
        this.errorCode = errorCode;
    }

    public AppException(ErrorCode errorCode, String detail) {
        super(detail == null || detail.isBlank() ? errorCode.message() : detail);
        this.errorCode = errorCode;
    }

    public ErrorCode getErrorCode() {
        return errorCode;
    }
}