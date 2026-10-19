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
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;
import tvorsvit.world.World;
import tvorsvit.world.WorldRepository;

import java.util.List;

@RestController
@RequestMapping("/api/worlds/{worldId}/places")
public class PlaceController {

    private final PlaceRepository placeRepository;
    private final WorldRepository worldRepository;

    public PlaceController(PlaceRepository placeRepository, WorldRepository worldRepository) {
        this.placeRepository = placeRepository;
        this.worldRepository = worldRepository;
    }

    @GetMapping
    public List<Place> list(@PathVariable Long worldId) {
        requireWorld(worldId);
        return placeRepository.findByWorld_IdOrderByCreatedAtAsc(worldId);
    }

    @PostMapping
    public ResponseEntity<Place> create(@PathVariable Long worldId, @Valid @RequestBody PlaceRequest request) {
        World world = requireWorld(worldId);
        Place place = new Place();
        place.setWorld(world);
        apply(request, place);
        Place saved = placeRepository.save(place);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @PutMapping("/{id}")
    public Place update(@PathVariable Long worldId, @PathVariable Long id, @Valid @RequestBody PlaceRequest request) {
        Place place = requirePlace(worldId, id);
        apply(request, place);
        return placeRepository.save(place);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long worldId, @PathVariable Long id) {
        requirePlace(worldId, id);
        placeRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private World requireWorld(Long worldId) {
        return worldRepository.findById(worldId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "World not found: " + worldId));
    }

    private Place requirePlace(Long worldId, Long id) {
        Place place = placeRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Place not found: " + id));
        if (!place.getWorld().getId().equals(worldId)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Place not found in world: " + worldId);
        }
        return place;
    }

    private void apply(PlaceRequest request, Place place) {
        place.setName(request.name().trim());
        place.setDescription(request.description());
        place.setPhotoUrl(request.photoUrl());
        place.setColor(request.color());
    }
}