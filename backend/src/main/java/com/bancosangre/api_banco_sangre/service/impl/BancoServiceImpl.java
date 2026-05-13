package com.bancosangre.api_banco_sangre.service.impl;

import com.bancosangre.api_banco_sangre.dto.BancoRequestDTO;
import com.bancosangre.api_banco_sangre.dto.BancoResponseDTO;
import com.bancosangre.api_banco_sangre.entity.Banco;
import com.bancosangre.api_banco_sangre.entity.Usuario;
import com.bancosangre.api_banco_sangre.exception.RecursoNoEncontradoException;
import com.bancosangre.api_banco_sangre.repository.BancoRepository;
import com.bancosangre.api_banco_sangre.repository.UsuarioRepository;
import com.bancosangre.api_banco_sangre.service.BancoService;
import com.bancosangre.api_banco_sangre.util.GeoUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class BancoServiceImpl implements BancoService {

    private final BancoRepository bancoRepository;
    private final UsuarioRepository usuarioRepository;

    @Override
    public BancoResponseDTO crear(BancoRequestDTO dto) {
        if (bancoRepository.existsByNit(dto.getNit())) {
            throw new IllegalArgumentException("Ya existe un banco con el NIT: " + dto.getNit());
        }
        Usuario admin = resolverAdmin(dto.getAdminId());
        Banco banco = mapearEntidad(dto, new Banco(), admin);
        return mapearResponse(bancoRepository.save(banco), null);
    }

    @Override
    public BancoResponseDTO actualizar(Long id, BancoRequestDTO dto) {
        Banco banco = obtenerEntidad(id);
        if (!banco.getNit().equals(dto.getNit()) && bancoRepository.existsByNit(dto.getNit())) {
            throw new IllegalArgumentException("Ya existe un banco con el NIT: " + dto.getNit());
        }
        Usuario admin = resolverAdmin(dto.getAdminId());
        mapearEntidad(dto, banco, admin);
        return mapearResponse(bancoRepository.save(banco), null);
    }

    @Override
    @Transactional(readOnly = true)
    public BancoResponseDTO obtenerPorId(Long id) {
        return mapearResponse(obtenerEntidad(id), null);
    }

    @Override
    @Transactional(readOnly = true)
    public List<BancoResponseDTO> listarTodos() {
        return bancoRepository.findAll().stream()
                .map(b -> mapearResponse(b, null)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BancoResponseDTO> listarActivos() {
        return bancoRepository.findByActivoTrue().stream()
                .map(b -> mapearResponse(b, null)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BancoResponseDTO> listarPorCiudad(String ciudad) {
        return bancoRepository.findByCiudadIgnoreCaseAndActivoTrue(ciudad).stream()
                .map(b -> mapearResponse(b, null)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BancoResponseDTO> listarPorDepartamento(String departamento) {
        return bancoRepository.findByDepartamentoIgnoreCaseAndActivoTrue(departamento).stream()
                .map(b -> mapearResponse(b, null)).toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<BancoResponseDTO> buscarEnRadio(Double lat, Double lon, Double radioKm) {
        return bancoRepository.findBancosEnRadio(lat, lon, radioKm).stream()
                .map(b -> mapearResponse(b,
                        GeoUtils.calcularDistanciaKm(lat, lon, b.getLatitud(), b.getLongitud())))
                .toList();
    }

    @Override
    public void desactivar(Long id) {
        Banco banco = obtenerEntidad(id);
        banco.setActivo(false);
        bancoRepository.save(banco);
    }

    @Override
    public void eliminar(Long id) {
        if (!bancoRepository.existsById(id)) {
            throw new RecursoNoEncontradoException("Banco no encontrado con id: " + id);
        }
        bancoRepository.deleteById(id);
    }

    // ── Helpers ─────────────────────────────────────────────────────────────

    private Banco mapearEntidad(BancoRequestDTO dto, Banco banco, Usuario admin) {
        banco.setNombre(dto.getNombre());
        banco.setNit(dto.getNit());
        banco.setDireccion(dto.getDireccion());
        banco.setCiudad(dto.getCiudad());
        banco.setDepartamento(dto.getDepartamento());
        banco.setTelefono(dto.getTelefono());
        banco.setCorreo(dto.getCorreo());
        banco.setLatitud(dto.getLatitud());
        banco.setLongitud(dto.getLongitud());
        banco.setHorarioApertura(dto.getHorarioApertura());
        banco.setHorarioCierre(dto.getHorarioCierre());
        banco.setActivo(dto.getActivo() != null ? dto.getActivo() : true);
        banco.setAdmin(admin);
        return banco;
    }

    private BancoResponseDTO mapearResponse(Banco b, Double distanciaKm) {
        return BancoResponseDTO.builder()
                .id(b.getId())
                .nombre(b.getNombre())
                .nit(b.getNit())
                .direccion(b.getDireccion())
                .ciudad(b.getCiudad())
                .departamento(b.getDepartamento())
                .telefono(b.getTelefono())
                .correo(b.getCorreo())
                .latitud(b.getLatitud())
                .longitud(b.getLongitud())
                .horarioApertura(b.getHorarioApertura())
                .horarioCierre(b.getHorarioCierre())
                .activo(b.getActivo())
                .admin(BancoResponseDTO.AdminInfo.builder()
                        .id(b.getAdmin().getId())
                        .nombre(b.getAdmin().getNombre())
                        .apellido(b.getAdmin().getApellido())
                        .correo(b.getAdmin().getCorreo())
                        .build())
                .createdAt(b.getCreatedAt())
                .updatedAt(b.getUpdatedAt())
                .distanciaKm(distanciaKm)
                .build();
    }

    private Banco obtenerEntidad(Long id) {
        return bancoRepository.findById(id)
                .orElseThrow(() -> new RecursoNoEncontradoException("Banco no encontrado con id: " + id));
    }

    private Usuario resolverAdmin(Long adminId) {
        return usuarioRepository.findById(adminId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Usuario admin no encontrado con id: " + adminId));
    }
}