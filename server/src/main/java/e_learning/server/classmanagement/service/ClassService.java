package e_learning.server.classmanagement.service;

import e_learning.server.classmanagement.dto.ClassResponse;
import e_learning.server.classmanagement.dto.CreateClassRequest;
import e_learning.server.classmanagement.entity.ClassEntity;
import e_learning.server.classmanagement.repository.ClassMemberRepository;
import e_learning.server.classmanagement.repository.ClassRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ClassService {

    private final ClassRepository classRepository;
    private final ClassMemberRepository classMemberRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<ClassResponse> findByTeacher(Long teacherId) {
        return classRepository.findAllByTeacherId(teacherId).stream()
            .map(classEntity -> ClassResponse.from(classEntity, classMemberRepository.countActiveMembers(classEntity.getId())))
                .toList();
    }

    @Transactional
    public ClassResponse create(CreateClassRequest request, Long teacherId) {
        if (classRepository.existsByNameIgnoreCaseAndAcademicYearAndTeacherId(request.name().trim(), request.academicYear().trim(), teacherId)) {
            throw new AppException(ErrorCode.CLASS_ALREADY_EXISTS);
        }
        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        ClassEntity classEntity = classRepository.save(new ClassEntity(request.name().trim(), request.grade(), request.academicYear().trim(), teacher));
        return ClassResponse.from(classEntity, 0);
    }
}