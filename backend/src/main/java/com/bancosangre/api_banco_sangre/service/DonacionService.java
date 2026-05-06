package com.bancosangre.api_banco_sangre.service;

import com.bancosangre.api_banco_sangre.dto.DonacionRequestDTO;
import com.bancosangre.api_banco_sangre.dto.DonacionResponseDTO;
import com.bancosangre.api_banco_sangre.entity.Donacion.EstadoDonacion;

import java.time.LocalDate;
import java.util.List;

public interface DonacionService {

    DonacionResponseDTO registrar(DonacionRequestDTO dto);

    DonacionResponseDTO actualizar(Long id, DonacionRequestDTO dto);

    DonacionResponseDTO obtenerPorId(Long id);

    List<DonacionResponseDTO> listarTodas();

    List<DonacionResponseDTO> listarPorUsuario(Long usuarioId);

    List<DonacionResponseDTO> listarPorBanco(Long bancoId);

    List<DonacionResponseDTO> listarPorEstado(EstadoDonacion estado);

    List<DonacionResponseDTO> listarPorSolicitud(Long solicitudId);

    List<DonacionResponseDTO> historialUsuario(Long usuarioId);

    List<DonacionResponseDTO> listarPorBancoYRangoFecha(Long bancoId, LocalDate inicio, LocalDate fin);

    DonacionResponseDTO cambiarEstado(Long id, EstadoDonacion estado);

    void eliminar(Long id);
}