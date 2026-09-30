package e_learning.server.activity.distribution;

import e_learning.server.activity.entity.Activity;
import e_learning.server.activity.entity.ActivityBank;
import java.util.*;

public final class ActivityDistributionCalculator {
    private ActivityDistributionCalculator() {}

    public static Map<Long, Integer> calculate(Activity activity, List<ActivityBank> banks) {
        Map<Long, Integer> result = new LinkedHashMap<>();
        if (banks.isEmpty()) return result;

        int total = activity.getTotalQuestions();

        switch (activity.getDistributionMode()) {
            case EQUAL -> {
                int each = total / banks.size();
                for (ActivityBank bank : banks) {
                    result.put(bank.getQuestionBank().getId(), each);
                }
            }
            case FIXED_COUNT -> {
                for (ActivityBank bank : banks) {
                    result.put(bank.getQuestionBank().getId(), bank.getFixedCount());
                }
            }
            case PERCENTAGE -> {
                List<Allocation> allocations = banks.stream().map(bank -> {
                    double exact = total * bank.getPercentage() / 100.0;
                    int floor = (int) Math.floor(exact);
                    return new Allocation(
                        bank.getQuestionBank().getId(),
                        floor,
                        exact - floor
                    );
                }).toList();

                int remaining = total - allocations.stream()
                    .mapToInt(Allocation::floor).sum();

                List<Allocation> sorted = new ArrayList<>(allocations);
                sorted.sort(
                    Comparator.comparingDouble(Allocation::fraction).reversed()
                        .thenComparingLong(Allocation::bankId)
                );

                for (int i = 0; i < remaining; i++) {
                    Allocation allocation = sorted.get(i);
                    result.merge(allocation.bankId(), 1, Integer::sum);
                }

                for (Allocation allocation : allocations) {
                    result.putIfAbsent(allocation.bankId(), allocation.floor());
                }
            }
        }

        return result;
    }

    private record Allocation(Long bankId, int floor, double fraction) {}
}
