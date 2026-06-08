package com.hospital.appointment.api.admin;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.hospital.appointment.api.auth.UserResponse;
import com.hospital.appointment.security.UserPrincipal;

import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/admin/users")
@Tag(name = "Users", description = "User management module (admin)")
public class AdminUserController {

	private final AdminUserService adminUserService;

	public AdminUserController(AdminUserService adminUserService) {
		this.adminUserService = adminUserService;
	}

	@GetMapping
	public List<UserResponse> list() {
		return adminUserService.listUsers();
	}

	@GetMapping("/{id}")
	public UserResponse get(@PathVariable Long id) {
		return adminUserService.getUser(id);
	}

	@PostMapping
	public ResponseEntity<UserResponse> create(@Valid @RequestBody AdminCreateUserRequest body) {
		UserResponse created = adminUserService.createUser(body);
		return ResponseEntity.status(HttpStatus.CREATED).body(created);
	}

	@PutMapping("/{id}")
	public UserResponse update(@PathVariable Long id, @Valid @RequestBody AdminUpdateUserRequest body) {
		return adminUserService.updateUser(id, body);
	}

	@DeleteMapping("/{id}")
	public ResponseEntity<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
		adminUserService.deleteUser(id, principal);
		return ResponseEntity.noContent().build();
	}
}
