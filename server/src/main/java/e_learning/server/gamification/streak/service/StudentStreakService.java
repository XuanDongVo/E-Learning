package e_learning.server.gamification.streak.service;

import e_learning.server.gamification.streak.dto.StudentStreakResponse;
import e_learning.server.gamification.profile.entity.StudentGamificationProfile;
import e_learning.server.gamification.streak.entity.StudentLearningDay;
import e_learning.server.gamification.xp.entity.XpSourceType;
import e_learning.server.gamification.xp.entity.XpTransaction;
import e_learning.server.gamification.profile.repository.StudentGamificationProfileRepository;
import e_learning.server.gamification.streak.repository.StudentLearningDayRepository;
import e_learning.server.gamification.xp.repository.XpTransactionRepository;
import e_learning.server.gamification.xp.service.ActivityXpCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Clock;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.time.DayOfWeek;
import java.util.List;

/** Student Streak v1: first COMPLETED Activity per calendar day qualifies. */
@Service
@RequiredArgsConstructor
public class StudentStreakService {
    private final StudentGamificationProfileRepository profileRepository;
    private final StudentLearningDayRepository dayRepository;
    private final XpTransactionRepository transactionRepository;
    private final ActivityXpCalculator calculator;
    private final StudentStreakPolicy policy;

    private LocalDate today() {
        return LocalDate.now(Clock.system(StudentStreakPolicy.ZONE));
    }

    /**
     * Called only for the new COMPLETED transition, while the parent ActivitySession
     * is write-locked. Joins that transaction (Activity reward -> profile -> day).
     * Repeating completion on the same day is harmless and does not award twice.
     */
    @Transactional
    public void recordCompletedActivity(long studentId) {
        profileRepository.insertIfAbsent(studentId);
        StudentGamificationProfile profile = profileRepository.findWithLockByStudentId(studentId)
                .orElseThrow(() -> new IllegalStateException("Gamification profile not found"));
        // The student's serialized, server-confirmed qualification determines
        // the day. Determine it only after acquiring the profile lock so two
        // concurrent completions around midnight cannot apply dates backwards.
        LocalDate day = today();

        if (dayRepository.findByStudentIdAndLearningDate(studentId, day).isPresent()) {
            return;
        }
        if (profile.getLastQualifiedDate() != null && profile.getLastQualifiedDate().isAfter(day)) {
            throw new IllegalStateException("Last qualified Streak day is in the future");
        }

        int next = policy.nextStreak(profile.getLastQualifiedDate(), profile.getCurrentStreak(), day);
        dayRepository.save(new StudentLearningDay(studentId, day));
        profile.setCurrentStreak(next);
        profile.setLongestStreak(Math.max(profile.getLongestStreak(), next));
        profile.setLastQualifiedDate(day);

        int bonus = policy.milestoneXp(next);
        if (bonus == 0) return;

        LocalDate runStart = day.minusDays(next - 1L);
        String key = policy.awardKey(studentId, runStart, next);
        if (transactionRepository.findByIdempotencyKey(key).isPresent()) {
            throw new IllegalStateException("Streak milestone already awarded without matching day state");
        }
        XpTransaction award = new XpTransaction(studentId, XpSourceType.STREAK_BONUS, null, bonus, key);
        award.setPolicyVersion(StudentStreakPolicy.VERSION);
        award.setNote("Streak milestone: " + next + " consecutive learning days");
        transactionRepository.save(award);

        long lifetimeAfter = Math.addExact(profile.getLifetimeXp(), bonus);
        profile.setLifetimeXp(lifetimeAfter);
        profile.setCurrentLevel(calculator.levelForLifetimeXp(lifetimeAfter));
    }

    @Transactional(readOnly = true)
    public StudentStreakResponse streak(long studentId) {
        StudentGamificationProfile profile = profileRepository.findByStudentId(studentId)
                .orElseGet(() -> new StudentGamificationProfile(studentId));
        LocalDate today = today();
        int effective = policy.effectiveStreak(profile.getLastQualifiedDate(), profile.getCurrentStreak(), today);
        LocalDate start = effective == 0 ? null : profile.getLastQualifiedDate().minusDays(effective - 1L);
        List<StudentStreakResponse.Milestone> milestones = StudentStreakPolicy.MILESTONES.stream()
                .map(days -> new StudentStreakResponse.Milestone(
                        days, policy.milestoneXp(days),
                        start != null && transactionRepository.findByIdempotencyKey(
                                policy.awardKey(studentId, start, days)).isPresent()))
                .toList();
        LocalDate weekStart = today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
        List<LocalDate> qualifiedDates = dayRepository
                .findAllByStudentIdAndLearningDateBetween(studentId, weekStart, weekStart.plusDays(6))
                .stream().map(StudentLearningDay::getLearningDate).sorted().toList();
        return new StudentStreakResponse(
                effective, profile.getLongestStreak(), today.equals(profile.getLastQualifiedDate()),
                start, profile.getLastQualifiedDate(), StudentStreakPolicy.ZONE.getId(), milestones,
                today, weekStart, qualifiedDates);
    }
}
