package com.bancosangre.api_banco_sangre.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class UsuarioResponseDTO {

    private Long id;
    private String nombre;
    private String apellido;
    private String correo;
    private String celular;
    private String tipoDocumento;
    private String numeroDocumento;
    private String tipoSangre;
    private String ciudad;
    private String departamento;
    private String rol;
    private boolean activo;
}