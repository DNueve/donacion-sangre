package com.bancosangre.api_banco_sangre.config;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.client.RestTemplate;

@Configuration
@RequiredArgsConstructor
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)

            .authorizeHttpRequests(auth -> auth

                // ── Preflight CORS ──────────────────────────────────────
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                // ── Auth ────────────────────────────────────────────────
                .requestMatchers("/api/v1/auth/**").permitAll()

                // ── Claude proxy ────────────────────────────────────────
                .requestMatchers(HttpMethod.POST, "/api/claude/chat").permitAll()

                // ── Bancos (consultas públicas) ─────────────────────────
                .requestMatchers(HttpMethod.GET,
                        "/api/bancos/activos",
                        "/api/bancos/radio",
                        "/api/bancos/ciudad/**",
                        "/api/bancos/departamento/**",
                        "/api/bancos/{id}"
                ).permitAll()

                // ── Solicitudes (urgencias públicas) ────────────────────
                .requestMatchers(HttpMethod.GET,
                        "/api/solicitudes/activas",
                        "/api/solicitudes/ciudad/**",
                        "/api/solicitudes/{id}",
                        "/api/solicitudes/tipo-sangre/**",
                        "/api/solicitudes/urgencia/**",
                        "/api/solicitudes/banco/**",
                        "/api/solicitudes/radio",
                        "/api/solicitudes/radio/**"
                ).permitAll()

                // ── Inventario (stock público por banco) ─────────────────
                .requestMatchers(HttpMethod.GET,
                        "/api/inventario/banco/**"
                ).permitAll()

                // ── Todo lo demás requiere JWT ───────────────────────────
                .anyRequest().authenticated()
            )

            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public BCryptPasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}