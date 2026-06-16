package trovsvit_backend;

public class DraftRequest {
    private String textContent;

    // Getter method so Spring can read the text
    public String getTextContent() {
        return textContent;
    }

    // Setter method so Spring can inject the incoming text
    public void setTextContent(String textContent) {
        this.textContent = textContent;
    }
}