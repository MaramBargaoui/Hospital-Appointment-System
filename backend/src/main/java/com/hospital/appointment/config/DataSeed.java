package com.hospital.appointment.config;

import java.time.LocalDateTime;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import com.hospital.appointment.domain.Appointment;
import com.hospital.appointment.domain.AppointmentStatus;
import com.hospital.appointment.domain.Doctor;
import com.hospital.appointment.domain.Priority;
import com.hospital.appointment.domain.Role;
import com.hospital.appointment.domain.User;
import com.hospital.appointment.repository.AppointmentRepository;
import com.hospital.appointment.repository.DoctorRepository;
import com.hospital.appointment.repository.UserRepository;

@Configuration
public class DataSeed {

	private static final Logger log = LoggerFactory.getLogger(DataSeed.class);

	@Bean
	ApplicationRunner seedAll(
			UserRepository users,
			DoctorRepository doctors,
			AppointmentRepository appointments,
			PasswordEncoder passwordEncoder,
			@Value("${app.seed.admin-email}") String adminEmail,
			@Value("${app.seed.admin-password}") String adminPassword) {
		return args -> {
			if (users.count() > 0) {
				return;
			}

			// 1. Admin
			User admin = new User();
			admin.setEmail(adminEmail.trim().toLowerCase());
			admin.setPasswordHash(passwordEncoder.encode(adminPassword));
			admin.setFirstName("System");
			admin.setLastName("Admin");
			admin.setRole(Role.ADMIN);
			users.save(admin);
			log.info("Seeded default admin user: {}", adminEmail);

			// 2. Patients
			String[][] patientData = {
					{ "john.doe@hospital.test", "John", "Doe", "PATIENT" },
					{ "jane.smith@hospital.test", "Jane", "Smith", "PATIENT" },
			};
			for (String[] p : patientData) {
				User u = new User();
				u.setEmail(p[0]);
				u.setPasswordHash(passwordEncoder.encode("Patient123!"));
				u.setFirstName(p[1]);
				u.setLastName(p[2]);
				u.setRole(Role.valueOf(p[3]));
				users.save(u);
			}
			log.info("Seeded default patients");

			// 3. Doctors
			String[][] doctorData = {
					{ "Alice", "Green", "Cardiology", "alice.green@hospital.test" },
					{ "Bob", "Carter", "Neurology", "bob.carter@hospital.test" },
					{ "Claire", "Vance", "Pediatrics", "claire.vance@hospital.test" },
			};
			for (String[] d : doctorData) {
				Doctor doc = new Doctor();
				doc.setFirstName(d[0]);
				doc.setLastName(d[1]);
				doc.setSpecialty(d[2]);
				doc.setEmail(d[3]);
				doctors.save(doc);
			}
			log.info("Seeded default doctors");

			// 4. Appointments
			var allUsers = users.findAll();
			var allDoctors = doctors.findAll();
			if (!allUsers.isEmpty() && !allDoctors.isEmpty()) {
				var patient = allUsers.stream()
						.filter(u -> u.getRole() == Role.PATIENT)
						.findFirst().orElse(allUsers.get(0));
				var doc = allDoctors.get(0);

				Appointment a1 = new Appointment();
				a1.setPatientId(patient.getId());
				a1.setDoctorId(doc.getId());
				a1.setScheduledAt(LocalDateTime.now().plusDays(1));
				a1.setStatus(AppointmentStatus.SCHEDULED);
				a1.setPriority(Priority.NORMAL);
				a1.setNotes("Follow-up checkup");
				a1.setDescription("Patient reports mild chest discomfort since last visit.");
				appointments.save(a1);

				Appointment a2 = new Appointment();
				a2.setPatientId(patient.getId());
				a2.setDoctorId(doc.getId());
				a2.setScheduledAt(LocalDateTime.now().minusDays(2));
				a2.setStatus(AppointmentStatus.COMPLETED);
				a2.setPriority(Priority.CRITICAL);
				a2.setNotes("Initial consultation");
				a2.setDescription("Emergency consultation for severe headache and dizziness.");
				appointments.save(a2);

				log.info("Seeded default appointments");
			}
		};
	}
}
