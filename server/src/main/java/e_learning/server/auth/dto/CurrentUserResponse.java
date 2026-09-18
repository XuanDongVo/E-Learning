package e_learning.server.auth.dto;

import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;

public record CurrentUserResponse(
		Long id,
		String email,
		String fullName,
		Role role
) {
	public static CurrentUserResponse from(User user) {
		return new CurrentUserResponse(user.getId(), user.getEmail(), user.getFullName(), user.getRole());
	}
}
