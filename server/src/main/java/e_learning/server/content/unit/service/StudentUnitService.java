package e_learning.server.content.unit.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.unit.dto.student.StudentUnitDetailResponse;
import e_learning.server.content.unit.dto.student.StudentUnitSummaryResponse;
import e_learning.server.user.entity.User;
import e_learning.server.user.entity.UserStatus;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class StudentUnitService {
    private final UserRepository userRepository;



    public List<StudentUnitSummaryResponse> getMyUnits(Long studentId) {
        // 1. Resolve the student's active class and grade.
        User user = userRepository.findById(studentId).orElseThrow( () -> new AppException(ErrorCode.USER_NOT_FOUND));

        if (user.getStatus().equals(UserStatus.INACTIVE)) throw new AppException(ErrorCode.USER_NOT_FOUND);



        // 2. Fetch published units belonging to that grade.

        // 3. Calculate published section and activity counts.
        // 4. Resolve cover URLs.
        // 5. Map results to StudentUnitSummaryResponse.

        throw new UnsupportedOperationException(
                "getMyUnits is not implemented yet"
        );
    }

    /**
     * Get a published unit and its visible content.
     */
    public StudentUnitDetailResponse getMyUnit(
            Long studentId,
            Long unitId
    ) {
        // TODO:
        // 1. Resolve the student's active class and grade.
        // 2. Find the unit and verify that it belongs to the student's grade
        //    and has PUBLISHED status.
        // 3. Fetch published sections and their published topics.
        // 4. Fetch published activities belonging to the unit.
        // 5. Resolve topicIds for each activity from its question banks.
        // 6. Resolve cover URL and calculate visible content counts.
        // 7. Map everything to StudentUnitDetailResponse.

        throw new UnsupportedOperationException(
                "getMyUnit is not implemented yet"
        );
    }
}