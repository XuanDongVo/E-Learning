package e_learning.server.classes.service;

import e_learning.server.classes.dto.ClassLeaderboardResponse;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.repository.ClassLeaderboardQueryRepository;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.gamification.streak.service.StudentStreakPolicy;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.time.temporal.TemporalAdjusters;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class ClassLeaderboardService {

    private final ClassRepository classRepository;
    private final ClassLeaderboardQueryRepository queryRepository;

    private LocalDateTime boundary(LocalDate day) {
        ZonedDateTime hcmMidnight = day.atStartOfDay(StudentStreakPolicy.ZONE);
        return hcmMidnight.withZoneSameInstant(ZoneId.systemDefault()).toLocalDateTime();
    }

    @Transactional(readOnly = true)
    public ClassLeaderboardResponse getLeaderboard(
            Long classId,
            String metric,
            String period,
            String search,
            int page,
            int size,
            Long teacherId
    ) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));

        if (!classEntity.getTeacher().getId().equals(teacherId)) {
            throw new AppException(ErrorCode.FORBIDDEN);
        }

        String m = metric == null ? "XP" : metric.trim().toUpperCase(Locale.ROOT);
        if (!m.equals("XP") && !m.equals("STREAK")) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported ranking metric: " + metric);
        }

        String p = null;
        if (m.equals("STREAK")) {
            if (period != null && !period.isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Period filter is not supported for STREAK metric");
            }
        } else {
            p = (period == null || period.isBlank()) ? "WEEK" : period.trim().toUpperCase(Locale.ROOT);
            if (!List.of("TODAY", "WEEK", "MONTH", "ALL").contains(p)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Unsupported XP period: " + period);
            }
        }

        boolean filterByPeriod = m.equals("XP") && !"ALL".equals(p);
        LocalDate today = LocalDate.now(StudentStreakPolicy.ZONE);
        LocalDate yesterday = today.minusDays(1);

        LocalDate from = null;
        LocalDate until = null;
        if (filterByPeriod) {
            from = switch (p) {
                case "TODAY" -> today;
                case "WEEK" -> today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
                case "MONTH" -> today.withDayOfMonth(1);
                default -> null;
            };
            until = switch (p) {
                case "TODAY" -> today.plusDays(1);
                case "WEEK" -> today.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY)).plusDays(7);
                case "MONTH" -> today.withDayOfMonth(1).plusMonths(1);
                default -> null;
            };
        }

        LocalDateTime startAt = boundary(from != null ? from : LocalDate.of(1970, 1, 1));
        LocalDateTime endAt = boundary(until != null ? until : LocalDate.of(9999, 1, 1));

        List<ClassLeaderboardQueryRepository.StudentRow> rows = queryRepository.findClassStudentMetrics(
                classId,
                yesterday,
                filterByPeriod,
                filterByPeriod,
                startAt,
                endAt
        );

        record StudentMetric(
                Long studentId,
                String fullName,
                String avatarKey,
                long xp,
                long completedSessions,
                int currentStreak
        ) {}

        List<StudentMetric> metrics = new ArrayList<>(rows.size());
        for (ClassLeaderboardQueryRepository.StudentRow r : rows) {
            metrics.add(new StudentMetric(
                    r.getStudentId(),
                    r.getFullName(),
                    r.getAvatarKey(),
                    r.getXp() != null ? r.getXp() : 0L,
                    r.getCompletedSessions() != null ? r.getCompletedSessions() : 0L,
                    r.getCurrentStreak() != null ? r.getCurrentStreak() : 0
            ));
        }

        if (m.equals("XP")) {
            metrics.sort(Comparator.comparingLong(StudentMetric::xp).reversed()
                    .thenComparing(StudentMetric::studentId));
        } else {
            metrics.sort(Comparator.comparingInt(StudentMetric::currentStreak).reversed()
                    .thenComparing(StudentMetric::studentId));
        }

        List<ClassLeaderboardResponse.Item> allRanked = new ArrayList<>(metrics.size());
        for (int i = 0; i < metrics.size(); i++) {
            StudentMetric sm = metrics.get(i);
            allRanked.add(new ClassLeaderboardResponse.Item(
                    sm.studentId(),
                    sm.fullName(),
                    sm.avatarKey(),
                    i + 1,
                    sm.xp(),
                    sm.completedSessions(),
                    sm.currentStreak()
            ));
        }

        long totalStudents = allRanked.size();

        List<ClassLeaderboardResponse.Item> filtered = allRanked;
        if (search != null && !search.isBlank()) {
            String q = search.trim().toLowerCase(Locale.ROOT);
            filtered = allRanked.stream()
                    .filter(item -> item.fullName() != null && item.fullName().toLowerCase(Locale.ROOT).contains(q))
                    .toList();
        }

        long totalElements = filtered.size();
        int validPage = Math.max(1, page);
        int validSize = Math.max(1, Math.min(size, 100));
        int fromIndex = Math.min((validPage - 1) * validSize, filtered.size());
        int toIndex = Math.min(fromIndex + validSize, filtered.size());
        List<ClassLeaderboardResponse.Item> pagedItems = filtered.subList(fromIndex, toIndex);

        String xpScope = m.equals("STREAK") || "ALL".equals(p) ? "ALL" : "PERIOD";
        String completedScope = m.equals("STREAK") || "ALL".equals(p) ? "ALL" : "PERIOD";

        return new ClassLeaderboardResponse(
                classId,
                m,
                p,
                xpScope,
                completedScope,
                totalStudents,
                totalElements,
                validPage,
                validSize,
                pagedItems
        );
    }
}
