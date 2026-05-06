package com.bancosangre.api_banco_sangre.service;

import com.bancosangre.api_banco_sangre.dto.SolicitudRequestDTO;
import com.bancosangre.api_banco_sangre.dto.SolicitudResponseDTO;
import com.bancosangre.api_banco_sangre.entity.Solicitud.EstadoSolicitud;
import com.bancosangre.api_banco_sangre.entity.Solicitud.Urgencia;

import java.util.List;

public interface SolicitudService {

    SolicitudResponseDTO crear(SolicitudRequestDTO dto);

    SolicitudResponseDTO actualizar(Long id, SolicitudRequestDTO dto);

    SolicitudResponseDTO obtenerPorId(Long id);

    List<SolicitudResponseDTO> listarTodas();

    List<SolicitudResponseDTO> listarActivas();

    List<SolicitudResponseDTO> listarPorBanco(Long bancoId);

    List<SolicitudResponseDTO> listarPorBancoYEstado(Long bancoId, EstadoSolicitud estado);

    List<SolicitudResponseDTO> listarPorTipoSangre(String tipoSangre);

    List<SolicitudResponseDTO> listarPorUrgencia(Urgencia urgencia);

    List<SolicitudResponseDTO> buscarEnRadio(Double lat, Double lon, Double radioKm);

    List<SolicitudResponseDTO> buscarPorTipoSangreEnRadio(String tipoSangre, Double lat, Double lon, Double radioKm);

    SolicitudResponseDTO cambiarEstado(Long id, EstadoSolicitud estado);

    void eliminar(Long id);
}