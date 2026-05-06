package com.bancosangre.api_banco_sangre.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Esta clase representa la tabla "roles" en PostgreSQL
// Almacena los roles del sistema: DONANTE, ADMIN_BANCO, ADMIN_GENERAL
@Entity
@Table(name = "roles")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Rol {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Nombre del rol → DONANTE, ADMIN_BANCO, ADMIN_GENERAL
    // unique = true → no pueden existir dos roles con el mismo nombre
    @Column(nullable = false, unique = true, length = 50)
    private String nombre;

    // Descripción opcional del rol
    @Column(length = 255)
    private String descripcion;
}