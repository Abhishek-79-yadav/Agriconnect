package com.example.AgriConnect.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CropHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    private User farmer;

    private String cropName;
    private double yield;
    private String season;
    private LocalDate date;

    private double sellingPricePerUnit;
    private double costPricePerUnit;
    private double quantity;
}