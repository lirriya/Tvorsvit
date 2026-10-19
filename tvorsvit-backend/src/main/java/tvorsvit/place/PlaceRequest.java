package tvorsvit.place;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record PlaceRequest(
        @NotBlank String name,
        @Size(max = 500) String description,
        @Size(max = 500) String photoUrl,
        String color) {
}
