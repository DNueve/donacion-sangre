package com.bancosangre.api_banco_sangre.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

// Servicio que se encarga de TODO lo relacionado con JWT
// Generar tokens, validarlos, extraer información de ellos
@Service
public class JwtService {

    // Lee del application.properties → jwt.secret
    @Value("${jwt.secret}")
    private String secretKey;

    // Lee del application.properties → jwt.expiration (en milisegundos)
    @Value("${jwt.expiration}")
    private long expiration;

    // ─── GENERAR TOKEN ───────────────────────────────────────────────
    // Crea un JWT con el correo del usuario y datos extra (rol, id)
    public String generarToken(String correo, Long userId, String rol) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("rol", rol);

        return Jwts.builder()
                .claims(claims)
                .subject(correo)
                .issuedAt(new Date(System.currentTimeMillis()))
                .expiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey())
                .compact();
    }

    // ─── EXTRAER CORREO DEL TOKEN ────────────────────────────────────
    public String extraerCorreo(String token) {
        return extraerClaim(token, Claims::getSubject);
    }

    // ─── EXTRAER ROL DEL TOKEN ───────────────────────────────────────
    public String extraerRol(String token) {
        return extraerClaim(token, claims -> claims.get("rol", String.class));
    }

    // ─── EXTRAER USER ID DEL TOKEN ───────────────────────────────────
    public Long extraerUserId(String token) {
        return extraerClaim(token, claims -> claims.get("userId", Long.class));
    }

    // ─── VALIDAR TOKEN ───────────────────────────────────────────────
    public boolean esTokenValido(String token, String correo) {
        final String correoExtraido = extraerCorreo(token);
        return correoExtraido.equals(correo) && !esTokenExpirado(token);
    }

    // ─── VERIFICAR EXPIRACIÓN ────────────────────────────────────────
    private boolean esTokenExpirado(String token) {
        return extraerExpiracion(token).before(new Date());
    }

    private Date extraerExpiracion(String token) {
        return extraerClaim(token, Claims::getExpiration);
    }

    // ─── EXTRAER CUALQUIER CLAIM (genérico) ──────────────────────────
    private <T> T extraerClaim(String token, Function<Claims, T> resolver) {
        final Claims claims = extraerTodosLosClaims(token);
        return resolver.apply(claims);
    }

    // ─── PARSEAR EL TOKEN COMPLETO ───────────────────────────────────
    private Claims extraerTodosLosClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    // ─── OBTENER LA LLAVE DE FIRMA ───────────────────────────────────
    // Convierte el secret de application.properties en una llave criptográfica
    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(secretKey.getBytes());
    }
}