package e_learning.server.content.unit.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.common.dto.ReorderRequest;
import e_learning.server.content.section.repository.SectionRepository;
import e_learning.server.content.topic.repository.TopicRepository;
import e_learning.server.content.unit.dto.CreateUnitRequest;
import e_learning.server.content.unit.dto.UnitResponse;
import e_learning.server.content.unit.dto.UpdateUnitRequest;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.repository.UnitRepository;
import e_learning.server.grades.entity.Grade;
import e_learning.server.grades.repository.GradeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class UnitService {

    private final UnitRepository unitRepository;
    private final GradeRepository gradeRepository;
    private final SectionRepository sectionRepository;
    private final TopicRepository topicRepository;

    public UnitResponse createUnit(CreateUnitRequest request) {
        Grade grade = gradeRepository.findById(request.gradeId())
                .orElseThrow(() ->
                        new AppException(ErrorCode.GRADE_NOT_FOUND)
                );

        if (unitRepository.existsByGradeIdAndCodeIgnoreCase(
                request.gradeId(),
                request.code()
        )) {
            throw new AppException(
                    ErrorCode.UNIT_CODE_ALREADY_EXISTS
            );
        }

        Unit unit = Unit.builder()
                .grade(grade)
                .code(request.code())
                .name(request.name())
                .description(request.description())
                .coverMediaId(request.coverMediaId())
                .displayOrder(
                        request.displayOrder() != null
                                ? request.displayOrder()
                                : 0
                )
                .status(ContentStatus.DRAFT)
                .build();

        Unit savedUnit = unitRepository.save(unit);

        return toResponse(savedUnit);
    }

    @Transactional(readOnly = true)
    public UnitResponse getById(Long id) {
        Unit unit = findUnitById(id);

        return toResponse(unit);
    }

    @Transactional(readOnly = true)
    public List<UnitResponse> getByGrade(Long gradeId) {
        if (!gradeRepository.existsById(gradeId)) {
            throw new AppException(ErrorCode.GRADE_NOT_FOUND);
        }

        return unitRepository
                .findAllByGradeIdAndStatusNotOrderByDisplayOrderAsc(gradeId, ContentStatus.ARCHIVED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public UnitResponse updateUnit(
            Long id,
            UpdateUnitRequest request
    ) {
        Unit unit = findUnitById(id);

        if (unitRepository.existsByGradeIdAndCodeAndIdNot(
                unit.getGrade().getId(),
                request.code(),
                id
        )) {
            throw new AppException(
                    ErrorCode.UNIT_CODE_ALREADY_EXISTS
            );
        }

        unit.setCode(request.code());
        unit.setName(request.name());
        unit.setDescription(request.description());
        unit.setCoverMediaId(request.coverMediaId());

        if (request.displayOrder() != null) {
            unit.setDisplayOrder(request.displayOrder());
        }

        Unit updatedUnit = unitRepository.save(unit);

        return toResponse(updatedUnit);
    }

        public UnitResponse archiveUnit(Long id) {
                Unit unit = findUnitById(id);
                unit.setStatus(ContentStatus.ARCHIVED);
                return toResponse(unitRepository.save(unit));
        }

    private Unit findUnitById(Long id) {
        return unitRepository.findById(id)
                .orElseThrow(() ->
                        new AppException(ErrorCode.UNIT_NOT_FOUND)
                );
    }

        public void reorder(Long gradeId, ReorderRequest request) {
                List<Unit> units = unitRepository.findAllByGradeIdAndStatusNotOrderByDisplayOrderAsc(gradeId, ContentStatus.ARCHIVED);
                if (units.size() != request.items().size() || request.items().stream().map(ReorderRequest.Item::id).distinct().count() != request.items().size()) {
                        throw new AppException(ErrorCode.INVALID_REQUEST);
                }
                var byId = units.stream().collect(java.util.stream.Collectors.toMap(Unit::getId, unit -> unit));
                request.items().forEach(item -> {
                        Unit unit = byId.get(item.id());
                        if (unit == null) throw new AppException(ErrorCode.INVALID_REQUEST);
                        unit.setDisplayOrder(item.displayOrder());
                });
                unitRepository.saveAll(units);
        }

    private UnitResponse toResponse(Unit unit) {
        int totalSection = Math.toIntExact(sectionRepository.countByUnitId(unit.getId()));
        int totalTopic = Math.toIntExact(topicRepository.countBySectionUnitId(unit.getId()));

        return UnitResponse.from(
                unit,
                totalSection,
                totalTopic
        );
    }
}