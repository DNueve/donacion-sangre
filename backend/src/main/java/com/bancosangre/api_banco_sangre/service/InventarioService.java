package com.bancosangre.api_banco_sangre.service;

import com.bancosangre.api_banco_sangre.dto.InventarioRequestDTO;
import com.bancosangre.api_banco_sangre.dto.InventarioResponseDTO;

import java.util.List;

public interface InventarioService {

    InventarioResponseDTO crear(InventarioRequestDTO dto);

    InventarioResponseDTO actualizar(Long id, InventarioRequestDTO dto);

    InventarioResponseDTO obtenerPorId(Long id);

    List<InventarioResponseDTO> listarPorBanco(Long bancoId);

    List<InventarioResponseDTO> listarBajoStockPorBanco(Long bancoId);

    List<InventarioResponseDTO> listarTodoBajoStock();

    List<InventarioResponseDTO> listarDisponiblesPorTipoSangre(String tipoSangre);

    // Sumar o restar unidades directamente
    InventarioResponseDTO ajustarUnidades(Long bancoId, String tipoSangre, Integer cantidad);

    void eliminar(Long id);
}