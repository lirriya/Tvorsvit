package tvorsvit;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.CrossOrigin;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

@RestController
@CrossOrigin(origins = "http://localhost:5173")
public class SaveController {

    @PostMapping("/api/save-test")
    public String receiveDraft(@RequestBody DraftRequest request) {
        System.out.println("Received write request from React...");

        Path filePath = Path.of("tvorsvit_draft.txt");

        try {
            String content = request.getTextContent();
            Files.writeString(filePath, content);
            System.out.println("SUCCESS: File successfully updated at: " + filePath.toAbsolutePath());
            return "File successfully saved on your PC hard drive!";
        } catch (IOException e) {
            System.err.println("ERROR: Failed to write file to disk.");
            e.printStackTrace();
            return "Server error: Unable to write to local storage.";
        }
    }
}