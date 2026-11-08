package e_learning.server.auth.security;

import e_learning.server.common.exception.ErrorCode;
import e_learning.server.common.response.ApiResponse;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import tools.jackson.databind.ObjectMapper;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class SecurityErrorWriter {

    private final ObjectMapper objectMapper;
    private final JwtCookieService cookieService;

    public void write(HttpServletResponse response, ErrorCode errorCode, boolean clearCookies) throws IOException {
        response.resetBuffer();
        response.setStatus(errorCode.status().value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.setCharacterEncoding("UTF-8");
        if (clearCookies) {
            response.addHeader(HttpHeaders.SET_COOKIE, cookieService.clearAccessCookie().toString());
            response.addHeader(HttpHeaders.SET_COOKIE, cookieService.clearRefreshCookie().toString());
        }
        objectMapper.writeValue(
                response.getOutputStream(),
                ApiResponse.failure(errorCode.code(), errorCode.message())
        );
        response.flushBuffer();
    }
}
