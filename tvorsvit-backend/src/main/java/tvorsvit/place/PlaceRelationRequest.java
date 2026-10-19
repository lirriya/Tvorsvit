package tvorsvit.place;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record PlaceRelationRequest(
        @NotNull Long fromPlaceId,
        @NotNull Long toPlaceId,
        @NotNull PlaceRelationType type,
        @Size(max = 80) String customLabel,
        @Size(max = 200) String description) {
}