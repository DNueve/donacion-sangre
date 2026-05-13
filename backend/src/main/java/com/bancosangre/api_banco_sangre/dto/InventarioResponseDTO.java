package com.bancosangre.api_banco_sangre.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class InventarioResponseDTO {

    private Long id;
    private Long bancoId;
    private String bancoNombre;
    private String bancoCiudad;
    private String tipoSangre;
    private Integer unidadesDisponibles;
    private Integer unidadesMinimas;
    private Boolean bajoStock;      // true si disponibles < minimas
    private LocalDateTime updatedAt;
}