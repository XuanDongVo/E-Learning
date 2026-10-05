package e_learning.server.student.service;

import e_learning.server.classes.entity.ClassMember;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.student.dto.*;
import e_learning.server.student.entity.StudentProfile;
import e_learning.server.student.repository.StudentGuardianRepository;
import e_learning.server.student.repository.StudentProfileRepository;
import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class StudentProfileService {
    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final StudentGuardianRepository guardianRepository;
    private final ClassMemberRepository classMemberRepository;

    @Transactional(readOnly=true)
    public StudentProfileResponse getOwnProfile(Long userId) {
        User user=student(userId);
        StudentProfile profile=profile(userId);
        return toProfileResponse(user,profile);
    }

    @Transactional
    public StudentProfileResponse updateOwnProfile(Long userId,UpdateStudentProfileRequest request) {
        User user=student(userId);
        StudentProfile profile=profile(userId);
        if(request.fullName()!=null&&!request.fullName().isBlank()) user.setFullName(request.fullName().trim());
        profile.update(request.dateOfBirth(),request.gender(),request.phone());
        return toProfileResponse(user,profile);
    }

    @Transactional(readOnly=true)
    public StudentDetailResponse getForTeacher(Long studentId,Long teacherId) {
        User user=student(studentId);
        ClassMember member=classMemberRepository.findActiveMembershipsByStudentAndTeacher(studentId,teacherId).stream().findFirst().orElseThrow(()->new AppException(ErrorCode.STUDENT_NOT_FOUND));
        StudentProfile profile=profile(studentId);
        List<StudentGuardianResponse> guardians=guardians(profile);
        return new StudentDetailResponse(user.getId(),user.getFullName(),profile.getDateOfBirth(),profile.getGender(),user.getEmail(),profile.getPhone(),guardians,member.getClassEntity().getId(),member.getClassEntity().getName(),member.getStatus(),user.getStatus().name());
    }

    @Transactional(readOnly=true)
    public List<StudentSummaryResponse> listForTeacher(Long teacherId){ return classMemberRepository.findStudentsByTeacherId(teacherId); }

    private User student(Long id){
        User user=userRepository.findById(id).orElseThrow(()->new AppException(ErrorCode.USER_NOT_FOUND));
        if(user.getRole()!=Role.STUDENT) throw new AppException(ErrorCode.STUDENT_NOT_FOUND);
        return user;
    }
    private StudentProfile profile(Long id){return profileRepository.findByUserId(id).orElseThrow(()->new AppException(ErrorCode.STUDENT_PROFILE_NOT_FOUND));}
    private List<StudentGuardianResponse> guardians(StudentProfile p){
        return guardianRepository.findAllByStudentProfileIdOrderByPrimaryDescIdAsc(p.getId()).stream().map(g->new StudentGuardianResponse(g.getId(),g.getRelationship(),g.getFullName(),g.getPhone(),g.getEmail(),g.isPrimary())).toList();
    }
    private StudentProfileResponse toProfileResponse(User user,StudentProfile profile){
        StudentClassResponse current=classMemberRepository.findActiveMembershipsByUserId(user.getId()).stream().findFirst().map(m->new StudentClassResponse(m.getClassEntity().getId(),m.getClassEntity().getName(),m.getClassEntity().getGrade().getId(),m.getClassEntity().getGrade().getName(),m.getClassEntity().getAcademicYear(),m.getStatus())).orElse(null);
        return new StudentProfileResponse(user.getId(),user.getEmail(),user.getFullName(),profile.getDateOfBirth(),profile.getGender(),profile.getPhone(),guardians(profile),current,user.getStatus().name());
    }
}
