package tvorsvit.character;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CharacterRelationRequest(
        @NotNull Long fromCharacterId,
        @NotNull Long toCharacterId,
        @NotNull CharacterRelationType type,
        @Size(max = 80) String customLabel,
        @Size(max = 200) String description) {
}