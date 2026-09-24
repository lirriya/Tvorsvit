package tvorsvit.world;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record WorldRequest(
        @NotBlank String name,
        @NotNull WorldType type,
        String description,
        String color) {
}