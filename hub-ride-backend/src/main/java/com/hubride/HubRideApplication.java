package com.hubride;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.ConfigurationPropertiesScan;

@SpringBootApplication
@ConfigurationPropertiesScan
public class HubRideApplication {
    public static void main(String[] args) {
        Dotenv dotenv = Dotenv.configure()
                .directory("hub-ride-backend")
                .ignoreIfMalformed()
                .load();
        dotenv.entries().forEach(e -> System.setProperty(e.getKey(), e.getValue()));

        SpringApplication.run(HubRideApplication.class, args);
    }
}
