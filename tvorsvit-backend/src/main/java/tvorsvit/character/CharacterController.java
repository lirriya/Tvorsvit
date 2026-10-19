package tvorsvit.character;

import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import tvorsvit.place.Place;
import tvorsvit.place.PlaceRepository;
import tvorsvit.world.World;
import tvorsvit.world.WorldRepository;

import java.util.List;

@RestController
@RequestMapping("/api/worlds/{worldId}/characters")
public class CharacterController {

    private final CharacterRepository characterRepository;
    private final WorldRepository worldRepository;
    private final PlaceRepository placeRepository;

    public CharacterController(
            CharacterRepository characterRepository,
            WorldRepository worldRepository,
            PlaceRepository placeRepository) {
        this.characterRepository = characterRepository;
        this.worldRepository = worldRepository;
        this.placeRepository = placeRepository;
    }

    @GetMapping
    public List<Character> list(@PathVariable Long worldId) {
        requireWorld(worldId);
        return characterRepository.findByWorld_IdOrderByCreatedAtAsc(worldId);
    }

    @PostMapping
    public ResponseEntity<Character> create(@PathVariable Long worldId, @Valid @RequestBody CharacterRequest request) {
        World world = requireWorld(worldId);
        Character character = new Character();
        character.setWorld(world);
        apply(request, character, worldId);
        Character saved = characterRepository.save(character);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Character update(@PathVariable Long worldId, @PathVariable Long id, @Valid @RequestBody CharacterRequest request) {
        Character character = requireCharacter(worldId, id);
        apply(request, character, worldId);
        return characterRepository.save(character);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long worldId, @PathVariable Long id) {
        requireCharacter(worldId, id);
        characterRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private World requireWorld(Long worldId) {
        return worldRepository.findById(worldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "World not found: " + worldId));
    }

    private Character requireCharacter(Long worldId, Long id) {
        Character character = characterRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Character not found: " + id));
        if (!character.getWorld().getId().equals(worldId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Character not found in world: " + worldId);
        }
        return character;
    }

    private void apply(CharacterRequest request, Character character, Long worldId) {
        character.setName(request.name().trim());
        character.setDescription(request.description());
        character.setColor(request.color());
        character.setPhotoUrl(request.photoUrl());
        character.setEyeColor(request.eyeColor());
        character.setSkinTone(request.skinTone());
        character.setHairColor(request.hairColor());
        character.setMbti(request.mbti());
        character.setQuirks(request.quirks());
        character.setFavoritePhrase(request.favoritePhrase());
        character.setBornInPlace(resolvePlace(worldId, request.bornInPlaceId()));
        character.setLivesInPlace(resolvePlace(worldId, request.livesInPlaceId()));
    }

    private Place resolvePlace(Long worldId, Long placeId) {
        if (placeId == null) {
            return null;
        }
        return placeRepository.findByIdAndWorld_Id(placeId, worldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Place not found in world: " + worldId));
    }
}