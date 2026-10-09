package e_learning.server.student.service;

import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.entity.ClassStatus;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.classes.repository.ClassRepository;
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
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentManagementService {
    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final StudentGuardianRepository guardianRepository;
    private final ClassRepository classRepository;
    private final ClassMemberRepository classMemberRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public StudentDetailResponse create(CreateStudentRequest request, Long teacherId) {
        ClassEntity classEntity = ownedClass(request.classId(), teacherId);
        ensureClassActive(classEntity);

        if (userRepository.findByEmailIgnoreCase(request.email().trim()).isPresent()) {
            throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        }

        User user = userRepository.save(new User(
                request.email().trim().toLowerCase(),
                passwordEncoder.encode(request.password()),
                request.fullName().trim(),
                Role.STUDENT
        ));

        StudentProfile profile = profileRepository.save(
                new StudentProfile(user, request.dateOfBirth(), request.gender(), request.phone())
        );

        saveGuardians(profile, request.guardians());
        ClassMember member = classMemberRepository.save(new ClassMember(classEntity, user));

        return detail(user, profile, member);
    }

    @Transactional
    public void addToClass(Long classId, Long studentId, Long teacherId) {
        ClassEntity classEntity = ownedClass(classId, teacherId);
        ensureClassActive(classEntity);

        User student = lockedStudent(studentId);
        if (classMemberRepository.findActiveMembershipByUserId(studentId).isPresent()) {
            throw new AppException(ErrorCode.STUDENT_ALREADY_IN_CLASS);
        }

        ClassMember member = classMemberRepository
                .findByClassEntityIdAndUserId(classId, studentId)
                .orElse(null);
        if (member != null) {
            member.setStatus("ACTIVE");
            return;
        }

        classMemberRepository.save(new ClassMember(classEntity, student));
    }

    @Transactional
    public void transferToClass(Long targetClassId, Long studentId, Long teacherId) {
        ClassEntity targetClass = ownedClass(targetClassId, teacherId);
        ensureClassActive(targetClass);

        User student = lockedStudent(studentId);
        ClassMember current = classMemberRepository.findActiveMembershipByUserId(studentId)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_IN_ACTIVE_CLASS));

        ClassEntity sourceClass = current.getClassEntity();

        if (sourceClass.getId().equals(targetClassId)) {
            throw new AppException(ErrorCode.STUDENT_ALREADY_IN_CLASS);
        }

        if (!sourceClass.getTeacher().getId().equals(teacherId)) {
            throw new AppException(ErrorCode.CLASS_NOT_FOUND);
        }

        current.setStatus("INACTIVE");
        classMemberRepository.flush();

        ClassMember targetMembership = classMemberRepository
                .findByClassEntityIdAndUserId(targetClassId, studentId)
                .orElse(null);

        if (targetMembership == null) {
            classMemberRepository.save(new ClassMember(targetClass, student));
        } else {
            targetMembership.setStatus("ACTIVE");
        }
    }

    @Transactional
    public void removeFromClass(Long classId, Long studentId, Long teacherId) {
        ownedClass(classId, teacherId);
        lockedStudent(studentId);
        ClassMember member = classMemberRepository
                .findByClassEntityIdAndUserId(classId, studentId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_MEMBER_NOT_FOUND));
        member.setStatus("INACTIVE");
    }

    @Transactional
    public void updateStatus(Long studentId, UserStatus status, Long teacherId) {
        studentForTeacher(studentId, teacherId);
        User student = student(studentId);
        student.setStatus(status);
    }

    @Transactional(readOnly = true)
    public List<StudentSummaryResponse> listClass(Long classId, Long teacherId) {
        ownedClass(classId, teacherId);
        return classMemberRepository.findStudentsByClassId(classId).stream()
                .map(member -> new StudentSummaryResponse(
                        member.getUser().getId(),
                        member.getUser().getFullName(),
                        member.getUser().getEmail(),
                        null,
                        List.of(new StudentClassSummary(
                                member.getClassEntity().getId(),
                                member.getClassEntity().getName(),
                                member.getClassEntity().getGrade().getId(),
                                member.getClassEntity().getGrade().getName(),
                                member.getClassEntity().getAcademicYear(),
                                member.getStatus()
                        )),
                        null,
                        member.getUser().getStatus().name()
                ))
                .toList();
    }

    private User studentForTeacher(Long studentId, Long teacherId) {
        student(studentId);
        if (classMemberRepository.findAllByStudentAndTeacher(studentId, teacherId).isEmpty()) {
            throw new AppException(ErrorCode.STUDENT_NOT_FOUND);
        }
        return student(studentId);
    }

    private ClassEntity ownedClass(Long classId, Long teacherId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));

        if (!classEntity.getTeacher().getId().equals(teacherId)) {
            throw new AppException(ErrorCode.CLASS_NOT_FOUND);
        }

        return classEntity;
    }

    private void ensureClassActive(ClassEntity classEntity) {
        if (classEntity.getStatus() == ClassStatus.ARCHIVED) {
            throw new AppException(ErrorCode.CLASS_NOT_FOUND);
        }
    }

    private User lockedStudent(Long id) {
        User user = userRepository.findByIdForMembershipUpdate(id)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        if (user.getRole() != Role.STUDENT) {
            throw new AppException(ErrorCode.STUDENT_NOT_FOUND);
        }
        return user;
    }

    private User student(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.STUDENT_NOT_FOUND));
        if (user.getRole() != Role.STUDENT) {
            throw new AppException(ErrorCode.STUDENT_NOT_FOUND);
        }
        return user;
    }

    private void saveGuardians(StudentProfile profile, List<StudentGuardianRequest> requests) {
        if (requests == null) {
            return;
        }

        boolean primarySeen = false;
        for (StudentGuardianRequest request : requests) {
            if (request.primary() && primarySeen) {
                throw new AppException(ErrorCode.INVALID_REQUEST);
            }
            primarySeen |= request.primary();

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

    private StudentDetailResponse detail(User user, StudentProfile profile, ClassMember member) {
        List<StudentGuardianResponse> guardians = guardianRepository
                .findAllByStudentProfileIdOrderByPrimaryDescIdAsc(profile.getId())
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

        return new StudentDetailResponse(
                user.getId(),
                user.getFullName(),
                profile.getDateOfBirth(),
                profile.getGender(),
                user.getEmail(),
                profile.getPhone(),
                guardians,
                member.getClassEntity().getId(),
                member.getClassEntity().getName(),
                member.getStatus(),
                user.getStatus().name()
        );
    }
}
