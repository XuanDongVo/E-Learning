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
