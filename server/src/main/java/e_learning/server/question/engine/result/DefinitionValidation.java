package e_learning.server.question.engine.result;

import java.util.List;

public record DefinitionValidation(Status status, List<String> errors) {
    public enum Status { INVALID, INCOMPLETE, READY }
    public DefinitionValidation { status = status == null ? Status.INVALID : status; errors = List.copyOf(errors == null ? List.of() : errors); }
    public boolean valid() { return status != Status.INVALID; }
    public boolean ready() { return status == Status.READY; }
    public static DefinitionValidation invalid(String... errors) { return new DefinitionValidation(Status.INVALID, List.of(errors)); }
    public static DefinitionValidation incomplete(String... errors) { return new DefinitionValidation(Status.INCOMPLETE, List.of(errors)); }
    public static DefinitionValidation ready() { return new DefinitionValidation(Status.READY, List.of()); }
}
