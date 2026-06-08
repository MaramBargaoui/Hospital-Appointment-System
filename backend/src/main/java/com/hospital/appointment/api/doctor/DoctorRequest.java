package com.hospital.appointment.api.doctor;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record DoctorRequest(
		@NotBlank @Size(max = 100) String firstName,
		@NotBlank @Size(max = 100) String lastName,
		@NotBlank @Size(max = 120) String specialty,
		@Size(max = 255) String email) {
}
