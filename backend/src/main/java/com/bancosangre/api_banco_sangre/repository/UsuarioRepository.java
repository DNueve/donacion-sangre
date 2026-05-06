package com.bancosangre.api_banco_sangre.repository;

import com.bancosangre.api_banco_sangre.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    // JpaRepository<Usuario, Long> ya te da gratis estos métodos:
    // save(usuario)        → INSERT o UPDATE
    // findById(id)         → SELECT WHERE id = ?
    // findAll()            → SELECT * FROM usuarios
    // deleteById(id)       → DELETE WHERE id = ?

    // ─── Consultas personalizadas ─────────────────────────────────────
    // Spring genera el SQL automáticamente leyendo el nombre del método

    // SELECT * FROM usuarios WHERE correo = ?
    // Lo usaremos en el login para buscar el usuario por correo
    Optional<Usuario> findByCorreo(String correo);

    // SELECT EXISTS WHERE correo = ?
    // Para validar si un correo ya está registrado al crear cuenta
    boolean existsByCorreo(String correo);

    // SELECT EXISTS WHERE numero_documento = ?
    // Para validar duplicados de documento
    boolean existsByNumeroDocumento(String numeroDocumento);


}