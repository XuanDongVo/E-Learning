package e_learning.server.student.dto;
import jakarta.validation.constraints.NotNull;
public record AddClassMemberRequest(@NotNull Long studentId) {}
