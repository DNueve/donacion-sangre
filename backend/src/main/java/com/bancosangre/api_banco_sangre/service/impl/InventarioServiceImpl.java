package com.bancosangre.api_banco_sangre.service.impl;

import com.bancosangre.api_banco_sangre.dto.InventarioRequestDTO;
import com.bancosangre.api_banco_sangre.dto.InventarioResponseDTO;
import com.bancosangre.api_banco_sangre.entity.Banco;
import com.bancosangre.api_banco_sangre.entity.Inventario;
import com.bancosangre.api_banco_sangre.exception.RecursoNoEncontradoException;
import com.bancosangre.api_banco_sangre.repository.BancoRepository;
import com.bancosangre.api_banco_sangre.repository.InventarioRepository;
import com.bancosangre.api_banco_sangre.service.InventarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class InventarioServiceImpl implements InventarioService {

    private final InventarioRepository inventarioRepository;
    private final BancoRepository bancoRepository;

    @Override
    public InventarioResponseDTO crear(InventarioRequestDTO dto) {
        if (inventarioRepository.existsByBancoIdAndTipoSangre(dto.getBancoId(), dto.getTipoSangre())) {
            throw new IllegalArgumentException(
                "Ya existe inventario para el tipo " + dto.getTipoSangre() + " en este banco.");
        }
        Banco banco = resolverBanco(dto.getBancoId());
        Inventario inv = Inventario.builder()
                .banco(banco)
                .tipoSangre(dto.getTipoSangre())
                .unidadesDisponibles(dto.getUnidadesDisponibles())
                .unidadesMinimas(dto.getUnidadesMinimas())
                .build();
        return mapearResponse(inventarioRepository.save(inv));
    }

    @Override
    public InventarioResponseDTO actualizar(Long id, InventarioRequestDTO dto) {
        Inventario inv = obtenerEntidad(id);
        inv.setUnidadesDisponibles(dto.getUnidadesDisponibles());
        inv.setUnidadesMinimas(dto.getUnidadesMinimas());
        return mapearResponse(inventarioRepository.save(inv));
    }

    @Override
    @Transactional(readOnly = true)
    public InventarioResponseDTO obtenerPorId(Long id) {
        return mapearResponse(obtenerEntidad(id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> listarPorBanco(Long bancoId) {
        return inventarioRepository.findByBancoId(bancoId)
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> listarBajoStockPorBanco(Long bancoId) {
        return inventarioRepository.findBajoStockPorBanco(bancoId)
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> listarTodoBajoStock() {
        return inventarioRepository.findTodoBajoStock()
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventarioResponseDTO> listarDisponiblesPorTipoSangre(String tipoSangre) {
        return inventarioRepository.findDisponiblesPorTipoSangre(tipoSangre)
                .stream().map(this::mapearResponse).toList();
    }

    @Override
    public InventarioResponseDTO ajustarUnidades(Long bancoId, String tipoSangre, Integer cantidad) {
        Inventario inv = inventarioRepository.findByBancoIdAndTipoSangre(bancoId, tipoSangre)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "No hay inventario de " + tipoSangre + " en el banco id: " + bancoId));

        int nuevaCantidad = inv.getUnidadesDisponibles() + cantidad;
        if (nuevaCantidad < 0) {
            throw new IllegalArgumentException("No hay suficientes unidades disponibles. Stock actual: "
                    + inv.getUnidadesDisponibles());
        }
        inv.setUnidadesDisponibles(nuevaCantidad);
        return mapearResponse(inventarioRepository.save(inv));
    }

    @Override
    public void eliminar(Long id) {
        if (!inventarioRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Inventario no encontrado con id: " + id);
        }
        inventarioRepository.deleteById(id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private Inventario obtenerEntidad(Long id) {
        return inventarioRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Inventario no encontrado con id: " + id));
    }

    private Banco resolverBanco(Long id) {
        return bancoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Banco no encontrado con id: " + id));
    }

    private InventarioResponseDTO mapearResponse(Inventario i) {
        return InventarioResponseDTO.builder()
                .id(i.getId())
                .bancoId(i.getBanco().getId())
                .bancoNombre(i.getBanco().getNombre())
                .bancoCiudad(i.getBanco().getCiudad())
                .tipoSangre(i.getTipoSangre())
                .unidadesDisponibles(i.getUnidadesDisponibles())
                .unidadesMinimas(i.getUnidadesMinimas())
                .bajoStock(i.isBajoStock())
                .updatedAt(i.getUpdatedAt())
                .build();
    }
}