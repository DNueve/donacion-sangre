package com.bancosangre.api_banco_sangre.dto;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class MatchingResponseDTO {

    private Long solicitudId;
    private String tipoSangreRequerido;
    private String bancoNombre;
    private String bancoCiudad;
    private Integer unidadesFaltantes;

    private List<DonanteCercano> donantesCompatibles;
    private Integer totalEncontrados;

    @Data
    @Builder
    public static class DonanteCercano {
        private Long usuarioId;
        private String nombre;
        private String apellido;
        private String tipoSangre;
        private String ciudad;
        private String departamento;
        private Double distanciaKm;
        private Boolean aptoParaDonar; // false si donó hace menos de 90 días
        private Long diasDesdeUltimaDonacion; // null si nunca ha donado
    }
}