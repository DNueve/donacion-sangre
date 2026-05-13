package com.bancosangre.api_banco_sangre.service.impl;

import com.bancosangre.api_banco_sangre.dto.MatchingResponseDTO;
import com.bancosangre.api_banco_sangre.dto.MatchingResponseDTO.DonanteCercano;
import com.bancosangre.api_banco_sangre.entity.Solicitud;
import com.bancosangre.api_banco_sangre.entity.Usuario;
import com.bancosangre.api_banco_sangre.exception.RecursoNoEncontradoException;
import com.bancosangre.api_banco_sangre.repository.DonacionRepository;
import com.bancosangre.api_banco_sangre.repository.SolicitudRepository;
import com.bancosangre.api_banco_sangre.repository.UsuarioRepository;
import com.bancosangre.api_banco_sangre.service.MatchingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class MatchingServiceImpl implements MatchingService {

    private final SolicitudRepository solicitudRepository;
    private final UsuarioRepository usuarioRepository;
    private final DonacionRepository donacionRepository;

    // ── Tabla de compatibilidad OMS ──────────────────────────────────────────
    private static final Map<String, List<String>> COMPATIBILIDAD = new HashMap<>();

    static {
        COMPATIBILIDAD.put("O-",  List.of("O-","O+","A-","A+","B-","B+","AB-","AB+"));
        COMPATIBILIDAD.put("O+",  List.of("O+","A+","B+","AB+"));
        COMPATIBILIDAD.put("A-",  List.of("A-","A+","AB-","AB+"));
        COMPATIBILIDAD.put("A+",  List.of("A+","AB+"));
        COMPATIBILIDAD.put("B-",  List.of("B-","B+","AB-","AB+"));
        COMPATIBILIDAD.put("B+",  List.of("B+","AB+"));
        COMPATIBILIDAD.put("AB-", List.of("AB-","AB+"));
        COMPATIBILIDAD.put("AB+", List.of("AB+"));
    }

    // ── Por solicitud ────────────────────────────────────────────────────────

    @Override
    public MatchingResponseDTO buscarDonantesParaSolicitud(Long solicitudId) {
        Solicitud solicitud = solicitudRepository.findById(solicitudId)
                .orElseThrow(() -> new RecursoNoEncontradoException(
                        "Solicitud no encontrada con id: " + solicitudId));

        MatchingResponseDTO resultado = buscarDonantesCompatibles(
                solicitud.getTipoSangre(),
                solicitud.getBanco().getLatitud(),
                solicitud.getBanco().getLongitud(),
                solicitud.getRadioBusquedaKm()
        );

        resultado.setSolicitudId(solicitudId);
        resultado.setBancoNombre(solicitud.getBanco().getNombre());
        resultado.setBancoCiudad(solicitud.getBanco().getCiudad());
        resultado.setUnidadesFaltantes(
                solicitud.getUnidadesNecesarias() - solicitud.getUnidadesRecibidas());

        return resultado;
    }

    // ── Por parámetros libres ────────────────────────────────────────────────

    @Override
    public MatchingResponseDTO buscarDonantesCompatibles(
            String tipoSangreRequerido,
            Double latBanco,
            Double lonBanco,
            Double radioKm) {

        // 1. Tipos de sangre que pueden donar al tipo requerido
        List<String> tiposCompatibles = obtenerTiposCompatibles(tipoSangreRequerido);

        // 2. Todos los donantes activos con tipo compatible
        List<Usuario> candidatos = usuarioRepository.findDonantesActivosPorTiposSangre(tiposCompatibles);

        // 3. Filtrar por radio con Haversine + ordenar + construir respuesta
        List<DonanteCercano> donantes = candidatos.stream()
                .filter(u -> u.getLatitud() != null && u.getLongitud() != null)
                .map(u -> new UsuarioConDistancia(u,
                        distanciaKm(latBanco, lonBanco, u.getLatitud(), u.getLongitud())))
                .filter(ud -> ud.distancia <= radioKm)
                .sorted(Comparator.comparingDouble(ud -> ud.distancia))
                .map(ud -> construirDonanteCercano(ud.usuario, ud.distancia))
                .collect(Collectors.toList());

        return MatchingResponseDTO.builder()
                .tipoSangreRequerido(tipoSangreRequerido)
                .donantesCompatibles(donantes)
                .totalEncontrados(donantes.size())
                .build();
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private DonanteCercano construirDonanteCercano(Usuario usuario, double distanciaKm) {
        var ultimaDonacion = donacionRepository.findUltimaDonacionCompletada(usuario.getId());

        Long diasDesdeUltima = null;
        boolean apto = true;

        if (ultimaDonacion.isPresent()) {
            diasDesdeUltima = ChronoUnit.DAYS.between(
                    ultimaDonacion.get().getFechaDonacion(), LocalDate.now());
            apto = diasDesdeUltima >= 90;
        }

        return DonanteCercano.builder()
                .usuarioId(usuario.getId())
                .nombre(usuario.getNombre())
                .apellido(usuario.getApellido())
                .tipoSangre(usuario.getTipoSangre())
                .ciudad(usuario.getCiudad())
                .departamento(usuario.getDepartamento())
                .distanciaKm(Math.round(distanciaKm * 100.0) / 100.0)
                .aptoParaDonar(apto)
                .diasDesdeUltimaDonacion(diasDesdeUltima)
                .build();
    }

    private List<String> obtenerTiposCompatibles(String tipoReceptor) {
        return COMPATIBILIDAD.entrySet().stream()
                .filter(entry -> entry.getValue().contains(tipoReceptor))
                .map(Map.Entry::getKey)
                .collect(Collectors.toList());
    }

    // ── Haversine local ──────────────────────────────────────────────────────

   private double distanciaKm(Double lat1, Double lon1, java.math.BigDecimal lat2, java.math.BigDecimal lon2) {
    final double R = 6371.0;
    double dLat = Math.toRadians(lat2.doubleValue() - lat1);
    double dLon = Math.toRadians(lon2.doubleValue() - lon1);
    double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
            + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2.doubleValue()))
            * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

    // ── Clase auxiliar para agrupar usuario + distancia ──────────────────────

    private static class UsuarioConDistancia {
        final Usuario usuario;
        final double distancia;

        UsuarioConDistancia(Usuario usuario, double distancia) {
            this.usuario = usuario;
            this.distancia = distancia;
        }
    }
}