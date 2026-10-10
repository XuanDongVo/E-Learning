package e_learning.server.content.unit.service;

import e_learning.server.activity.enums.ActivityStatus;
import e_learning.server.activity.repository.ActivityBankRepository;
import e_learning.server.activity.repository.ActivityRepository;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.media.enums.MediaStatus;
import e_learning.server.content.media.repository.MediaRepository;
import e_learning.server.content.media.service.CloudinaryMediaService;
import e_learning.server.content.section.repository.SectionRepository;
import e_learning.server.content.topic.repository.TopicRepository;
import e_learning.server.content.unit.dto.student.*;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.repository.UnitRepository;
import e_learning.server.user.entity.User;
import e_learning.server.user.entity.UserStatus;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentUnitService {

    private final UserRepository userRepository;
    private final ClassMemberRepository classMemberRepository;
    private final UnitRepository unitRepository;
    private final SectionRepository sectionRepository;
    private final TopicRepository topicRepository;
    private final ActivityRepository activityRepository;
    private final ActivityBankRepository activityBankRepository;
    private final MediaRepository mediaRepository;
    private final CloudinaryMediaService cloudinaryMediaService;

    /**
     * Get published units visible to the current student.
     */
    public List<StudentUnitSummaryResponse> getMyUnits(Long studentId) {

        Long gradeId = resolveStudentGradeId(studentId);

        List<Unit> units = unitRepository
                .findAllByGradeIdAndStatusOrderByDisplayOrderAsc(
                        gradeId,
                        ContentStatus.PUBLISHED
                );

        return units.stream()
                .map(this::toUnitSummary)
                .toList();
    }

    /**
     * Get a published unit and its visible content.
     */
    public StudentUnitDetailResponse getMyUnit(
            Long studentId,
            Long unitId
    ) {

        // 1. Resolve student's current grade.
        Long gradeId = resolveStudentGradeId(studentId);

        // 2. Resolve published unit belonging to that grade.
        Unit unit = unitRepository.findById(unitId).orElseThrow(() -> new AppException(ErrorCode.UNIT_NOT_FOUND));

        if (!unit.getGrade().getId().equals(gradeId) || unit.getStatus() != ContentStatus.PUBLISHED) {
            throw new AppException(ErrorCode.UNIT_NOT_FOUND);
        }

        // 3. Fetch published sections and topics.
        List<StudentSectionResponse> sections = getPublishedSections(unitId);

        // 4. Fetch published activities.
        List<StudentActivityResponse> activities = getPublishedActivities(unitId);

        // 5. Resolve cover URL.
        String coverUrl = resolveCoverUrl(unit);

        // 6. Calculate visible content counts.
        int sectionCount = sections.size();
        int activityCount = activities.size();

        return new StudentUnitDetailResponse(
                unit.getId(),
                unit.getCode(),
                unit.getName(),
                unit.getDescription(),
                coverUrl,
                unit.getDisplayOrder(),
                sectionCount,
                activityCount,
                sections,
                activities
        );
    }

    /**
     * Resolve the student's current grade from the ACTIVE class.
     */
    private Long resolveStudentGradeId(Long studentId) {

        User student = userRepository.findById(studentId)
                .orElseThrow(
                        () -> new AppException(ErrorCode.USER_NOT_FOUND)
                );

        if (student.getStatus() != UserStatus.ACTIVE) {
            throw new AppException(ErrorCode.USER_NOT_FOUND);
        }

        ClassMember activeMembership = classMemberRepository
                .findActiveMembershipByUserId(studentId)
                .orElseThrow(
                        () -> new AppException(
                                ErrorCode.STUDENT_NOT_IN_ACTIVE_CLASS
                        )
                );

        return activeMembership
                .getClassEntity()
                .getGrade()
                .getId();
    }

    /**
     * Map a published Unit to its summary response.
     */
    private StudentUnitSummaryResponse toUnitSummary(Unit unit) {

        int sectionCount = Math.toIntExact(
                sectionRepository.countByUnitIdAndStatus(
                        unit.getId(),
                        ContentStatus.PUBLISHED
                )
        );

        int activityCount = Math.toIntExact(
                activityRepository.countByUnitIdAndStatus(
                        unit.getId(),
                        ActivityStatus.PUBLISHED
                )
        );

        return new StudentUnitSummaryResponse(
                unit.getId(),
                unit.getCode(),
                unit.getName(),
                unit.getDescription(),
                resolveCoverUrl(unit),
                unit.getDisplayOrder(),
                sectionCount,
                activityCount
        );
    }

    /**
     * Resolve Unit cover URL.
     */
    private String resolveCoverUrl(Unit unit) {

        if (unit.getCoverMediaId() == null) {
            return null;
        }

        return mediaRepository
                .findById(unit.getCoverMediaId())
                .filter(media -> media.getStatus() == MediaStatus.READY)
                .map(media ->
                        cloudinaryMediaService.generatedUrl(
                                media.getPublicId(),
                                media.getResourceType(),
                                media.getFormat()
                        )
                )
                .orElse(null);
    }

    /**
     * Get published Sections and their published Topics.
     */
    private List<StudentSectionResponse> getPublishedSections(Long unitId) {
        return sectionRepository.findByUnitIdAndStatusOrderByDisplayOrderAsc(unitId, ContentStatus.PUBLISHED)
                .stream().map(section -> {
                    List<StudentTopicResponse> topics = topicRepository
                            .findBySectionIdAndStatusOrderByDisplayOrderAsc(section.getId(), ContentStatus.PUBLISHED)
                            .stream()
                            .map(topic ->
                                    new StudentTopicResponse(
                                            topic.getId(),
                                            topic.getName()
                                    )
                            )
                            .toList();

                    return new StudentSectionResponse(
                            section.getId(),
                            section.getName(),
                            section.getDescription(),
                            topics
                    );
                })
                .toList();
    }

    /**
     * Get published Activities and their referenced Topics.
     */
    private List<StudentActivityResponse> getPublishedActivities(Long unitId) {
        return activityRepository
                .findAllByUnitIdAndStatusOrderByDisplayOrderAscIdAsc(unitId, ActivityStatus.PUBLISHED)
                .stream()
                .map(activity -> {
                    List<Long> topicIds = activityBankRepository
                            .findByActivityIdOrderByDisplayOrderAsc(activity.getId())
                            .stream()
                            .map(activityBank ->
                                    activityBank
                                            .getQuestionBank()
                                            .getTopic()
                                            .getId()
                            )
                            .distinct()
                            .toList();

                    return new StudentActivityResponse(
                            activity.getId(),
                            activity.getName(),
                            activity.getDescription(),
                            activity.getMode(),
                            activity.getTotalQuestions(),
                            activity.getTimeLimitSeconds(),
                            activity.getLives(),
                            topicIds
                    );
                })
                .toList();
    }
}