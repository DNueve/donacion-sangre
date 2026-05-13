    package com.bancosangre.api_banco_sangre.controller;

    import com.bancosangre.api_banco_sangre.dto.DonacionRequestDTO;
    import com.bancosangre.api_banco_sangre.dto.DonacionResponseDTO;
    import com.bancosangre.api_banco_sangre.entity.Donacion.EstadoDonacion;
    import com.bancosangre.api_banco_sangre.service.DonacionService;
    import jakarta.validation.Valid;
    import lombok.RequiredArgsConstructor;
    import org.springframework.format.annotation.DateTimeFormat;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.access.prepost.PreAuthorize;
    import org.springframework.web.bind.annotation.*;

    import java.time.LocalDate;
    import java.util.List;

    @RestController
    @RequestMapping("/api/donaciones")
    @RequiredArgsConstructor
    public class DonacionController {

        private final DonacionService donacionService;

        @PostMapping
        @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO', 'DONANTE')")
        public ResponseEntity<DonacionResponseDTO> registrar(@Valid @RequestBody DonacionRequestDTO dto) {
            return ResponseEntity.status(HttpStatus.CREATED).body(donacionService.registrar(dto));
        }

        @PutMapping("/{id}")
        @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
        public ResponseEntity<DonacionResponseDTO> actualizar(
                @PathVariable Long id, @Valid @RequestBody DonacionRequestDTO dto) {
            return ResponseEntity.ok(donacionService.actualizar(id, dto));
        }

        @GetMapping("/{id}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<DonacionResponseDTO> obtenerPorId(@PathVariable Long id) {
            return ResponseEntity.ok(donacionService.obtenerPorId(id));
        }

        @GetMapping
        @PreAuthorize("hasRole('SUPER_ADMIN')")
        public ResponseEntity<List<DonacionResponseDTO>> listarTodas() {
            return ResponseEntity.ok(donacionService.listarTodas());
        }

        @GetMapping("/usuario/{usuarioId}")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<List<DonacionResponseDTO>> listarPorUsuario(@PathVariable Long usuarioId) {
            return ResponseEntity.ok(donacionService.listarPorUsuario(usuarioId));
        }

        @GetMapping("/usuario/{usuarioId}/historial")
        @PreAuthorize("isAuthenticated()")
        public ResponseEntity<List<DonacionResponseDTO>> historialUsuario(@PathVariable Long usuarioId) {
            return ResponseEntity.ok(donacionService.historialUsuario(usuarioId));
        }

        @GetMapping("/banco/{bancoId}")
        @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
        public ResponseEntity<List<DonacionResponseDTO>> listarPorBanco(@PathVariable Long bancoId) {
            return ResponseEntity.ok(donacionService.listarPorBanco(bancoId));
        }

        @GetMapping("/banco/{bancoId}/rango")
        @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
        public ResponseEntity<List<DonacionResponseDTO>> listarPorBancoYRango(
                @PathVariable Long bancoId,
                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate inicio,
                @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate fin) {
            return ResponseEntity.ok(donacionService.listarPorBancoYRangoFecha(bancoId, inicio, fin));
        }

        @GetMapping("/solicitud/{solicitudId}")
        @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
        public ResponseEntity<List<DonacionResponseDTO>> listarPorSolicitud(@PathVariable Long solicitudId) {
            return ResponseEntity.ok(donacionService.listarPorSolicitud(solicitudId));
        }

        @GetMapping("/estado/{estado}")
        @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
        public ResponseEntity<List<DonacionResponseDTO>> listarPorEstado(@PathVariable EstadoDonacion estado) {
            return ResponseEntity.ok(donacionService.listarPorEstado(estado));
        }

        @PatchMapping("/{id}/estado")
        @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN_BANCO')")
        public ResponseEntity<DonacionResponseDTO> cambiarEstado(
                @PathVariable Long id, @RequestParam EstadoDonacion estado) {
            return ResponseEntity.ok(donacionService.cambiarEstado(id, estado));
        }

        @DeleteMapping("/{id}")
        @PreAuthorize("hasRole('SUPER_ADMIN')")
        public ResponseEntity<Void> eliminar(@PathVariable Long id) {
            donacionService.eliminar(id);
            return ResponseEntity.noContent().build();
        }
    }