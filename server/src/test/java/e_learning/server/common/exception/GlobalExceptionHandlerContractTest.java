package e_learning.server.common.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

import e_learning.server.common.response.ApiResponse;
import e_learning.server.question.engine.exception.QuestionEngineException;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;

class GlobalExceptionHandlerContractTest {
    private final GlobalExceptionHandler handler = new GlobalExceptionHandler();

    @Test
    void appExceptionPreservesStableCodeStatusAndLegacyMessage() {
        ResponseEntity<ApiResponse<Void>> response =
                handler.handleAppException(new AppException(ErrorCode.CLASS_NOT_FOUND, "Class 42 was not found"));

        assertEquals(404, response.getStatusCode().value());
        assertFalse(response.getBody().success());
        assertEquals("CLASS_NOT_FOUND", response.getBody().code());
        assertEquals("Class 42 was not found", response.getBody().message());
        assertEquals(null, response.getBody().data());
    }

    @Test
    void validationFailureUsesStableCodeAndBadRequestStatus() {
        ResponseEntity<ApiResponse<Void>> response =
                handler.handleValidationException(new IllegalArgumentException("invalid input"));

        assertEquals(400, response.getStatusCode().value());
        assertEquals("VALIDATION_FAILED", response.getBody().code());
        assertEquals(ErrorCode.VALIDATION_FAILED.message(), response.getBody().message());
    }

    @Test
    void questionEngineInvariantIsNotExposedToApiConsumer() {
        ResponseEntity<ApiResponse<Void>> response =
                handler.handleInternalFailure(new QuestionEngineException("internal engine invariant"));

        assertEquals(500, response.getStatusCode().value());
        assertEquals("INTERNAL_ERROR", response.getBody().code());
        assertEquals(ErrorCode.INTERNAL_ERROR.message(), response.getBody().message());
        assertFalse(response.getBody().message().contains("internal engine invariant"));
    }

    @Test
    void unexpectedFailureUsesGenericInternalContract() {
        ResponseEntity<ApiResponse<Void>> response = handler.handleUnexpectedException();

        assertEquals(500, response.getStatusCode().value());
        assertEquals("INTERNAL_ERROR", response.getBody().code());
        assertTrue(response.getBody().message().contains("unexpected"));
    }
}
