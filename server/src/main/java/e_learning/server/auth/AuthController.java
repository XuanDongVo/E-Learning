package e_learning.server.auth;

import e_learning.server.auth.dto.CurrentUserResponse;
import e_learning.server.auth.dto.LoginRequest;
import e_learning.server.auth.security.JwtCookieService;
import e_learning.server.common.response.ApiResponse;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Arrays;

@RestController
@RequestMapping("/v1/auth")
@RequiredArgsConstructor
public class AuthController {

	private final AuthService authService;
	private final JwtCookieService cookieService;

	@PostMapping("/login")
	public ResponseEntity<ApiResponse<CurrentUserResponse>> login(
			@Valid @RequestBody LoginRequest request,
			HttpServletResponse response
	) {
		AuthService.LoginResult result = authService.login(request);
		addTokenCookies(response, result);
		CurrentUserResponse user = authService.currentUserByEmail(request.email());
		return ResponseEntity.ok(ApiResponse.success("Login successful", user));
	}

	@PostMapping("/refresh")
	public ResponseEntity<ApiResponse<Void>> refresh(
			HttpServletRequest request,
			HttpServletResponse response
	) {
		String refreshToken = cookieValue(request, JwtCookieService.REFRESH_TOKEN_COOKIE);
		AuthService.LoginResult result = authService.refresh(refreshToken);
		addTokenCookies(response, result);
		return ResponseEntity.ok(ApiResponse.success("Token refreshed", null));
	}

	@PostMapping("/logout")
	public ResponseEntity<ApiResponse<Void>> logout(
			HttpServletRequest request,
			HttpServletResponse response
	) {
		authService.revoke(cookieValue(request, JwtCookieService.ACCESS_TOKEN_COOKIE));
		authService.revoke(cookieValue(request, JwtCookieService.REFRESH_TOKEN_COOKIE));
		response.addHeader(HttpHeaders.SET_COOKIE, cookieService.clearAccessCookie().toString());
		response.addHeader(HttpHeaders.SET_COOKIE, cookieService.clearRefreshCookie().toString());
		return ResponseEntity.ok(ApiResponse.success("Logout successful", null));
	}

	@GetMapping("/me")
	public ResponseEntity<ApiResponse<CurrentUserResponse>> me(@AuthenticationPrincipal Jwt jwt) {
		return ResponseEntity.ok(ApiResponse.success(authService.currentUserById(Long.valueOf(jwt.getSubject()))));
	}

	private void addTokenCookies(HttpServletResponse response, AuthService.LoginResult result) {
		response.addHeader(HttpHeaders.SET_COOKIE, cookieService.accessCookie(result.accessToken()).toString());
		response.addHeader(HttpHeaders.SET_COOKIE, cookieService.refreshCookie(result.refreshToken()).toString());
	}

	private String cookieValue(HttpServletRequest request, String name) {
		if (request.getCookies() == null) {
			return null;
		}
		return Arrays.stream(request.getCookies())
				.filter(cookie -> name.equals(cookie.getName()))
				.map(Cookie::getValue)
				.findFirst()
				.orElse(null);
	}
}
