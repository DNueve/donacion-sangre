package com.bancosangre.api_banco_sangre.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
@Builder
public class BancoResponseDTO {

    private Long id;
    private String nombre;
    private String nit;
    private String direccion;
    private String ciudad;
    private String departamento;
    private String telefono;
    private String correo;
    private Double latitud;
    private Double longitud;
    private LocalTime horarioApertura;
    private LocalTime horarioCierre;
    private Boolean activo;

    // Info del admin embebida (sin exponer datos sensibles)
    private AdminInfo admin;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Distancia calculada en runtime (para búsquedas por radio)
    private Double distanciaKm;

    @Data @Builder
    public static class AdminInfo {
        private Long id;
        private String nombre;
        private String apellido;
        private String correo;
    }
}