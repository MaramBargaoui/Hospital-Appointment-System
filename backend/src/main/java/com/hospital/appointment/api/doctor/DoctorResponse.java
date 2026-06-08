package com.hospital.appointment.api.doctor;

import com.hospital.appointment.domain.Doctor;

public record DoctorResponse(Long id, String firstName, String lastName, String specialty, String email) {

	public static DoctorResponse from(Doctor doctor) {
		return new DoctorResponse(
				doctor.getId(),
				doctor.getFirstName(),
				doctor.getLastName(),
				doctor.getSpecialty(),
				doctor.getEmail());
	}
}
