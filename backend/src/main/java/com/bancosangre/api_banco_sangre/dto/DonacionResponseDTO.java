package com.bancosangre.api_banco_sangre.dto;

import com.bancosangre.api_banco_sangre.entity.Donacion.EstadoDonacion;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class DonacionResponseDTO {

    private Long id;

    // Donante
    private Long usuarioId;
    private String usuarioNombre;
    private String usuarioApellido;
    private String usuarioTipoSangre;

    // Banco
    private Long bancoId;
    private String bancoNombre;

    // Solicitud (puede ser null)
    private Long solicitudId;

    private LocalDate fechaDonacion;
    private String tipoSangre;
    private Integer cantidadMl;
    private Double hemoglobina;
    private String presionArterial;
    private EstadoDonacion estado;
    private String observaciones;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}