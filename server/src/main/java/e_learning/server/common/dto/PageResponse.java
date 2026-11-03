package e_learning.server.common.dto;

import lombok.*;
import org.springframework.data.domain.Page;

import java.util.List;

@Builder
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class PageResponse<T> {
    private List<T> items;
    private int page;
    private int size;
    private long totalElements;
    private int totalPages;
    private boolean isFirst;
    private boolean isLast;

    public static <T> PageResponse<T> from(Page<T> page) {
        return PageResponse.<T>builder()
                .items(page.getContent())
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .build();
    }

    public static <T, R> PageResponse<R> from(Page<T> page, List<R> mappedContent) {
        return PageResponse.<R>builder()
                .items(mappedContent)
                .page(page.getNumber() + 1)
                .size(page.getSize())
                .totalElements(page.getTotalElements())
                .totalPages(page.getTotalPages())
                .isFirst(page.isFirst())
                .isLast(page.isLast())
                .build();
    }

    /** 1-indexed page slice over an already-materialized list. */
    public static <T> PageResponse<T> fromList(List<T> all, int page, int size) {
        int safeSize = size <= 0 ? 20 : size;
        int safePage = Math.max(1, page);
        long total = all == null ? 0 : all.size();
        int totalPages = total == 0 ? 0 : (int) Math.ceil(total / (double) safeSize);
        if (total == 0) {
            return PageResponse.<T>builder()
                    .items(List.of())
                    .page(safePage)
                    .size(safeSize)
                    .totalElements(0)
                    .totalPages(0)
                    .isFirst(true)
                    .isLast(true)
                    .build();
        }
        if (safePage > totalPages) {
            safePage = totalPages;
        }
        int from = (safePage - 1) * safeSize;
        int to = Math.min(from + safeSize, all.size());
        List<T> slice = from >= all.size() ? List.of() : all.subList(from, to);
        return PageResponse.<T>builder()
                .items(slice)
                .page(safePage)
                .size(safeSize)
                .totalElements(total)
                .totalPages(totalPages)
                .isFirst(safePage <= 1)
                .isLast(safePage >= totalPages)
                .build();
    }
}
