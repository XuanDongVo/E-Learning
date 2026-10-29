package e_learning.server.assignment.dto.student;

import com.fasterxml.jackson.annotation.JsonValue;

public enum StudentAssignmentStatus {
    TODO("todo"),
    IN_PROGRESS("in_progress"),
    SUBMITTED("submitted"),
    LATE("late");

    private final String value;

    StudentAssignmentStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static StudentAssignmentStatus fromRequest(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Student assignment status is required");
        }

        return switch (value.trim().toLowerCase()) {
            case "todo" -> TODO;
            case "in_progress", "in-progress", "in progress" -> IN_PROGRESS;
            case "submitted", "completed", "done", "finish", "finished" -> SUBMITTED;
            default -> throw new IllegalArgumentException("Unsupported student assignment status: " + value);
        };
    }
}
