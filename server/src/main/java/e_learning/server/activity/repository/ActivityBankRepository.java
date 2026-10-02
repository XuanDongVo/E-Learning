package e_learning.server.activity.repository;

import e_learning.server.activity.entity.ActivityBank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ActivityBankRepository extends JpaRepository<ActivityBank, Long> {

    List<ActivityBank> findByActivityIdOrderByDisplayOrderAsc(Long activityId);

    void deleteByActivityId(Long activityId);
}
