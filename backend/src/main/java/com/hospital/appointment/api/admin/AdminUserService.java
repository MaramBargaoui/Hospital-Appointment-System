package com.hospital.appointment.api.admin;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import com.hospital.appointment.api.auth.UserResponse;
import com.hospital.appointment.domain.Role;
import com.hospital.appointment.domain.User;
import com.hospital.appointment.repository.UserRepository;
import com.hospital.appointment.security.UserPrincipal;

@Service
public class AdminUserService {

	private final UserRepository userRepository;
	private final PasswordEncoder passwordEncoder;

	public AdminUserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
		this.userRepository = userRepository;
		this.passwordEncoder = passwordEncoder;
	}

	@Transactional(readOnly = true)
	public List<UserResponse> listUsers() {
		return userRepository.findAll(Sort.by("id")).stream()
				.map(UserResponse::from)
				.toList();
	}

	@Transactional(readOnly = true)
	public UserResponse getUser(Long id) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		return UserResponse.from(user);
	}

	@Transactional
	public UserResponse createUser(AdminCreateUserRequest request) {
		String email = request.email().trim().toLowerCase();
		if (userRepository.existsByEmailIgnoreCase(email)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
		}
		User user = new User();
		user.setEmail(email);
		user.setPasswordHash(passwordEncoder.encode(request.password()));
		user.setFirstName(request.firstName().trim());
		user.setLastName(request.lastName().trim());
		user.setRole(request.role());
		userRepository.save(user);
		return UserResponse.from(user);
	}

	@Transactional
	public UserResponse updateUser(Long id, AdminUpdateUserRequest request) {
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		String email = request.email().trim().toLowerCase();
		if (!email.equalsIgnoreCase(user.getEmail()) && userRepository.existsByEmailIgnoreCaseAndIdNot(email, id)) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Email already in use");
		}
		if (user.getRole() == Role.ADMIN && request.role() != Role.ADMIN) {
			if (userRepository.countByRole(Role.ADMIN) <= 1) {
				throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot remove the last administrator");
			}
		}
		user.setEmail(email);
		user.setFirstName(request.firstName().trim());
		user.setLastName(request.lastName().trim());
		user.setRole(request.role());
		if (StringUtils.hasText(request.password())) {
			String pwd = request.password();
			if (pwd.length() < 8 || pwd.length() > 128) {
				throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password must be 8–128 characters");
			}
			user.setPasswordHash(passwordEncoder.encode(pwd));
		}
		userRepository.save(user);
		return UserResponse.from(user);
	}

	@Transactional
	public void deleteUser(Long id, UserPrincipal principal) {
		if (principal.getId().equals(id)) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "You cannot delete your own account");
		}
		User user = userRepository.findById(id)
				.orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));
		if (user.getRole() == Role.ADMIN && userRepository.countByRole(Role.ADMIN) <= 1) {
			throw new ResponseStatusException(HttpStatus.CONFLICT, "Cannot delete the last administrator");
		}
		userRepository.delete(user);
	}
}
