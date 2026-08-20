package com.example.AgriConnect;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class AgriConnectApplication {

	static {
		Dotenv dotenv = Dotenv.configure()
				.ignoreIfMissing()
				.load();

		dotenv.entries().forEach(entry ->
				System.setProperty(entry.getKey(), entry.getValue())
		);

		// TEMPORARY DEBUG — remove after checking
		System.out.println("### DEBUG: SUPER_ADMIN_SETUP_KEY loaded as: ["
				+ System.getProperty("SUPER_ADMIN_SETUP_KEY") + "]");
	}
//	@Value("${app.super-admin-setup-key}")
//	private String setupKey;
//
//	@Bean
//	CommandLineRunner debugKey() {
//		return args -> {
//			System.out.println("================================");
//			System.out.println("ENV KEY = [" +
//					System.getProperty("SUPER_ADMIN_SETUP_KEY") + "]");
//			System.out.println("APP KEY = [" + setupKey + "]");
//			System.out.println("================================");
//		};
//	}

	public static void main(String[] args) {
		SpringApplication.run(AgriConnectApplication.class, args);
	}
}