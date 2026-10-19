package tvorsvit.place;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import tvorsvit.world.WorldRepository;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class PlaceControllerTests {

    private static final Pattern ID_PATTERN = Pattern.compile("\"id\":(\\d+)");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private PlaceRepository placeRepository;

    @BeforeEach
    void cleanDatabase() {
        placeRepository.deleteAll();
        worldRepository.deleteAll();
    }

    @Test
    void createPersistsPlaceAndReturns201() throws Exception {
        long worldId = createWorld("Middle-earth");

        mockMvc.perform(post("/api/worlds/{worldId}/places", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Bag End\",\"description\":\"A cozy hobbit hole\",\"color\":\"#22c55e\",\"photoUrl\":\"/img/bagend.png\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.worldId").value(worldId))
                .andExpect(jsonPath("$.name").value("Bag End"))
                .andExpect(jsonPath("$.description").value("A cozy hobbit hole"))
                .andExpect(jsonPath("$.color").value("#22c55e"))
                .andExpect(jsonPath("$.photoUrl").value("/img/bagend.png"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty())
                .andExpect(jsonPath("$.updatedAt").isNotEmpty());

        assertThat(placeRepository.count()).isEqualTo(1);
    }

    @Test
    void createWithBlankNameReturns400() throws Exception {
        long worldId = createWorld("Middle-earth");

        mockMvc.perform(post("/api/worlds/{worldId}/places", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"   \"}"))
                .andExpect(status().isBadRequest());

        assertThat(placeRepository.count()).isZero();
    }

    @Test
    void createOnMissingWorldReturns404() throws Exception {
        mockMvc.perform(post("/api/worlds/999999/places")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Orphan Place\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void listReturnsPlacesInCreationOrder() throws Exception {
        long worldId = createWorld("Middle-earth");
        createPlace(worldId, "Bag End");
        createPlace(worldId, "Rivendell");

        mockMvc.perform(get("/api/worlds/{worldId}/places", worldId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Bag End"))
                .andExpect(jsonPath("$[1].name").value("Rivendell"))
                .andExpect(jsonPath("$[0].worldId").value(worldId));
    }

    @Test
    void listOnMissingWorldReturns404() throws Exception {
        mockMvc.perform(get("/api/worlds/999999/places"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateModifiesPlaceAndReturns200() throws Exception {
        long worldId = createWorld("Middle-earth");
        long placeId = createPlace(worldId, "Bag End");

        mockMvc.perform(put("/api/worlds/{worldId}/places/{id}", worldId, placeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Bag End Hall\",\"description\":\"Cozy\",\"color\":\"#a78bfa\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(placeId))
                .andExpect(jsonPath("$.name").value("Bag End Hall"));

        assertThat(placeRepository.findById(placeId)).isPresent();
    }

    @Test
    void updateReturns404WhenPlaceBelongsToDifferentWorld() throws Exception {
        long worldA = createWorld("World A");
        long worldB = createWorld("World B");
        long placeId = createPlace(worldA, "Bag End");

        mockMvc.perform(put("/api/worlds/{worldId}/places/{id}", worldB, placeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Stolen\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteRemovesPlaceAndReturns204() throws Exception {
        long worldId = createWorld("Middle-earth");
        long placeId = createPlace(worldId, "Bag End");

        mockMvc.perform(delete("/api/worlds/{worldId}/places/{id}", worldId, placeId))
                .andExpect(status().isNoContent());

        assertThat(placeRepository.existsById(placeId)).isFalse();
    }

    @Test
    void deleteReturns404WhenPlaceBelongsToDifferentWorld() throws Exception {
        long worldA = createWorld("World A");
        long worldB = createWorld("World B");
        long placeId = createPlace(worldA, "Bag End");

        mockMvc.perform(delete("/api/worlds/{worldId}/places/{id}", worldB, placeId))
                .andExpect(status().isNotFound());
    }

    @Test
    void createWithCustomFieldsReturnsThemInOrder() throws Exception {
        long worldId = createWorld("Middle-earth");

        mockMvc.perform(post("/api/worlds/{worldId}/places", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"The Gilded Tankard\",\"customFields\":["
                                + "{\"label\":\"Region\",\"value\":\"Lower city\"},"
                                + "{\"label\":\"Owner\",\"value\":\"Mira Voss\"}]}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customFields.length()").value(2))
                .andExpect(jsonPath("$.customFields[0].label").value("Region"))
                .andExpect(jsonPath("$.customFields[0].value").value("Lower city"))
                .andExpect(jsonPath("$.customFields[1].label").value("Owner"));
    }

    @Test
    void updateReplacesCustomFields() throws Exception {
        long worldId = createWorld("Middle-earth");
        long placeId = createPlace(worldId, "Bag End");

        mockMvc.perform(put("/api/worlds/{worldId}/places/{id}", worldId, placeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Bag End\",\"customFields\":[{\"label\":\"Owner\",\"value\":\"Bilbo\"}]}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customFields.length()").value(1))
                .andExpect(jsonPath("$.customFields[0].value").value("Bilbo"));

        mockMvc.perform(put("/api/worlds/{worldId}/places/{id}", worldId, placeId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Bag End\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.customFields.length()").value(0));
    }

    @Test
    void deletingWorldCascadesToItsPlacesWithCustomFields() throws Exception {
        long worldId = createWorld("Middle-earth");

        mockMvc.perform(post("/api/worlds/{worldId}/places", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Bag End\",\"customFields\":[{\"label\":\"Owner\",\"value\":\"Bilbo\"}]}"))
                .andExpect(status().isCreated());

        mockMvc.perform(delete("/api/worlds/{id}", worldId))
                .andExpect(status().isNoContent());

        assertThat(placeRepository.count()).isZero();
        assertThat(worldRepository.count()).isZero();
    }

    private long createWorld(String name) throws Exception {
        String response = mockMvc.perform(post("/api/worlds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\",\"type\":\"BOOK\"}"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Matcher matcher = ID_PATTERN.matcher(response);
        if (!matcher.find()) {
            throw new IllegalStateException("Could not extract id from response: " + response);
        }
        return Long.parseLong(matcher.group(1));
    }

    private long createPlace(long worldId, String name) throws Exception {
        String response = mockMvc.perform(post("/api/worlds/{worldId}/places", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\"}"))
                .andReturn()
                .getResponse()
                .getContentAsString();

        Matcher matcher = ID_PATTERN.matcher(response);
        if (!matcher.find()) {
            throw new IllegalStateException("Could not extract id from response: " + response);
        }
        return Long.parseLong(matcher.group(1));
    }
}