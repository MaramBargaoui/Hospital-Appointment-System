package com.hospital.appointment.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;

@Configuration
public class OpenApiConfig {

	@Bean
	public OpenAPI hospitalOpenAPI() {
		final String schemeName = "bearerAuth";
		return new OpenAPI()
				.info(new Info()
						.title("Hospital Appointment API")
						.description("REST API — users, doctors, appointments. Use Authorize with a JWT from /api/auth/login.")
						.version("1.0"))
				.addSecurityItem(new SecurityRequirement().addList(schemeName))
				.components(new Components()
						.addSecuritySchemes(schemeName, new SecurityScheme()
								.name(schemeName)
								.type(SecurityScheme.Type.HTTP)
								.scheme("bearer")
								.bearerFormat("JWT")));
	}
}
