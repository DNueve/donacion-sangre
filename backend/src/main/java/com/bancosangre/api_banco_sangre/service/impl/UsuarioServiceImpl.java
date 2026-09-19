package com.bancosangre.api_banco_sangre.service.impl;

import com.bancosangre.api_banco_sangre.dto.CrearAdminBancoDTO;
import com.bancosangre.api_banco_sangre.dto.UsuarioResponseDTO;
import com.bancosangre.api_banco_sangre.entity.Rol;
import com.bancosangre.api_banco_sangre.entity.Usuario;
import com.bancosangre.api_banco_sangre.repository.RolRepository;
import com.bancosangre.api_banco_sangre.repository.UsuarioRepository;
import com.bancosangre.api_banco_sangre.service.UsuarioService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UsuarioServiceImpl implements UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ─── LISTAR TODOS ─────────────────────────────────────────────────
    @Override
    public List<UsuarioResponseDTO> listarTodos() {
        return usuarioRepository.findAll().stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── LISTAR POR ROL ───────────────────────────────────────────────
    @Override
    public List<UsuarioResponseDTO> listarPorRol(String nombreRol) {
        return usuarioRepository.findByRolNombre(nombreRol).stream()
                .map(this::toDTO)
                .collect(Collectors.toList());
    }

    // ─── OBTENER POR ID ───────────────────────────────────────────────
    @Override
    public UsuarioResponseDTO obtenerPorId(Long id) {
        Usuario u = usuarioRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Usuario no encontrado con id: " + id));
        return toDTO(u);
    }

    // ─── CREAR ADMIN DE BANCO ─────────────────────────────────────────
    @Override
    @Transactional
    public UsuarioResponseDTO crearAdminBanco(CrearAdminBancoDTO dto) {

        // Validar duplicados
        if (usuarioRepository.existsByCorreo(dto.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }
        if (usuarioRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new RuntimeException("El número de documento ya está registrado");
        }

        // Buscar rol ADMIN_BANCO
        Rol rolAdminBanco = rolRepository.findByNombre("ADMIN_BANCO")
                .orElseThrow(() -> new RuntimeException("Rol ADMIN_BANCO no encontrado en la BD"));

        // Crear usuario con defaults para los campos médicos (no dona)
        Usuario nuevo = new Usuario();
        nuevo.setTipoDocumento(dto.getTipoDocumento());
        nuevo.setNumeroDocumento(dto.getNumeroDocumento());
        nuevo.setNombre(dto.getNombre());
        nuevo.setApellido(dto.getApellido());
        nuevo.setCorreo(dto.getCorreo());
        nuevo.setCelular(dto.getCelular());
        nuevo.setContrasena(passwordEncoder.encode(dto.getContrasena()));
        nuevo.setCiudad(dto.getCiudad());
        nuevo.setDepartamento(dto.getDepartamento());
        nuevo.setRol(rolAdminBanco);
        nuevo.setActivo(true);

        // Defaults para campos obligatorios de la entidad (admin no dona)
        nuevo.setTipoSangre("O+");
        nuevo.setFechaNacimiento(LocalDate.of(1990, 1, 1));
        nuevo.setGenero("N/E");
        nuevo.setPesoKg(new BigDecimal("70.00"));
        nuevo.setLatitud(new BigDecimal("6.24420000"));   // Medellín default
        nuevo.setLongitud(new BigDecimal("-75.58120000"));

        Usuario guardado = usuarioRepository.save(nuevo);
        return toDTO(guardado);
    }

    // ─── MAPPER ───────────────────────────────────────────────────────
    private UsuarioResponseDTO toDTO(Usuario u) {
        return UsuarioResponseDTO.builder()
                .id(u.getId())
                .nombre(u.getNombre())
                .apellido(u.getApellido())
                .correo(u.getCorreo())
                .celular(u.getCelular())
                .tipoDocumento(u.getTipoDocumento())
                .numeroDocumento(u.getNumeroDocumento())
                .tipoSangre(u.getTipoSangre())
                .ciudad(u.getCiudad())
                .departamento(u.getDepartamento())
                .rol(u.getRol() != null ? u.getRol().getNombre() : null)
                .activo(u.isActivo())
                .build();
    }
}