package com.bancosangre.api_banco_sangre.dto;

import com.bancosangre.api_banco_sangre.entity.Solicitud.EstadoSolicitud;
import com.bancosangre.api_banco_sangre.entity.Solicitud.Urgencia;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@Builder
public class SolicitudResponseDTO {

    private Long id;
    private Long bancoId;
    private String bancoNombre;
    private String bancoCiudad;
    private String tipoSangre;
    private Integer unidadesNecesarias;
    private Integer unidadesRecibidas;
    private Integer unidadesFaltantes;   // calculado: necesarias - recibidas
    private Urgencia urgencia;
    private String motivo;
    private String pacienteReferencia;
    private LocalDate fechaLimite;
    private EstadoSolicitud estado;
    private Double radioBusquedaKm;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}