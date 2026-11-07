package e_learning.server.gamification.streak.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "student_streak_freeze_usages",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "used_for_date"})
)
public class StudentStreakFreezeUsage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "used_for_date", nullable = false)
    private LocalDate usedForDate;

    @Column(name = "used_at", nullable = false)
    private LocalDateTime usedAt;

    @Column(nullable = false, length = 40)
    private String source;

    protected StudentStreakFreezeUsage() {
    }

    public StudentStreakFreezeUsage(Long studentId, LocalDate usedForDate, String source) {
        this.studentId = studentId;
        this.usedForDate = usedForDate;
        this.source = source;
    }

    @PrePersist
    void onCreate() {
        if (usedAt == null) {
            usedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public LocalDate getUsedForDate() {
        return usedForDate;
    }

    public LocalDateTime getUsedAt() {
        return usedAt;
    }

    public String getSource() {
        return source;
    }
}
