package e_learning.server.knowledge.teacher.validation;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import e_learning.server.common.exception.AppException;
import e_learning.server.common.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.util.List;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

@Component
@RequiredArgsConstructor
public class KnowledgeNoteContentValidator {
    private static final int MAX_BYTES = 512 * 1024;
    private static final Set<String> ARTICLE_ROOT =
            Set.of("paragraph", "heading", "bulletList", "orderedList", "horizontalRule", "table", "learningBlock");
    private static final Set<String> ARTICLE_NODES = Set.of(
            "paragraph", "heading", "bulletList", "orderedList", "listItem", "horizontalRule",
            "hardBreak", "text", "table", "tableRow", "tableCell", "tableHeader",
            "learningBlock", "learningSection");
    private static final Map<String, Set<String>> ATTRIBUTES = Map.of(
            "heading", Set.of("level", "id"),
            "learningBlock", Set.of("kind", "title", "variant", "id", "isKeyPoint"),
            "learningSection", Set.of("role"),
            "table", Set.of("purpose", "id", "isKeyPoint"),
            "tableCell", Set.of("colspan", "rowspan", "colwidth", "align"),
            "tableHeader", Set.of("colspan", "rowspan", "colwidth", "align"),
            "orderedList", Set.of("start", "type"),
            "bulletList", Set.of("type"));
    private static final Map<String, Set<String>> CHILDREN = Map.ofEntries(
            Map.entry("paragraph", Set.of("text", "hardBreak")),
            Map.entry("heading", Set.of("text", "hardBreak")),
            Map.entry("bulletList", Set.of("listItem")),
            Map.entry("orderedList", Set.of("listItem")),
            Map.entry("listItem", Set.of("paragraph", "bulletList", "orderedList")),
            Map.entry("learningBlock", Set.of("learningSection")),
            Map.entry("learningSection", Set.of("paragraph", "bulletList", "orderedList")),
            Map.entry("table", Set.of("tableRow")),
            Map.entry("tableRow", Set.of("tableCell", "tableHeader")),
            Map.entry("tableCell", Set.of("paragraph", "bulletList", "orderedList")),
            Map.entry("tableHeader", Set.of("paragraph", "bulletList", "orderedList")));
    private static final Map<String, List<String>> BLOCK_ROLES = Map.of(
            "formula", List.of("expression", "explanation", "condition"),
            "example", List.of("example", "explanation", "translation"),
            "callout", List.of("body", "explanation"),
            "commonMistake", List.of("incorrect", "correct", "explanation"));
    private static final Set<String> SECTION_ROLES = Set.of(
            "expression", "explanation", "condition", "example", "translation",
            "body", "incorrect", "correct");
    private final ObjectMapper mapper;

    public void validate(Map<String, Object> document) {
        if (document == null) fail("Document là bắt buộc.");
        try {
            if (mapper.writeValueAsBytes(document).length > MAX_BYTES) {
                fail("Nội dung vượt quá giới hạn 512 KB.");
            }
        } catch (JsonProcessingException e) {
            fail("Không thể đọc JSON của bài học.");
        }
        int[] count = {0};
        Set<String> ids = new HashSet<>();
        validateRoot(mapper.valueToTree(document), count, ids);
    }

    public boolean hasReadableContent(Map<String, Object> document) {
        return hasText(mapper.valueToTree(document));
    }

    public boolean hasHeading(Map<String, Object> document) {
        JsonNode contents = mapper.valueToTree(document).path("content");
        for (JsonNode node : contents) if ("heading".equals(text(node, "type"))) return true;
        return false;
    }

    public boolean hasKeyPoint(Map<String, Object> document) {
        JsonNode contents = mapper.valueToTree(document).path("content");
        for (JsonNode node : contents) {
            if (("learningBlock".equals(text(node, "type")) || "table".equals(text(node, "type")))
                    && node.path("attrs").path("isKeyPoint").asBoolean(false)) return true;
        }
        return false;
    }

    private static boolean hasText(JsonNode node) {
        if (node == null || node.isMissingNode()) return false;
        if (node.isObject() && "text".equals(text(node, "type"))) {
            return !text(node, "text").isBlank();
        }
        JsonNode content = node.path("content");
        if (content.isArray()) for (JsonNode child : content) if (hasText(child)) return true;
        return false;
    }

    private void validateRoot(JsonNode node, int[] count, Set<String> ids) {
        if (node == null || !node.isObject() || !"doc".equals(text(node, "type"))
                || !onlyFields(node, Set.of("type", "content"))
                || !array(node.get("content"), 0, 3000)) {
            fail("Document root phải là doc với content array.");
        }
        for (JsonNode child : node.get("content")) {
            if (!ARTICLE_ROOT.contains(text(child, "type"))) fail("Root chứa node không được hỗ trợ.");
            validateNode(child, 0, count, ids);
        }
    }

    private void validateNode(JsonNode node, int depth, int[] count, Set<String> ids) {
        if (depth > 24 || ++count[0] > 6000) fail("Nội dung quá sâu hoặc có quá nhiều node.");
        if (!node.isObject() || !onlyFields(node, Set.of("type", "attrs", "content", "marks", "text"))) {
            fail("Node JSON không hợp lệ.");
        }
        String type = text(node, "type");
        if (!ARTICLE_NODES.contains(type)) {
            fail("Loại node không được hỗ trợ: " + type);
        }
        JsonNode attrs = node.get("attrs");
        if (attrs != null && (!attrs.isObject()
                || !onlyFields(attrs, ATTRIBUTES.getOrDefault(type, Set.of())))) {
            fail("Attributes của " + type + " không hợp lệ.");
        }
        if (Set.of("heading", "learningBlock", "table").contains(type)) {
            JsonNode id = field(attrs, "id");
            if (id != null && (!id.isTextual()
                    || !id.asText().matches("[A-Za-z0-9_-]{1,100}")
                    || !ids.add(id.asText()))) fail("ID của khối không hợp lệ hoặc bị trùng.");
        }
        if (Set.of("learningBlock", "table").contains(type)) {
            JsonNode flag = field(attrs, "isKeyPoint");
            if (flag != null && !flag.isBoolean()) fail("isKeyPoint phải là boolean.");
        }
        JsonNode children = node.get("content");
        if (children != null && !array(children, 0, 3000)) fail("Danh sách node con không hợp lệ.");
        if (children != null && !CHILDREN.containsKey(type) && children.size() > 0) {
            fail("Node không được chứa nội dung con.");
        }
        if (CHILDREN.containsKey(type) && children != null) {
            for (JsonNode child : children) {
                if (!CHILDREN.get(type).contains(text(child, "type"))) fail("Cấu trúc node con không hợp lệ.");
            }
        }
        if (Set.of("bulletList", "orderedList", "listItem", "tableCell", "tableHeader").contains(type)
                && (children == null || children.isEmpty())) fail("Node thiếu nội dung con.");
        if ("text".equals(type)) {
            JsonNode value = node.get("text");
            if (value == null || !value.isTextual() || value.textValue().length() > 100000) {
                fail("Text node không hợp lệ.");
            }
        } else if (node.has("text")) fail("Chỉ text node được chứa text.");
        if ("heading".equals(type) && !isInt(field(attrs, "level"), 2, 3)) fail("Heading chỉ hỗ trợ H2/H3.");
        if ("learningBlock".equals(type)) validateBlock(attrs, children);
        if ("learningSection".equals(type)
                && !SECTION_ROLES.contains(text(attrs, "role"))) fail("Vai trò section không hợp lệ.");
        if ("table".equals(type)) validateTable(attrs, children);
        if ("tableCell".equals(type) || "tableHeader".equals(type)) validateCell(attrs);
        validateMarks(node.get("marks"), type);
        if (children != null) {
            for (JsonNode child : children) validateNode(child, depth + 1, count, ids);
        }
    }

    private void validateBlock(JsonNode attrs, JsonNode children) {
        String kind = text(attrs, "kind");
        List<String> roles = BLOCK_ROLES.get(kind);
        if (roles == null || !textField(attrs, "title", 200)
                || !Set.of("default", "note", "tip", "warning", "important")
                       .contains(text(attrs, "variant"))
                || children == null || children.size() != roles.size()) {
            fail("Learning Block không hợp lệ.");
        }
        for (int i = 0; i < roles.size(); i++) {
            if (!roles.get(i).equals(text(children.get(i).get("attrs"), "role"))) {
                fail("Thứ tự section không hợp lệ.");
            }
        }
    }

    private void validateTable(JsonNode attrs, JsonNode rows) {
        if (!Set.of("general", "comparison").contains(text(attrs, "purpose"))
                || rows == null || !array(rows, 1, 100)) fail("Bảng không hợp lệ.");
        boolean[][] occupied = new boolean[rows.size()][12];
        for (int r = 0; r < rows.size(); r++) {
            JsonNode cells = rows.get(r).get("content");
            if (cells == null || !cells.isArray()) fail("Hàng bảng không có ô.");
            int col = 0;
            for (JsonNode cell : cells) {
                while (col < 12 && occupied[r][col]) col++;
                JsonNode cellAttrs = cell.get("attrs");
                int colspan = intValue(field(cellAttrs, "colspan"), 1);
                int rowspan = intValue(field(cellAttrs, "rowspan"), 1);
                if (colspan < 1 || colspan > 12 || rowspan < 1
                        || col + colspan > 12 || r + rowspan > rows.size()) fail("Ô bảng vượt giới hạn.");
                for (int y = r; y < r + rowspan; y++) {
                    for (int x = col; x < col + colspan; x++) {
                        if (occupied[y][x]) fail("Ô bảng bị chồng lên nhau.");
                        occupied[y][x] = true;
                    }
                }
                col += colspan;
            }
        }
        int width = lastFilled(occupied[0]);
        if (width < 2 || width > 12) fail("Bảng phải có từ 2 đến 12 cột.");
        for (boolean[] row : occupied) {
            if (lastFilled(row) != width) fail("Bảng có hàng/cột không đều.");
            for (int x = 0; x < width; x++) if (!row[x]) fail("Bảng có ô trống không hợp lệ.");
        }
    }

    private void validateCell(JsonNode attrs) {
        JsonNode colspan = field(attrs, "colspan");
        JsonNode rowspan = field(attrs, "rowspan");
        if (colspan != null && !isInt(colspan, 1, 12)) fail("colspan không hợp lệ.");
        if (rowspan != null && !isInt(rowspan, 1, 100)) fail("rowspan không hợp lệ.");
        JsonNode align = field(attrs, "align");
        if (align != null && !align.isNull()
                && !Set.of("left", "center", "right").contains(align.asText())) fail("Căn lề không hợp lệ.");
        JsonNode width = field(attrs, "colwidth");
        if (width != null && !width.isNull()) {
            int span = intValue(colspan, 1);
            if (!width.isArray() || width.size() != span) fail("colwidth không hợp lệ.");
            for (JsonNode w : width) if (!isInt(w, 1, 4000)) fail("colwidth không hợp lệ.");
        }
    }

    private void validateMarks(JsonNode marks, String type) {
        if (marks == null) return;
        if (!"text".equals(type) || !marks.isArray()) fail("Marks chỉ áp dụng cho text.");
        for (JsonNode mark : marks) {
            if (!mark.isObject() || !onlyFields(mark, Set.of("type", "attrs"))) fail("Mark không hợp lệ.");
            String markType = text(mark, "type");
            if (!Set.of("bold", "italic", "link").contains(markType)) fail("Mark không được hỗ trợ.");
            JsonNode attrs = mark.get("attrs");
            if ("link".equals(markType)) {
                if (attrs == null || !attrs.isObject()
                        || !onlyFields(attrs, Set.of("href", "target", "rel", "class"))) fail("Link không hợp lệ.");
                String href = text(attrs, "href");
                if (!safeHref(href)) fail("Liên kết không an toàn.");
                JsonNode target = attrs.get("target");
                if (target != null && !target.isNull() && !Set.of("_blank", "_self").contains(target.asText())) {
                    fail("Target link không hợp lệ.");
                }
                for (String k : List.of("rel", "class")) {
                    JsonNode val = attrs.get(k);
                    if (val != null && !val.isNull() && !val.isTextual()) fail("Thuộc tính link không hợp lệ.");
                }
            } else if (attrs != null && (!attrs.isObject() || !attrs.isEmpty())) {
                fail("Mark không hỗ trợ attributes.");
            }
        }
    }

    private static boolean safeHref(String href) {
        if (href == null || href.isBlank() || href.chars().anyMatch(Character::isISOControl)) return false;
        try {
            URI uri = URI.create(href);
            String scheme = uri.getScheme();
            return scheme != null && Set.of("http", "https", "mailto")
                    .contains(scheme.toLowerCase(java.util.Locale.ROOT));
        } catch (IllegalArgumentException e) { return false; }
    }

    private static int lastFilled(boolean[] row) {
        for (int i = row.length - 1; i >= 0; i--) if (row[i]) return i + 1;
        return 0;
    }
    private static JsonNode field(JsonNode obj, String key) {
        return obj != null && obj.isObject() ? obj.get(key) : null;
    }
    private static String text(JsonNode obj, String key) {
        JsonNode val = field(obj, key);
        return val != null && val.isTextual() ? val.textValue() : "";
    }
    private static boolean textField(JsonNode obj, String key, int max) {
        JsonNode value = field(obj, key);
        return value != null && value.isTextual() && value.textValue().length() <= max;
    }
    private static int intValue(JsonNode node, int fallback) {
        return node == null ? fallback : node.isIntegralNumber() && node.canConvertToInt() ? node.intValue() : -1;
    }
    private static boolean isInt(JsonNode node, int min, int max) {
        return node != null && node.isIntegralNumber() && node.canConvertToInt()
                && node.intValue() >= min && node.intValue() <= max;
    }
    private static boolean array(JsonNode node, int min, int max) {
        return node != null && node.isArray() && node.size() >= min && node.size() <= max;
    }
    private static boolean onlyFields(JsonNode node, Set<String> allowed) {
        if (node == null || !node.isObject()) return false;
        var names = node.fieldNames();
        while (names.hasNext()) if (!allowed.contains(names.next())) return false;
        return true;
    }
    private static void fail(String message) {
        throw new AppException(ErrorCode.KNOWLEDGE_NOTE_CONTENT_INVALID, message);
    }
}
