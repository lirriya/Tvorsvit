package tvorsvit.place;

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
@RequestMapping("/api/worlds/{worldId}/place-relations")
public class PlaceRelationController {

    private final PlaceRelationRepository relationRepository;
    private final PlaceRepository placeRepository;
    private final WorldRepository worldRepository;

    public PlaceRelationController(
            PlaceRelationRepository relationRepository,
            PlaceRepository placeRepository,
            WorldRepository worldRepository) {
        this.relationRepository = relationRepository;
        this.placeRepository = placeRepository;
        this.worldRepository = worldRepository;
    }

    @GetMapping
    public List<PlaceRelation> list(@PathVariable Long worldId, @RequestParam(required = false) Long placeId) {
        requireWorld(worldId);
        if (placeId != null) {
            return relationRepository.findByWorldAndPlace(worldId, placeId);
        }
        return relationRepository.findByWorld_IdOrderByCreatedAtAsc(worldId);
    }

    @PostMapping
    public ResponseEntity<PlaceRelation> create(@PathVariable Long worldId, @Valid @RequestBody PlaceRelationRequest request) {
        World world = requireWorld(worldId);
        PlaceRelation relation = new PlaceRelation();
        relation.setWorld(world);
        apply(request, relation, worldId);
        PlaceRelation saved = relationRepository.save(relation);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public PlaceRelation update(@PathVariable Long worldId, @PathVariable Long id, @Valid @RequestBody PlaceRelationRequest request) {
        PlaceRelation relation = requireRelation(worldId, id);
        apply(request, relation, worldId);
        return relationRepository.save(relation);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long worldId, @PathVariable Long id) {
        requireRelation(worldId, id);
        relationRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void apply(PlaceRelationRequest request, PlaceRelation relation, Long worldId) {
        if (request.fromPlaceId().equals(request.toPlaceId())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A place cannot be related to itself.");
        }
        if (request.type() == PlaceRelationType.CUSTOM && (request.customLabel() == null || request.customLabel().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "A custom relation needs a label.");
        }
        relation.setFromPlace(requirePlace(worldId, request.fromPlaceId()));
        relation.setToPlace(requirePlace(worldId, request.toPlaceId()));
        relation.setType(request.type());
        relation.setCustomLabel(request.customLabel());
        relation.setDescription(request.description());
    }

    private World requireWorld(Long worldId) {
        return worldRepository.findById(worldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "World not found: " + worldId));
    }

    private Place requirePlace(Long worldId, Long placeId) {
        return placeRepository.findByIdAndWorld_Id(placeId, worldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Place not found in world: " + worldId));
    }

    private PlaceRelation requireRelation(Long worldId, Long id) {
        return relationRepository.findByIdAndWorld_Id(id, worldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Place relation not found: " + id));
    }
}