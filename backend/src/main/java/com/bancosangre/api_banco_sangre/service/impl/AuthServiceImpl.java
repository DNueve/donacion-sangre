package com.bancosangre.api_banco_sangre.service.impl;

import com.bancosangre.api_banco_sangre.dto.AuthResponseDTO;
import com.bancosangre.api_banco_sangre.dto.LoginDTO;
import com.bancosangre.api_banco_sangre.dto.RegistroDTO;
import com.bancosangre.api_banco_sangre.entity.Rol;
import com.bancosangre.api_banco_sangre.entity.Usuario;
import com.bancosangre.api_banco_sangre.repository.RolRepository;
import com.bancosangre.api_banco_sangre.repository.UsuarioRepository;
import com.bancosangre.api_banco_sangre.service.AuthService;
import com.bancosangre.api_banco_sangre.service.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final JwtService jwtService;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    // ─── REGISTRO DE NUEVO DONANTE ───────────────────────────────────
    @Override
    @Transactional
    public AuthResponseDTO registrar(RegistroDTO dto) {

        // 1. Validar que el correo no exista
        if (usuarioRepository.existsByCorreo(dto.getCorreo())) {
            throw new RuntimeException("El correo ya está registrado");
        }

        // 2. Validar que el documento no exista
        if (usuarioRepository.existsByNumeroDocumento(dto.getNumeroDocumento())) {
            throw new RuntimeException("El número de documento ya está registrado");
        }

        // 3. Buscar el rol DONANTE
        Rol rolDonante = rolRepository.findByNombre("DONANTE")
                .orElseThrow(() -> new RuntimeException("Rol DONANTE no encontrado en la BD"));

        // 4. Crear el nuevo usuario
        Usuario nuevoUsuario = new Usuario();
        nuevoUsuario.setTipoDocumento(dto.getTipoDocumento());
        nuevoUsuario.setNumeroDocumento(dto.getNumeroDocumento());
        nuevoUsuario.setNombre(dto.getNombre());
        nuevoUsuario.setApellido(dto.getApellido());
        nuevoUsuario.setCorreo(dto.getCorreo());
        nuevoUsuario.setCelular(dto.getCelular());
        // ⭐ La contraseña se ENCRIPTA con BCrypt antes de guardar
        nuevoUsuario.setContrasena(passwordEncoder.encode(dto.getContrasena()));
        nuevoUsuario.setTipoSangre(dto.getTipoSangre());
        nuevoUsuario.setFechaNacimiento(dto.getFechaNacimiento());
        nuevoUsuario.setGenero(dto.getGenero());
        nuevoUsuario.setPesoKg(dto.getPesoKg());
        nuevoUsuario.setLatitud(dto.getLatitud());
        nuevoUsuario.setLongitud(dto.getLongitud());
        nuevoUsuario.setCiudad(dto.getCiudad());
        nuevoUsuario.setDepartamento(dto.getDepartamento());
        nuevoUsuario.setRol(rolDonante);
        nuevoUsuario.setActivo(true);

        // 5. Guardar en BD
        Usuario usuarioGuardado = usuarioRepository.save(nuevoUsuario);

        // 6. Generar token JWT
        String token = jwtService.generarToken(
                usuarioGuardado.getCorreo(),
                usuarioGuardado.getId(),
                usuarioGuardado.getRol().getNombre()
        );

        // 7. Construir respuesta
        return construirAuthResponse(usuarioGuardado, token);
    }

    // ─── LOGIN ───────────────────────────────────────────────────────
    @Override
    public AuthResponseDTO login(LoginDTO dto) {

        // 1. Buscar usuario por correo
        Usuario usuario = usuarioRepository.findByCorreo(dto.getCorreo())
                .orElseThrow(() -> new RuntimeException("Credenciales inválidas"));

        // 2. Verificar que esté activo
        if (!usuario.isActivo()) {
            throw new RuntimeException("Usuario inactivo. Contacta al administrador");
        }

        // 3. Verificar que la contraseña coincida (compara hash BCrypt)
        if (!passwordEncoder.matches(dto.getContrasena(), usuario.getContrasena())) {
            throw new RuntimeException("Credenciales inválidas");
        }

        // 4. Generar token JWT
        String token = jwtService.generarToken(
                usuario.getCorreo(),
                usuario.getId(),
                usuario.getRol().getNombre()
        );

        // 5. Construir respuesta
        return construirAuthResponse(usuario, token);
    }

    // ─── HELPER: Construye la respuesta sin exponer la contraseña ───
    private AuthResponseDTO construirAuthResponse(Usuario usuario, String token) {
        AuthResponseDTO.UsuarioInfo info = new AuthResponseDTO.UsuarioInfo(
                usuario.getId(),
                usuario.getNombre(),
                usuario.getApellido(),
                usuario.getCorreo(),
                usuario.getTipoSangre(),
                usuario.getRol().getNombre()
        );

        AuthResponseDTO response = new AuthResponseDTO();
        response.setToken(token);
        response.setUsuario(info);
        return response;
    }
}