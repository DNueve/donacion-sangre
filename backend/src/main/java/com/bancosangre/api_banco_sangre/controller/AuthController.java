package com.bancosangre.api_banco_sangre.controller;

import com.bancosangre.api_banco_sangre.dto.AuthResponseDTO;
import com.bancosangre.api_banco_sangre.dto.LoginDTO;
import com.bancosangre.api_banco_sangre.dto.RegistroDTO;
import com.bancosangre.api_banco_sangre.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

// Controller que expone los endpoints de autenticación
// Base URL: /api/v1/auth
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor // Lombok genera el constructor con los campos final
@CrossOrigin(origins = "*") // Permite que React se conecte (luego lo manejamos con CorsConfig)
public class AuthController {

    private final AuthService authService;

    // ─── REGISTRO DE NUEVO DONANTE ───────────────────────────────────
    // POST /api/v1/auth/registro
    @PostMapping("/registro")
    public ResponseEntity<AuthResponseDTO> registrar(@Valid @RequestBody RegistroDTO dto) {
        AuthResponseDTO response = authService.registrar(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // ─── LOGIN ───────────────────────────────────────────────────────
    // POST /api/v1/auth/login
    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@Valid @RequestBody LoginDTO dto) {
        AuthResponseDTO response = authService.login(dto);
        return ResponseEntity.ok(response);
    }
}