package tvorsvit.character;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface CharacterRelationRepository extends JpaRepository<CharacterRelation, Long> {

    List<CharacterRelation> findByWorld_IdOrderByCreatedAtAsc(Long worldId);

    @Query("select r from CharacterRelation r where r.world.id = :worldId and (r.fromCharacter.id = :characterId or r.toCharacter.id = :characterId) order by r.createdAt asc")
    List<CharacterRelation> findByWorldAndCharacter(@Param("worldId") Long worldId, @Param("characterId") Long characterId);

    Optional<CharacterRelation> findByIdAndWorld_Id(Long id, Long worldId);
}