package com.bancosangre.api_banco_sangre.config;

import com.bancosangre.api_banco_sangre.entity.Usuario;
import com.bancosangre.api_banco_sangre.repository.UsuarioRepository;
import com.bancosangre.api_banco_sangre.service.JwtService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

// Filtro que se ejecuta antes de cada request
// Lee el header Authorization, valida el JWT y autentica al usuario
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UsuarioRepository usuarioRepository;

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        // 1. Leer el header "Authorization: Bearer <token>"
        final String authHeader = request.getHeader("Authorization");

        // 2. Si no hay token o no empieza con "Bearer ", deja pasar (rutas públicas)
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        // 3. Extraer el token (quitar "Bearer ")
        final String token = authHeader.substring(7);

        try {
            // 4. Extraer el correo del token
            final String correo = jwtService.extraerCorreo(token);

            // 5. Si hay correo y el usuario no está autenticado todavía
            if (correo != null && SecurityContextHolder.getContext().getAuthentication() == null) {

                // 6. Buscar el usuario en la BD
                Optional<Usuario> usuarioOpt = usuarioRepository.findByCorreo(correo);

                if (usuarioOpt.isPresent()) {
                    Usuario usuario = usuarioOpt.get();

                    // 7. Validar que el token sea válido
                    if (jwtService.esTokenValido(token, correo)) {
                        // 8. Crear la autenticación con el rol
                        var authorities = List.of(
                                new SimpleGrantedAuthority("ROLE_" + usuario.getRol().getNombre())
                        );

                        UsernamePasswordAuthenticationToken authToken =
                                new UsernamePasswordAuthenticationToken(
                                        usuario,
                                        null,
                                        authorities
                                );

                        authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                        // 9. Registrar la autenticación en el contexto
                        SecurityContextHolder.getContext().setAuthentication(authToken);
                    }
                }
            }
        } catch (Exception e) {
            // Si el token es inválido, simplemente no autenticamos
            // El controller se encarga de devolver 401 si la ruta lo requiere
        }

        // 10. Continuar con el siguiente filtro
        filterChain.doFilter(request, response);
    }
}