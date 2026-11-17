package e_learning.server.question.engine.types.ordering;

import java.text.Normalizer;

public final class OrderingCanonicalizer {
    private OrderingCanonicalizer() {
    }

    public static String content(String value) {
        if (value == null) return "";
        return Normalizer.normalize(value, Normalizer.Form.NFC)
                .replace("\r\n", "\n")
                .replace('\r', '\n')
                .trim();
    }
}
