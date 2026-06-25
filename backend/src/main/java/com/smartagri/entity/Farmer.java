package com.smartagri.entity;

import com.smartagri.enums.FarmerStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "farmers")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Farmer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long farmerId;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    private String farmName;
    private String farmLocation;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String experience;
    private String specialty;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    private FarmerStatus status = FarmerStatus.PENDING;
}
