// src/main/java/com/bancosangre/api_banco_sangre/service/BancoService.java
package com.bancosangre.api_banco_sangre.service;

import com.bancosangre.api_banco_sangre.dto.BancoRequestDTO;
import com.bancosangre.api_banco_sangre.dto.BancoResponseDTO;

import java.util.List;

public interface BancoService {

    BancoResponseDTO crear(BancoRequestDTO dto);

    BancoResponseDTO actualizar(Long id, BancoRequestDTO dto);

    BancoResponseDTO obtenerPorId(Long id);

    List<BancoResponseDTO> listarTodos();

    List<BancoResponseDTO> listarActivos();

    List<BancoResponseDTO> listarPorCiudad(String ciudad);

    List<BancoResponseDTO> listarPorDepartamento(String departamento);

    List<BancoResponseDTO> buscarEnRadio(Double lat, Double lon, Double radioKm);

    void desactivar(Long id);

    void eliminar(Long id);
}