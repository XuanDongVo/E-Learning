package e_learning.server.user.repository;

import e_learning.server.user.entity.Role;
import e_learning.server.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface UserRepository
        extends JpaRepository<User, Long>, JpaSpecificationExecutor<User> {

    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findAllByRoleOrderByFullNameAsc(Role role);
}