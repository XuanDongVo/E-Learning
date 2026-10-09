package e_learning.server.common.config;

import java.util.Arrays;
import org.springframework.context.annotation.*;
import org.springframework.security.authentication.*;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.server.resource.authentication.*;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.cors.*;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;
import jakarta.servlet.http.Cookie;
import e_learning.server.user.service.UserDetailServiceCustomize;
import lombok.RequiredArgsConstructor;

@Configuration
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final UserDetailServiceCustomize userDetailsService;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http.cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .authorizeHttpRequests(authorize -> authorize
                .requestMatchers("/v1/auth/login", "/v1/auth/refresh").permitAll()
                .requestMatchers("/v1/teacher/**").hasRole("TEACHER")
                .requestMatchers("/v1/users/students/**").hasRole("TEACHER")
                .requestMatchers("/v1/student/**").hasRole("STUDENT")
                .requestMatchers("/v1/classes/**").hasRole("TEACHER")
                .requestMatchers("/v1/content/**").hasRole("TEACHER")
                .requestMatchers("/v1/activities/*/sessions").hasRole("STUDENT")
                .requestMatchers("/v1/activities/*/session-options").hasRole("STUDENT")
                .requestMatchers("/v1/activity-sessions/**").hasRole("STUDENT")
                .requestMatchers("/v1/activities/**").hasRole("TEACHER")
                .requestMatchers("/v1/assignments/**").hasRole("TEACHER")
                .anyRequest().authenticated())
            .oauth2ResourceServer(oauth -> oauth
                .bearerTokenResolver(bearerTokenResolver())
                .jwt(jwt -> jwt.jwtAuthenticationConverter(jwtAuthenticationConverter())));
        return http.build();
    }

    @Bean public PasswordEncoder passwordEncoder() { return new BCryptPasswordEncoder(); }

    @Bean
    public BearerTokenResolver bearerTokenResolver() {
        return request -> {
            String path = request.getServletPath();
            if (path.equals("/v1/auth/login") || path.equals("/v1/auth/refresh")) return null;
            if (request.getCookies() != null) {
                for (Cookie cookie : request.getCookies()) {
                    if ("accessToken".equals(cookie.getName())) return cookie.getValue();
                }
            }
            String header = request.getHeader("Authorization");
            return header != null && header.startsWith("Bearer ") ? header.substring(7) : null;
        };
    }

    @Bean
    public AuthenticationManager authenticationManager() {
        DaoAuthenticationProvider provider = new DaoAuthenticationProvider(userDetailsService);
        provider.setPasswordEncoder(passwordEncoder());
        return new ProviderManager(provider);
    }

    @Bean
    public JwtAuthenticationConverter jwtAuthenticationConverter() {
        JwtGrantedAuthoritiesConverter granted = new JwtGrantedAuthoritiesConverter();
        granted.setAuthorityPrefix("ROLE_");
        granted.setAuthoritiesClaimName("roles");
        JwtAuthenticationConverter converter = new JwtAuthenticationConverter();
        converter.setJwtGrantedAuthoritiesConverter(granted);
        return converter;
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration config = new CorsConfiguration();
        config.setAllowCredentials(true);
        config.setAllowedOrigins(Arrays.asList(
            "http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3001"));
        config.addAllowedHeader("*");
        config.addAllowedMethod("*");
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", config);
        return source;
    }
}
