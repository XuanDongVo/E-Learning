# Question Bank CSV Import v1 — Backend validation contract

Phase 1 implements validation only. It never saves a question. The later UI imports the `validQuestions[].question` payload into the existing BulkQuestionCreator.

## Endpoint

`POST /v1/content/question-banks/{bankId}/questions/import/validate`

- Authenticated TEACHER (existing `/v1/content/**` security rule).
- `multipart/form-data`, field `file`.
- CSV only, UTF-8 (BOM accepted), max 2 MiB and 1,000 data records.
- Uses RFC-style quoted fields; commas and newlines within quoted content are supported.
- Header must match exactly, in this order:

```csv
type,difficulty,content,option_a,option_b,option_c,option_d,correct_answer,explanation,hint
```

No `questionBankId` column: the ID comes from the URL.

## Question types

Only `SINGLE_CHOICE`, `MULTIPLE_CHOICE`, `TRUE_FALSE`, `FILL_IN_BLANK`, `TYPE_ANSWER` are valid for Question Bank CSV. `MATCHING` and `CLOZE` are row-level errors. Their assignment support is unchanged.

- `difficulty`: `EASY`, `MEDIUM`, `HARD`.
- `content`: required, <= 2000 characters.
- `explanation`: optional, <= 2000 characters.
- `hint`: optional, <= 500 characters.
- Choice: 2–4 distinct, contiguous options from A; `correct_answer` is `B` or `A|C`.
- `SINGLE_CHOICE` requires exactly one correct option; `MULTIPLE_CHOICE` requires at least one.
- `TRUE_FALSE`: `correct_answer` is `TRUE` or `FALSE`.
- `FILL_IN_BLANK`: content must contain `____` (required by existing QuestionEngine).
- `FILL_IN_BLANK` and `TYPE_ANSWER`: separate acceptable answers with `|` (no literal `|` in an answer in v1).
- Non-choice types must leave option columns empty.
- Whitespace around fields is trimmed; quoted commas/newlines are handled as normal CSV.
- Rows with empty columns in the correct_answer list are invalid.

Example:

```csv
type,difficulty,content,option_a,option_b,option_c,option_d,correct_answer,explanation,hint
SINGLE_CHOICE,EASY,She ___ to school.,go,goes,going,gone,B,Present simple,
MULTIPLE_CHOICE,MEDIUM,Select fruits.,Apple,Carrot,Banana,Potato,A|C,Fruits,
TRUE_FALSE,EASY,The sun is a star.,,,,,TRUE,,
FILL_IN_BLANK,MEDIUM,She ____ to school.,,,,,goes,Present simple,
TYPE_ANSWER,HARD,Translate apple into Vietnamese.,,,,,táo,,
```

## Response semantics

- HTTP `200` even when some/all rows fail semantic validation. `data.validQuestions` contains objects `{rowNumber, question}` using the existing `CreateQuestionRequest` JSON shape. `data.errors` contains `{rowNumber, field, code, message, rawValue}` (rawValue may be null).
- `totalRows` counts data records, `validCount` counts valid questions, `invalidCount = totalRows - validCount` counts invalid records rather than error messages.
- `rowNumber` is the logical CSV record number, including the header as row 1. Multiline quoted records are one logical row.
- HTTP `400` for invalid file/header/encoding, oversized file, syntax failure or > 1,000 records; `404` for missing bank; `401/403` from the existing security chain.

No partial data is persisted. The later Save action remains the existing bulk create endpoint and should validate again. Phase 1 does not add tests per project request.
