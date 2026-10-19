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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import tvorsvit.world.World;
import tvorsvit.world.WorldRepository;

import java.util.List;

@RestController
@RequestMapping("/api/worlds/{worldId}/character-relations")
public class CharacterRelationController {

    private final CharacterRelationRepository relationRepository;
    private final CharacterRepository characterRepository;
    private final WorldRepository worldRepository;

    public CharacterRelationController(
            CharacterRelationRepository relationRepository,
            CharacterRepository characterRepository,
            WorldRepository worldRepository) {
        this.relationRepository = relationRepository;
        this.characterRepository = characterRepository;
        this.worldRepository = worldRepository;
    }

    @GetMapping
    public List<CharacterRelation> list(@PathVariable Long worldId, @RequestParam(required = false) Long characterId) {
        requireWorld(worldId);
        if (characterId != null) {
            return relationRepository.findByWorldAndCharacter(worldId, characterId);
        }
        return relationRepository.findByWorld_IdOrderByCreatedAtAsc(worldId);
    }

    @PostMapping
    public ResponseEntity<CharacterRelation> create(@PathVariable Long worldId, @Valid @RequestBody CharacterRelationRequest request) {
        World world = requireWorld(worldId);
        CharacterRelation relation = new CharacterRelation();
        relation.setWorld(world);
        apply(request, relation, worldId);
        CharacterRelation saved = relationRepository.save(relation);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public CharacterRelation update(@PathVariable Long worldId, @PathVariable Long id, @Valid @RequestBody CharacterRelationRequest request) {
        CharacterRelation relation = requireRelation(worldId, id);
        apply(request, relation, worldId);
        return relationRepository.save(relation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long worldId, @PathVariable Long id) {
        requireRelation(worldId, id);
        relationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void apply(CharacterRelationRequest request, CharacterRelation relation, Long worldId) {
        if (request.fromCharacterId().equals(request.toCharacterId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A character cannot be related to themselves.");
        }
        if (request.type() == CharacterRelationType.CUSTOM && (request.customLabel() == null || request.customLabel().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A custom relation needs a label.");
        }
        relation.setFromCharacter(requireCharacter(worldId, request.fromCharacterId()));
        relation.setToCharacter(requireCharacter(worldId, request.toCharacterId()));
        relation.setType(request.type());
        relation.setCustomLabel(request.customLabel());
        relation.setDescription(request.description());
    }

    private World requireWorld(Long worldId) {
        return worldRepository.findById(worldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "World not found: " + worldId));
    }

    private Character requireCharacter(Long worldId, Long characterId) {
        Character character = characterRepository.findById(characterId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Character not found: " + characterId));
        if (!character.getWorld().getId().equals(worldId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Character not found in world: " + worldId);
        }
        return character;
    }

    private CharacterRelation requireRelation(Long worldId, Long id) {
        return relationRepository.findByIdAndWorld_Id(id, worldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Character relation not found: " + id));
    }
}