package com.hospital.appointment.api.appointment;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.hospital.appointment.domain.Appointment;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.appointment.repository.DoctorRepository;
import com.hospital.appointment.repository.UserRepository;

@Service
public class AppointmentService {

	private final AppointmentRepository appointmentRepository;
	private final UserRepository userRepository;
	private final DoctorRepository doctorRepository;

	public AppointmentService(
			AppointmentRepository appointmentRepository,
			UserRepository userRepository,
			DoctorRepository doctorRepository) {
		this.appointmentRepository = appointmentRepository;
		this.userRepository = userRepository;
		this.doctorRepository = doctorRepository;
	}

	@Transactional(readOnly = true)
	public List<AppointmentResponse> list() {
		return appointmentRepository.findAll(Sort.by(Sort.Direction.DESC, "scheduledAt")).stream()
				.map(AppointmentResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public List<AppointmentResponse> listByDoctor(Long doctorId) {
		return appointmentRepository.findByDoctorIdOrderByScheduledAtDesc(doctorId).stream()
				.map(AppointmentResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public AppointmentResponse get(Long id) {
		return AppointmentResponse.from(findOrThrow(id));
	}

	@Transactional
	public AppointmentResponse create(AppointmentRequest request) {
		validateReferences(request);
		Appointment appointment = new Appointment();
		apply(request, appointment);
		return AppointmentResponse.from(appointmentRepository.save(appointment));
	}

	@Transactional
	public AppointmentResponse update(Long id, AppointmentRequest request) {
		validateReferences(request);
		Appointment appointment = findOrThrow(id);
		apply(request, appointment);
		return AppointmentResponse.from(appointmentRepository.save(appointment));
	}

	@Transactional
	public void delete(Long id) {
		if (!appointmentRepository.existsById(id)) {
			throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found");
		}
		appointmentRepository.deleteById(id);
	}

	private Appointment findOrThrow(Long id) {
		return appointmentRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Appointment not found"));
	}

	private void validateReferences(AppointmentRequest request) {
		if (!userRepository.existsById(request.patientId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Patient not found");
		}
		if (!doctorRepository.existsById(request.doctorId())) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Doctor not found");
		}
	}

	private void apply(AppointmentRequest request, Appointment appointment) {
		appointment.setPatientId(request.patientId());
		appointment.setDoctorId(request.doctorId());
		appointment.setScheduledAt(request.scheduledAt());
		appointment.setStatus(request.status());
		appointment.setNotes(request.notes() != null && !request.notes().isBlank()
				? request.notes().trim()
				: null);
		appointment.setPriority(request.priority());
		appointment.setDescription(request.description() != null && !request.description().isBlank()
				? request.description().trim()
				: null);
	}
}
