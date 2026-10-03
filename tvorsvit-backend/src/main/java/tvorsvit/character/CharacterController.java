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
import tvorsvit.world.World;
import tvorsvit.world.WorldRepository;

import java.util.List;

@RestController
@RequestMapping("/api/worlds/{worldId}/characters")
public class CharacterController {

    private final CharacterRepository characterRepository;
    private final WorldRepository worldRepository;

    public CharacterController(CharacterRepository characterRepository, WorldRepository worldRepository) {
        this.characterRepository = characterRepository;
        this.worldRepository = worldRepository;
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
        apply(request, character);
        Character saved = characterRepository.save(character);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Character update(@PathVariable Long worldId, @PathVariable Long id, @Valid @RequestBody CharacterRequest request) {
        Character character = requireCharacter(worldId, id);
        apply(request, character);
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

    private void apply(CharacterRequest request, Character character) {
        character.setName(request.name().trim());
        character.setDescription(request.description());
        character.setColor(request.color());
    }
}