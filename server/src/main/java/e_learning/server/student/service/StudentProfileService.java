package e_learning.server.student.service;

import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.dto.PageResponse;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.student.dto.*;
import e_learning.server.student.entity.StudentGuardian;
import e_learning.server.student.entity.StudentProfile;
import e_learning.server.student.repository.StudentGuardianRepository;
import e_learning.server.student.repository.StudentProfileRepository;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.entity.UserStatus;
import e_learning.server.user.repository.UserRepository;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Root;
import jakarta.persistence.criteria.Subquery;
import lombok.RequiredArgsConstructor;
import org.springframework.util.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

import jakarta.persistence.criteria.Predicate;


@Service
@RequiredArgsConstructor
public class StudentProfileService {
    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final StudentGuardianRepository guardianRepository;
    private final ClassMemberRepository classMemberRepository;

    @Transactional(readOnly = true)
    public StudentProfileResponse getOwnProfile(Long userId) {
        User user = student(userId);
        StudentProfile profile = profile(userId);
        return toProfileResponse(user, profile);
    }

    @Transactional
    public StudentProfileResponse updateOwnProfile(Long userId, UpdateStudentProfileRequest request) {
        User user = student(userId);
        StudentProfile profile = profile(userId);

        if (request.fullName() != null && !request.fullName().isBlank()) {
            user.setFullName(request.fullName().trim());
        }

        profile.update(request.dateOfBirth(), request.gender(), request.phone());

        if (request.guardians() != null) {
            guardianRepository.deleteAll(
                    guardianRepository.findAllByStudentProfileIdOrderByPrimaryDescIdAsc(profile.getId())
            );
            saveGuardians(profile, request.guardians());
        }

        return toProfileResponse(user, profile);
    }

    @Transactional(readOnly = true)
    public StudentDetailResponse getForTeacher(Long studentId, Long teacherId) {
        User user = student(studentId);
        ClassMember member = classMemberRepository
                .findAllByStudentAndTeacher(studentId, teacherId)
                .stream()
                .findFirst()
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));

        StudentProfile profile = profile(studentId);
        return new StudentDetailResponse(
                user.getId(),
                user.getFullName(),
                profile.getDateOfBirth(),
                profile.getGender(),
                user.getEmail(),
                profile.getPhone(),
                guardians(profile),
                member.getClassEntity().getId(),
                member.getClassEntity().getName(),
                member.getStatus(),
                user.getStatus().name()
        );
    }

    @Transactional(readOnly = true)
    public PageResponse<StudentSummaryResponse> listForTeacher(Long teacherId, String search, UserStatus status, Long classId,
                                                               Long gradeId, Boolean noClass, int page, int size) {

        Pageable pageable = PageRequest.of(Math.max(0, page - 1), size <= 0 ? 10 : size);

        Specification<User> specification = buildStudentSpecification(teacherId, search, status, classId, gradeId, noClass);

        Page<User> studentPage = userRepository.findAll(specification, pageable);

        List<Long> studentIds = studentPage.getContent()
                .stream()
                .map(User::getId)
                .toList();

        if (studentIds.isEmpty()) {
            return PageResponse.from(studentPage, List.of());
        }

        List<StudentProfile> profiles = profileRepository.findAllByUserIdIn(studentIds);

        Map<Long, StudentProfile> profileMap = profiles.stream()
                .collect(Collectors.toMap(
                        profile -> profile.getUser().getId(),
                        profile -> profile
                ));

        List<Long> profileIds = profiles.stream()
                .map(StudentProfile::getId)
                .toList();

        List<StudentGuardian> guardians =
                profileIds.isEmpty()
                        ? List.of()
                        : guardianRepository
                        .findAllByStudentProfileIdInOrderByPrimaryDescIdAsc(
                                profileIds
                        );

        Map<Long, StudentGuardianResponse> primaryGuardians =
                guardians.stream()
                        .filter(StudentGuardian::isPrimary)
                        .collect(Collectors.toMap(
                                guardian -> guardian
                                        .getStudentProfile()
                                        .getUser()
                                        .getId(),
                                StudentGuardianResponse::from,
                                (first, ignored) -> first
                        ));

        List<ClassMember> memberships =
                classMemberRepository.findAllByTeacherIdAndUserIdIn(
                        teacherId,
                        studentIds
                );

        Map<Long, List<ClassMember>> membershipMap =
                memberships.stream()
                        .collect(Collectors.groupingBy(
                                member -> member.getUser().getId()
                        ));

        List<StudentSummaryResponse> responses =
                studentPage.getContent()
                        .stream()
                        .map(student ->
                                StudentSummaryResponse.from(
                                        student,
                                        membershipMap.getOrDefault(
                                                student.getId(),
                                                List.of()
                                        ),
                                        profileMap.get(student.getId()),
                                        primaryGuardians.get(student.getId())
                                )
                        )
                        .toList();

        return PageResponse.from(
                studentPage,
                responses
        );
    }


    private Specification<User> buildStudentSpecification(Long teacherId, String search, UserStatus status, Long classId,
                                                          Long gradeId, Boolean noClass) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // Only students
            predicates.add(cb.equal(root.get("role"), Role.STUDENT));

            // Teacher scope
            Subquery<Long> teacherScope = query.subquery(Long.class);

            Root<ClassMember> teacherMember = teacherScope.from(ClassMember.class);

            teacherScope.select(teacherMember.get("id"));

            teacherScope.where(cb.equal(teacherMember.get("user").get("id"), root.get("id")),
                    cb.equal(teacherMember.get("classEntity").get("teacher").get("id"), teacherId));

            predicates.add(cb.exists(teacherScope));

            // Search
            if (StringUtils.hasText(search)) {
                predicates.add(buildSearchPredicate(root, query, cb, search));
            }

            // Account status
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            // Class filter
            if (classId != null) {
                predicates.add(buildClassPredicate(root, query, cb, classId));
            }

            // Grade filter
            if (gradeId != null) {
                predicates.add(buildGradePredicate(root, query, cb, gradeId));
            }

            // No class
            if (Boolean.TRUE.equals(noClass)) {
                predicates.add(buildNoClassPredicate(root, query, cb));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }

    private Predicate buildSearchPredicate(
            Root<User> root,
            CriteriaQuery<?> query,
            CriteriaBuilder cb,
            String search
    ) {
        String keyword = "%" +
                search.trim().toLowerCase() +
                "%";

        Predicate namePredicate = cb.like(
                cb.lower(root.get("fullName")),
                keyword
        );

        Predicate emailPredicate = cb.like(
                cb.lower(root.get("email")),
                keyword
        );

        Subquery<Long> phoneSubquery =
                query.subquery(Long.class);

        Root<StudentProfile> profile =
                phoneSubquery.from(StudentProfile.class);

        phoneSubquery.select(
                profile.get("id")
        );

        phoneSubquery.where(
                cb.equal(
                        profile.get("user").get("id"),
                        root.get("id")
                ),
                cb.like(
                        cb.lower(profile.get("phone")),
                        keyword
                )
        );

        Predicate phonePredicate = cb.exists(phoneSubquery);

        return cb.or(
                namePredicate,
                emailPredicate,
                phonePredicate
        );
    }

    private Predicate buildClassPredicate(
            Root<User> root,
            CriteriaQuery<?> query,
            CriteriaBuilder cb,
            Long classId
    ) {
        Subquery<Long> subquery = query.subquery(Long.class);

        Root<ClassMember> member =
                subquery.from(ClassMember.class);

        subquery.select(member.get("id"));

        subquery.where(
                cb.equal(
                        member.get("user").get("id"),
                        root.get("id")
                ),
                cb.equal(
                        member.get("classEntity").get("id"),
                        classId
                ),
                cb.equal(
                        member.get("status"),
                        "ACTIVE"
                )
        );

        return cb.exists(subquery);
    }

    private Predicate buildGradePredicate(
            Root<User> root,
            CriteriaQuery<?> query,
            CriteriaBuilder cb,
            Long gradeId
    ) {
        Subquery<Long> subquery = query.subquery(Long.class);

        Root<ClassMember> member =
                subquery.from(ClassMember.class);

        subquery.select(member.get("id"));

        subquery.where(
                cb.equal(
                        member.get("user").get("id"),
                        root.get("id")
                ),
                cb.equal(
                        member
                                .get("classEntity")
                                .get("grade")
                                .get("id"),
                        gradeId
                ),
                cb.equal(
                        member.get("status"),
                        "ACTIVE"
                )
        );

        return cb.exists(subquery);
    }

    private Predicate buildNoClassPredicate(
            Root<User> root,
            CriteriaQuery<?> query,
            CriteriaBuilder cb
    ) {
        Subquery<Long> subquery = query.subquery(Long.class);

        Root<ClassMember> member =
                subquery.from(ClassMember.class);

        subquery.select(member.get("id"));

        subquery.where(
                cb.equal(
                        member.get("user").get("id"),
                        root.get("id")
                ),
                cb.equal(
                        member.get("status"),
                        "ACTIVE"
                )
        );

        return cb.not(cb.exists(subquery));
    }

    private User student(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        if (user.getRole() != Role.STUDENT) {
            throw new AppException(ErrorCode.STUDENT_NOT_FOUND);
        }
        return user;
    }

    private StudentProfile profile(Long id) {
        return profileRepository.findByUserId(id)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));
    }

    private void saveGuardians(StudentProfile profile, List<StudentGuardianRequest> requests) {
        boolean primary = false;
        for (StudentGuardianRequest request : requests) {
            if (request.primary() && primary) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            primary |= request.primary();
            guardianRepository.save(new StudentGuardian(
                    profile,
                    request.relationship(),
                    request.fullName().trim(),
                    request.phone().trim(),
                    request.email(),
                    request.primary()
            ));
        }
    }

    private List<StudentGuardianResponse> guardians(StudentProfile profile) {
        return guardianRepository.findAllByStudentProfileIdOrderByPrimaryDescIdAsc(profile.getId())
                .stream()
                .map(g -> new StudentGuardianResponse(
                        g.getId(),
                        g.getRelationship(),
                        g.getFullName(),
                        g.getPhone(),
                        g.getEmail(),
                        g.isPrimary()
                ))
                .toList();
    }

    private StudentProfileResponse toProfileResponse(User user, StudentProfile profile) {
        StudentClassResponse current = classMemberRepository
                .findActiveMembershipsByUserId(user.getId())
                .stream()
                .findFirst()
                .map(m -> new StudentClassResponse(
                        m.getClassEntity().getId(),
                        m.getClassEntity().getName(),
                        m.getClassEntity().getGrade().getId(),
                        m.getClassEntity().getGrade().getName(),
                        m.getClassEntity().getAcademicYear(),
                        m.getStatus()
                ))
                .orElse(null);

        return new StudentProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getFullName(),
                profile.getDateOfBirth(),
                profile.getGender(),
                profile.getPhone(),
                guardians(profile),
                current,
                user.getStatus().name()
        );
    }
}
