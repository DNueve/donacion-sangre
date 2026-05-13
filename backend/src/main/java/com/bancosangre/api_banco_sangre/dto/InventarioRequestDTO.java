package com.bancosangre.api_banco_sangre.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

@Data
public class InventarioRequestDTO {

    @NotNull(message = "El banco es obligatorio")
    private Long bancoId;

    @NotBlank(message = "El tipo de sangre es obligatorio")
    private String tipoSangre;

    @NotNull(message = "Las unidades disponibles son obligatorias")
    @Min(value = 0, message = "Las unidades no pueden ser negativas")
    private Integer unidadesDisponibles;

    @NotNull(message = "Las unidades mínimas son obligatorias")
    @Min(value = 1, message = "El mínimo debe ser al menos 1")
    private Integer unidadesMinimas;
}