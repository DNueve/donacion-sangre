package com.bancosangre.api_banco_sangre.repository;

import com.bancosangre.api_banco_sangre.entity.Solicitud;
import com.bancosangre.api_banco_sangre.entity.Solicitud.EstadoSolicitud;
import com.bancosangre.api_banco_sangre.entity.Solicitud.Urgencia;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SolicitudRepository extends JpaRepository<Solicitud, Long> {

    List<Solicitud> findByEstado(EstadoSolicitud estado);

    List<Solicitud> findByBancoId(Long bancoId);

    List<Solicitud> findByBancoIdAndEstado(Long bancoId, EstadoSolicitud estado);

    List<Solicitud> findByTipoSangreAndEstado(String tipoSangre, EstadoSolicitud estado);

    List<Solicitud> findByUrgenciaAndEstado(Urgencia urgencia, EstadoSolicitud estado);

    // Solicitudes activas de bancos en un radio dado
    @Query("""
        SELECT s FROM Solicitud s
        JOIN s.banco b
        WHERE s.estado = 'ACTIVA'
          AND (6371 * acos(
                cos(radians(:lat)) * cos(radians(b.latitud))
                * cos(radians(b.longitud) - radians(:lon))
                + sin(radians(:lat)) * sin(radians(b.latitud))
              )) <= :radioKm
        ORDER BY s.urgencia ASC, s.fechaLimite ASC
        """)
    List<Solicitud> findActivasEnRadio(
            @Param("lat") Double lat,
            @Param("lon") Double lon,
            @Param("radioKm") Double radioKm
    );

    // Solicitudes activas por tipo de sangre en radio
    @Query("""
        SELECT s FROM Solicitud s
        JOIN s.banco b
        WHERE s.estado = 'ACTIVA'
          AND s.tipoSangre = :tipoSangre
          AND (6371 * acos(
                cos(radians(:lat)) * cos(radians(b.latitud))
                * cos(radians(b.longitud) - radians(:lon))
                + sin(radians(:lat)) * sin(radians(b.latitud))
              )) <= :radioKm
        ORDER BY s.urgencia ASC
        """)
    List<Solicitud> findActivasPorTipoSangreEnRadio(
            @Param("tipoSangre") String tipoSangre,
            @Param("lat") Double lat,
            @Param("lon") Double lon,
            @Param("radioKm") Double radioKm
    );

    // Solicitudes próximas a vencer (para notificaciones)
    @Query("SELECT s FROM Solicitud s WHERE s.estado = 'ACTIVA' AND s.fechaLimite <= :fecha")
    List<Solicitud> findProximasAVencer(@Param("fecha") LocalDate fecha);
}