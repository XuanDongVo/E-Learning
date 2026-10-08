package e_learning.server.classes.repository;

import e_learning.server.classes.entity.ClassMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface ClassMemberRepository extends JpaRepository<ClassMember, Long> {

    @Query("select count(member) from ClassMember member where member.classEntity.id = :classId and member.status = 'ACTIVE'")
    long countActiveMembers(Long classId);

    Optional<ClassMember> findByClassEntityIdAndUserId(Long classId, Long userId);

    boolean existsByClassEntityIdAndUserId(Long classId, Long userId);

    @Query("select member from ClassMember member join fetch member.classEntity classEntity join fetch classEntity.grade where member.user.id = :userId and member.status = 'ACTIVE' order by classEntity.academicYear desc, classEntity.id desc")
    List<ClassMember> findActiveMembershipsByUserId(Long userId);

    boolean existsByUserIdAndClassEntityGradeIdAndStatus(Long userId, Long gradeId, String status);

    @Query("select member from ClassMember member join fetch member.classEntity classEntity join fetch classEntity.grade where member.user.id = :studentId and classEntity.teacher.id = :teacherId order by member.status desc, classEntity.academicYear desc, classEntity.id desc")
    List<ClassMember> findAllByStudentAndTeacher(Long studentId, Long teacherId);

    @Query("select member from ClassMember member join fetch member.user join fetch member.classEntity classEntity join fetch classEntity.grade where classEntity.teacher.id = :teacherId order by member.user.fullName, classEntity.academicYear desc, classEntity.id desc")
    List<ClassMember> findAllByTeacherId(Long teacherId);

    @Query("select member from ClassMember member join fetch member.user join fetch member.classEntity classEntity join fetch classEntity.grade where classEntity.id = :classId and member.user.role = e_learning.server.user.entity.Role.STUDENT order by member.user.fullName")
    List<ClassMember> findStudentsByClassId(Long classId);

    @Query("""
        select member
        from ClassMember member
        join fetch member.user
        join fetch member.classEntity classEntity
        join fetch classEntity.grade
        where classEntity.teacher.id = :teacherId
          and member.user.id in :studentIds
        order by member.user.fullName,
                 classEntity.academicYear desc,
                 classEntity.id desc
        """)
    List<ClassMember> findAllByTeacherIdAndUserIdIn(
            Long teacherId,
            Collection<Long> studentIds
    );
}
