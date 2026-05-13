package com.bancosangre.api_banco_sangre.controller;

import com.bancosangre.api_banco_sangre.dto.MatchingResponseDTO;
import com.bancosangre.api_banco_sangre.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/matching")
@RequiredArgsConstructor
public class MatchingController {

    private final MatchingService matchingService;

    // Matching automático por solicitud
    @GetMapping("/solicitud/{solicitudId}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<MatchingResponseDTO> buscarPorSolicitud(@PathVariable Long solicitudId) {
        return ResponseEntity.ok(matchingService.buscarDonantesParaSolicitud(solicitudId));
    }

    // Matching manual por parámetros
    @GetMapping("/buscar")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
    public ResponseEntity<MatchingResponseDTO> buscarCompatibles(
            @RequestParam String tipoSangre,
            @RequestParam Double lat,
            @RequestParam Double lon,
            @RequestParam(defaultValue = "50.0") Double radioKm) {
        return ResponseEntity.ok(
                matchingService.buscarDonantesCompatibles(tipoSangre, lat, lon, radioKm));
    }
}