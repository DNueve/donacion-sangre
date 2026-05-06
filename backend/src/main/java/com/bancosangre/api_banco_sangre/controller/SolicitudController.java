package com.bancosangre.api_banco_sangre.controller;

import com.bancosangre.api_banco_sangre.dto.SolicitudRequestDTO;
import com.bancosangre.api_banco_sangre.dto.SolicitudResponseDTO;
import com.bancosangre.api_banco_sangre.entity.Solicitud.EstadoSolicitud;
import com.bancosangre.api_banco_sangre.entity.Solicitud.Urgencia;
import com.bancosangre.api_banco_sangre.service.SolicitudService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/solicitudes")
@RequiredArgsConstructor
public class SolicitudController {

    private final SolicitudService solicitudService;

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<SolicitudResponseDTO> crear(@Valid @RequestBody SolicitudRequestDTO dto) {
        return ResponseEntity.status(HttpStatus.CREATED).body(solicitudService.crear(dto));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<SolicitudResponseDTO> actualizar(
            @PathVariable Long id, @Valid @RequestBody SolicitudRequestDTO dto) {
        return ResponseEntity.ok(solicitudService.actualizar(id, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SolicitudResponseDTO> obtenerPorId(@PathVariable Long id) {
        return ResponseEntity.ok(solicitudService.obtenerPorId(id));
    }

    @GetMapping
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<List<SolicitudResponseDTO>> listarTodas() {
        return ResponseEntity.ok(solicitudService.listarTodas());
    }

    @GetMapping("/activas")
    public ResponseEntity<List<SolicitudResponseDTO>> listarActivas() {
        return ResponseEntity.ok(solicitudService.listarActivas());
    }

    @GetMapping("/banco/{bancoId}")
    public ResponseEntity<List<SolicitudResponseDTO>> listarPorBanco(@PathVariable Long bancoId) {
        return ResponseEntity.ok(solicitudService.listarPorBanco(bancoId));
    }

    @GetMapping("/banco/{bancoId}/estado/{estado}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<List<SolicitudResponseDTO>> listarPorBancoYEstado(
            @PathVariable Long bancoId, @PathVariable EstadoSolicitud estado) {
        return ResponseEntity.ok(solicitudService.listarPorBancoYEstado(bancoId, estado));
    }

    @GetMapping("/tipo-sangre/{tipoSangre}")
    public ResponseEntity<List<SolicitudResponseDTO>> listarPorTipoSangre(@PathVariable String tipoSangre) {
        return ResponseEntity.ok(solicitudService.listarPorTipoSangre(tipoSangre));
    }

    @GetMapping("/urgencia/{urgencia}")
    public ResponseEntity<List<SolicitudResponseDTO>> listarPorUrgencia(@PathVariable Urgencia urgencia) {
        return ResponseEntity.ok(solicitudService.listarPorUrgencia(urgencia));
    }

    @GetMapping("/radio")
    public ResponseEntity<List<SolicitudResponseDTO>> buscarEnRadio(
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(defaultValue = "50.0") Double radioKm) {
        return ResponseEntity.ok(solicitudService.buscarEnRadio(lat, lon, radioKm));
    }

    @GetMapping("/radio/tipo-sangre/{tipoSangre}")
    public ResponseEntity<List<SolicitudResponseDTO>> buscarPorTipoSangreEnRadio(
            @PathVariable String tipoSangre,
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(defaultValue = "50.0") Double radioKm) {
        return ResponseEntity.ok(solicitudService.buscarPorTipoSangreEnRadio(tipoSangre, lat, lon, radioKm));
    }

    @PatchMapping("/{id}/estado")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<SolicitudResponseDTO> cambiarEstado(
            @PathVariable Long id, @RequestParam EstadoSolicitud estado) {
        return ResponseEntity.ok(solicitudService.cambiarEstado(id, estado));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        solicitudService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}