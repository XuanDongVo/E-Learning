package e_learning.server.user.dto;

import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;

public record UserResponse(
        Long id,
        String email,
        String fullName,
        Role role
) {
    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
    }
}