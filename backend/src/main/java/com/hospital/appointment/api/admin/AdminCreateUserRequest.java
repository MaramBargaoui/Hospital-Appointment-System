package com.hospital.appointment.api.admin;

import com.hospital.appointment.domain.Role;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AdminCreateUserRequest(
		@NotBlank @Email String email,
		@NotBlank @Size(min = 8, max = 128) String password,
		@NotBlank @Size(max = 100) String firstName,
		@NotBlank @Size(max = 100) String lastName,
		@NotNull Role role) {
}
