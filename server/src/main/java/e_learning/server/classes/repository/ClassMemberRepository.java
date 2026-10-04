package e_learning.server.classes.repository;

import e_learning.server.classes.entity.ClassMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import e_learning.server.classes.dto.ClassMemberResponse;
import java.util.List;

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
}