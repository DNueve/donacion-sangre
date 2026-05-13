package com.bancosangre.api_banco_sangre.service;

import com.bancosangre.api_banco_sangre.dto.MatchingResponseDTO;

public interface MatchingService {

    // Buscar donantes compatibles para una solicitud específica
    MatchingResponseDTO buscarDonantesParaSolicitud(Long solicitudId);

    // Buscar donantes compatibles por tipo de sangre, coordenadas y radio
    MatchingResponseDTO buscarDonantesCompatibles(
            String tipoSangreRequerido,
            Double latBanco,
            Double lonBanco,
            Double radioKm
    );
}