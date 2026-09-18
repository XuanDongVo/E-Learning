package e_learning.server.auth.security;

import org.springframework.data.jpa.repository.JpaRepository;

public interface RevokedTokenRepository extends JpaRepository<RevokedToken, Long> {

    boolean existsByJwtId(String jwtId);
}