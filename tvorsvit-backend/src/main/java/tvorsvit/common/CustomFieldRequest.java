package tvorsvit.common;

import jakarta.validation.constraints.Size;

public record CustomFieldRequest(
        @Size(max = 80) String label,
        @Size(max = 500) String value) {
}
