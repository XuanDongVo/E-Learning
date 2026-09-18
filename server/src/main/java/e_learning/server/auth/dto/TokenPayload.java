package e_learning.server.auth.dto;

import lombok.Builder;
import lombok.Getter;

import java.time.Instant;

@Getter
@Builder
public class TokenPayload {
    private String token;
    private String jwtId;
    private Instant expiresAt;
}
