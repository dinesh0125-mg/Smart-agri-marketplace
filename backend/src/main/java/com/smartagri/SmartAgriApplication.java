package com.smartagri;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableAsync
@EnableScheduling
public class SmartAgriApplication {

    public static void main(String[] args) {
        SpringApplication.run(SmartAgriApplication.class, args);
    }
}
