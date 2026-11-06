package e_learning.server.gamification.entity;

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
        name = "student_learning_days",
        uniqueConstraints = @UniqueConstraint(columnNames = {"student_id", "learning_date"})
)
public class StudentLearningDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "learning_date", nullable = false)
    private LocalDate learningDate;

    @Column(name = "qualifying_session_count", nullable = false)
    private int qualifyingSessionCount = 1;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected StudentLearningDay() {
    }

    public StudentLearningDay(Long studentId, LocalDate learningDate) {
        this.studentId = studentId;
        this.learningDate = learningDate;
    }

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public LocalDate getLearningDate() {
        return learningDate;
    }

    public int getQualifyingSessionCount() {
        return qualifyingSessionCount;
    }

    public void setQualifyingSessionCount(int qualifyingSessionCount) {
        this.qualifyingSessionCount = qualifyingSessionCount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
}
