package com.bancosangre.api_banco_sangre.service;

import com.bancosangre.api_banco_sangre.dto.AuthResponseDTO;
import com.bancosangre.api_banco_sangre.dto.LoginDTO;
import com.bancosangre.api_banco_sangre.dto.RegistroDTO;

// Interfaz que define los métodos del servicio de autenticación
// La implementación real está en AuthServiceImpl
public interface AuthService {

    // Registra un nuevo donante en el sistema
    // Retorna el token JWT + datos del usuario
    AuthResponseDTO registrar(RegistroDTO registroDTO);

    // Valida credenciales y devuelve token JWT + datos del usuario
    AuthResponseDTO login(LoginDTO loginDTO);
}