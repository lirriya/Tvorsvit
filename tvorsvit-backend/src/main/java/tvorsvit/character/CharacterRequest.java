package tvorsvit.character;

import jakarta.validation.constraints.NotBlank;

public record CharacterRequest(
        @NotBlank String name,
        String description,
        String color) {
}