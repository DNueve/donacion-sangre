package com.bancosangre.api_banco_sangre.controller;

import com.bancosangre.api_banco_sangre.dto.InventarioRequestDTO;
import com.bancosangre.api_banco_sangre.dto.InventarioResponseDTO;
import com.bancosangre.api_banco_sangre.service.InventarioService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/inventario")
@RequiredArgsConstructor
public class InventarioController {

    private final InventarioService inventarioService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<InventarioResponseDTO> crear(@Valid @RequestBody InventarioRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(inventarioService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<InventarioResponseDTO> actualizar(
            @PathVariable Long id, @Valid @RequestBody InventarioRequestDTO dto) {
        return ResponseEntity.ok(inventarioService.actualizar(id, dto));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<InventarioResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(inventarioService.obtenerPorId(id));
    }

    // Público — donantes pueden ver stock por banco
    @GetMapping("/banco/{bancoId}")
    public ResponseEntity<List<InventarioResponseDTO>> listarPorBanco(@PathVariable Long bancoId) {
        return ResponseEntity.ok(inventarioService.listarPorBanco(bancoId));
    }

    @GetMapping("/banco/{bancoId}/bajo-stock")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<List<InventarioResponseDTO>> listarBajoStockPorBanco(@PathVariable Long bancoId) {
        return ResponseEntity.ok(inventarioService.listarBajoStockPorBanco(bancoId));
    }

    @GetMapping("/bajo-stock")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<InventarioResponseDTO>> listarTodoBajoStock() {
        return ResponseEntity.ok(inventarioService.listarTodoBajoStock());
    }

    // Público — buscar bancos con stock de un tipo de sangre
    @GetMapping("/tipo-sangre/{tipoSangre}")
    public ResponseEntity<List<InventarioResponseDTO>> listarDisponiblesPorTipoSangre(
            @PathVariable String tipoSangre) {
        return ResponseEntity.ok(inventarioService.listarDisponiblesPorTipoSangre(tipoSangre));
    }

    // Ajuste manual de unidades (positivo = entrada, negativo = salida)
    @PatchMapping("/ajustar")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<InventarioResponseDTO> ajustarUnidades(
            @RequestParam Long bancoId,
            @RequestParam String tipoSangre,
            @RequestParam Integer cantidad) {
        return ResponseEntity.ok(inventarioService.ajustarUnidades(bancoId, tipoSangre, cantidad));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        inventarioService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}