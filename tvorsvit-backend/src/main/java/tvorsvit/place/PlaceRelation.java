package tvorsvit.place;

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
@Table(name = "place_relations")
public class PlaceRelation extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "world_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private World world;

    @ManyToOne(optional = false)
    @JoinColumn(name = "from_place_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private Place fromPlace;

    @ManyToOne(optional = false)
    @JoinColumn(name = "to_place_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private Place toPlace;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private PlaceRelationType type;

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

    @JsonProperty("fromPlaceId")
    public Long getFromPlaceId() {
        return fromPlace != null ? fromPlace.getId() : null;
    }

    @JsonProperty("toPlaceId")
    public Long getToPlaceId() {
        return toPlace != null ? toPlace.getId() : null;
    }

    public World getWorld() {
        return world;
    }

    public void setWorld(World world) {
        this.world = world;
    }

    public Place getFromPlace() {
        return fromPlace;
    }

    public void setFromPlace(Place fromPlace) {
        this.fromPlace = fromPlace;
    }

    public Place getToPlace() {
        return toPlace;
    }

    public void setToPlace(Place toPlace) {
        this.toPlace = toPlace;
    }

    public PlaceRelationType getType() {
        return type;
    }

    public void setType(PlaceRelationType type) {
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