# 🎓 University of Layyah — Student Portal

A responsive and interactive student portal built for **Practical Lab Task # 7** (Web Technologies).
Students can browse courses, register online, search/filter courses, and manage their profile — all in the browser with **no backend required**.

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![Bootstrap](https://img.shields.io/badge/Bootstrap%205.3-7952B3?style=flat&logo=bootstrap&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

---

## 📋 Table of Contents

- [Features](#-features)
- [Demo](#-demo)
- [Folder Structure](#-folder-structure)
- [Setup & Run](#-setup--run)
- [How to Use](#-how-to-use)
- [Technologies Used](#-technologies-used)
- [Lab Requirements Coverage](#-lab-requirements-coverage)
- [Viva Preparation](#-viva-preparation)
- [Known Limitations](#-known-limitations)
- [LLM Usage](#-llm-usage)
- [Author](#-author)

---

## ✨ Features

### Core Features
- 🕐 **Live clock** — current date and time update every second
- 🌗 **Dark / Light mode** — remembered across page reloads via Local Storage
- 📝 **Registration form** — full client-side validation (name, email, phone, DOB, program, semester, password, gender, terms)
- 💾 **Local Storage** — registered students are saved in the browser (password never stored)
- 📚 **Course catalog** — 6 pre-loaded courses with alternating green/orange themes
- 🔍 **Course search** — filter by course name or code in real time
- ➕ **Add new courses** — dynamically append cards with validation and duplicate code check
- 🗑️ **Remove courses** — delete any course (including dynamically added ones)
- 📊 **Live counters** — total courses and total students update automatically
- 🎯 **Enroll button** — pick a course and it is carried into the registration form
- ✅ **Confirmation modal** — Bootstrap modal shows the summary after registration
- ❓ **FAQ accordion** — 4 common questions answered
- 📱 **Fully responsive** — navbar collapses, cards stack, everything works on mobile

### Extra Polish
- 🛡️ **XSS protection** — every user-supplied string is escaped before rendering
- 🖼️ **Logo fallback** — if `images/logo.png` is missing, a Bootstrap icon is shown instead
- 📅 **Today's schedule highlight** — the current weekday row is highlighted automatically
- 🎨 **Rich hover effects** — cards lift, icons pop, chips fill, enroll button wipes in
- ♿ **Accessibility** — semantic HTML, `aria-label` on icon buttons, focus-visible outlines, reduced-motion support
- 🔁 **Duplicate email guard** — the same email cannot register twice

---
