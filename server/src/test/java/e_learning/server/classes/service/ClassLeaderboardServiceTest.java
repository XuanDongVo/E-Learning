package e_learning.server.classes.service;

import e_learning.server.classes.dto.ClassLeaderboardResponse;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.repository.ClassLeaderboardQueryRepository;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ClassLeaderboardServiceTest {

    @Mock
    private ClassRepository classRepository;

    @Mock
    private ClassLeaderboardQueryRepository queryRepository;

    private ClassLeaderboardService service;

    private final Long teacherId = 1L;
    private final Long otherTeacherId = 2L;
    private final Long classId = 10L;
    private ClassEntity classEntity;

    @BeforeEach
    void setUp() {
        service = new ClassLeaderboardService(classRepository, queryRepository);

        User teacher = new User("teacher@example.com", "pass", "Teacher One", Role.TEACHER);
        ReflectionTestUtils.setField(teacher, "id", teacherId);

        classEntity = new ClassEntity("Class 7A", null, "2026-2027", teacher);
        ReflectionTestUtils.setField(classEntity, "id", classId);
    }

    private ClassLeaderboardQueryRepository.StudentRow createRow(
            Long studentId,
            String fullName,
            String avatarKey,
            Long xp,
            Long completedSessions,
            Integer currentStreak
    ) {
        return new ClassLeaderboardQueryRepository.StudentRow() {
            @Override
            public Long getStudentId() {
                return studentId;
            }

            @Override
            public String getFullName() {
                return fullName;
            }

            @Override
            public String getAvatarKey() {
                return avatarKey;
            }

            @Override
            public Long getXp() {
                return xp;
            }

            @Override
            public Long getCompletedSessions() {
                return completedSessions;
            }

            @Override
            public Integer getCurrentStreak() {
                return currentStreak;
            }
        };
    }

    @Test
    void getLeaderboard_xpMetric_ranksByXpDescThenStudentIdAsc() {
        when(classRepository.findById(classId)).thenReturn(Optional.of(classEntity));

        var row1 = createRow(101L, "Nguyen Van A", "avatar1", 500L, 5L, 3);
        var row2 = createRow(102L, "Tran Thi B", "avatar2", 1200L, 10L, 7);
        var row3 = createRow(103L, "Le Van C", null, 500L, 2L, 0); // Tie XP with 101, but 101 < 103
        var row4 = createRow(104L, "Pham Thi D", null, 0L, 0L, 0);

        when(queryRepository.findClassStudentMetrics(
                eq(classId), any(LocalDate.class), eq(true), eq(true), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(row1, row2, row3, row4));

        ClassLeaderboardResponse response = service.getLeaderboard(
                classId, "XP", "WEEK", null, 1, 20, teacherId
        );

        assertNotNull(response);
        assertEquals(classId, response.classId());
        assertEquals("XP", response.metric());
        assertEquals("WEEK", response.period());
        assertEquals("PERIOD", response.xpScope());
        assertEquals("PERIOD", response.completedScope());
        assertEquals(4, response.totalStudents());
        assertEquals(4, response.totalElements());
        assertEquals(1, response.page());

        List<ClassLeaderboardResponse.Item> items = response.items();
        assertEquals(4, items.size());

        // Rank 1: 102 with 1200 XP
        assertEquals(102L, items.get(0).studentId());
        assertEquals(1, items.get(0).rank());
        assertEquals(1200L, items.get(0).xp());

        // Rank 2: 101 with 500 XP (studentId 101 < 103)
        assertEquals(101L, items.get(1).studentId());
        assertEquals(2, items.get(1).rank());

        // Rank 3: 103 with 500 XP
        assertEquals(103L, items.get(2).studentId());
        assertEquals(3, items.get(2).rank());

        // Rank 4: 104 with 0 XP
        assertEquals(104L, items.get(3).studentId());
        assertEquals(4, items.get(3).rank());
        assertEquals(0L, items.get(3).xp());
        assertEquals(0, items.get(3).currentStreak());
    }

    @Test
    void getLeaderboard_streakMetric_ranksByStreakDesc_andRejectsPeriod() {
        when(classRepository.findById(classId)).thenReturn(Optional.of(classEntity));

        // When period is passed in STREAK mode, must throw 400
        assertThrows(ResponseStatusException.class, () ->
                service.getLeaderboard(classId, "STREAK", "WEEK", null, 1, 20, teacherId)
        );

        // When period is null, succeeds with all-time scopes
        var row1 = createRow(101L, "Nguyen Van A", "avatar1", 5000L, 50L, 3);
        var row2 = createRow(102L, "Tran Thi B", "avatar2", 1200L, 10L, 14);

        when(queryRepository.findClassStudentMetrics(
                eq(classId), any(LocalDate.class), eq(false), eq(false), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(row1, row2));

        ClassLeaderboardResponse response = service.getLeaderboard(
                classId, "STREAK", null, null, 1, 20, teacherId
        );

        assertEquals("STREAK", response.metric());
        assertNull(response.period());
        assertEquals("ALL", response.xpScope());
        assertEquals("ALL", response.completedScope());

        List<ClassLeaderboardResponse.Item> items = response.items();
        assertEquals(2, items.size());
        assertEquals(102L, items.get(0).studentId()); // 14 streak
        assertEquals(1, items.get(0).rank());
        assertEquals(101L, items.get(1).studentId()); // 3 streak
        assertEquals(2, items.get(1).rank());
    }

    @Test
    void getLeaderboard_searchFilter_preservesOriginalRank() {
        when(classRepository.findById(classId)).thenReturn(Optional.of(classEntity));

        var row1 = createRow(101L, "Nguyen Van A", null, 1000L, 10L, 5);
        var row2 = createRow(102L, "Tran Thi B", null, 800L, 8L, 3);
        var row3 = createRow(103L, "Nguyen Van C", null, 600L, 6L, 1);

        when(queryRepository.findClassStudentMetrics(
                eq(classId), any(LocalDate.class), eq(true), eq(true), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(row1, row2, row3));

        // Search for "Tran" -> only 102 matches, but her rank must remain 2!
        ClassLeaderboardResponse response = service.getLeaderboard(
                classId, "XP", "WEEK", "Tran", 1, 20, teacherId
        );

        assertEquals(3, response.totalStudents());
        assertEquals(1, response.totalElements());
        assertEquals(1, response.items().size());
        assertEquals(102L, response.items().get(0).studentId());
        assertEquals(2, response.items().get(0).rank()); // Original class rank preserved
    }

    @Test
    void getLeaderboard_authorizationChecks() {
        // Not found
        when(classRepository.findById(999L)).thenReturn(Optional.empty());
        AppException exNotFound = assertThrows(AppException.class, () ->
                service.getLeaderboard(999L, "XP", "WEEK", null, 1, 20, teacherId)
        );
        assertEquals(ErrorCode.CLASS_NOT_FOUND, exNotFound.getErrorCode());

        // Forbidden
        when(classRepository.findById(classId)).thenReturn(Optional.of(classEntity));
        AppException exForbidden = assertThrows(AppException.class, () ->
                service.getLeaderboard(classId, "XP", "WEEK", null, 1, 20, otherTeacherId)
        );
        assertEquals(ErrorCode.FORBIDDEN, exForbidden.getErrorCode());
    }

    @Test
    void getLeaderboard_pagination_slicesCorrectly() {
        when(classRepository.findById(classId)).thenReturn(Optional.of(classEntity));

        var row1 = createRow(101L, "Student A", null, 1000L, 10L, 5);
        var row2 = createRow(102L, "Student B", null, 800L, 8L, 3);
        var row3 = createRow(103L, "Student C", null, 600L, 6L, 1);

        when(queryRepository.findClassStudentMetrics(
                eq(classId), any(LocalDate.class), eq(true), eq(true), any(LocalDateTime.class), any(LocalDateTime.class)
        )).thenReturn(List.of(row1, row2, row3));

        // Page 1, size 2 -> items 101, 102
        ClassLeaderboardResponse page1 = service.getLeaderboard(
                classId, "XP", "WEEK", null, 1, 2, teacherId
        );
        assertEquals(3, page1.totalStudents());
        assertEquals(3, page1.totalElements());
        assertEquals(1, page1.page());
        assertEquals(2, page1.size());
        assertEquals(2, page1.items().size());
        assertEquals(101L, page1.items().get(0).studentId());
        assertEquals(102L, page1.items().get(1).studentId());

        // Page 2, size 2 -> item 103
        ClassLeaderboardResponse page2 = service.getLeaderboard(
                classId, "XP", "WEEK", null, 2, 2, teacherId
        );
        assertEquals(1, page2.items().size());
        assertEquals(103L, page2.items().get(0).studentId());
        assertEquals(3, page2.items().get(0).rank());
    }

    @Test
    void getLeaderboard_invalidPeriod_throws400() {
        when(classRepository.findById(classId)).thenReturn(Optional.of(classEntity));

        assertThrows(ResponseStatusException.class, () ->
                service.getLeaderboard(classId, "XP", "INVALID_PERIOD", null, 1, 20, teacherId)
        );
    }
}
