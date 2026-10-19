package tvorsvit.common;

import java.util.List;

public final class CustomFields {

    private CustomFields() {
    }

    public static void apply(List<CustomFieldRequest> requests, List<CustomField> target) {
        target.clear();
        if (requests == null) {
            return;
        }
        for (CustomFieldRequest request : requests) {
            if (request == null || request.label() == null || request.label().isBlank()) {
                continue;
            }
            CustomField field = new CustomField();
            field.setLabel(request.label().trim());
            field.setValue(request.value() == null || request.value().isBlank() ? null : request.value().trim());
            target.add(field);
        }
    }
}
