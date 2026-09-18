package e_learning.server.auth.security;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

import java.time.Instant;

@Entity
@Table(name = "revoked_tokens")
public class RevokedToken {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "jwt_id", nullable = false, unique = true, length = 36)
    private String jwtId;

    @Column(name = "expires_at", nullable = false)
    private Instant expiresAt;

    protected RevokedToken() {
    }

    public RevokedToken(String jwtId, Instant expiresAt) {
        this.jwtId = jwtId;
        this.expiresAt = expiresAt;
    }

    public String getJwtId() {
        return jwtId;
    }
}