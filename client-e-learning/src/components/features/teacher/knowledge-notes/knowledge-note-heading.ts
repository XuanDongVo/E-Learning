import Heading from "@tiptap/extension-heading";

export const KnowledgeHeading = Heading.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      id: {
        default: null,
        parseHTML: element => element.getAttribute("id"),
        renderHTML: attrs => attrs.id ? { id: attrs.id } : {},
      },
    };
  },
}).configure({ levels: [2, 3] });
