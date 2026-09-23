package e_learning.server.content.section.service;

import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import e_learning.server.content.common.enums.ContentStatus;
import e_learning.server.content.common.dto.ReorderRequest;
import e_learning.server.content.common.dto.UpdateStatusRequest;
import e_learning.server.content.section.dto.CreateSectionRequest;
import e_learning.server.content.section.dto.SectionResponse;
import e_learning.server.content.section.dto.UpdateSectionRequest;
import e_learning.server.content.section.entity.Section;
import e_learning.server.content.section.repository.SectionRepository;
import e_learning.server.content.topic.repository.TopicRepository;
import e_learning.server.content.unit.entity.Unit;
import e_learning.server.content.unit.repository.UnitRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class SectionService {
    private final SectionRepository sectionRepository;
    private final UnitRepository unitRepository;
    private final TopicRepository topicRepository;

    public SectionResponse createSection(CreateSectionRequest request) {
        Unit unit = unitRepository.findById(request.unitId())
                .orElseThrow(() ->
                        new AppException(ErrorCode.UNIT_NOT_FOUND)
                );

        if (sectionRepository.existsByUnitIdAndNameIgnoreCase(request.unitId(), request.name())) {
            throw new AppException(
                    ErrorCode.SECTION_ALREADY_EXISTS
            );
        }

        Section section = Section.builder()
                .unit(unit)
                .name(request.name())
                .description(request.description())
                .displayOrder(
                        request.displayOrder() != null
                                ? request.displayOrder()
                                : 0
                )
                .status(ContentStatus.DRAFT)
                .build();

        Section savedSection = sectionRepository.save(section);

        return toResponse(savedSection);
    }

    @Transactional(readOnly = true)
    public SectionResponse getById(Long id) {
        Section section = findSectionById(id);
        return toResponse(section);
    }

    @Transactional(readOnly = true)
    public List<SectionResponse> getByUnit(Long unitId) {
        if (!unitRepository.existsById(unitId)) {
            throw new AppException(ErrorCode.UNIT_NOT_FOUND);
        }

        return sectionRepository
                .findAllByUnitIdAndStatusNotOrderByDisplayOrderAsc(unitId, ContentStatus.ARCHIVED)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public SectionResponse updateSection(Long id, UpdateSectionRequest request) {
        Section section = findSectionById(id);

        if (sectionRepository.existsByUnitIdAndNameIgnoreCaseAndIdNot(section.getUnit().getId(), request.name(), id)) {
            throw new AppException(
                    ErrorCode.SECTION_ALREADY_EXISTS
            );
        }

        section.setName(request.name());
        section.setDescription(request.description());

        if (request.displayOrder() != null) {
            section.setDisplayOrder(request.displayOrder());
        }

        Section updatedSection = sectionRepository.save(section);

        return toResponse(updatedSection);
    }

    public SectionResponse archiveSection(Long id) {
        Section section = findSectionById(id);
        section.setStatus(ContentStatus.ARCHIVED);
        return toResponse(sectionRepository.save(section));
    }

    public SectionResponse updateStatus(Long id, UpdateStatusRequest request) {
        Section section = findSectionById(id);
        section.setStatus(request.status());
        return toResponse(sectionRepository.save(section));
    }

    public void reorder(Long unitId, ReorderRequest request) {
        List<Section> sections = sectionRepository.findAllByUnitIdAndStatusNotOrderByDisplayOrderAsc(unitId, ContentStatus.ARCHIVED);
        if (sections.size() != request.items().size() || request.items().stream().map(ReorderRequest.Item::id).distinct().count() != sections.size()) {
            throw new AppException(ErrorCode.INVALID_REQUEST);
        }
        var byId = sections.stream().collect(java.util.stream.Collectors.toMap(Section::getId, section -> section));
        request.items().forEach(item -> {
            Section section = byId.get(item.id());
            if (section == null) throw new AppException(ErrorCode.INVALID_REQUEST);
            section.setDisplayOrder(item.displayOrder());
        });
        sectionRepository.saveAll(sections);
    }

    private Section findSectionById(Long id) {
        return sectionRepository.findById(id)
                .orElseThrow(() ->new AppException(ErrorCode.SECTION_NOT_FOUND));
    }

    private SectionResponse toResponse(Section section) {
        int totalTopic = Math.toIntExact(topicRepository.countBySectionId(section.getId()));

        return SectionResponse.from(
                section,
                totalTopic
        );
    }
}