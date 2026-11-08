package e_learning.server.gamification.profile.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "student_gamification_profiles")
public class StudentGamificationProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "student_id", nullable = false, unique = true)
    private Long studentId;

    @Column(name = "lifetime_xp", nullable = false)
    private long lifetimeXp = 0;

    @Column(name = "current_level", nullable = false)
    private int currentLevel = 1;

    @Column(name = "current_streak", nullable = false)
    private int currentStreak = 0;

    @Column(name = "longest_streak", nullable = false)
    private int longestStreak = 0;

    @Column(name = "last_qualified_date")
    private LocalDate lastQualifiedDate;

    @Column(name = "active_avatar_key", length = 255)
    private String activeAvatarKey;

    @Column(name = "active_mascot_key", length = 255)
    private String activeMascotKey;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    protected StudentGamificationProfile() {
    }

    public StudentGamificationProfile(Long studentId) {
        this.studentId = studentId;
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

    public Long getId() {
        return id;
    }

    public Long getStudentId() {
        return studentId;
    }

    public long getLifetimeXp() {
        return lifetimeXp;
    }

    public void setLifetimeXp(long lifetimeXp) {
        this.lifetimeXp = lifetimeXp;
    }

    public int getCurrentLevel() {
        return currentLevel;
    }

    public void setCurrentLevel(int currentLevel) {
        this.currentLevel = currentLevel;
    }

    public int getCurrentStreak() {
        return currentStreak;
    }

    public void setCurrentStreak(int currentStreak) {
        this.currentStreak = currentStreak;
    }

    public int getLongestStreak() {
        return longestStreak;
    }

    public void setLongestStreak(int longestStreak) {
        this.longestStreak = longestStreak;
    }

    public LocalDate getLastQualifiedDate() {
        return lastQualifiedDate;
    }

    public void setLastQualifiedDate(LocalDate lastQualifiedDate) {
        this.lastQualifiedDate = lastQualifiedDate;
    }

    public String getActiveAvatarKey() {
        return activeAvatarKey;
    }

    public void setActiveAvatarKey(String activeAvatarKey) {
        this.activeAvatarKey = activeAvatarKey;
    }

    public String getActiveMascotKey() {
        return activeMascotKey;
    }

    public void setActiveMascotKey(String activeMascotKey) {
        this.activeMascotKey = activeMascotKey;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }
}
