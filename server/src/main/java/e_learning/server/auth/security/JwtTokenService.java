package e_learning.server.auth.security;

import e_learning.server.auth.dto.TokenPayload;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.User;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class JwtTokenService {

    public static final MacAlgorithm JWT_ALGORITHM = MacAlgorithm.HS512;

    @Value("${jwt.access-token-expire}")
    private int accessTokenExpiration;

    @Value("${jwt.refresh-token-expire}")
    private int refreshTokenExpiration;

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final RevokedTokenRepository revokedTokenRepository;

    public TokenPayload generateAccessToken(User user) {
        return generateToken(user, accessTokenExpiration, "ACCESS");
    }

    public TokenPayload generateRefreshToken(User user) {
        return generateToken(user, refreshTokenExpiration, "REFRESH");
    }

    public boolean isValidToken(String token) {
        try {
            Jwt jwt = jwtDecoder.decode(token);
            return jwt.getExpiresAt() != null &&
                    jwt.getExpiresAt().isAfter(Instant.now());
        } catch (JwtException ex) {
            return false;
        }
    }

    public Jwt extractToken(String token) {
        try {
            return jwtDecoder.decode(token);
        } catch (JwtException ex) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    public void revoke(String token) {
        Jwt jwt = extractTokenIgnoringRevocation(token);
        String jwtId = jwt.getClaimAsString("jwtId");
        Instant expiresAt = jwt.getExpiresAt();
        if (jwtId != null && expiresAt != null && expiresAt.isAfter(Instant.now())) {
            revokedTokenRepository.save(new RevokedToken(jwtId, expiresAt));
        }
    }

    public boolean isRefreshToken(Jwt jwt) {
        return "REFRESH".equals(jwt.getClaimAsString("tokenType"));
    }

    private Jwt extractTokenIgnoringRevocation(String token) {
        try {
            return jwtDecoder.decode(token);
        } catch (JwtException ex) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
    }

    private TokenPayload generateToken(User user, long ttlSeconds, String tokenType) {
        String jwtId = UUID.randomUUID().toString();
        Instant now = Instant.now();
        Instant expiresAt = now.plus(ttlSeconds, ChronoUnit.SECONDS);

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(user.getId().toString())
                .claim("roles", user.getAuthorities()
                        .stream()
                        .map(a -> a.getAuthority().replace("ROLE_", ""))
                        .toList())
                    .claim("tokenType", tokenType)
                .claim("jwtId", jwtId)
                .build();

        JwsHeader header = JwsHeader.with(JWT_ALGORITHM).build();

        String token = jwtEncoder
                .encode(JwtEncoderParameters.from(header, claims))
                .getTokenValue();

        return TokenPayload.builder()
                .token(token)
                .jwtId(jwtId)
                .expiresAt(expiresAt)
                .build();
    }
}
