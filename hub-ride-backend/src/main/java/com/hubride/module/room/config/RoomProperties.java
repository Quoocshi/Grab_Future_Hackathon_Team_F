package com.hubride.module.room.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

@Component
@ConfigurationProperties(prefix = "hubride.room")
@Getter
@Setter
public class RoomProperties {
    private int countdownSeconds = 30;
    private BigDecimal holdAmount = BigDecimal.valueOf(100_000);
}
