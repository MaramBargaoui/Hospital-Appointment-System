package com.hospital.appointment;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import com.hospital.appointment.config.SqliteFileSupport;

@SpringBootApplication
public class HospitalApiApplication {

	public static void main(String[] args) {
		String jdbcUrl = System.getenv().getOrDefault("SPRING_DATASOURCE_URL",
				System.getProperty("spring.datasource.url", "jdbc:sqlite:./data/hospital.db"));
		SqliteFileSupport.ensureDirectoryForJdbcUrl(jdbcUrl);
		SpringApplication.run(HospitalApiApplication.class, args);
	}

}
