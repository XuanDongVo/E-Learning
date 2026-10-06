package e_learning.server.student.entity;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_guardians")
@Getter
public class StudentGuardian {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private GuardianRelationship relationship;

    @Column(name = "full_name", nullable = false, length = 150)
    private String fullName;

    @Column(nullable = false, length = 30)
    private String phone;

    @Column(length = 255)
    private String email;

    @Column(name = "is_primary", nullable = false)
    private boolean primary;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected StudentGuardian() {
    }

    public StudentGuardian(
            StudentProfile studentProfile,
            GuardianRelationship relationship,
            String fullName,
            String phone,
            String email,
            boolean primary
    ) {
        this.studentProfile = studentProfile;
        this.relationship = relationship;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.primary = primary;
    }

    public void update(
            GuardianRelationship relationship,
            String fullName,
            String phone,
            String email,
            boolean primary
    ) {
        this.relationship = relationship;
        this.fullName = fullName;
        this.phone = phone;
        this.email = email;
        this.primary = primary;
    }

    @PrePersist
    void onCreate() {
        LocalDateTime now = LocalDateTime.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
