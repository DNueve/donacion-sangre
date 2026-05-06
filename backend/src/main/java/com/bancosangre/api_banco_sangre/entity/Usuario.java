package com.bancosangre.api_banco_sangre.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "usuarios")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Usuario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // ─── Documento de identidad ───────────────────────────────────────
    @Column(name = "tipo_documento", nullable = false, length = 10)
    @NotBlank(message = "El tipo de documento es obligatorio")
    private String tipoDocumento;

    @Column(name = "numero_documento", nullable = false, unique = true, length = 20)
    @NotBlank(message = "El número de documento es obligatorio")
    private String numeroDocumento;

    // ─── Datos personales ─────────────────────────────────────────────
    @Column(nullable = false, length = 100)
    @NotBlank(message = "El nombre es obligatorio")
    private String nombre;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "El apellido es obligatorio")
    private String apellido;

    // ─── Contacto ─────────────────────────────────────────────────────
    @Column(nullable = false, unique = true, length = 150)
    @Email(message = "El correo no es válido")
    @NotBlank(message = "El correo es obligatorio")
    private String correo;

    @Column(nullable = false, length = 20)
    @NotBlank(message = "El celular es obligatorio")
    private String celular;

    // ─── Seguridad ────────────────────────────────────────────────────
    @Column(nullable = false)
    @NotBlank(message = "La contraseña es obligatoria")
    private String contrasena;

    // ─── Datos médicos (AHORA OBLIGATORIOS) ───────────────────────────
    @Column(name = "tipo_sangre", nullable = false, length = 3)
    @NotBlank(message = "El tipo de sangre es obligatorio")
    private String tipoSangre; 

    @Column(name = "fecha_nacimiento", nullable = false)
    @NotNull(message = "La fecha de nacimiento es obligatoria")
    private LocalDate fechaNacimiento;

    @Column(nullable = false, length = 20)
    @NotBlank(message = "El género es obligatorio")
    private String genero; 

    @Column(name = "peso_kg", nullable = false, precision = 5, scale = 2)
    @NotNull(message = "El peso es obligatorio")
    @DecimalMin(value = "50.0", message = "El peso mínimo para donar es 50kg")
    private BigDecimal pesoKg;

    // ─── Geolocalización (AHORA OBLIGATORIOS) ──────────────────────────
    @Column(nullable = false, precision = 10, scale = 8)
    @NotNull(message = "La latitud es obligatoria")
    private BigDecimal latitud;

    @Column(nullable = false, precision = 11, scale = 8)
    @NotNull(message = "La longitud es obligatoria")
    private BigDecimal longitud;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "La ciudad es obligatoria")
    private String ciudad;

    @Column(nullable = false, length = 100)
    @NotBlank(message = "El departamento es obligatorio")
    private String departamento;

    // ─── Rol ──────────────────────────────────────────────────────────
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "rol_id", nullable = false)
    @NotNull(message = "El rol es obligatorio")
    private Rol rol;

    // ─── Control ──────────────────────────────────────────────────────
    @Column(nullable = false)
    private boolean activo = true;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}