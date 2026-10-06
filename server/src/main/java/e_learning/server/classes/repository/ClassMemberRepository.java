package e_learning.server.classes.repository;

import e_learning.server.classes.entity.ClassMember;
import e_learning.server.student.dto.StudentSummaryResponse;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ClassMemberRepository extends JpaRepository<ClassMember, Long> {

    @Query("""
        select count(member)
        from ClassMember member
        where member.classEntity.id = :classId
          and member.status = 'ACTIVE'
        """)
    long countActiveMembers(Long classId);

    Optional<ClassMember> findByClassEntityIdAndUserId(Long classId, Long userId);

    boolean existsByClassEntityIdAndUserId(Long classId, Long userId);

    @Query("""
        select member
        from ClassMember member
        join fetch member.classEntity classEntity
        where member.user.id = :userId
          and member.status = 'ACTIVE'
        order by classEntity.academicYear desc, classEntity.id desc
        """)
    List<ClassMember> findActiveMembershipsByUserId(Long userId);

    @Query("""
        select member
        from ClassMember member
        join fetch member.classEntity classEntity
        where member.user.id = :studentId
          and classEntity.teacher.id = :teacherId
          and member.status = 'ACTIVE'
        order by classEntity.academicYear desc, classEntity.id desc
        """)
    List<ClassMember> findActiveMembershipsByStudentAndTeacher(
            Long studentId,
            Long teacherId
    );

    @Query("""
        select new e_learning.server.student.dto.StudentSummaryResponse(
            member.user.id,
            member.user.fullName,
            member.user.email,
            profile.phone,
            classEntity.name,
            member.status
        )
        from ClassMember member
        join member.classEntity classEntity
        join e_learning.server.student.entity.StudentProfile profile
            on profile.user.id = member.user.id
        where classEntity.teacher.id = :teacherId
          and member.user.role = e_learning.server.user.entity.Role.STUDENT
        order by member.user.fullName, classEntity.name
        """)
    List<StudentSummaryResponse> findStudentsByTeacherId(Long teacherId);

    @Query("""
        select new e_learning.server.student.dto.StudentSummaryResponse(
            member.user.id,
            member.user.fullName,
            member.user.email,
            profile.phone,
            classEntity.name,
            member.status
        )
        from ClassMember member
        join member.classEntity classEntity
        join e_learning.server.student.entity.StudentProfile profile
            on profile.user.id = member.user.id
        where classEntity.id = :classId
          and member.user.role = e_learning.server.user.entity.Role.STUDENT
        order by member.user.fullName
        """)
    List<StudentSummaryResponse> findStudentsByClassId(Long classId);
}