package tvorsvit.place;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.CollectionTable;
import jakarta.persistence.Column;
import jakarta.persistence.ElementCollection;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OrderColumn;
import jakarta.persistence.Table;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import tvorsvit.common.BaseEntity;
import tvorsvit.common.CustomField;
import tvorsvit.world.World;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "places")
public class Place extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    @JoinColumn(name = "world_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private World world;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(length = 500)
    private String description;

    @Column(length = 500)
    private String photoUrl;

    @Column(length = 7)
    private String color;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "place_custom_fields", joinColumns = @JoinColumn(name = "place_id"))
    @OrderColumn(name = "field_position")
    @OnDelete(action = OnDeleteAction.CASCADE)
    private List<CustomField> customFields = new ArrayList<>();

    public Long getId() {
        return id;
    }

    @JsonProperty("worldId")
    public Long getWorldId() {
        return world != null ? world.getId() : null;
    }

    public World getWorld() {
        return world;
    }

    public void setWorld(World world) {
        this.world = world;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public List<CustomField> getCustomFields() {
        return customFields;
    }

    public void setCustomFields(List<CustomField> customFields) {
        this.customFields = customFields;
    }
}