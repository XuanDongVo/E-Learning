package e_learning.server.student.dto;
import e_learning.server.student.entity.GuardianRelationship;
public record StudentGuardianResponse(Long id, GuardianRelationship relationship, String fullName, String phone, String email, boolean primary) {}
