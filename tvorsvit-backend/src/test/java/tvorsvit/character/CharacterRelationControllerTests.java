package tvorsvit.character;

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
class CharacterRelationControllerTests {

    private static final Pattern ID_PATTERN = Pattern.compile("\"id\":(\\d+)");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private CharacterRepository characterRepository;

    @Autowired
    private CharacterRelationRepository relationRepository;

    @BeforeEach
    void cleanDatabase() {
        relationRepository.deleteAll();
        characterRepository.deleteAll();
        worldRepository.deleteAll();
    }

    @Test
    void createPersistsRelationAndReturns201() throws Exception {
        long worldId = createWorld("Middle-earth");
        long frodo = createCharacter(worldId, "Frodo");
        long sam = createCharacter(worldId, "Sam");

        mockMvc.perform(post("/api/worlds/{worldId}/character-relations", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromCharacterId\":" + frodo + ",\"toCharacterId\":" + sam
                                + ",\"type\":\"FRIEND\",\"description\":\"Inseparable\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.worldId").value(worldId))
                .andExpect(jsonPath("$.fromCharacterId").value(frodo))
                .andExpect(jsonPath("$.toCharacterId").value(sam))
                .andExpect(jsonPath("$.type").value("FRIEND"))
                .andExpect(jsonPath("$.description").value("Inseparable"));
    }

    @Test
    void createWithSameCharacterTwiceReturns400() throws Exception {
        long worldId = createWorld("Middle-earth");
        long frodo = createCharacter(worldId, "Frodo");

        mockMvc.perform(post("/api/worlds/{worldId}/character-relations", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromCharacterId\":" + frodo + ",\"toCharacterId\":" + frodo + ",\"type\":\"FRIEND\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createCustomWithoutLabelReturns400() throws Exception {
        long worldId = createWorld("Middle-earth");
        long a = createCharacter(worldId, "A");
        long b = createCharacter(worldId, "B");

        mockMvc.perform(post("/api/worlds/{worldId}/character-relations", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromCharacterId\":" + a + ",\"toCharacterId\":" + b + ",\"type\":\"CUSTOM\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWithCharacterFromAnotherWorldReturns404() throws Exception {
        long worldA = createWorld("World A");
        long worldB = createWorld("World B");
        long charA = createCharacter(worldA, "A");
        long charB = createCharacter(worldB, "B");

        mockMvc.perform(post("/api/worlds/{worldId}/character-relations", worldA)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromCharacterId\":" + charA + ",\"toCharacterId\":" + charB + ",\"type\":\"ALLY\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void listFiltersByCharacter() throws Exception {
        long worldId = createWorld("Middle-earth");
        long a = createCharacter(worldId, "A");
        long b = createCharacter(worldId, "B");
        long c = createCharacter(worldId, "C");
        createRelation(worldId, a, b, "FRIEND");
        createRelation(worldId, b, c, "MENTOR");

        mockMvc.perform(get("/api/worlds/{worldId}/character-relations", worldId).param("characterId", String.valueOf(b)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2));

        mockMvc.perform(get("/api/worlds/{worldId}/character-relations", worldId).param("characterId", String.valueOf(a)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1));
    }

    @Test
    void relationReadsFromBothSidesWithDirectionIntact() throws Exception {
        long worldId = createWorld("Middle-earth");
        long mentor = createCharacter(worldId, "Gandalf");
        long student = createCharacter(worldId, "Frodo");
        createRelation(worldId, mentor, student, "MENTOR");

        mockMvc.perform(get("/api/worlds/{worldId}/character-relations", worldId).param("characterId", String.valueOf(mentor)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fromCharacterId").value(mentor))
                .andExpect(jsonPath("$[0].toCharacterId").value(student));

        mockMvc.perform(get("/api/worlds/{worldId}/character-relations", worldId).param("characterId", String.valueOf(student)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].fromCharacterId").value(mentor))
                .andExpect(jsonPath("$[0].toCharacterId").value(student));
    }

    @Test
    void updateKeepsDirectionWhenEndpointsAreResent() throws Exception {
        long worldId = createWorld("Middle-earth");
        long mentor = createCharacter(worldId, "Gandalf");
        long student = createCharacter(worldId, "Frodo");
        long relationId = createRelation(worldId, mentor, student, "MENTOR");

        mockMvc.perform(put("/api/worlds/{worldId}/character-relations/{id}", worldId, relationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromCharacterId\":" + mentor + ",\"toCharacterId\":" + student
                                + ",\"type\":\"OTHER\",\"description\":\"still the teacher\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.fromCharacterId").value(mentor))
                .andExpect(jsonPath("$.toCharacterId").value(student))
                .andExpect(jsonPath("$.type").value("OTHER"));
    }

    @Test
    void updateChangesType() throws Exception {
        long worldId = createWorld("Middle-earth");
        long a = createCharacter(worldId, "A");
        long b = createCharacter(worldId, "B");
        long relationId = createRelation(worldId, a, b, "FRIEND");

        mockMvc.perform(put("/api/worlds/{worldId}/character-relations/{id}", worldId, relationId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromCharacterId\":" + a + ",\"toCharacterId\":" + b + ",\"type\":\"RIVAL\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.type").value("RIVAL"));
    }

    @Test
    void deleteRemovesRelation() throws Exception {
        long worldId = createWorld("Middle-earth");
        long a = createCharacter(worldId, "A");
        long b = createCharacter(worldId, "B");
        long relationId = createRelation(worldId, a, b, "FRIEND");

        mockMvc.perform(delete("/api/worlds/{worldId}/character-relations/{id}", worldId, relationId))
                .andExpect(status().isNoContent());

        assertThat(relationRepository.existsById(relationId)).isFalse();
    }

    @Test
    void deletingCharacterRemovesItsRelations() throws Exception {
        long worldId = createWorld("Middle-earth");
        long a = createCharacter(worldId, "A");
        long b = createCharacter(worldId, "B");
        createRelation(worldId, a, b, "FRIEND");

        mockMvc.perform(delete("/api/worlds/{worldId}/characters/{id}", worldId, a))
                .andExpect(status().isNoContent());

        assertThat(relationRepository.count()).isZero();
    }

    @Test
    void listOnMissingWorldReturns404() throws Exception {
        mockMvc.perform(get("/api/worlds/999999/character-relations"))
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

    private long createCharacter(long worldId, String name) throws Exception {
        String body = mockMvc.perform(post("/api/worlds/{worldId}/characters", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();
        return extractId(body);
    }

    private long createRelation(long worldId, long fromId, long toId, String type) throws Exception {
        String body = mockMvc.perform(post("/api/worlds/{worldId}/character-relations", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"fromCharacterId\":" + fromId + ",\"toCharacterId\":" + toId + ",\"type\":\"" + type + "\"}"))
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