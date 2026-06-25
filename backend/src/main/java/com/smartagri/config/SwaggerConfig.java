package com.smartagri.config;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.*;
import io.swagger.v3.oas.models.security.*;
import io.swagger.v3.oas.models.Components;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class SwaggerConfig {
    @Bean
    public OpenAPI smartAgriOpenAPI() {
        return new OpenAPI()
            .info(new Info()
                .title("Smart Agriculture Marketplace API")
                .description("Complete backend API for Smart Agriculture Marketplace — connecting farmers and buyers across India.")
                .version("1.0.0")
                .contact(new Contact().name("Smart Agri Team").email("support@smartagri.in").url("https://smartagri.in"))
                .license(new License().name("MIT").url("https://opensource.org/licenses/MIT")))
            .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
            .components(new Components()
                .addSecuritySchemes("Bearer Authentication",
                    new SecurityScheme()
                        .type(SecurityScheme.Type.HTTP)
                        .scheme("bearer")
                        .bearerFormat("JWT")
                        .description("Enter JWT token")));
    }
}
