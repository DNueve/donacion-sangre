package com.bancosangre.api_banco_sangre.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

    // ─── Validación de DTOs (@Valid) ─────────────────────────────────
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<Map<String, Object>> manejarValidacion(MethodArgumentNotValidException ex) {
        Map<String, String> errores = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach(error -> {
            String campo = ((FieldError) error).getField();
            errores.put(campo, error.getDefaultMessage());
        });

        return construir(HttpStatus.BAD_REQUEST, "Error de validación", null, errores);
    }

    // ─── Recurso no encontrado → 404 ─────────────────────────────────
    @ExceptionHandler(RecursoNoEncontradoException.class)
    public ResponseEntity<Map<String, Object>> manejarNoEncontrado(RecursoNoEncontradoException ex) {
        return construir(HttpStatus.NOT_FOUND, "Recurso no encontrado", ex.getMessage(), null);
    }

    // ─── Conflicto de negocio (NIT duplicado, etc.) → 409 ────────────
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> manejarConflicto(IllegalArgumentException ex) {
        return construir(HttpStatus.CONFLICT, "Conflicto de datos", ex.getMessage(), null);
    }

    // ─── Acceso denegado → 403 ────────────────────────────────────────
    @ExceptionHandler(org.springframework.security.access.AccessDeniedException.class)
    public ResponseEntity<Map<String, Object>> manejarAccesoDenegado(Exception ex) {
        return construir(HttpStatus.FORBIDDEN, "Acceso denegado", "No tienes permisos para esta operación", null);
    }

    // ─── Runtime genérico → 400 ───────────────────────────────────────
    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<Map<String, Object>> manejarRuntime(RuntimeException ex) {
        return construir(HttpStatus.BAD_REQUEST, "Error de negocio", ex.getMessage(), null);
    }

    // ─── Error inesperado → 500 ───────────────────────────────────────
    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> manejarGeneral(Exception ex) {
        return construir(HttpStatus.INTERNAL_SERVER_ERROR, "Error interno del servidor", ex.getMessage(), null);
    }

    // ─── Helper para respuesta uniforme ──────────────────────────────
    private ResponseEntity<Map<String, Object>> construir(
            HttpStatus status, String error, String mensaje, Map<String, String> errores) {

        Map<String, Object> body = new HashMap<>();
        body.put("timestamp", LocalDateTime.now());
        body.put("status", status.value());
        body.put("error", error);
        if (mensaje != null) body.put("mensaje", mensaje);
        if (errores != null) body.put("errores", errores);

        return ResponseEntity.status(status).body(body);
    }
}