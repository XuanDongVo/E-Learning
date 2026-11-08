package e_learning.server.auth.security;

import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.UserStatus;
import e_learning.server.user.repository.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class AccountStatusFilter extends OncePerRequestFilter {

    private final UserRepository userRepository;
    private final SecurityErrorWriter errorWriter;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof Jwt jwt)) {
            filterChain.doFilter(request, response);
            return;
        }

        Long userId;
        try {
            userId = Long.valueOf(jwt.getSubject());
        } catch (NumberFormatException exception) {
            errorWriter.write(response, ErrorCode.INVALID_TOKEN, true);
            return;
        }

        var status = userRepository.findStatusById(userId);
        if (status.isEmpty()) {
            errorWriter.write(response, ErrorCode.INVALID_TOKEN, true);
            return;
        }
        if (status.get() == UserStatus.INACTIVE) {
            errorWriter.write(response, ErrorCode.ACCOUNT_INACTIVE, true);
            return;
        }

        filterChain.doFilter(request, response);
    }
}
