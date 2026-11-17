package e_learning.server.activitysession.dto.response.ordering;

import java.util.List;

/** One sample accepted order, exposed only after the existing reveal policy allows it. */
public record OrderingAnswerRevealResponse(List<OrderingQuestionResponse.Item> items) {
    public OrderingAnswerRevealResponse {
        items = List.copyOf(items == null ? List.of() : items);
    }
}
