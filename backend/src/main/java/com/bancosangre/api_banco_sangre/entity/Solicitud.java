package com.bancosangre.api_banco_sangre.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "solicitudes")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Solicitud {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banco_id", nullable = false)
    private Banco banco;

    @Column(name = "tipo_sangre", nullable = false, length = 5)
    private String tipoSangre;

    @Column(name = "unidades_necesarias", nullable = false)
    private Integer unidadesNecesarias;

    @Column(name = "unidades_recibidas", nullable = false)
    @Builder.Default
    private Integer unidadesRecibidas = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 10)
    private Urgencia urgencia;

    @Column(length = 500)
    private String motivo;

    @Column(name = "paciente_referencia", length = 100)
    private String pacienteReferencia;

    @Column(name = "fecha_limite")
    private LocalDate fechaLimite;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private EstadoSolicitud estado = EstadoSolicitud.ACTIVA;

    @Column(name = "radio_busqueda_km")
    @Builder.Default
    private Double radioBusquedaKm = 50.0;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // ── Enums internos ──────────────────────────────────────────────────────

    public enum Urgencia {
        ALTA, MEDIA, BAJA
    }

    public enum EstadoSolicitud {
        ACTIVA, COMPLETADA, CANCELADA, VENCIDA
    }
}