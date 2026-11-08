# University of Layyah - Student Portal (Web Technologies Lab Task 7)

Open `index.html` in a browser (internet needed for Bootstrap, icons and fonts CDN).
Put your university logo at `images/logo.png`; it replaces the placeholder in the navbar and footer.

## Files
- index.html - structure, Bootstrap components (navbar, cards, modal, accordion, alerts, tables)
- style.css - custom theme (white, green, orange), sticky header, media query, dark mode
- script.js - clock, heading change, dark mode, validation, registration, add/search/count courses, Local Storage

## LLM usage (write this in your submission)
Claude (Anthropic) was used to generate the first version of the code and to explain it. I tested the features myself and can explain every function.

## Viva quick notes
- id vs class: id is unique on a page (#id, one element); class can be reused on many elements (.class).
- Bootstrap grid: 12 columns; breakpoints xs (<576px), sm (>=576), md (>=768), lg (>=992), xl (>=1200), xxl (>=1400).
- let vs const: let can be reassigned; const cannot be reassigned (objects/arrays can still change inside).
- DOM manipulation: see addCourse() (createElement + appendChild), changeHeading() (textContent), searchCourses() (classList.toggle).
