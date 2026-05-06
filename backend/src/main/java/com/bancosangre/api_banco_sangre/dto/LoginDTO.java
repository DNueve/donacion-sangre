package com.bancosangre.api_banco_sangre.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

// DTO de entrada para el endpoint POST /auth/login
// Es lo que el frontend manda en el body de la petición
@Data
public class LoginDTO {

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El formato del correo no es válido")
    private String correo;

    @NotBlank(message = "La contraseña es obligatoria")
    private String contrasena;
}