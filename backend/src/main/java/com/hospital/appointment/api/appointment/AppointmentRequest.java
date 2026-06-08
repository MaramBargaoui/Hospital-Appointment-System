package com.hospital.appointment.api.appointment;

import java.time.LocalDateTime;

import com.hospital.appointment.domain.AppointmentStatus;
import com.hospital.appointment.domain.Priority;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record AppointmentRequest(
		@NotNull Long patientId,
		@NotNull Long doctorId,
		@NotNull LocalDateTime scheduledAt,
		@NotNull AppointmentStatus status,
		@Size(max = 500) String notes,
		@NotNull Priority priority,
		@Size(max = 2000) String description) {
}
