package com.hospital.appointment.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital.appointment.domain.Appointment;

public interface AppointmentRepository extends JpaRepository<Appointment, Long> {

	List<Appointment> findByDoctorIdOrderByScheduledAtDesc(Long doctorId);
}
