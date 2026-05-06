package com.bancosangre.api_banco_sangre.repository;

import com.bancosangre.api_banco_sangre.entity.Donacion;
import com.bancosangre.api_banco_sangre.entity.Donacion.EstadoDonacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface DonacionRepository extends JpaRepository<Donacion, Long> {

    List<Donacion> findByUsuarioId(Long usuarioId);

    List<Donacion> findByBancoId(Long bancoId);

    List<Donacion> findByEstado(EstadoDonacion estado);

    List<Donacion> findByUsuarioIdAndEstado(Long usuarioId, EstadoDonacion estado);

    List<Donacion> findBySolicitudId(Long solicitudId);

    // Historial de donaciones de un usuario ordenado por fecha desc
    @Query("SELECT d FROM Donacion d WHERE d.usuario.id = :usuarioId ORDER BY d.fechaDonacion DESC")
    List<Donacion> findHistorialUsuario(@Param("usuarioId") Long usuarioId);

    // Última donación de un usuario (para validar los 3 meses entre donaciones)
    @Query("SELECT d FROM Donacion d WHERE d.usuario.id = :usuarioId AND d.estado = 'COMPLETADA' ORDER BY d.fechaDonacion DESC LIMIT 1")
    java.util.Optional<Donacion> findUltimaDonacionCompletada(@Param("usuarioId") Long usuarioId);

    // Total de donaciones completadas por banco
    @Query("SELECT COUNT(d) FROM Donacion d WHERE d.banco.id = :bancoId AND d.estado = 'COMPLETADA'")
    Long countCompletadasPorBanco(@Param("bancoId") Long bancoId);

    // Donaciones por banco en un rango de fechas
    @Query("SELECT d FROM Donacion d WHERE d.banco.id = :bancoId AND d.fechaDonacion BETWEEN :inicio AND :fin")
    List<Donacion> findPorBancoYRangoFecha(
            @Param("bancoId") Long bancoId,
            @Param("inicio") LocalDate inicio,
            @Param("fin") LocalDate fin
    );
}