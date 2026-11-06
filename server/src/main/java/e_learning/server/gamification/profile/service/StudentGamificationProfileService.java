package e_learning.server.gamification.profile.service;

import e_learning.server.gamification.profile.dto.StudentGamificationProfileResponse;
import e_learning.server.gamification.profile.entity.StudentGamificationProfile;
import e_learning.server.gamification.profile.repository.StudentGamificationProfileRepository;
import e_learning.server.gamification.streak.service.StudentStreakPolicy;
import e_learning.server.gamification.xp.service.ActivityXpCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class StudentGamificationProfileService {
    private final StudentGamificationProfileRepository profileRepository;
    private final ActivityXpCalculator calculator;
    private final StudentStreakPolicy policy;

    @Transactional(readOnly = true)
    public StudentGamificationProfileResponse profile(long studentId) {
        StudentGamificationProfile profile = profileRepository.findByStudentId(studentId)
                .orElseGet(() -> new StudentGamificationProfile(studentId));
        LocalDate today = LocalDate.now(Clock.system(StudentStreakPolicy.ZONE));
        int level = calculator.levelForLifetimeXp(profile.getLifetimeXp());
        long levelStart = calculator.lifetimeXpRequiredForLevel(level);
        long levelEnd = calculator.lifetimeXpRequiredForLevel(Math.addExact(level, 1));
        return new StudentGamificationProfileResponse(
                profile.getLifetimeXp(), level, levelStart, levelEnd,
                profile.getLifetimeXp() - levelStart, levelEnd - profile.getLifetimeXp(),
                policy.effectiveStreak(profile.getLastQualifiedDate(), profile.getCurrentStreak(), today),
                profile.getLongestStreak(), profile.getLastQualifiedDate(),
                today.equals(profile.getLastQualifiedDate()));
    }
}
