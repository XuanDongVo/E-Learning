package e_learning.server.common.exception;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.question.engine.exception.QuestionEngineException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.multipart.MaxUploadSizeExceededException;

@RestControllerAdvice
public class GlobalExceptionHandler {
    @ExceptionHandler(AppException.class)
    public ResponseEntity<ApiResponse<Void>> handleAppException(AppException exception) {
        ErrorCode errorCode = exception.getErrorCode();
        return ResponseEntity.status(errorCode.status())
                .body(ApiResponse.failure(errorCode.code(), exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Void>> handleValidationException(MethodArgumentNotValidException exception) {
        String message = exception.getBindingResult().getFieldErrors().stream()
                .map(error -> error.getDefaultMessage())
                .filter(value -> value != null && !value.isBlank())
                .findFirst().orElse(ErrorCode.VALIDATION_FAILED.message());
        return failure(ErrorCode.VALIDATION_FAILED, message);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Void>> handleConstraintViolation(ConstraintViolationException exception) {
        String message = exception.getConstraintViolations().stream()
                .map(violation -> violation.getMessage())
                .filter(value -> value != null && !value.isBlank())
                .sorted().findFirst().orElse(ErrorCode.VALIDATION_FAILED.message());
        return failure(ErrorCode.VALIDATION_FAILED, message);
    }

    @ExceptionHandler({HttpMessageNotReadableException.class,
            MissingServletRequestParameterException.class,
            MethodArgumentTypeMismatchException.class})
    public ResponseEntity<ApiResponse<Void>> handleInvalidJson() {
        return failure(ErrorCode.INVALID_REQUEST, "Dữ liệu gửi lên không hợp lệ. Vui lòng kiểm tra các giá trị đã chọn.");
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Void>> handleBadCredentials() {
        return failure(ErrorCode.AUTHENTICATION_FAILED);
    }

    @ExceptionHandler(DisabledException.class)
    public ResponseEntity<ApiResponse<Void>> handleDisabledAccount() {
        return failure(ErrorCode.ACCOUNT_INACTIVE);
    }

    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ApiResponse<Void>> handleMaxUploadSizeExceeded() {
        return failure(ErrorCode.MEDIA_FILE_TOO_LARGE);
    }

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<ApiResponse<Void>> handleEntityNotFound() {
        return failure(ErrorCode.INTERNAL_ERROR);
    }

    @ExceptionHandler({InternalServiceException.class, QuestionEngineException.class})
    public ResponseEntity<ApiResponse<Void>> handleInternalFailure(RuntimeException exception) {
        return failure(ErrorCode.INTERNAL_ERROR);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Void>> handleUnexpectedException() {
        return failure(ErrorCode.INTERNAL_ERROR);
    }

    private ResponseEntity<ApiResponse<Void>> failure(ErrorCode errorCode) {
        return failure(errorCode, errorCode.message());
    }

    private ResponseEntity<ApiResponse<Void>> failure(ErrorCode errorCode, String message) {
        return ResponseEntity.status(errorCode.status())
                .body(ApiResponse.failure(errorCode.code(), message));
    }
}
