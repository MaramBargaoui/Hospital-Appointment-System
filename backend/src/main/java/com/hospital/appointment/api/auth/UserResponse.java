package com.hospital.appointment.api.auth;

import com.hospital.appointment.domain.Role;
import com.hospital.appointment.domain.User;

public record UserResponse(Long id, String email, Role role, String firstName, String lastName) {

	public static UserResponse from(User user) {
		return new UserResponse(user.getId(), user.getEmail(), user.getRole(), user.getFirstName(),
				user.getLastName());
	}
}
