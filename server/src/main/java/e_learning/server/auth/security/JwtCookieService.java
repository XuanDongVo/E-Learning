package e_learning.server.auth.security;

import e_learning.server.auth.dto.TokenPayload;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class JwtCookieService {

    public static final String ACCESS_TOKEN_COOKIE = "accessToken";
    public static final String REFRESH_TOKEN_COOKIE = "refreshToken";

    @Value("${jwt.cookie-secure:true}")
    private boolean secure;

    public ResponseCookie accessCookie(TokenPayload token) {
        return createCookie(ACCESS_TOKEN_COOKIE, token, "/v1");
    }

    public ResponseCookie refreshCookie(TokenPayload token) {
        return createCookie(REFRESH_TOKEN_COOKIE, token, "/v1/auth");
    }

    public ResponseCookie clearAccessCookie() {
        return clearCookie(ACCESS_TOKEN_COOKIE, "/v1");
    }

    public ResponseCookie clearRefreshCookie() {
        return clearCookie(REFRESH_TOKEN_COOKIE, "/v1/auth");
    }

    private ResponseCookie createCookie(String name, TokenPayload token, String path) {
        long maxAge = Math.max(0, Duration.between(java.time.Instant.now(), token.getExpiresAt()).getSeconds());
        return ResponseCookie.from(name, token.getToken())
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path(path)
                .maxAge(maxAge)
                .build();
    }

    private ResponseCookie clearCookie(String name, String path) {
        return ResponseCookie.from(name, "")
                .httpOnly(true)
                .secure(secure)
                .sameSite("Lax")
                .path(path)
                .maxAge(0)
                .build();
    }
}