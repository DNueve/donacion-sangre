// src/main/java/com/bancosangre/api_banco_sangre/controller/BancoController.java
package com.bancosangre.api_banco_sangre.controller;

import com.bancosangre.api_banco_sangre.dto.BancoRequestDTO;
import com.bancosangre.api_banco_sangre.dto.BancoResponseDTO;
import com.bancosangre.api_banco_sangre.service.BancoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bancos")
@RequiredArgsConstructor
public class BancoController {

    private final BancoService bancoService;

    // ── Crear banco (solo SUPER_ADMIN) ──────────────────────────────────────
    @PostMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<BancoResponseDTO> crear(@Valid @RequestBody BancoRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bancoService.crear(dto));
    }

    // ── Actualizar banco ────────────────────────────────────────────────────
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<BancoResponseDTO> actualizar(
            @PathVariable Long id,
            @Valid @RequestBody BancoRequestDTO dto) {
        return ResponseEntity.ok(bancoService.actualizar(id, dto));
    }

    // ── Obtener por ID (público) ─────────────────────────────────────────────
    @GetMapping("/{id}")
    public ResponseEntity<BancoResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(bancoService.obtenerPorId(id));
    }

    // ── Listar todos (admin) ─────────────────────────────────────────────────
    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<BancoResponseDTO>> listarTodos() {
        return ResponseEntity.ok(bancoService.listarTodos());
    }

    // ── Listar activos (público) ─────────────────────────────────────────────
    @GetMapping("/activos")
    public ResponseEntity<List<BancoResponseDTO>> listarActivos() {
        return ResponseEntity.ok(bancoService.listarActivos());
    }

    // ── Filtrar por ciudad ───────────────────────────────────────────────────
    @GetMapping("/ciudad/{ciudad}")
    public ResponseEntity<List<BancoResponseDTO>> listarPorCiudad(@PathVariable String ciudad) {
        return ResponseEntity.ok(bancoService.listarPorCiudad(ciudad));
    }

    // ── Filtrar por departamento ─────────────────────────────────────────────
    @GetMapping("/departamento/{departamento}")
    public ResponseEntity<List<BancoResponseDTO>> listarPorDepartamento(@PathVariable String departamento) {
        return ResponseEntity.ok(bancoService.listarPorDepartamento(departamento));
    }

    // ── Búsqueda geoespacial por radio ───────────────────────────────────────
    @GetMapping("/radio")
    public ResponseEntity<List<BancoResponseDTO>> buscarEnRadio(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(defaultValue = "20.0") Double radioKm) {
        return ResponseEntity.ok(bancoService.buscarEnRadio(lat, lon, radioKm));
    }

    // ── Desactivar (soft delete) ─────────────────────────────────────────────
    @PatchMapping("/{id}/desactivar")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> desactivar(@PathVariable Long id) {
        bancoService.desactivar(id);
        return ResponseEntity.noContent().build();
    }

    // ── Eliminar físico ──────────────────────────────────────────────────────
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        bancoService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}