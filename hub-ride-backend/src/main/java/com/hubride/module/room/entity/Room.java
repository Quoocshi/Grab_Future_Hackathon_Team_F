package com.hubride.module.room.entity;

import com.hubride.common.enums.RoomStatus;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rooms")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Room {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "host_user_id", nullable = false)
    private UUID hostUserId;

    @Column(name = "origin_address_id")
    private UUID originAddressId;

    @Column(name = "dest_address_id")
    private UUID destAddressId;

    @Column(name = "origin_h3", nullable = false, length = 20)
    private String originH3;

    @Column(name = "dest_h3", nullable = false, length = 20)
    private String destH3;

    @Column(name = "origin_lat", nullable = false)
    private Double originLat;

    @Column(name = "origin_lng", nullable = false)
    private Double originLng;

    @Column(name = "dest_lat", nullable = false)
    private Double destLat;

    @Column(name = "dest_lng", nullable = false)
    private Double destLng;

    @Column(name = "origin_label", length = 200)
    private String originLabel;

    @Column(name = "dest_label", length = 200)
    private String destLabel;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private RoomStatus status = RoomStatus.OPEN;

    @Column(name = "countdown_remaining_sec", nullable = false)
    @Builder.Default
    private Integer countdownRemainingSec = 300;

    @Column(name = "distance_km")
    private Double distanceKm;

    @Column(name = "eta_minutes")
    private Integer etaMinutes;

    @Column(name = "created_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime createdAt = OffsetDateTime.now();

    @Column(name = "dispatched_at")
    private OffsetDateTime dispatchedAt;

    @OneToMany(mappedBy = "room", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<RoomMember> members = new ArrayList<>();
}
