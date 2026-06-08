package com.hospital.appointment.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.hospital.appointment.domain.Doctor;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {
}
