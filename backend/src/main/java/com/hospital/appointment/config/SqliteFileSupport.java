package com.hospital.appointment.config;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

public final class SqliteFileSupport {

	private SqliteFileSupport() {
	}

	/**
	 * Ensures the parent directory exists for a {@code jdbc:sqlite:...} file URL.
	 * No-op for in-memory URLs.
	 */
	public static void ensureDirectoryForJdbcUrl(String jdbcUrl) {
		if (jdbcUrl == null || !jdbcUrl.startsWith("jdbc:sqlite:")) {
			return;
		}
		String remainder = jdbcUrl.substring("jdbc:sqlite:".length());
		if (remainder.isEmpty() || remainder.startsWith(":memory:")) {
			return;
		}
		int query = remainder.indexOf('?');
		if (query >= 0) {
			remainder = remainder.substring(0, query);
		}
		Path path = Paths.get(remainder);
		if (!path.isAbsolute()) {
			path = Paths.get(System.getProperty("user.dir")).resolve(path).normalize();
		}
		Path parent = path.getParent();
		if (parent != null) {
			try {
				Files.createDirectories(parent);
			}
			catch (IOException e) {
				throw new IllegalStateException("Failed to create SQLite directory: " + parent, e);
			}
		}
	}
}
