package com.hospital.appointment.api.appointment;

import static org.hamcrest.Matchers.hasSize;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.time.LocalDateTime;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.hospital.appointment.domain.Appointment;
import com.hospital.appointment.domain.AppointmentStatus;
import com.hospital.appointment.domain.Doctor;
import com.hospital.appointment.domain.Priority;
import com.hospital.appointment.domain.Role;
import com.hospital.appointment.domain.User;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.appointment.repository.DoctorRepository;
import com.hospital.appointment.repository.UserRepository;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AppointmentControllerTest {

	@Autowired
	private MockMvc mockMvc;

	@Autowired
	private AppointmentRepository appointmentRepository;

	@Autowired
	private UserRepository userRepository;

	@Autowired
	private DoctorRepository doctorRepository;

	@Autowired
	private ObjectMapper objectMapper;

	private User patient;
	private Doctor doctor;
	private Appointment savedAppointment;

	@BeforeEach
	void setUp() {
		appointmentRepository.deleteAll();
		userRepository.deleteAll();
		doctorRepository.deleteAll();

		User user = new User();
		String uniqueEmail = java.util.UUID.randomUUID().toString() + "@example.com";
		user.setEmail(uniqueEmail);
		user.setPasswordHash("hash");
		user.setFirstName("John");
		user.setLastName("Doe");
		user.setRole(Role.PATIENT);
		patient = userRepository.save(user);

		Doctor doc = new Doctor();
		doc.setFirstName("Alice");
		doc.setLastName("Green");
		doc.setSpecialty("Cardiology");
		String docEmail = java.util.UUID.randomUUID().toString() + "@example.com";
		doc.setEmail(docEmail);
		doctor = doctorRepository.save(doc);

		Appointment app = new Appointment();
		app.setPatientId(patient.getId());
		app.setDoctorId(doctor.getId());
		app.setScheduledAt(LocalDateTime.of(2026, 6, 1, 10, 0));
		app.setStatus(AppointmentStatus.SCHEDULED);
		app.setNotes("First cardiology consult.");
		savedAppointment = appointmentRepository.save(app);
	}

	@Test
	@WithMockUser(username = "user@hospital.test")
	void testListAppointments() throws Exception {
		mockMvc.perform(get("/api/appointments"))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$", hasSize(1)))
				.andExpect(jsonPath("$[0].notes").value("First cardiology consult."));
	}

	@Test
	@WithMockUser(username = "user@hospital.test")
	void testGetAppointment() throws Exception {
		mockMvc.perform(get("/api/appointments/" + savedAppointment.getId()))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.notes").value("First cardiology consult."))
				.andExpect(jsonPath("$.status").value("SCHEDULED"));
	}

	@Test
	@WithMockUser(username = "user@hospital.test")
	void testCreateAppointment() throws Exception {
		AppointmentRequest request = new AppointmentRequest(
				patient.getId(),
				doctor.getId(),
				LocalDateTime.of(2026, 6, 2, 14, 30),
				AppointmentStatus.SCHEDULED,
				"New appointment notes.",
				Priority.NORMAL,
				null);

		mockMvc.perform(post("/api/appointments")
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isCreated())
				.andExpect(jsonPath("$.notes").value("New appointment notes."))
				.andExpect(jsonPath("$.status").value("SCHEDULED"))
				.andExpect(jsonPath("$.priority").value("NORMAL"));
	}

	@Test
	@WithMockUser(username = "user@hospital.test")
	void testUpdateAppointment() throws Exception {
		AppointmentRequest request = new AppointmentRequest(
				patient.getId(),
				doctor.getId(),
				LocalDateTime.of(2026, 6, 1, 10, 0),
				AppointmentStatus.COMPLETED,
				"Consultation completed successfully.",
				Priority.NORMAL,
				null);

		mockMvc.perform(put("/api/appointments/" + savedAppointment.getId())
				.contentType(MediaType.APPLICATION_JSON)
				.content(objectMapper.writeValueAsString(request)))
				.andExpect(status().isOk())
				.andExpect(jsonPath("$.status").value("COMPLETED"))
				.andExpect(jsonPath("$.notes").value("Consultation completed successfully."));
	}

	@Test
	@WithMockUser(username = "user@hospital.test")
	void testDeleteAppointment() throws Exception {
		mockMvc.perform(delete("/api/appointments/" + savedAppointment.getId()))
				.andExpect(status().isNoContent());

		mockMvc.perform(get("/api/appointments/" + savedAppointment.getId()))
				.andExpect(status().isNotFound());
	}
}
