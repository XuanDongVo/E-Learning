package e_learning.server.auth.security;

import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.*;
import lombok.RequiredArgsConstructor;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.util.Base64;

@Configuration
@RequiredArgsConstructor
public class JwtConfig {
    @Value("${jwt.base64-secret}")
    private String jwtKey;
    private final RevokedTokenRepository revokedTokenRepository;
    public SecretKey getSecretKey() {
        byte[] keyBytes = Base64.getDecoder().decode(jwtKey);
        return new SecretKeySpec(keyBytes, 0, keyBytes.length, JwtTokenService.JWT_ALGORITHM.getName());
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        return new NimbusJwtEncoder(new ImmutableSecret<>(getSecretKey()));
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        NimbusJwtDecoder jwtDecoder = NimbusJwtDecoder.withSecretKey(getSecretKey()).macAlgorithm(JwtTokenService.JWT_ALGORITHM).build();
        return token -> {
            Jwt jwt = jwtDecoder.decode(token);
            String jwtId = jwt.getClaimAsString("jwtId");
            if (jwtId != null && revokedTokenRepository.existsByJwtId(jwtId)) {
                throw new JwtException("JWT token has been revoked");
            }
            return jwt;
        };
    }
}
