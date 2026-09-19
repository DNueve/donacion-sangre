package com.bancosangre.api_banco_sangre.controller;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;

import java.util.Map;

@RestController
@RequestMapping("/api/claude")
@RequiredArgsConstructor
public class ClaudeController {

    @Value("${gemini.api.key}")
    private String apiKey;

    private final RestTemplate restTemplate;

    @PostMapping("/chat")
    public ResponseEntity<String> chat(@RequestBody Map<String, Object> body) {

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Authorization", "Bearer " + apiKey);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

        // Endpoint compatible con formato OpenAI de Gemini
        ResponseEntity<String> response = restTemplate.exchange(
            "https://generativelanguage.googleapis.com/v1beta/openai/chat/completions",
            HttpMethod.POST,
            request,
            String.class
        );

        return ResponseEntity.ok(response.getBody());
    }
}