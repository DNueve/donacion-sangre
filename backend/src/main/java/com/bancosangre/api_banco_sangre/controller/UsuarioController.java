package com.bancosangre.api_banco_sangre.controller;

import com.bancosangre.api_banco_sangre.dto.CrearAdminBancoDTO;
import com.bancosangre.api_banco_sangre.dto.UsuarioResponseDTO;
import com.bancosangre.api_banco_sangre.service.UsuarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/usuarios")
@RequiredArgsConstructor
public class UsuarioController {

    private final UsuarioService usuarioService;

    // ── Listar todos los usuarios (solo SUPER_ADMIN) ────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarTodos() {
        return ResponseEntity.ok(usuarioService.listarTodos());
    }

    // ── Listar usuarios por rol (para dropdown de admins de banco) ──────────
    // Ejemplo: GET /api/usuarios/rol/ADMIN_BANCO
    @GetMapping("/rol/{nombreRol}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<UsuarioResponseDTO>> listarPorRol(@PathVariable String nombreRol) {
        return ResponseEntity.ok(usuarioService.listarPorRol(nombreRol));
    }

    // ── Obtener por ID ──────────────────────────────────────────────────────
    @GetMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(usuarioService.obtenerPorId(id));
    }

    // ── Crear usuario con rol ADMIN_BANCO (solo SUPER_ADMIN) ────────────────
    @PostMapping("/admin-banco")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<UsuarioResponseDTO> crearAdminBanco(@Valid @RequestBody CrearAdminBancoDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.crearAdminBanco(dto));
    }
}