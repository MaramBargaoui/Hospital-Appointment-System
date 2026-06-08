package com.hospital.appointment.api.appointment;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/appointments")
@Tag(name = "Appointments", description = "Appointment booking module")
public class AppointmentController {

	private final AppointmentService appointmentService;

	public AppointmentController(AppointmentService appointmentService) {
		this.appointmentService = appointmentService;
	}

	@GetMapping
	public List<AppointmentResponse> list(
			@RequestParam(required = false) Long doctorId) {
		if (doctorId != null) {
			return appointmentService.listByDoctor(doctorId);
		}
		return appointmentService.list();
	}

	@GetMapping("/{id}")
	public AppointmentResponse get(@PathVariable Long id) {
		return appointmentService.get(id);
	}

	@PostMapping
	public ResponseEntity<AppointmentResponse> create(@Valid @RequestBody AppointmentRequest body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(appointmentService.create(body));
	}

	@PutMapping("/{id}")
	public AppointmentResponse update(@PathVariable Long id, @Valid @RequestBody AppointmentRequest body) {
		return appointmentService.update(id, body);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		appointmentService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
