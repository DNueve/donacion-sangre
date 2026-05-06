package com.bancosangre.api_banco_sangre.repository;

import com.bancosangre.api_banco_sangre.entity.Rol;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

// @Repository → le dice a Spring que esta interfaz es una capa de acceso a datos
@Repository
public interface RolRepository extends JpaRepository<Rol, Long> {

    // SELECT * FROM roles WHERE nombre = ?
    // Lo usamos para buscar el rol al registrar un usuario nuevo
    Optional<Rol> findByNombre(String nombre);
}