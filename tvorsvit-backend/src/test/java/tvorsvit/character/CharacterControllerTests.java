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
class CharacterControllerTests {

    private static final Pattern ID_PATTERN = Pattern.compile("\"id\":(\\d+)");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WorldRepository worldRepository;

    @Autowired
    private CharacterRepository characterRepository;

    @BeforeEach
    void cleanDatabase() {
        characterRepository.deleteAll();
        worldRepository.deleteAll();
    }

    @Test
    void createPersistsCharacterAndReturns201() throws Exception {
        long worldId = createWorld("Middle-earth");

        mockMvc.perform(post("/api/worlds/{worldId}/characters", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Gandalf\",\"description\":\"A wizard\",\"color\":\"#ffd700\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.worldId").value(worldId))
                .andExpect(jsonPath("$.name").value("Gandalf"))
                .andExpect(jsonPath("$.description").value("A wizard"))
                .andExpect(jsonPath("$.color").value("#ffd700"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty())
                .andExpect(jsonPath("$.updatedAt").isNotEmpty());

        assertThat(characterRepository.count()).isEqualTo(1);
    }

    @Test
    void createWithBlankNameReturns400() throws Exception {
        long worldId = createWorld("Middle-earth");

        mockMvc.perform(post("/api/worlds/{worldId}/characters", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"   \"}"))
                .andExpect(status().isBadRequest());

        assertThat(characterRepository.count()).isZero();
    }

    @Test
    void createOnMissingWorldReturns404() throws Exception {
        mockMvc.perform(post("/api/worlds/999999/characters")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Orphan\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void listReturnsCharactersInCreationOrder() throws Exception {
        long worldId = createWorld("Middle-earth");
        createCharacter(worldId, "Frodo");
        createCharacter(worldId, "Sam");

        mockMvc.perform(get("/api/worlds/{worldId}/characters", worldId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Frodo"))
                .andExpect(jsonPath("$[1].name").value("Sam"))
                .andExpect(jsonPath("$[0].worldId").value(worldId));
    }

    @Test
    void listOnMissingWorldReturns404() throws Exception {
        mockMvc.perform(get("/api/worlds/999999/characters"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateChangesFields() throws Exception {
        long worldId = createWorld("Middle-earth");
        long characterId = createCharacter(worldId, "Gandalf the Grey");

        mockMvc.perform(put("/api/worlds/{worldId}/characters/{id}", worldId, characterId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Gandalf the White\",\"description\":\"Returned\",\"color\":\"#ffffff\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Gandalf the White"))
                .andExpect(jsonPath("$.description").value("Returned"))
                .andExpect(jsonPath("$.color").value("#ffffff"));
    }

    @Test
    void updateOnMissingWorldReturns404() throws Exception {
        long worldId = createWorld("Middle-earth");
        long characterId = createCharacter(worldId, "Frodo");

        mockMvc.perform(put("/api/worlds/999999/characters/{id}", characterId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Stranger\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateCharacterFromAnotherWorldReturns404() throws Exception {
        long worldA = createWorld("World A");
        long worldB = createWorld("World B");
        long characterId = createCharacter(worldA, "Resident of A");

        mockMvc.perform(put("/api/worlds/{worldId}/characters/{id}", worldB, characterId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Hijacker\"}"))
                .andExpect(status().isNotFound());
    }

    @Test
    void deleteRemovesCharacter() throws Exception {
        long worldId = createWorld("Middle-earth");
        long characterId = createCharacter(worldId, "Gollum");

        mockMvc.perform(delete("/api/worlds/{worldId}/characters/{id}", worldId, characterId))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/worlds/{worldId}/characters", worldId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void deleteOnMissingWorldReturns404() throws Exception {
        long worldId = createWorld("Middle-earth");
        long characterId = createCharacter(worldId, "Sauron");

        mockMvc.perform(delete("/api/worlds/999999/characters/{id}", characterId))
                .andExpect(status().isNotFound());
    }

    @Test
    void deletingWorldCascadesToItsCharacters() throws Exception {
        long worldId = createWorld("Middle-earth");
        createCharacter(worldId, "Aragorn");
        createCharacter(worldId, "Legolas");

        mockMvc.perform(delete("/api/worlds/{id}", worldId))
                .andExpect(status().isNoContent());

        assertThat(characterRepository.count()).isZero();
        assertThat(worldRepository.count()).isZero();
    }

    private long createWorld(String name) throws Exception {
        String body = mockMvc.perform(post("/api/worlds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\",\"type\":\"BOOK\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Matcher matcher = ID_PATTERN.matcher(body);
        if (!matcher.find()) {
            throw new AssertionError("Created world response did not contain an id: " + body);
        }
        return Long.parseLong(matcher.group(1));
    }

    private long createCharacter(long worldId, String name) throws Exception {
        String body = mockMvc.perform(post("/api/worlds/{worldId}/characters", worldId)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\"}"))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        Matcher matcher = ID_PATTERN.matcher(body);
        if (!matcher.find()) {
            throw new AssertionError("Created character response did not contain an id: " + body);
        }
        return Long.parseLong(matcher.group(1));
    }
}