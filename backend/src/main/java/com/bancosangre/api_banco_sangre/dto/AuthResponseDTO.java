package com.bancosangre.api_banco_sangre.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponseDTO {

    private String token;
    private String tipo = "Bearer";
    private UsuarioInfo usuario;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class UsuarioInfo {
        private Long id;
        private String nombre;
        private String apellido;
        private String correo;
        private String tipoSangre;
        private String rol;
    }
}