package e_learning.server.gamification.level.service;

import e_learning.server.gamification.level.dto.StudentLevelResponse;
import e_learning.server.gamification.profile.entity.StudentGamificationProfile;
import e_learning.server.gamification.profile.repository.StudentGamificationProfileRepository;
import e_learning.server.gamification.xp.service.ActivityXpCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class StudentLevelService {
    private final StudentGamificationProfileRepository profileRepository;
    private final ActivityXpCalculator calculator;

    @Transactional(readOnly = true)
    public StudentLevelResponse level(long studentId) {
        StudentGamificationProfile profile = profileRepository.findByStudentId(studentId)
                .orElseGet(() -> new StudentGamificationProfile(studentId));
        int level = calculator.levelForLifetimeXp(profile.getLifetimeXp());
        long levelStart = calculator.lifetimeXpRequiredForLevel(level);
        long levelEnd = calculator.lifetimeXpRequiredForLevel(Math.addExact(level, 1));
        return new StudentLevelResponse(
                profile.getLifetimeXp(), level, levelStart, levelEnd,
                profile.getLifetimeXp() - levelStart, levelEnd - profile.getLifetimeXp());
    }
}
