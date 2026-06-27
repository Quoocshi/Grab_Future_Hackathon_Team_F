package com.hubride.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import java.util.List;

@Configuration
public class SwaggerConfig {

    @Bean
    public OpenAPI hubRideOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Hub-Ride API")
                        .version("1.0.0")
                        .description("Hub-Ride Aggregator Ridesharing Platform API — MVP"))
                .servers(List.of(
                        new Server().url("http://localhost:8081").description("Local dev")
                ));
    }
}
