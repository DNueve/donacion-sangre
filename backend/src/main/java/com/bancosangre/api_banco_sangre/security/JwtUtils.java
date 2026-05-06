package com.bancosangre.api_banco_sangre.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    // Nota: La clave debe tener al menos 32 caracteres para algoritmos HS256
    private static final String JWT_SECRET = "EstaEsUnaClaveSuperSecretaYMuyLargaParaElBancoDeSangre2026";
    private static final long JWT_EXPIRATION_MS = 86400000; // 24 horas

    // Generamos la llave de forma segura
    private final SecretKey key = Keys.hmacShaKeyFor(JWT_SECRET.getBytes(StandardCharsets.UTF_8));

    // 1. Generar el Token
    public String generarToken(String correo) {
        return Jwts.builder()
                .subject(correo)
                .issuedAt(new Date())
                .expiration(new Date((new Date()).getTime() + JWT_EXPIRATION_MS))
                .signWith(key) // En 0.12.3 ya no es necesario especificar el algoritmo si usas una SecretKey
                .compact();
    }

    // 2. Obtener el correo del Token
    public String getCorreoDesdeToken(String token) {
        return Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    // 3. Validar el Token
    public boolean validarToken(String token) {
        try {
            Jwts.parser()
                .verifyWith(key)
                .build()
                .parseSignedClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            // Aquí puedes loguear el error específico si lo deseas
            System.err.println("Error en el token: " + e.getMessage());
        }
        return false;
    }
}