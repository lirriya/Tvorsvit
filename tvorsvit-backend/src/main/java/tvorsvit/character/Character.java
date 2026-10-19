package tvorsvit.character;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import tvorsvit.common.BaseEntity;
import tvorsvit.place.Place;
import tvorsvit.world.World;

@Entity
@Table(name = "characters")
public class Character extends BaseEntity {

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

    @Column(length = 300)
    private String description;

    @Column(length = 7)
    private String color;

    @Column(length = 500)
    private String photoUrl;

    @Column(length = 30)
    private String eyeColor;

    @Column(length = 30)
    private String skinTone;

    @Column(length = 30)
    private String hairColor;

    @Column(length = 4)
    private String mbti;

    @Column(length = 300)
    private String quirks;

    @Column(length = 200)
    private String favoritePhrase;

    @ManyToOne
    @JoinColumn(name = "born_in_place_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JsonIgnore
    private Place bornInPlace;

    @ManyToOne
    @JoinColumn(name = "lives_in_place_id")
    @OnDelete(action = OnDeleteAction.SET_NULL)
    @JsonIgnore
    private Place livesInPlace;

    public Long getId() {
        return id;
    }

    @JsonProperty("worldId")
    public Long getWorldId() {
        return world.getId();
    }

    @JsonProperty("bornInPlaceId")
    public Long getBornInPlaceId() {
        return bornInPlace != null ? bornInPlace.getId() : null;
    }

    public void setBornInPlace(Place bornInPlace) {
        this.bornInPlace = bornInPlace;
    }

    @JsonProperty("livesInPlaceId")
    public Long getLivesInPlaceId() {
        return livesInPlace != null ? livesInPlace.getId() : null;
    }

    public void setLivesInPlace(Place livesInPlace) {
        this.livesInPlace = livesInPlace;
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

    public String getColor() {
        return color;
    }

    public void setColor(String color) {
        this.color = color;
    }

    public String getPhotoUrl() {
        return photoUrl;
    }

    public void setPhotoUrl(String photoUrl) {
        this.photoUrl = photoUrl;
    }

    public String getEyeColor() {
        return eyeColor;
    }

    public void setEyeColor(String eyeColor) {
        this.eyeColor = eyeColor;
    }

    public String getSkinTone() {
        return skinTone;
    }

    public void setSkinTone(String skinTone) {
        this.skinTone = skinTone;
    }

    public String getHairColor() {
        return hairColor;
    }

    public void setHairColor(String hairColor) {
        this.hairColor = hairColor;
    }

    public String getMbti() {
        return mbti;
    }

    public void setMbti(String mbti) {
        this.mbti = mbti;
    }

    public String getQuirks() {
        return quirks;
    }

    public void setQuirks(String quirks) {
        this.quirks = quirks;
    }

    public String getFavoritePhrase() {
        return favoritePhrase;
    }

    public void setFavoritePhrase(String favoritePhrase) {
        this.favoritePhrase = favoritePhrase;
    }

    public Place getBornInPlace() {
        return bornInPlace;
    }

    public Place getLivesInPlace() {
        return livesInPlace;
    }
}