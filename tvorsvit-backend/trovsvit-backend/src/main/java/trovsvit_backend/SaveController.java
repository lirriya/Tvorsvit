package trovsvit_backend;

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

        // 1. Define WHERE to save the file.
        // This saves a file named "trovsvit_draft.txt" directly in your project root folder.
        Path filePath = Path.of("trovsvit_draft.txt");

        try {
            // 2. Extract the text string from the React request payload
            String content = request.getTextContent();

            // 3. Write the string to the file. If the file exists, it overwrites it.
            Files.writeString(filePath, content);

            System.out.println("SUCCESS: File successfully updated at: " + filePath.toAbsolutePath());
            return "File successfully saved on your PC hard drive!";

        } catch (IOException e) {
            // If the computer blocks the file write (e.g. permission issues), capture the error
            System.err.println("ERROR: Failed to write file to disk.");
            e.printStackTrace();
            return "Server error: Unable to write to local storage.";
        }
    }
}