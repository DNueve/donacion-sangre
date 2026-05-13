package com.bancosangre.api_banco_sangre.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
    name = "inventario",
    uniqueConstraints = @UniqueConstraint(columnNames = {"banco_id", "tipo_sangre"})
)
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Inventario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "banco_id", nullable = false)
    private Banco banco;

    @Column(name = "tipo_sangre", nullable = false, length = 5)
    private String tipoSangre;

    @Column(name = "unidades_disponibles", nullable = false)
    @Builder.Default
    private Integer unidadesDisponibles = 0;

    @Column(name = "unidades_minimas", nullable = false)
    @Builder.Default
    private Integer unidadesMinimas = 5;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Indica si el stock está por debajo del mínimo
    @Transient
    public boolean isBajoStock() {
        return unidadesDisponibles < unidadesMinimas;
    }
}