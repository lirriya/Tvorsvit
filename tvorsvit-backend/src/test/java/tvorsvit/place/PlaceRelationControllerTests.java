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
class PlaceRelationControllerTests {

    private static final Pattern ID_PATTERN = Pattern.compile("\"id\":(\\d+)");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private PlaceRepository placeRepository;

    @Autowired
    private PlaceRelationRepository relationRepository;

    @BeforeEach
    void cleanDatabase() {
        relationRepository.deleteAll();
        placeRepository.deleteAll();
        worldRepository.deleteAll();
    }

    @Test
    void createPersistsRelationAndReturns201() throws Exception {
        long worldId = createWorld("Middle-earth");
        long townId = createPlace(worldId, "Bree");
        long kingdomId = createPlace(worldId, "Eriador");

        mockMvc.perform(post("/api/worlds/{worldId}/place-relations", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromPlaceId\":" + townId + ",\"toPlaceId\":" + kingdomId
                                + ",\"type\":\"PART_OF\",\"description\":\"Bree lies in Eriador\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.worldId").value(worldId))
                .andExpect(jsonPath("$.fromPlaceId").value(townId))
                .andExpect(jsonPath("$.toPlaceId").value(kingdomId))
                .andExpect(jsonPath("$.type").value("PART_OF"));

        assertThat(relationRepository.count()).isEqualTo(1);
    }

    @Test
    void customRelationRequiresLabel() throws Exception {
        long worldId = createWorld("Middle-earth");
        long a = createPlace(worldId, "A");
        long b = createPlace(worldId, "B");

        mockMvc.perform(post("/api/worlds/{worldId}/place-relations", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromPlaceId\":" + a + ",\"toPlaceId\":" + b + ",\"type\":\"CUSTOM\"}"))
                .andExpect(status().isBadRequest());

        mockMvc.perform(post("/api/worlds/{worldId}/place-relations", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromPlaceId\":" + a + ",\"toPlaceId\":" + b
                                + ",\"type\":\"CUSTOM\",\"customLabel\":\"Trade route\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customLabel").value("Trade route"));
    }

    @Test
    void createWithSamePlaceTwiceReturns400() throws Exception {
        long worldId = createWorld("Middle-earth");
        long placeId = createPlace(worldId, "Bree");

        mockMvc.perform(post("/api/worlds/{worldId}/place-relations", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromPlaceId\":" + placeId + ",\"toPlaceId\":" + placeId + ",\"type\":\"NEIGHBOR\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWithPlaceFromAnotherWorldReturns404() throws Exception {
        long worldA = createWorld("World A");
        long worldB = createWorld("World B");
        long placeA = createPlace(worldA, "A");
        long placeB = createPlace(worldB, "B");

        mockMvc.perform(post("/api/worlds/{worldId}/place-relations", worldA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromPlaceId\":" + placeA + ",\"toPlaceId\":" + placeB + ",\"type\":\"NEIGHBOR\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void listFiltersByPlaceWhenPlaceIdGiven() throws Exception {
        long worldId = createWorld("Middle-earth");
        long a = createPlace(worldId, "A");
        long b = createPlace(worldId, "B");
        long c = createPlace(worldId, "C");
        createRelation(worldId, a, b, "NEIGHBOR");
        createRelation(worldId, b, c, "NEIGHBOR");

        mockMvc.perform(get("/api/worlds/{worldId}/place-relations", worldId).param("placeId", String.valueOf(b)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(get("/api/worlds/{worldId}/place-relations", worldId).param("placeId", String.valueOf(a)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fromPlaceId").value(a))
                .andExpect(jsonPath("$[0].toPlaceId").value(b));
    }

    @Test
    void relationReadsFromBothSidesWithDirectionIntact() throws Exception {
        long worldId = createWorld("Middle-earth");
        long town = createPlace(worldId, "Bree");
        long shop = createPlace(worldId, "The Gilded Tankard");
        createRelation(worldId, shop, town, "LOCATED_IN");

        mockMvc.perform(get("/api/worlds/{worldId}/place-relations", worldId).param("placeId", String.valueOf(shop)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fromPlaceId").value(shop))
                .andExpect(jsonPath("$[0].toPlaceId").value(town));

        mockMvc.perform(get("/api/worlds/{worldId}/place-relations", worldId).param("placeId", String.valueOf(town)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fromPlaceId").value(shop))
                .andExpect(jsonPath("$[0].toPlaceId").value(town));
    }

    @Test
    void updateChangesTypeAndDescription() throws Exception {
        long worldId = createWorld("Middle-earth");
        long a = createPlace(worldId, "A");
        long b = createPlace(worldId, "B");
        long relationId = createRelation(worldId, a, b, "NEIGHBOR");

        mockMvc.perform(put("/api/worlds/{worldId}/place-relations/{id}", worldId, relationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromPlaceId\":" + a + ",\"toPlaceId\":" + b
                                + ",\"type\":\"CONNECTED_TO\",\"description\":\"Old road\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("CONNECTED_TO"))
                .andExpect(jsonPath("$.description").value("Old road"));
    }

    @Test
    void deleteRemovesRelation() throws Exception {
        long worldId = createWorld("Middle-earth");
        long a = createPlace(worldId, "A");
        long b = createPlace(worldId, "B");
        long relationId = createRelation(worldId, a, b, "NEIGHBOR");

        mockMvc.perform(delete("/api/worlds/{worldId}/place-relations/{id}", worldId, relationId))
                .andExpect(status().isNoContent());

        assertThat(relationRepository.existsById(relationId)).isFalse();
    }

    @Test
    void deletingPlaceRemovesItsRelations() throws Exception {
        long worldId = createWorld("Middle-earth");
        long a = createPlace(worldId, "A");
        long b = createPlace(worldId, "B");
        createRelation(worldId, a, b, "NEIGHBOR");

        mockMvc.perform(delete("/api/worlds/{worldId}/places/{id}", worldId, a))
                .andExpect(status().isNoContent());

        assertThat(relationRepository.count()).isZero();
    }

    @Test
    void listOnMissingWorldReturns404() throws Exception {
        mockMvc.perform(get("/api/worlds/999999/place-relations"))
                .andExpect(status().isNotFound());
    }

    private long createWorld(String name) throws Exception {
        String body = mockMvc.perform(post("/api/worlds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\",\"type\":\"BOOK\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return extractId(body);
    }

    private long createPlace(long worldId, String name) throws Exception {
        String body = mockMvc.perform(post("/api/worlds/{worldId}/places", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return extractId(body);
    }

    private long createRelation(long worldId, long fromId, long toId, String type) throws Exception {
        String body = mockMvc.perform(post("/api/worlds/{worldId}/place-relations", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromPlaceId\":" + fromId + ",\"toPlaceId\":" + toId + ",\"type\":\"" + type + "\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return extractId(body);
    }

    private long extractId(String body) {
        Matcher matcher = ID_PATTERN.matcher(body);
        if (!matcher.find()) {
            throw new AssertionError("Response did not contain an id: " + body);
        }
        return Long.parseLong(matcher.group(1));
    }
}