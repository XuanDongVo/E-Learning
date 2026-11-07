package e_learning.server.student.entity;

import e_learning.server.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_profiles")
@Getter
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;

    @Enumerated(EnumType.STRING)
    @Column(length = 20)
    private Gender gender;

    @Column(length = 30)
    private String phone;

    /** Profile's public-facing avatar selection (DiceBear key, never an arbitrary URL). */
    @Column(name = "avatar_key", length = 255)
    private String avatarKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected StudentProfile() {
    }

    public StudentProfile(User user, LocalDate dateOfBirth, Gender gender, String phone) {
        this.user = user;
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.phone = phone;
    }

    public void update(LocalDate dateOfBirth, Gender gender, String phone) {
        this.dateOfBirth = dateOfBirth;
        this.gender = gender;
        this.phone = phone;
    }

    public void setAvatarKey(String avatarKey) {
        this.avatarKey = avatarKey;
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
