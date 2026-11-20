# Knowledge Note — Phase 02.2 Teacher Editor (Client-first)

Status: Implemented client interaction; persistence contract proposed only
Date: 2026-11-20
Authority: ADR 0038 amendment, ADR 0039 and ADR 0040

## Boundary

Phase 02.2 implements the Teacher authoring interaction without adding content-save, lifecycle, Topic-link or Student APIs. The three approved metadata endpoints remain the only server operations used. Editor content lives in React/TipTap memory, can be previewed and copied as JSON, and is lost when the session is left or reloaded.

## Editor engine

TipTap 3 is the selected editor engine. The integration is a client component with deferred initial rendering for Next.js SSR safety. StarterKit supplies paragraphs, H2/H3, ordered/bullet lists, bold, italic, links, horizontal rules and undo/redo. A custom atomic `learningBlock` node supplies domain blocks and serializes to the same JSON tree.

## Versioned document contract

The client exports one envelope:

```json
{
  "schemaVersion": 1,
  "document": { "type": "doc", "content": [] },
  "summary": { "type": "doc", "content": [] }
}
```

`document` and `summary` are separately authored TipTap JSON documents. Quick Summary is not derived from or truncated from `document`.

Allowlisted body nodes for schema v1:

- `doc`, `paragraph`, `text`, `heading` levels 2–3;
- `bulletList`, `orderedList`, `listItem`, `horizontalRule`;
- marks `bold`, `italic`, `link` with HTTP, HTTPS or mailto only;
- `learningBlock` with `kind` `formula`, `example`, `callout`, `comparison` or `commonMistake`.

Common Learning Block attributes are `kind`, `title`, `body` and `secondary`. Comparison additionally uses `leftTitle` and `rightTitle`; `body` and `secondary` hold the two column bodies. Unknown nodes/attributes must be rejected or stripped by the future server validator. Raw HTML and image/media nodes are not allowed.

Quick Summary uses paragraph, text, ordered/bullet list and basic text marks only. It does not accept Learning Blocks or headings in this phase.

## Interaction and states

- Toolbar: paragraph, H2/H3, bold, italic, lists, safe link, divider and Learning Block insertion.
- Slash shortcuts: `/formula`, `/example`, `/note`, `/compare`, `/mistake`, completed with Space.
- Learning Blocks support inline attribute editing, drag handle, keyboard-operable up/down actions and delete.
- Preview opens the dedicated Teacher-only `/teacher/knowledge-notes/{id}/preview` page in a new tab, using Student-scoped paper/typography styles and the same safe JSON renderer. The open Editor transfers its current unsaved Full Article and separately authored Quick Summary over a per-session same-origin BroadcastChannel. Changes made while both tabs are open update the Preview; no browser storage, backend read or Student permission is involved. Tabs switch Full Article/Quick Summary and Desktop/Mobile widths. Direct access without an Editor session displays an explicit unavailable state.
- `clean`: metadata loaded and no local content mutation.
- `unsaved`: any body, Summary or Learning Block mutation occurred.
- `readOnly`: archived Note; both editors disable mutation.
- `saving`: future PUT is in flight; controls must disable and state remains dirty until success.
- `saveError`: future PUT failed; content stays in memory and retry remains possible.
- A browser unload warning and internal-link confirmation protect unsaved client state.

The Save button stays disabled in Phase 02.2 and explains that Phase 02.3 provides persistence. No timer, fake request, fake saved toast or localStorage fallback is allowed.

## Proposed Phase 02.3 content API

This proposal is not approved for server implementation yet.

`GET /v1/teacher/knowledge-notes/{id}/content`

Response data:

```json
{
  "knowledgeNoteId": 42,
  "document": { "type": "doc", "content": [] },
  "summary": { "type": "doc", "content": [] },
  "schemaVersion": 1,
  "editVersion": 3,
  "updatedAt": "2026-11-20T10:00:00"
}
```

`PUT /v1/teacher/knowledge-notes/{id}/content`

Request:

```json
{
  "document": { "type": "doc", "content": [] },
  "summary": { "type": "doc", "content": [] },
  "schemaVersion": 1,
  "baseVersion": 3
}
```

The server must authorize the Teacher, validate the full allowlist and size/depth limits, sanitize link protocols, reject stale `baseVersion` with 409 and increment `editVersion` atomically. Saving PUBLISHED content requires an explicit client confirmation because it becomes Student-visible immediately. Publish/unpublish remain separate future operations.

## Validation evidence

Static source review, new protocol tests (written but not executed in this pass), and prior editor checks are documented in `.agents/PROGRESS.md`. The Teacher preview displays Student styling but is not an authorized Student Library/Reader or persistence API. Editor drafts do not survive reload or closing the original Editor tab.
