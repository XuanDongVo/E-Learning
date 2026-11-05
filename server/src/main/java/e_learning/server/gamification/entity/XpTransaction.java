package e_learning.server.gamification.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "xp_transactions")
public class XpTransaction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false)
    private Long studentId;

    @Column(name = "activity_session_id")
    private Long activitySessionId;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 40)
    private XpSourceType sourceType;

    @Column(name = "source_id")
    private Long sourceId;

    @Column(nullable = false)
    private int amount;

    @Column(name = "earned_at", nullable = false)
    private LocalDateTime earnedAt;

    @Column(name = "idempotency_key", nullable = false, unique = true, length = 255)
    private String idempotencyKey;

    @Column(length = 500)
    private String note;

    protected XpTransaction() {
    }

    public XpTransaction(
            Long studentId,
            XpSourceType sourceType,
            Long sourceId,
            int amount,
            String idempotencyKey
    ) {
        this.studentId = studentId;
        this.sourceType = sourceType;
        this.sourceId = sourceId;
        this.amount = amount;
        this.idempotencyKey = idempotencyKey;
    }

    @PrePersist
    void onCreate() {
        if (earnedAt == null) {
            earnedAt = LocalDateTime.now();
        }
    }

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public Long getActivitySessionId() {
        return activitySessionId;
    }

    public void setActivitySessionId(Long activitySessionId) {
        this.activitySessionId = activitySessionId;
    }

    public XpSourceType getSourceType() {
        return sourceType;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public int getAmount() {
        return amount;
    }

    public LocalDateTime getEarnedAt() {
        return earnedAt;
    }

    public String getIdempotencyKey() {
        return idempotencyKey;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
