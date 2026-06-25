package com.smartagri.config;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.HashMap;
import java.util.Map;

/**
 * Loads a {@code .env} file from the project root directory into the Spring
 * {@link ConfigurableEnvironment} as a property source before the application
 * context initialises.
 * <p>
 * This allows {@code application.properties} to reference {@code .env} values
 * using standard placeholder syntax: {@code ${DB_PASSWORD}}.
 * <p>
 * The file is optional — if it doesn't exist, the application starts normally
 * (so that real environment variables can be used in production).
 */
public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "dotenv";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment,
                                       SpringApplication application) {
        Path dotenvPath = Path.of(".env");
        if (!Files.exists(dotenvPath)) {
            return;
        }

        try {
            Map<String, Object> props = new HashMap<>();
            for (String line : Files.readAllLines(dotenvPath)) {
                String trimmed = line.trim();
                if (trimmed.isEmpty() || trimmed.startsWith("#")) {
                    continue;
                }
                int eqIndex = trimmed.indexOf('=');
                if (eqIndex > 0) {
                    String key = trimmed.substring(0, eqIndex).trim();
                    String value = trimmed.substring(eqIndex + 1).trim();
                    // Strip surrounding quotes if present
                    if (value.length() >= 2
                            && ((value.startsWith("\"") && value.endsWith("\""))
                            || (value.startsWith("'") && value.endsWith("'")))) {
                        value = value.substring(1, value.length() - 1);
                    }
                    props.put(key, value);
                }
            }
            environment.getPropertySources()
                    .addLast(new MapPropertySource(PROPERTY_SOURCE_NAME, props));
        } catch (IOException e) {
            throw new RuntimeException("Failed to load .env file", e);
        }
    }
}
