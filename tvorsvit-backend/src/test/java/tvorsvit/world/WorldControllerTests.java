package tvorsvit.world;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

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
class WorldControllerTests {

    private static final Pattern ID_PATTERN = Pattern.compile("\"id\":(\\d+)");

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private WorldRepository repository;

    @BeforeEach
    void cleanDatabase() {
        repository.deleteAll();
    }

    @Test
    void createPersistsWorldAndReturns201() throws Exception {
        mockMvc.perform(post("/api/worlds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Middle-earth\",\"type\":\"BOOK\",\"description\":\"A long ago age\",\"color\":\"#a78bfa\",\"theme\":\"forest\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.id").isNumber())
                .andExpect(jsonPath("$.name").value("Middle-earth"))
                .andExpect(jsonPath("$.type").value("BOOK"))
                .andExpect(jsonPath("$.description").value("A long ago age"))
                .andExpect(jsonPath("$.color").value("#a78bfa"))
                .andExpect(jsonPath("$.theme").value("forest"))
                .andExpect(jsonPath("$.createdAt").isNotEmpty())
                .andExpect(jsonPath("$.updatedAt").isNotEmpty());

        assertThat(repository.count()).isEqualTo(1);
    }

    @Test
    void createWithBlankNameReturns400() throws Exception {
        mockMvc.perform(post("/api/worlds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"   \",\"type\":\"BOOK\"}"))
                .andExpect(status().isBadRequest());

        assertThat(repository.count()).isZero();
    }

    @Test
    void createWithMissingTypeReturns400() throws Exception {
        mockMvc.perform(post("/api/worlds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"No type\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void createWithUnknownTypeReturns400() throws Exception {
        mockMvc.perform(post("/api/worlds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Bad type\",\"type\":\"MAGIC\"}"))
                .andExpect(status().isBadRequest());
    }

    @Test
    void listReturnsWorldsNewestFirst() throws Exception {
        mockMvc.perform(post("/api/worlds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"First\",\"type\":\"BOOK\"}"))
                .andExpect(status().isCreated());
        mockMvc.perform(post("/api/worlds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Second\",\"type\":\"GAME_LORE\"}"))
                .andExpect(status().isCreated());

        mockMvc.perform(get("/api/worlds"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].name").value("Second"))
                .andExpect(jsonPath("$[1].name").value("First"));
    }

    @Test
    void getExistingWorldReturns200() throws Exception {
        long id = createWorld("Skyrim", "GAME_LORE");

        mockMvc.perform(get("/api/worlds/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Skyrim"));
    }

    @Test
    void getMissingWorldReturns404() throws Exception {
        mockMvc.perform(get("/api/worlds/999999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateChangesFields() throws Exception {
        long id = createWorld("Old name", "BOOK");

        mockMvc.perform(put("/api/worlds/{id}", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"New name\",\"type\":\"SHORT_STORY\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("New name"))
                .andExpect(jsonPath("$.type").value("SHORT_STORY"));
    }

    @Test
    void deleteRemovesWorld() throws Exception {
        long id = createWorld("Doomed", "OTHER");

        mockMvc.perform(delete("/api/worlds/{id}", id))
                .andExpect(status().isNoContent());

        mockMvc.perform(get("/api/worlds/{id}", id))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateContentPersistsText() throws Exception {
        long id = createWorld("Writings", "BOOK");

        mockMvc.perform(put("/api/worlds/{id}/content", id)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"Chapter one. The valley slept.\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Chapter one. The valley slept."));

        mockMvc.perform(get("/api/worlds/{id}", id))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Chapter one. The valley slept."));
    }

    @Test
    void updateContentOnMissingWorldReturns404() throws Exception {
        mockMvc.perform(put("/api/worlds/999999/content")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"content\":\"nowhere\"}"))
                .andExpect(status().isNotFound());
    }

    private long createWorld(String name, String type) throws Exception {
        String body = mockMvc.perform(post("/api/worlds")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"" + name + "\",\"type\":\"" + type + "\"}"))
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
}