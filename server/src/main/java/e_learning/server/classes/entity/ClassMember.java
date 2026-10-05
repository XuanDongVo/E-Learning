package e_learning.server.classes.entity;

import e_learning.server.user.entity.User;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

import java.time.LocalDateTime;

@Entity
@Table(name = "class_members")
public class ClassMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "class_id", nullable = false)
    private ClassEntity classEntity;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "joined_at", nullable = false)
    private LocalDateTime joinedAt;

    protected ClassMember() {
    }

    public ClassMember(ClassEntity classEntity, User user) {
        this.classEntity = classEntity;
        this.user = user;
        this.status = "ACTIVE";
        this.joinedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public ClassEntity getClassEntity() { return classEntity; }
    public User getUser() { return user; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}