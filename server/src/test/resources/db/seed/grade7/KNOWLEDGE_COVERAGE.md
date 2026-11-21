# Grade 7 Knowledge Note coverage

## Unit mapping

The existing disposable fixture has six units. `G7-SEED-U06` is named
**Traffic and Transport**, but Global Success places **A Visit to a School** at
Unit 6 and **Traffic** at Unit 7. The seed does not reinterpret that existing
identifier because questions, activities and assignments already reference it.

| Curriculum unit | Repository unit | Knowledge Note key | Category | Topic link |
|---|---|---|---|---|
| 01 Hobbies | `G7-SEED-U01` | `g7-u01-core` | Core Curriculum | Hobbies and Present Simple |
| 02 Healthy Living | `G7-SEED-U02` | `g7-u02-core` | Core Curriculum | Healthy Living and Advice |
| 03 Community Service | `G7-SEED-U03` | `g7-u03-core` | Core Curriculum | Community Service and Past Simple |
| 04 Music and Arts | `G7-SEED-U04` | `g7-u04-core` | Core Curriculum | Music, Arts and Comparisons |
| 05 Food and Drink | `G7-SEED-U05` | `g7-u05-core` | Core Curriculum | Food, Drink and Quantities |
| 06 A Visit to a School | `G7-CURR-U06` | `g7-u06-school` | Core Curriculum | School Facilities and Prepositions |
| 07 Traffic | `G7-CURR-U07` | `g7-u07-traffic` | Core Curriculum | Traffic, Distance and Advice |
| 08 Films | `G7-CURR-U08` | `g7-u08-films` | Core Curriculum | Films and Opinions |
| 09 Festivals Around the World | `G7-CURR-U09` | `g7-u09-festivals` | Core Curriculum | Festivals and Word Stress |
| 10 Energy Sources | `G7-CURR-U10` | `g7-u10-energy` | Core Curriculum | Energy and Present Continuous |
| 11 Travelling in the Future | `G7-CURR-U11` | `g7-u11-future` | Core Curriculum | Future Transport and Predictions |
| 12 English-speaking Countries | `G7-CURR-U12` | `g7-u12-countries` | Core Curriculum | Countries, Articles and Intonation |

## Independent review notes

The fixture also adds six Grade 7-wide notes without Topic links:

- `g7-review-tenses`: four common tenses;
- `g7-review-pronouns`: subject, object and possessive pronouns;
- `g7-review-articles-quantifiers`: articles, countability and quantifiers;
- `g7-review-prepositions`: time and place prepositions;
- `g7-review-reading-writing`: reading strategy and guided paragraph writing;
- `g7-review-pronunciation-stress`: pronunciation, stress and question intonation.

## Document contract

Each note is a single V69 `doc` document and uses only validator-supported
nodes. Every note contains:

- a meaningful H2 heading;
- a marked `formula` Learning Block;
- an `example` block with Vietnamese translation;
- a `commonMistake` block;
- a `callout` self-check block.

No unsupported quiz node, HTML, external URL or production migration is added.
The fixture provides one substantive core note per official unit and six
independent revision notes. Further vocabulary expansion and separate
supplementary notes can be added in a later content pass without changing the
stable seed identities.


## Phase 03.2.1 / 03.3 / 03.4 reading and library QA additions

Run `012_knowledge_note_reading_library.sql` **after** `011_knowledge_note.sql` to test student reader/Library behavior beyond the original core curriculum:

| Note key | Student Library role | Topic associations |
|---|---|---|
| `g7-extra-tenses-contrast` | PRIMARY + SUPPLEMENTARY | Primary: new U01 "Present Simple vs Present Continuous"; Supplementary: U01 Hobbies, U10 Energy |
| `g7-extra-hobbies-examples` | SUPPLEMENTARY | U01 Hobbies; U03 Community Service |
| `g7-extra-quantity-table` | SUPPLEMENTARY | U05 Food and Drink |
| `g7-extra-road-safety` | SUPPLEMENTARY | U07 Traffic; U09 Festivals |
| `g7-extra-error-review` | SUPPLEMENTARY | U03 Community Service; U10 Energy |
| `g7-extra-articles-table` | SUPPLEMENTARY | U05 Food and Drink; U12 Countries |
| `g7-extra-free-reading` | UNLINKED | No Topic; independent published reading |
| `g7-extra-hidden-draft` | Not visible to Student | UNPUBLISHED; no Topic |

New supplementary documents include a Tiptap `table` with `purpose="comparison"` and `isKeyPoint=true` plus a marked formula block. Their H2/H3 headings support the reading TOC, while the two key-point nodes demonstrate the Topic Quick Summary and full-reader rendering. No child content, exact Topic/Unit association or Student progress is fabricated beyond the declared fixture.

**Manual API checks:**

- `GET /v1/student/knowledge-notes?role=PRIMARY` includes the contrast Note; `role=SUPPLEMENTARY` also includes it.
- `GET /v1/student/knowledge-notes?role=UNLINKED` includes the published free-reading Note, not the hidden UNPUBLISHED Note.
- `GET /v1/student/knowledge-notes?role=UNLINKED&unitId=1` must reject the incompatible filter (use the actual Unit ID when testing; the number here is illustrative).
- Open the new contrast Topic and inspect Quick Summary table + formula block, then use full reader and linked Topic navigation.
- For student read by ID, UNPUBLISHED Note must return a not-found style response.
