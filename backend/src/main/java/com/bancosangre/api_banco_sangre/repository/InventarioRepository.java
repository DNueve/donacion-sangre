package com.bancosangre.api_banco_sangre.repository;

import com.bancosangre.api_banco_sangre.entity.Inventario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface InventarioRepository extends JpaRepository<Inventario, Long> {

    List<Inventario> findByBancoId(Long bancoId);

    Optional<Inventario> findByBancoIdAndTipoSangre(Long bancoId, String tipoSangre);

    boolean existsByBancoIdAndTipoSangre(Long bancoId, String tipoSangre);

    // Stock bajo mínimo por banco
    @Query("SELECT i FROM Inventario i WHERE i.banco.id = :bancoId AND i.unidadesDisponibles < i.unidadesMinimas")
    List<Inventario> findBajoStockPorBanco(@Param("bancoId") Long bancoId);

    // Todo el stock bajo mínimo (para alertas globales)
    @Query("SELECT i FROM Inventario i WHERE i.unidadesDisponibles < i.unidadesMinimas")
    List<Inventario> findTodoBajoStock();

    // Stock por tipo de sangre en todos los bancos
    @Query("SELECT i FROM Inventario i WHERE i.tipoSangre = :tipoSangre AND i.unidadesDisponibles > 0")
    List<Inventario> findDisponiblesPorTipoSangre(@Param("tipoSangre") String tipoSangre);

    // Total de unidades disponibles por tipo de sangre globalmente
    @Query("SELECT SUM(i.unidadesDisponibles) FROM Inventario i WHERE i.tipoSangre = :tipoSangre")
    Integer sumUnidadesPorTipoSangre(@Param("tipoSangre") String tipoSangre);
}