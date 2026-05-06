package com.bancosangre.api_banco_sangre.dto;

import com.bancosangre.api_banco_sangre.entity.Donacion.EstadoDonacion;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class DonacionRequestDTO {

    @NotNull(message = "El usuario es obligatorio")
    private Long usuarioId;

    @NotNull(message = "El banco es obligatorio")
    private Long bancoId;

    private Long solicitudId; // opcional

    @NotNull(message = "La fecha de donación es obligatoria")
    private LocalDate fechaDonacion;

    @NotBlank(message = "El tipo de sangre es obligatorio")
    private String tipoSangre;

    @Min(value = 200, message = "Mínimo 200 ml")
    @Max(value = 550, message = "Máximo 550 ml")
    private Integer cantidadMl = 450;

    @DecimalMin(value = "7.0", message = "Hemoglobina mínima 7.0")
    @DecimalMax(value = "25.0", message = "Hemoglobina máxima 25.0")
    private Double hemoglobina;

    private String presionArterial;

    private EstadoDonacion estado;

    @Size(max = 500)
    private String observaciones;
}