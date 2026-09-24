package tvorsvit.world;

import jakarta.validation.Valid;
import org.springframework.data.domain.Sort;
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

import java.util.List;

@RestController
@RequestMapping("/api/worlds")
public class WorldController {

    private final WorldRepository repository;

    public WorldController(WorldRepository repository) {
        this.repository = repository;
    }

    @GetMapping
    public List<World> list() {
        return repository.findAll(Sort.by(Sort.Direction.DESC, "createdAt"));
    }

    @PostMapping
    public ResponseEntity<World> create(@Valid @RequestBody WorldRequest request) {
        World world = new World();
        apply(request, world);
        World saved = repository.save(world);
        return ResponseEntity.status(HttpStatus.CREATED).body(saved);
    }

    @GetMapping("/{id}")
    public World get(@PathVariable Long id) {
        return repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "World not found: " + id));
    }

    @PutMapping("/{id}")
    public World update(@PathVariable Long id, @Valid @RequestBody WorldRequest request) {
        World world = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "World not found: " + id));
        apply(request, world);
        return repository.save(world);
    }

    @PutMapping("/{id}/content")
    public World updateContent(@PathVariable Long id, @RequestBody ContentRequest request) {
        World world = repository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "World not found: " + id));
        world.setContent(request.content());
        return repository.save(world);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (!repository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "World not found: " + id);
        }
        repository.deleteById(id);
        return ResponseEntity.noContent().build();
    }

    private void apply(WorldRequest request, World world) {
        world.setName(request.name().trim());
        world.setType(request.type());
        world.setDescription(request.description());
        world.setColor(request.color());
    }
}