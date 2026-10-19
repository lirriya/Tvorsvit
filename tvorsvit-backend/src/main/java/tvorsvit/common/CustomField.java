package tvorsvit.common;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;

@Embeddable
public class CustomField {

    @Column(name = "field_label", length = 80)
    private String label;

    @Column(name = "field_value", length = 500)
    private String value;

    public CustomField() {
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    public String getValue() {
        return value;
    }

    public void setValue(String value) {
        this.value = value;
    }
}
