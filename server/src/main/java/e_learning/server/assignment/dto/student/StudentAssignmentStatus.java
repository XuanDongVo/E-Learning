package e_learning.server.assignment.dto.student;

import com.fasterxml.jackson.annotation.JsonValue;

public enum StudentAssignmentStatus {
    TODO("todo"),
    COMPLETED("completed"),
    LATE("late");

    private final String value;

    StudentAssignmentStatus(String value) {
        this.value = value;
    }

    @JsonValue
    public String getValue() {
        return value;
    }

    public static StudentAssignmentStatus fromFilter(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        return switch (value.trim().toLowerCase()) {
            case "todo", "pending", "in_progress", "in-progress", "in progress" -> TODO;
            case "completed", "done", "finish", "finished" -> COMPLETED;
            case "late", "overdue" -> LATE;
            default -> throw new IllegalArgumentException("Unsupported student assignment status: " + value);
        };
    }
}
