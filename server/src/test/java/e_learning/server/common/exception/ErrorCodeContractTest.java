package e_learning.server.common.exception;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertNotNull;

import java.util.HashSet;
import java.util.Set;
import org.junit.jupiter.api.Test;

class ErrorCodeContractTest {
    @Test
    void everyErrorCodeHasStableCodeMessageAndHttpStatus() {
        Set<String> codes = new HashSet<>();
        for (ErrorCode errorCode : ErrorCode.values()) {
            assertNotNull(errorCode.status(), errorCode.name() + " must declare an HTTP status");
            assertFalse(errorCode.code().isBlank(), errorCode.name() + " must declare a stable code");
            assertFalse(errorCode.message().isBlank(), errorCode.name() + " must declare a fallback message");
            assertTrueUnique(codes, errorCode.code());
        }
        assertEquals(ErrorCode.values().length, codes.size());
    }

    private static void assertTrueUnique(Set<String> codes, String code) {
        org.junit.jupiter.api.Assertions.assertTrue(codes.add(code), "Duplicate API error code: " + code);
    }
}
