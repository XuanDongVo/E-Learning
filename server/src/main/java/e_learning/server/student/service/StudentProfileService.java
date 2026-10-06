package e_learning.server.student.service;

import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.student.dto.*;
import e_learning.server.student.entity.StudentGuardian;
import e_learning.server.student.entity.StudentProfile;
import e_learning.server.student.repository.StudentGuardianRepository;
import e_learning.server.student.repository.StudentProfileRepository;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

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
    public List<StudentSummaryResponse> listForTeacher(Long teacherId) {
        List<User> students = userRepository.findAllByRoleOrderByFullNameAsc(Role.STUDENT);
        List<ClassMember> memberships = classMemberRepository.findAllByTeacherId(teacherId);

        Map<Long, List<ClassMember>> membershipMap = memberships.stream()
                .collect(Collectors.groupingBy(member -> member.getUser().getId()));

        List<Long> studentIds = students.stream().map(User::getId).toList();
        List<StudentProfile> profiles = studentIds.isEmpty()
                ? List.of()
                : profileRepository.findAllByUserIdIn(studentIds);

        Map<Long, StudentProfile> profileMap = profiles.stream()
                .collect(Collectors.toMap(profile -> profile.getUser().getId(), profile -> profile));

        List<Long> profileIds = profiles.stream().map(StudentProfile::getId).toList();
        List<StudentGuardian> guardians = profileIds.isEmpty()
                ? List.of()
                : guardianRepository.findAllByStudentProfileIdInOrderByPrimaryDescIdAsc(profileIds);

        Map<Long, StudentGuardianResponse> primaryGuardians = guardians.stream()
                .filter(StudentGuardian::isPrimary)
                .collect(Collectors.toMap(
                        guardian -> guardian.getStudentProfile().getUser().getId(),
                        guardian -> new StudentGuardianResponse(
                                guardian.getId(),
                                guardian.getRelationship(),
                                guardian.getFullName(),
                                guardian.getPhone(),
                                guardian.getEmail(),
                                true
                        ),
                        (first, ignored) -> first
                ));

        return students.stream()
                .filter(student -> membershipMap.containsKey(student.getId()))
                .map(student -> new StudentSummaryResponse(
                        student.getId(),
                        student.getFullName(),
                        student.getEmail(),
                        profileMap.get(student.getId()) == null ? null : profileMap.get(student.getId()).getPhone(),
                        membershipMap.getOrDefault(student.getId(), List.of()).stream()
                                .map(member -> new StudentClassSummary(
                                        member.getClassEntity().getId(),
                                        member.getClassEntity().getName(),
                                        member.getClassEntity().getGrade().getId(),
                                        member.getClassEntity().getGrade().getName(),
                                        member.getClassEntity().getAcademicYear(),
                                        member.getStatus()
                                ))
                                .toList(),
                        primaryGuardians.get(student.getId()),
                        student.getStatus().name()
                ))
                .toList();
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
