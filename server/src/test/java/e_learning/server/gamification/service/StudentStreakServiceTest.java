package e_learning.server.gamification.service;

import e_learning.server.gamification.entity.StudentGamificationProfile;
import e_learning.server.gamification.entity.StudentLearningDay;
import e_learning.server.gamification.entity.XpSourceType;
import e_learning.server.gamification.entity.XpTransaction;
import e_learning.server.gamification.repository.StudentGamificationProfileRepository;
import e_learning.server.gamification.repository.StudentLearningDayRepository;
import e_learning.server.gamification.repository.XpTransactionRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class StudentStreakServiceTest {
    @Mock private StudentGamificationProfileRepository profiles;
    @Mock private StudentLearningDayRepository days;
    @Mock private XpTransactionRepository transactions;
    private StudentStreakService service;

    @BeforeEach
    void setUp() {
        service = new StudentStreakService(profiles, days, transactions,
                new ActivityXpCalculatorImpl(), new StudentStreakPolicy());
    }

    @Test
    void secondCompletedActivityTodayDoesNotChangeStreakOrBonus() {
        LocalDate today = LocalDate.now(StudentStreakPolicy.ZONE);
        StudentGamificationProfile profile = new StudentGamificationProfile(42L);
        profile.setCurrentStreak(3);
        profile.setLastQualifiedDate(today);
        when(profiles.findWithLockByStudentId(42L)).thenReturn(Optional.of(profile));
        when(days.findByStudentIdAndLearningDate(42L, today))
                .thenReturn(Optional.of(new StudentLearningDay(42L, today)));

        service.recordCompletedActivity(42L);

        assertEquals(3, profile.getCurrentStreak());
        verify(days, never()).save(any());
        verifyNoInteractions(transactions);
    }

    @Test
    void thirdConsecutiveDayAwardsTenXpAndCanAdvanceLevel() {
        LocalDate today = LocalDate.now(StudentStreakPolicy.ZONE);
        StudentGamificationProfile profile = new StudentGamificationProfile(42L);
        profile.setCurrentStreak(2);
        profile.setLongestStreak(2);
        profile.setLastQualifiedDate(today.minusDays(1));
        profile.setLifetimeXp(95);
        when(profiles.findWithLockByStudentId(42L)).thenReturn(Optional.of(profile));
        when(days.findByStudentIdAndLearningDate(42L, today)).thenReturn(Optional.empty());

        service.recordCompletedActivity(42L);

        assertEquals(3, profile.getCurrentStreak());
        assertEquals(3, profile.getLongestStreak());
        assertEquals(105L, profile.getLifetimeXp());
        assertEquals(2, profile.getCurrentLevel());
        ArgumentCaptor<XpTransaction> award = ArgumentCaptor.forClass(XpTransaction.class);
        verify(transactions).save(award.capture());
        assertEquals(XpSourceType.STREAK_BONUS, award.getValue().getSourceType());
        assertEquals(10, award.getValue().getAmount());
        assertEquals("STREAK_V1", award.getValue().getPolicyVersion());
        verify(days).save(any(StudentLearningDay.class));
    }

    @Test
    void missedDayResetsStreakWithoutRemovingEarnedXpOrLongest() {
        LocalDate today = LocalDate.now(StudentStreakPolicy.ZONE);
        StudentGamificationProfile profile = new StudentGamificationProfile(42L);
        profile.setCurrentStreak(30);
        profile.setLongestStreak(30);
        profile.setLifetimeXp(500);
        profile.setLastQualifiedDate(today.minusDays(2));
        when(profiles.findWithLockByStudentId(42L)).thenReturn(Optional.of(profile));
        when(days.findByStudentIdAndLearningDate(42L, today)).thenReturn(Optional.empty());

        service.recordCompletedActivity(42L);

        assertEquals(1, profile.getCurrentStreak());
        assertEquals(30, profile.getLongestStreak());
        assertEquals(500, profile.getLifetimeXp());
        verifyNoInteractions(transactions);
    }
}
