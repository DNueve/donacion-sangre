package com.bancosangre.api_banco_sangre.service.impl;

import com.bancosangre.api_banco_sangre.dto.SolicitudRequestDTO;
import com.bancosangre.api_banco_sangre.dto.SolicitudResponseDTO;
import com.bancosangre.api_banco_sangre.entity.Banco;
import com.bancosangre.api_banco_sangre.entity.Solicitud;
import com.bancosangre.api_banco_sangre.entity.Solicitud.EstadoSolicitud;
import com.bancosangre.api_banco_sangre.entity.Solicitud.Urgencia;
import com.bancosangre.api_banco_sangre.exception.RecursoNoEncontradoException;
import com.bancosangre.api_banco_sangre.repository.BancoRepository;
import com.bancosangre.api_banco_sangre.repository.SolicitudRepository;
import com.bancosangre.api_banco_sangre.service.SolicitudService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SolicitudServiceImpl implements SolicitudService {

    private final SolicitudRepository solicitudRepository;
    private final BancoRepository bancoRepository;

    @Override
    public SolicitudResponseDTO crear(SolicitudRequestDTO dto) {
        Banco banco = resolverBanco(dto.getBancoId());
        Solicitud solicitud = Solicitud.builder()
                .banco(banco)
                .tipoSangre(dto.getTipoSangre())
                .unidadesNecesarias(dto.getUnidadesNecesarias())
                .urgencia(dto.getUrgencia())
                .motivo(dto.getMotivo())
                .pacienteReferencia(dto.getPacienteReferencia())
                .fechaLimite(dto.getFechaLimite())
                .estado(dto.getEstado() != null ? dto.getEstado() : EstadoSolicitud.ACTIVA)
                .radioBusquedaKm(dto.getRadioBusquedaKm() != null ? dto.getRadioBusquedaKm() : 50.0)
                .build();
        return mapearResponse(solicitudRepository.save(solicitud));
    }

    @Override
    public SolicitudResponseDTO actualizar(Long id, SolicitudRequestDTO dto) {
        Solicitud solicitud = obtenerEntidad(id);
        Banco banco = resolverBanco(dto.getBancoId());
        solicitud.setBanco(banco);
        solicitud.setTipoSangre(dto.getTipoSangre());
        solicitud.setUnidadesNecesarias(dto.getUnidadesNecesarias());
        solicitud.setUrgencia(dto.getUrgencia());
        solicitud.setMotivo(dto.getMotivo());
        solicitud.setPacienteReferencia(dto.getPacienteReferencia());
        solicitud.setFechaLimite(dto.getFechaLimite());
        if (dto.getEstado() != null) solicitud.setEstado(dto.getEstado());
        if (dto.getRadioBusquedaKm() != null) solicitud.setRadioBusquedaKm(dto.getRadioBusquedaKm());
        return mapearResponse(solicitudRepository.save(solicitud));
    }

    @Override
    @Transactional(readOnly = true)
    public SolicitudResponseDTO obtenerPorId(Long id) {
        return mapearResponse(obtenerEntidad(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudResponseDTO> listarTodas() {
        return solicitudRepository.findAll().stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudResponseDTO> listarActivas() {
        return solicitudRepository.findByEstado(EstadoSolicitud.ACTIVA)
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudResponseDTO> listarPorBanco(Long bancoId) {
        return solicitudRepository.findByBancoId(bancoId)
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudResponseDTO> listarPorBancoYEstado(Long bancoId, EstadoSolicitud estado) {
        return solicitudRepository.findByBancoIdAndEstado(bancoId, estado)
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudResponseDTO> listarPorTipoSangre(String tipoSangre) {
        return solicitudRepository.findByTipoSangreAndEstado(tipoSangre, EstadoSolicitud.ACTIVA)
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudResponseDTO> listarPorUrgencia(Urgencia urgencia) {
        return solicitudRepository.findByUrgenciaAndEstado(urgencia, EstadoSolicitud.ACTIVA)
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudResponseDTO> buscarEnRadio(Double lat, Double lon, Double radioKm) {
        return solicitudRepository.findActivasEnRadio(lat, lon, radioKm)
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SolicitudResponseDTO> buscarPorTipoSangreEnRadio(
            String tipoSangre, Double lat, Double lon, Double radioKm) {
        return solicitudRepository.findActivasPorTipoSangreEnRadio(tipoSangre, lat, lon, radioKm)
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    public SolicitudResponseDTO cambiarEstado(Long id, EstadoSolicitud estado) {
        Solicitud solicitud = obtenerEntidad(id);
        solicitud.setEstado(estado);
        return mapearResponse(solicitudRepository.save(solicitud));
    }

    @Override
    public void eliminar(Long id) {
        if (!solicitudRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Solicitud no encontrada con id: " + id);
        }
        solicitudRepository.deleteById(id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private Solicitud obtenerEntidad(Long id) {
        return solicitudRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Solicitud no encontrada con id: " + id));
    }

    private Banco resolverBanco(Long bancoId) {
        return bancoRepository.findById(bancoId)
                .orElseThrow(() -> new RecursoNoEncontradoException("Banco no encontrado con id: " + bancoId));
    }

    private SolicitudResponseDTO mapearResponse(Solicitud s) {
        return SolicitudResponseDTO.builder()
                .id(s.getId())
                .bancoId(s.getBanco().getId())
                .bancoNombre(s.getBanco().getNombre())
                .bancoCiudad(s.getBanco().getCiudad())
                .tipoSangre(s.getTipoSangre())
                .unidadesNecesarias(s.getUnidadesNecesarias())
                .unidadesRecibidas(s.getUnidadesRecibidas())
                .unidadesFaltantes(s.getUnidadesNecesarias() - s.getUnidadesRecibidas())
                .urgencia(s.getUrgencia())
                .motivo(s.getMotivo())
                .pacienteReferencia(s.getPacienteReferencia())
                .fechaLimite(s.getFechaLimite())
                .estado(s.getEstado())
                .radioBusquedaKm(s.getRadioBusquedaKm())
                .createdAt(s.getCreatedAt())
                .updatedAt(s.getUpdatedAt())
                .build();
    }
}