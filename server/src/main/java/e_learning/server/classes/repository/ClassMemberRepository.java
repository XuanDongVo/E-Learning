package e_learning.server.classes.repository;

import e_learning.server.classes.dto.ClassMemberResponse;
import e_learning.server.classes.entity.ClassMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;
import java.util.Optional;

public interface ClassMemberRepository extends JpaRepository<ClassMember, Long> {

    @Query("select count(member) from ClassMember member where member.classEntity.id = :classId and member.status = 'ACTIVE'")
    long countActiveMembers(Long classId);

    @Query("""
        select new e_learning.server.classes.dto.ClassMemberResponse(
            member.user.id, member.user.fullName, member.user.email, member.status)
        from ClassMember member
        where member.classEntity.id = :classId
        order by member.user.fullName
        """)
    List<ClassMemberResponse> findMembers(Long classId);

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
}
