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
		return issueTokens(user);
	}

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

		User user = userRepository.findById(userId)
				.orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
		jwtTokenService.revoke(refreshToken);
		return issueTokens(user);
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

	private LoginResult issueTokens(User user) {
		return new LoginResult(
				jwtTokenService.generateAccessToken(user),
				jwtTokenService.generateRefreshToken(user)
		);
	}

	public record LoginResult(TokenPayload accessToken, TokenPayload refreshToken) {
	}
}
