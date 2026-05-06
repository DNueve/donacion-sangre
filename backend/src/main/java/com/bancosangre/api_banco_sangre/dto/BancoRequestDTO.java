package com.bancosangre.api_banco_sangre.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalTime;

@Data
public class BancoRequestDTO {

    @NotBlank(message = "El nombre es obligatorio")
    @Size(max = 150)
    private String nombre;

    @NotBlank(message = "El NIT es obligatorio")
    @Size(max = 20)
    private String nit;

    @NotBlank(message = "La dirección es obligatoria")
    private String direccion;

    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;

    @NotBlank(message = "El departamento es obligatorio")
    private String departamento;

    private String telefono;

    @Email(message = "Correo inválido")
    private String correo;

    @NotNull(message = "La latitud es obligatoria")
    @DecimalMin(value = "-90.0") @DecimalMax(value = "90.0")
    private Double latitud;

    @NotNull(message = "La longitud es obligatoria")
    @DecimalMin(value = "-180.0") @DecimalMax(value = "180.0")
    private Double longitud;

    private LocalTime horarioApertura;
    private LocalTime horarioCierre;

    private Boolean activo = true;

    @NotNull(message = "El administrador es obligatorio")
    private Long adminId;
}