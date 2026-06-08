package com.hospital.appointment.api.user;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.appointment.api.auth.UserResponse;
import com.hospital.appointment.repository.UserRepository;

import io.swagger.v3.oas.annotations.tags.Tag;

@RestController
@RequestMapping("/api/users")
@Tag(name = "User directory", description = "Read-only user list for booking")
public class UserDirectoryController {

	private final UserRepository userRepository;

	public UserDirectoryController(UserRepository userRepository) {
		this.userRepository = userRepository;
	}

	@GetMapping("/directory")
	public List<UserResponse> directory() {
		return userRepository.findAll().stream()
				.map(UserResponse::from)
				.toList();
	}
}
