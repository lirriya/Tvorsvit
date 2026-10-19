package tvorsvit.character;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import tvorsvit.common.BaseEntity;
import tvorsvit.world.World;

@Entity
@Table(name = "character_relations")
public class CharacterRelation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "world_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private World world;

    @ManyToOne(optional = false)
    @JoinColumn(name = "from_character_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private Character fromCharacter;

    @ManyToOne(optional = false)
    @JoinColumn(name = "to_character_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private Character toCharacter;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private CharacterRelationType type;

    @Column(length = 80)
    private String customLabel;

    @Column(length = 200)
    private String description;

    public Long getId() {
        return id;
    }

    @JsonProperty("worldId")
    public Long getWorldId() {
        return world != null ? world.getId() : null;
    }

    @JsonProperty("fromCharacterId")
    public Long getFromCharacterId() {
        return fromCharacter != null ? fromCharacter.getId() : null;
    }

    @JsonProperty("toCharacterId")
    public Long getToCharacterId() {
        return toCharacter != null ? toCharacter.getId() : null;
    }

    public World getWorld() {
        return world;
    }

    public void setWorld(World world) {
        this.world = world;
    }

    public Character getFromCharacter() {
        return fromCharacter;
    }

    public void setFromCharacter(Character fromCharacter) {
        this.fromCharacter = fromCharacter;
    }

    public Character getToCharacter() {
        return toCharacter;
    }

    public void setToCharacter(Character toCharacter) {
        this.toCharacter = toCharacter;
    }

    public CharacterRelationType getType() {
        return type;
    }

    public void setType(CharacterRelationType type) {
        this.type = type;
    }

    public String getCustomLabel() {
        return customLabel;
    }

    public void setCustomLabel(String customLabel) {
        this.customLabel = customLabel;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}