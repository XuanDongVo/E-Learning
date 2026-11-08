package e_learning.server.auth;

import e_learning.server.auth.dto.CurrentUserResponse;
import e_learning.server.auth.dto.LoginRequest;
import e_learning.server.auth.dto.TokenPayload;
import e_learning.server.auth.security.JwtTokenService;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;

@Service
@RequiredArgsConstructor
public class AuthService {

	private final AuthenticationManager authenticationManager;
	private final JwtTokenService jwtTokenService;
	private final UserRepository userRepository;

	public LoginResult login(LoginRequest request) {
		authenticationManager.authenticate(
				new UsernamePasswordAuthenticationToken(request.email(), request.password())
		);

		User user = userRepository.findByEmailIgnoreCase(request.email())
				.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		if (request.expectedRole() != null && user.getRole() != request.expectedRole()) {
			throw new AppException(ErrorCode.LOGIN_ROLE_MISMATCH);
		}
		return issueTokens(user, jwtTokenService.newSessionExpiresAt());
	}

	@Transactional(noRollbackFor = AppException.class)
	public LoginResult refresh(String refreshToken) {
		if (refreshToken == null || refreshToken.isBlank()) {
			throw new AppException(ErrorCode.INVALID_TOKEN);
		}
		var jwt = jwtTokenService.extractToken(refreshToken);
		if (!jwtTokenService.isRefreshToken(jwt)) {
			throw new AppException(ErrorCode.INVALID_TOKEN);
		}

		Long userId;
		try {
			userId = Long.valueOf(jwt.getSubject());
		} catch (NumberFormatException exception) {
			throw new AppException(ErrorCode.INVALID_TOKEN);
		}

		Instant sessionExpiresAt = jwtTokenService.sessionExpiresAt(jwt);
		if (!sessionExpiresAt.isAfter(Instant.now())) {
			throw new AppException(ErrorCode.INVALID_TOKEN);
		}
		jwtTokenService.revoke(refreshToken);
		User user = userRepository.findById(userId)
				.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		if (!user.isEnabled()) {
			throw new AppException(ErrorCode.ACCOUNT_INACTIVE);
		}
		return issueTokens(user, sessionExpiresAt);
	}

	public void revoke(String token) {
		if (token != null && !token.isBlank()) {
			try {
				jwtTokenService.revoke(token);
			} catch (AppException ignored) {
			}
		}
	}

	public CurrentUserResponse currentUser(User user) {
		return CurrentUserResponse.from(user);
	}

	public CurrentUserResponse currentUserByEmail(String email) {
		User user = userRepository.findByEmailIgnoreCase(email)
				.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		return CurrentUserResponse.from(user);
	}

	public CurrentUserResponse currentUserById(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		return CurrentUserResponse.from(user);
	}

	private LoginResult issueTokens(User user, Instant sessionExpiresAt) {
		return new LoginResult(
				jwtTokenService.generateAccessToken(user, sessionExpiresAt),
				jwtTokenService.generateRefreshToken(user, sessionExpiresAt)
		);
	}

	public record LoginResult(TokenPayload accessToken, TokenPayload refreshToken) {
	}
}
