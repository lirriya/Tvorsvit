package tvorsvit.place;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PlaceRepository extends JpaRepository<Place, Long> {

    List<Place> findByWorld_IdOrderByCreatedAtAsc(Long worldId);

    Optional<Place> findByIdAndWorld_Id(Long id, Long worldId);
}