package com.hubride.module.room.entity;

import com.hubride.common.enums.MemberRole;
import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "room_members", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"room_id", "user_id"})
})
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoomMember {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "room_id", nullable = false)
    private Room room;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 10)
    @Builder.Default
    private MemberRole role = MemberRole.JOINER;

    @Column(name = "amount_held", nullable = false, precision = 12, scale = 2)
    @Builder.Default
    private BigDecimal amountHeld = BigDecimal.ZERO;

    @Column(name = "joined_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime joinedAt = OffsetDateTime.now();
}
