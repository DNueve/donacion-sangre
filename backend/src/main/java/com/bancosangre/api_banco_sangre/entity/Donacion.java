package com.bancosangre.api_banco_sangre.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "donaciones")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Donacion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "usuario_id", nullable = false)
    private Usuario usuario;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banco_id", nullable = false)
    private Banco banco;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "solicitud_id")  // opcional
    private Solicitud solicitud;

    @Column(name = "fecha_donacion", nullable = false)
    private LocalDate fechaDonacion;

    @Column(name = "tipo_sangre", nullable = false, length = 5)
    private String tipoSangre;

    @Column(name = "cantidad_ml")
    @Builder.Default
    private Integer cantidadMl = 450;

    private Double hemoglobina;

    @Column(name = "presion_arterial", length = 20)
    private String presionArterial;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoDonacion estado = EstadoDonacion.PENDIENTE;

    @Column(length = 500)
    private String observaciones;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum EstadoDonacion {
        PENDIENTE, COMPLETADA, RECHAZADA, CANCELADA
    }
}