package tvorsvit.character;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record CharacterRequest(
        @NotBlank String name,
        @Size(max = 300) String description,
        String color,
        @Size(max = 500) String photoUrl,
        @Size(max = 30) String eyeColor,
        @Size(max = 30) String skinTone,
        @Size(max = 30) String hairColor,
        @Pattern(
                regexp = "^(ISTJ|ISFJ|INFJ|INTJ|ISTP|ISFP|INFP|INTP|ESTP|ESFP|ENFP|ENTP|ESTJ|ESFJ|ENFJ|ENTJ)?$",
                message = "MBTI must be one of the 16 valid types.")
        String mbti,
        @Size(max = 300) String quirks,
        @Size(max = 200) String favoritePhrase,
        Long bornInPlaceId,
        Long livesInPlaceId) {
}
