package com.hospital.appointment.api.auth;

import com.hospital.appointment.domain.Role;
import com.hospital.appointment.domain.User;

public record AuthResponse(
		String accessToken,
		String tokenType,
		Long userId,
		String email,
		Role role,
		String firstName,
		String lastName) {

	public static AuthResponse of(User user, String accessToken) {
		return new AuthResponse(accessToken, "Bearer", user.getId(), user.getEmail(), user.getRole(),
				user.getFirstName(), user.getLastName());
	}
}
