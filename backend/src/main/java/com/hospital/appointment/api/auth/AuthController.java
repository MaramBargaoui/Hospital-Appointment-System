package com.hospital.appointment.api.auth;

import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.appointment.domain.User;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.security.UserPrincipal;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

	private final AuthService authService;
	private final UserRepository userRepository;

	public AuthController(AuthService authService, UserRepository userRepository) {
		this.authService = authService;
		this.userRepository = userRepository;
	}

	@PostMapping("/register")
	public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest body) {
		return ResponseEntity.ok(authService.register(body));
	}

	@PostMapping("/login")
	public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest body) {
		return ResponseEntity.ok(authService.login(body));
	}

	@GetMapping("/me")
	public ResponseEntity<UserResponse> me(@AuthenticationPrincipal UserPrincipal principal) {
		if (principal == null) {
			return ResponseEntity.status(401).build();
		}
		User user = userRepository.findById(principal.getId())
				.orElseThrow();
		return ResponseEntity.ok(UserResponse.from(user));
	}
}
