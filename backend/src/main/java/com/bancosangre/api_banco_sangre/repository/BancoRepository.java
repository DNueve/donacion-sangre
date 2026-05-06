// src/main/java/com/bancosangre/api_banco_sangre/repository/BancoRepository.java
package com.bancosangre.api_banco_sangre.repository;

import com.bancosangre.api_banco_sangre.entity.Banco;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BancoRepository extends JpaRepository<Banco, Long> {

    List<Banco> findByActivoTrue();

    List<Banco> findByCiudadIgnoreCaseAndActivoTrue(String ciudad);

    List<Banco> findByDepartamentoIgnoreCaseAndActivoTrue(String departamento);

    Optional<Banco> findByNit(String nit);

    boolean existsByNit(String nit);

    List<Banco> findByAdminId(Long adminId);

    // Bancos dentro de un radio (Haversine en JPQL)
    @Query("""
        SELECT b FROM Banco b
        WHERE b.activo = true
          AND (6371 * acos(
                cos(radians(:lat)) * cos(radians(b.latitud))
                * cos(radians(b.longitud) - radians(:lon))
                + sin(radians(:lat)) * sin(radians(b.latitud))
              )) <= :radioKm
        ORDER BY (6371 * acos(
                cos(radians(:lat)) * cos(radians(b.latitud))
                * cos(radians(b.longitud) - radians(:lon))
                + sin(radians(:lat)) * sin(radians(b.latitud))
              )) ASC
        """)
    List<Banco> findBancosEnRadio(
            @Param("lat") Double lat,
            @Param("lon") Double lon,
            @Param("radioKm") Double radioKm
    );
}