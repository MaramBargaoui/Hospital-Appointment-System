package com.hospital.appointment.api.doctor;

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
import org.springframework.web.bind.annotation.RestController;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/doctors")
@Tag(name = "Doctors", description = "Doctor directory module")
public class DoctorController {

	private final DoctorService doctorService;

	public DoctorController(DoctorService doctorService) {
		this.doctorService = doctorService;
	}

	@GetMapping
	public List<DoctorResponse> list() {
		return doctorService.list();
	}

	@GetMapping("/{id}")
	public DoctorResponse get(@PathVariable Long id) {
		return doctorService.get(id);
	}

	@PostMapping
	public ResponseEntity<DoctorResponse> create(@Valid @RequestBody DoctorRequest body) {
		return ResponseEntity.status(HttpStatus.CREATED).body(doctorService.create(body));
	}

	@PutMapping("/{id}")
	public DoctorResponse update(@PathVariable Long id, @Valid @RequestBody DoctorRequest body) {
		return doctorService.update(id, body);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id) {
		doctorService.delete(id);
		return ResponseEntity.noContent().build();
	}
}
