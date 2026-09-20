package e_learning.server.grades.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.grades.dto.CreateGradeRequest;
import e_learning.server.grades.dto.GradeResponse;
import e_learning.server.grades.entity.Grade;
import e_learning.server.grades.entity.GradeStatus;
import e_learning.server.grades.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class GradeService {
    private final GradeRepository gradeRepository;

    @Transactional(readOnly = true)
    public List<GradeResponse> findActive() {
        return gradeRepository.findAllByStatusOrderByDisplayOrderAsc(GradeStatus.ACTIVE)
                .stream()
                .map(GradeResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<GradeResponse> findAll() {
        return gradeRepository.findAllByOrderByDisplayOrderAsc()
                .stream()
                .map(GradeResponse::from)
                .toList();
    }

    @Transactional
    public GradeResponse createGrade(CreateGradeRequest request) {
        String code = request.code().trim();
        String name = request.name().trim();

        if (gradeRepository.existsByCodeIgnoreCase(code)) {
            throw new AppException(ErrorCode.GRADE_ALREADY_EXISTS);
        }
        if (gradeRepository.existsByNameIgnoreCase(name)) {
            throw new AppException(ErrorCode.GRADE_ALREADY_EXISTS);
        }

        Grade grade = new Grade(code, name, request.displayOrder(), GradeStatus.ACTIVE);
        return GradeResponse.from(gradeRepository.save(grade));
    }

    @Transactional
    public GradeResponse updateGrade(Long gradeId, CreateGradeRequest request) {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new AppException(ErrorCode.GRADE_NOT_FOUND));

        String newCode = request.code().trim();
        String newName = request.name().trim();

        if (gradeRepository.existsByCodeIgnoreCaseAndIdNot(newCode, gradeId)) {
            throw new AppException(ErrorCode.GRADE_ALREADY_EXISTS);
        }
        if (gradeRepository.existsByNameIgnoreCaseAndIdNot(newName, gradeId)) {
            throw new AppException(ErrorCode.GRADE_ALREADY_EXISTS);
        }

        grade.setCode(newCode);
        grade.setName(newName);
        grade.setDisplayOrder(request.displayOrder());
        return GradeResponse.from(gradeRepository.save(grade));
    }

    @Transactional
    public GradeResponse inactiveGrade(Long gradeId) {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new AppException(ErrorCode.GRADE_NOT_FOUND));
        grade.setStatus(GradeStatus.INACTIVE);
        return GradeResponse.from(gradeRepository.save(grade));
    }

    @Transactional
    public GradeResponse activateGrade(Long gradeId) {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new AppException(ErrorCode.GRADE_NOT_FOUND));
        grade.setStatus(GradeStatus.ACTIVE);
        return GradeResponse.from(gradeRepository.save(grade));
    }

    @Transactional
    public void deleteGrade(Long gradeId) {
        Grade grade = gradeRepository.findById(gradeId)
                .orElseThrow(() -> new AppException(ErrorCode.GRADE_NOT_FOUND));
        gradeRepository.delete(grade);
    }
}