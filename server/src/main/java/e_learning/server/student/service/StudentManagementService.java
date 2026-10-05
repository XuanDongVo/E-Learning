package e_learning.server.student.service;

import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.entity.ClassMember;
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
        if (userRepository.findByEmailIgnoreCase(request.email().trim()).isPresent()) throw new AppException(ErrorCode.EMAIL_ALREADY_EXISTS);
        User user = userRepository.save(new User(request.email().trim().toLowerCase(), passwordEncoder.encode(request.password()), request.fullName().trim(), Role.STUDENT));
        StudentProfile profile = profileRepository.save(new StudentProfile(user, request.dateOfBirth(), request.gender(), request.phone()));
        saveGuardians(profile, request.guardians());
        ClassMember member = classMemberRepository.save(new ClassMember(classEntity, user));
        return detail(user, profile, member);
    }

    @Transactional
    public void addToClass(Long classId, Long studentId, Long teacherId) {
        ClassEntity classEntity = ownedClass(classId, teacherId);
        User student = student(studentId);
        ClassMember member = classMemberRepository.findByClassEntityIdAndUserId(classId, studentId).orElse(null);
        if (member != null) {
            if ("ACTIVE".equals(member.getStatus())) throw new AppException(ErrorCode.STUDENT_ALREADY_IN_CLASS);
            member.setStatus("ACTIVE");
            return;
        }
        classMemberRepository.save(new ClassMember(classEntity, student));
    }

    @Transactional
    public void removeFromClass(Long classId, Long studentId, Long teacherId) {
        ownedClass(classId, teacherId);
        ClassMember member = classMemberRepository.findByClassEntityIdAndUserId(classId, studentId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_MEMBER_NOT_FOUND));
        member.setStatus("INACTIVE");
    }

    @Transactional(readOnly=true)
    public List<StudentSummaryResponse> listClass(Long classId, Long teacherId) {
        ownedClass(classId, teacherId);
        return classMemberRepository.findStudentsByClassId(classId);
    }

    private ClassEntity ownedClass(Long classId, Long teacherId) {
        ClassEntity c=classRepository.findById(classId).orElseThrow(()->new AppException(ErrorCode.CLASS_NOT_FOUND));
        if(!c.getTeacher().getId().equals(teacherId)) throw new AppException(ErrorCode.CLASS_NOT_FOUND);
        return c;
    }
    private User student(Long id){User u=userRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.STUDENT_NOT_FOUND));if(u.getRole()!=Role.STUDENT)throw new AppException(ErrorCode.STUDENT_NOT_FOUND);return u;}
    private void saveGuardians(StudentProfile p,List<StudentGuardianRequest> requests){if(requests==null)return;boolean primarySeen=false;for(StudentGuardianRequest r:requests){if(r.primary()&&primarySeen)throw new AppException(ErrorCode.INVALID_REQUEST);primarySeen|=r.primary();guardianRepository.save(new StudentGuardian(p,r.relationship(),r.fullName().trim(),r.phone().trim(),r.email(),r.primary()));}}
    private StudentDetailResponse detail(User u,StudentProfile p,ClassMember m){List<StudentGuardianResponse> gs=guardianRepository.findAllByStudentProfileIdOrderByPrimaryDescIdAsc(p.getId()).stream().map(g->new StudentGuardianResponse(g.getId(),g.getRelationship(),g.getFullName(),g.getPhone(),g.getEmail(),g.isPrimary())).toList();return new StudentDetailResponse(u.getId(),u.getFullName(),p.getDateOfBirth(),p.getGender(),u.getEmail(),p.getPhone(),gs,m.getClassEntity().getId(),m.getClassEntity().getName(),m.getStatus(),u.getStatus().name());}
}
