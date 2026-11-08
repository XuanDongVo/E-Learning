package e_learning.server.auth.security;

import e_learning.server.auth.dto.TokenPayload;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.User;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.*;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Service
public class JwtTokenService {

    public static final MacAlgorithm JWT_ALGORITHM = MacAlgorithm.HS512;

    @Value("${jwt.access-token-expire}")
    private int accessTokenExpiration;

    @Value("${jwt.refresh-token-expire}")
    private int refreshTokenExpiration;

    private final JwtEncoder jwtEncoder;
    private final JwtDecoder jwtDecoder;
    private final RevokedTokenRepository revokedTokenRepository;

    public JwtTokenService(
            JwtEncoder jwtEncoder,
            @Qualifier("refreshJwtDecoder") JwtDecoder jwtDecoder,
            RevokedTokenRepository revokedTokenRepository
    ) {
        this.jwtEncoder = jwtEncoder;
        this.jwtDecoder = jwtDecoder;
        this.revokedTokenRepository = revokedTokenRepository;
    }

    public Instant newSessionExpiresAt() {
        return Instant.now().plus(refreshTokenExpiration, ChronoUnit.SECONDS);
    }

    public Instant sessionExpiresAt(Jwt refreshToken) {
        String claim = refreshToken.getClaimAsString("sessionExpiresAt");
        if (claim != null && !claim.isBlank()) {
            try {
                return Instant.parse(claim);
            } catch (RuntimeException exception) {
                throw new AppException(ErrorCode.INVALID_TOKEN);
            }
        }
        Instant expiresAt = refreshToken.getExpiresAt();
        if (expiresAt == null) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }
        return expiresAt;
    }

    public TokenPayload generateAccessToken(User user, Instant sessionExpiresAt) {
        Instant tokenExpiresAt = Instant.now().plus(accessTokenExpiration, ChronoUnit.SECONDS);
        return generateToken(user, min(tokenExpiresAt, sessionExpiresAt), sessionExpiresAt, "ACCESS");
    }

    public TokenPayload generateRefreshToken(User user, Instant sessionExpiresAt) {
        return generateToken(user, sessionExpiresAt, sessionExpiresAt, "REFRESH");
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

    private TokenPayload generateToken(
            User user,
            Instant expiresAt,
            Instant sessionExpiresAt,
            String tokenType
    ) {
        String jwtId = UUID.randomUUID().toString();
        Instant now = Instant.now();
        if (!expiresAt.isAfter(now) || !sessionExpiresAt.isAfter(now)) {
            throw new AppException(ErrorCode.INVALID_TOKEN);
        }

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuedAt(now)
                .expiresAt(expiresAt)
                .subject(user.getId().toString())
                .claim("roles", user.getAuthorities()
                        .stream()
                        .map(a -> a.getAuthority().replace("ROLE_", ""))
                        .toList())
                    .claim("tokenType", tokenType)
                .claim("sessionExpiresAt", sessionExpiresAt.toString())
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

    private Instant min(Instant first, Instant second) {
        return first.isBefore(second) ? first : second;
    }
}
