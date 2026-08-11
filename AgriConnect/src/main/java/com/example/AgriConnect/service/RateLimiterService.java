package com.example.AgriConnect.service;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
@RequiredArgsConstructor
public class RateLimiterService {

    private final StringRedisTemplate redisTemplate;

    private static final int LIMIT = 10;
    private static final long WINDOW = 60;

    public boolean isAllowed(String key) {

        try {

            String redisKey = "rate:" + key;
            String value = redisTemplate.opsForValue().get(redisKey);

            if (value == null) {
                redisTemplate.opsForValue().set(redisKey, "1", Duration.ofSeconds(WINDOW));
                return true;
            }

            int count = Integer.parseInt(value);

            if (count >= LIMIT) {
                return false;
            }

            redisTemplate.opsForValue().increment(redisKey);
            return true;

        } catch (Exception e) {

            // Redis unavailable -> allow request
            return true;
        }
    }
}