package com.hospital.appointment.security;

import java.util.Collection;
import java.util.List;

import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import com.hospital.appointment.domain.User;

public class UserPrincipal implements UserDetails {

	private final Long id;
	private final String email;
	private final String passwordHash;
	private final String firstName;
	private final String lastName;
	private final Collection<? extends GrantedAuthority> authorities;

	public UserPrincipal(Long id, String email, String passwordHash, String firstName, String lastName,
			Collection<? extends GrantedAuthority> authorities) {
		this.id = id;
		this.email = email;
		this.passwordHash = passwordHash;
		this.firstName = firstName;
		this.lastName = lastName;
		this.authorities = authorities;
	}

	public static UserPrincipal from(User user) {
		var auth = List.<GrantedAuthority>of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));
		return new UserPrincipal(user.getId(), user.getEmail(), user.getPasswordHash(), user.getFirstName(),
				user.getLastName(), auth);
	}

	public Long getId() {
		return id;
	}

	public String getFirstName() {
		return firstName;
	}

	public String getLastName() {
		return lastName;
	}

	@Override
	public Collection<? extends GrantedAuthority> getAuthorities() {
		return authorities;
	}

	@Override
	public String getPassword() {
		return passwordHash;
	}

	@Override
	public String getUsername() {
		return email;
	}

	@Override
	public boolean isAccountNonExpired() {
		return true;
	}

	@Override
	public boolean isAccountNonLocked() {
		return true;
	}

	@Override
	public boolean isCredentialsNonExpired() {
		return true;
	}

	@Override
	public boolean isEnabled() {
		return true;
	}
}
