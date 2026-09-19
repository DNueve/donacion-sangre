package com.bancosangre.api_banco_sangre.service;

import com.bancosangre.api_banco_sangre.dto.CrearAdminBancoDTO;
import com.bancosangre.api_banco_sangre.dto.UsuarioResponseDTO;

import java.util.List;

public interface UsuarioService {

    List<UsuarioResponseDTO> listarTodos();

    List<UsuarioResponseDTO> listarPorRol(String nombreRol);

    UsuarioResponseDTO obtenerPorId(Long id);

    UsuarioResponseDTO crearAdminBanco(CrearAdminBancoDTO dto);
}