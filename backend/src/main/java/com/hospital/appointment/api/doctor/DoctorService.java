package com.hospital.appointment.api.doctor;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.hospital.appointment.domain.Doctor;
import com.hospital.appointment.repository.DoctorRepository;

@Service
public class DoctorService {

	private final DoctorRepository doctorRepository;

	public DoctorService(DoctorRepository doctorRepository) {
		this.doctorRepository = doctorRepository;
	}

	@Transactional(readOnly = true)
	public List<DoctorResponse> list() {
		return doctorRepository.findAll(Sort.by("id")).stream()
				.map(DoctorResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public DoctorResponse get(Long id) {
		return DoctorResponse.from(findOrThrow(id));
	}

	@Transactional
	public DoctorResponse create(DoctorRequest request) {
		Doctor doctor = new Doctor();
		apply(request, doctor);
		return DoctorResponse.from(doctorRepository.save(doctor));
	}

	@Transactional
	public DoctorResponse update(Long id, DoctorRequest request) {
		Doctor doctor = findOrThrow(id);
		apply(request, doctor);
		return DoctorResponse.from(doctorRepository.save(doctor));
	}

	@Transactional
	public void delete(Long id) {
		if (!doctorRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found");
		}
		doctorRepository.deleteById(id);
	}

	private Doctor findOrThrow(Long id) {
		return doctorRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Doctor not found"));
	}

	private void apply(DoctorRequest request, Doctor doctor) {
		doctor.setFirstName(request.firstName().trim());
		doctor.setLastName(request.lastName().trim());
		doctor.setSpecialty(request.specialty().trim());
		doctor.setEmail(request.email() != null && !request.email().isBlank()
				? request.email().trim().toLowerCase()
				: null);
	}
}
