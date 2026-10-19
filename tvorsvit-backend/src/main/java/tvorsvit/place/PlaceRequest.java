package tvorsvit.place;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import tvorsvit.common.CustomFieldRequest;

import java.util.List;

public record PlaceRequest(
        @NotBlank String name,
        @Size(max = 500) String description,
        @Size(max = 500) String photoUrl,
        String color,
        List<@Valid CustomFieldRequest> customFields) {
}
