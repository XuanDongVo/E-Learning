package e_learning.server.classes.service;

import e_learning.server.classes.dto.ClassResponse;
import e_learning.server.classes.dto.CreateClassRequest;
import e_learning.server.classes.dto.UpdateClassRequest;
import e_learning.server.classes.entity.ClassEntity;
import e_learning.server.classes.repository.ClassMemberRepository;
import e_learning.server.classes.repository.ClassRepository;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.user.entity.User;
import e_learning.server.user.repository.UserRepository;
import e_learning.server.grades.entity.Grade;
import e_learning.server.grades.repository.GradeRepository;
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
    private final GradeRepository gradeRepository;

    @Transactional(readOnly = true)
    public List<ClassResponse> findByTeacher(Long teacherId) {
        return classRepository.findAllByTeacherId(teacherId).stream()
                .map(classEntity -> ClassResponse.from(
                        classEntity,
                        classMemberRepository.countActiveMembers(classEntity.getId())
                ))
                .toList();
    }

    @Transactional
    public ClassResponse create(CreateClassRequest request, Long teacherId) {
        String name = request.name().trim();
        String academicYear = request.academicYear().trim();

        if (classRepository.existsByNameIgnoreCaseAndAcademicYearAndTeacherId(name, academicYear, teacherId)) {
            throw new AppException(ErrorCode.CLASS_ALREADY_EXISTS);
        }

        User teacher = userRepository.findById(teacherId)
                .orElseThrow(() -> new AppException(ErrorCode.USER_NOT_FOUND));
        Grade grade = gradeRepository.findById(request.gradeId())
                .orElseThrow(() -> new AppException(ErrorCode.GRADE_NOT_FOUND));

        ClassEntity classEntity = classRepository.save(
                new ClassEntity(name, grade, academicYear, teacher)
        );
        return ClassResponse.from(classEntity, 0);
    }

    @Transactional
    public ClassResponse update(Long classId, UpdateClassRequest request, Long teacherId) {
        ClassEntity classEntity = ownedClass(classId, teacherId);
        String name = request.name().trim();
        String academicYear = request.academicYear().trim();

        if (!classEntity.getName().equalsIgnoreCase(name)
                || !classEntity.getAcademicYear().equals(academicYear)) {
            if (classRepository.existsByNameIgnoreCaseAndAcademicYearAndTeacherId(name, academicYear, teacherId)) {
                throw new AppException(ErrorCode.CLASS_ALREADY_EXISTS);
            }
        }

        Grade grade = gradeRepository.findById(request.gradeId())
                .orElseThrow(() -> new AppException(ErrorCode.GRADE_NOT_FOUND));

        classEntity.update(name, grade, academicYear);
        return ClassResponse.from(
                classEntity,
                classMemberRepository.countActiveMembers(classId)
        );
    }

    @Transactional
    public ClassResponse archive(Long classId, Long teacherId) {
        ClassEntity classEntity = ownedClass(classId, teacherId);
        classEntity.archive();
        return ClassResponse.from(
                classEntity,
                classMemberRepository.countActiveMembers(classId)
        );
    }

    private ClassEntity ownedClass(Long classId, Long teacherId) {
        ClassEntity classEntity = classRepository.findById(classId)
                .orElseThrow(() -> new AppException(ErrorCode.CLASS_NOT_FOUND));

        if (!classEntity.getTeacher().getId().equals(teacherId)) {
            throw new AppException(ErrorCode.CLASS_NOT_FOUND);
        }

        return classEntity;
    }
}
