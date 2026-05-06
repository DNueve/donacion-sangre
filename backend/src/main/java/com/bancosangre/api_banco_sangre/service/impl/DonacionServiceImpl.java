package com.bancosangre.api_banco_sangre.service.impl;

import com.bancosangre.api_banco_sangre.dto.DonacionRequestDTO;
import com.bancosangre.api_banco_sangre.dto.DonacionResponseDTO;
import com.bancosangre.api_banco_sangre.entity.*;
import com.bancosangre.api_banco_sangre.entity.Donacion.EstadoDonacion;
import com.bancosangre.api_banco_sangre.exception.RecursoNoEncontradoException;
import com.bancosangre.api_banco_sangre.repository.*;
import com.bancosangre.api_banco_sangre.service.DonacionService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class DonacionServiceImpl implements DonacionService {

    private final DonacionRepository donacionRepository;
    private final UsuarioRepository usuarioRepository;
    private final BancoRepository bancoRepository;
    private final SolicitudRepository solicitudRepository;

    @Override
    public DonacionResponseDTO registrar(DonacionRequestDTO dto) {
        Usuario usuario = resolverUsuario(dto.getUsuarioId());
        Banco banco = resolverBanco(dto.getBancoId());

        // Validar intervalo mínimo de 90 días entre donaciones
        donacionRepository.findUltimaDonacionCompletada(dto.getUsuarioId())
                .ifPresent(ultima -> {
                    long dias = ChronoUnit.DAYS.between(ultima.getFechaDonacion(), dto.getFechaDonacion());
                    if (dias < 90) {
                        throw new IllegalArgumentException(
                            "El donante debe esperar " + (90 - dias) + " días más para volver a donar.");
                    }
                });

        Solicitud solicitud = null;
        if (dto.getSolicitudId() != null) {
            solicitud = solicitudRepository.findById(dto.getSolicitudId())
                    .orElseThrow(() -> new RecursoNoEncontradoException(
                            "Solicitud no encontrada con id: " + dto.getSolicitudId()));
        }

        Donacion donacion = Donacion.builder()
                .usuario(usuario)
                .banco(banco)
                .solicitud(solicitud)
                .fechaDonacion(dto.getFechaDonacion())
                .tipoSangre(dto.getTipoSangre())
                .cantidadMl(dto.getCantidadMl() != null ? dto.getCantidadMl() : 450)
                .hemoglobina(dto.getHemoglobina())
                .presionArterial(dto.getPresionArterial())
                .estado(dto.getEstado() != null ? dto.getEstado() : EstadoDonacion.PENDIENTE)
                .observaciones(dto.getObservaciones())
                .build();

        return mapearResponse(donacionRepository.save(donacion));
    }

    @Override
    public DonacionResponseDTO actualizar(Long id, DonacionRequestDTO dto) {
        Donacion donacion = obtenerEntidad(id);
        donacion.setUsuario(resolverUsuario(dto.getUsuarioId()));
        donacion.setBanco(resolverBanco(dto.getBancoId()));
        donacion.setFechaDonacion(dto.getFechaDonacion());
        donacion.setTipoSangre(dto.getTipoSangre());
        if (dto.getCantidadMl() != null) donacion.setCantidadMl(dto.getCantidadMl());
        donacion.setHemoglobina(dto.getHemoglobina());
        donacion.setPresionArterial(dto.getPresionArterial());
        if (dto.getEstado() != null) donacion.setEstado(dto.getEstado());
        donacion.setObservaciones(dto.getObservaciones());
        return mapearResponse(donacionRepository.save(donacion));
    }

    @Override
    @Transactional(readOnly = true)
    public DonacionResponseDTO obtenerPorId(Long id) {
        return mapearResponse(obtenerEntidad(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonacionResponseDTO> listarTodas() {
        return donacionRepository.findAll().stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonacionResponseDTO> listarPorUsuario(Long usuarioId) {
        return donacionRepository.findByUsuarioId(usuarioId).stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonacionResponseDTO> listarPorBanco(Long bancoId) {
        return donacionRepository.findByBancoId(bancoId).stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonacionResponseDTO> listarPorEstado(EstadoDonacion estado) {
        return donacionRepository.findByEstado(estado).stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonacionResponseDTO> listarPorSolicitud(Long solicitudId) {
        return donacionRepository.findBySolicitudId(solicitudId).stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonacionResponseDTO> historialUsuario(Long usuarioId) {
        return donacionRepository.findHistorialUsuario(usuarioId).stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<DonacionResponseDTO> listarPorBancoYRangoFecha(Long bancoId, LocalDate inicio, LocalDate fin) {
        return donacionRepository.findPorBancoYRangoFecha(bancoId, inicio, fin)
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    public DonacionResponseDTO cambiarEstado(Long id, EstadoDonacion estado) {
        Donacion donacion = obtenerEntidad(id);
        donacion.setEstado(estado);
        return mapearResponse(donacionRepository.save(donacion));
    }

    @Override
    public void eliminar(Long id) {
        if (!donacionRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Donacion no encontrada con id: " + id);
        }
        donacionRepository.deleteById(id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private Donacion obtenerEntidad(Long id) {
        return donacionRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Donacion no encontrada con id: " + id));
    }

    private Usuario resolverUsuario(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Usuario no encontrado con id: " + id));
    }

    private Banco resolverBanco(Long id) {
        return bancoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Banco no encontrado con id: " + id));
    }

    private DonacionResponseDTO mapearResponse(Donacion d) {
        return DonacionResponseDTO.builder()
                .id(d.getId())
                .usuarioId(d.getUsuario().getId())
                .usuarioNombre(d.getUsuario().getNombre())
                .usuarioApellido(d.getUsuario().getApellido())
                .usuarioTipoSangre(d.getUsuario().getTipoSangre())
                .bancoId(d.getBanco().getId())
                .bancoNombre(d.getBanco().getNombre())
                .solicitudId(d.getSolicitud() != null ? d.getSolicitud().getId() : null)
                .fechaDonacion(d.getFechaDonacion())
                .tipoSangre(d.getTipoSangre())
                .cantidadMl(d.getCantidadMl())
                .hemoglobina(d.getHemoglobina())
                .presionArterial(d.getPresionArterial())
                .estado(d.getEstado())
                .observaciones(d.getObservaciones())
                .createdAt(d.getCreatedAt())
                .updatedAt(d.getUpdatedAt())
                .build();
    }
}