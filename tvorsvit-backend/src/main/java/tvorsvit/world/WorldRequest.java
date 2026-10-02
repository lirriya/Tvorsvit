package tvorsvit.world;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record WorldRequest(
        @NotBlank String name,
        @NotNull WorldType type,
        @Size(max = 500, message = "Description must be 500 characters or fewer.")
        String description,
        String color,
        String theme) {
}