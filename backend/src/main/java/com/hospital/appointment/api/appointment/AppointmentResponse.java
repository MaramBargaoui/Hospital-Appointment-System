package com.hospital.appointment.api.appointment;

import java.time.LocalDateTime;

import com.hospital.appointment.domain.Appointment;
import com.hospital.appointment.domain.AppointmentStatus;
import com.hospital.appointment.domain.Priority;

public record AppointmentResponse(
		Long id,
		Long patientId,
		Long doctorId,
		LocalDateTime scheduledAt,
		AppointmentStatus status,
		String notes,
		Priority priority,
		String description) {

	public static AppointmentResponse from(Appointment appointment) {
		return new AppointmentResponse(
				appointment.getId(),
				appointment.getPatientId(),
				appointment.getDoctorId(),
				appointment.getScheduledAt(),
				appointment.getStatus(),
				appointment.getNotes(),
				appointment.getPriority() != null ? appointment.getPriority() : Priority.NORMAL,
				appointment.getDescription());
	}
}
