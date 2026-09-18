package e_learning.server.classmanagement.repository;

import e_learning.server.classmanagement.entity.ClassMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

public interface ClassMemberRepository extends JpaRepository<ClassMember, Long> {

    @Query("select count(member) from ClassMember member where member.classEntity.id = :classId and member.status = 'ACTIVE'")
    long countActiveMembers(Long classId);
}