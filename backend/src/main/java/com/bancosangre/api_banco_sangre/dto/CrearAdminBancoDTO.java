package com.bancosangre.api_banco_sangre.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

/**
 * DTO simplificado para que el SUPER_ADMIN cree usuarios con rol ADMIN_BANCO.
 * Los campos médicos (tipo sangre, peso, fecha nacimiento, etc.) se rellenan
 * en el service con defaults porque un admin de banco no dona.
 */
@Data
public class CrearAdminBancoDTO {

    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    @NotBlank(message = "El correo es obligatorio")
    @Email(message = "El correo no es válido")
    private String correo;

    @NotBlank(message = "El celular es obligatorio")
    private String celular;

    @NotBlank(message = "El tipo de documento es obligatorio")
    private String tipoDocumento;

    @NotBlank(message = "El número de documento es obligatorio")
    private String numeroDocumento;

    @NotBlank(message = "La contraseña es obligatoria")
    @Size(min = 8, message = "La contraseña debe tener al menos 8 caracteres")
    private String contrasena;

    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;

    @NotBlank(message = "El departamento es obligatorio")
    private String departamento;
}