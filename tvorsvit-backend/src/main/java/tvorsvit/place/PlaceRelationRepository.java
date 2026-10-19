package tvorsvit.place;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface PlaceRelationRepository extends JpaRepository<PlaceRelation, Long> {

    List<PlaceRelation> findByWorld_IdOrderByCreatedAtAsc(Long worldId);

    @Query("select r from PlaceRelation r where r.world.id = :worldId and (r.fromPlace.id = :placeId or r.toPlace.id = :placeId) order by r.createdAt asc")
    List<PlaceRelation> findByWorldAndPlace(@Param("worldId") Long worldId, @Param("placeId") Long placeId);

    Optional<PlaceRelation> findByIdAndWorld_Id(Long id, Long worldId);
}