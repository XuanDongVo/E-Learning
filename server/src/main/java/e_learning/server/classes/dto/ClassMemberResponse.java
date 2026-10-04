package e_learning.server.classes.dto;

import e_learning.server.user.entity.User;

public record ClassMemberResponse(
        Long userId,
        String fullName,
        String email,
        String status
) {
    public static ClassMemberResponse from(User user, String status) {
        return new ClassMemberResponse(user.getId(), user.getFullName(), user.getEmail(), status);
    }
}
