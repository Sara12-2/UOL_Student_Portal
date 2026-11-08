'use strict';

/* ===== Helpers and constants ===== */
const $ = (id) => document.getElementById(id);
const STORAGE_KEY = 'uolStudents';
const THEME_KEY = 'uolTheme';
const headings = ['Learn. Build. Lead.', 'Your Future Starts Here', 'Code Today, Create Tomorrow', 'Welcome to University of Layyah'];
let headingIndex = 0;

function escapeHTML(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* 1. Current date and time */
function updateDateTime() {
  const now = new Date();
  $('liveDateTime').textContent = now.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) +
    ' | ' + now.toLocaleTimeString('en-GB');
}

/* 2. Change the website heading */
function changeHeading() {
  headingIndex = (headingIndex + 1) % headings.length;
  $('mainHeading').textContent = headings[headingIndex];
}

/* 3. Dark / light mode */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-bs-theme', theme);
  const dark = theme === 'dark';
  $('themeIcon').className = dark ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
  $('themeLabel').textContent = dark ? 'Light mode' : 'Dark mode';
}
function toggleTheme() {
  const next = document.documentElement.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  try { localStorage.setItem(THEME_KEY, next); } catch (e) { /* storage blocked */ }
}

/* 4. Validate registration form */
const validators = {
  fullName: (v) => /^[A-Za-z][A-Za-z .'-]{2,39}$/.test(v.trim()) ? '' : 'Enter your full name using letters only (at least 3 characters).',
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? '' : 'Enter a valid email, for example name@example.com.',
  phone: (v) => /^03\d{2}-?\d{7}$/.test(v.trim()) ? '' : 'Enter a mobile number like 0300-1234567.',
  dob: (v) => {
    if (!v) return 'Select your date of birth.';
    const born = new Date(v), today = new Date();
    let age = today.getFullYear() - born.getFullYear();
    const m = today.getMonth() - born.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < born.getDate())) age--;
    return age >= 16 && age <= 60 ? '' : 'Age must be between 16 and 60 years.';
  },
  program: (v) => v ? '' : 'Choose your program.',
  semester: (v) => (Number.isInteger(Number(v)) && v !== '' && Number(v) >= 1 && Number(v) <= 8) ? '' : 'Semester must be a number from 1 to 8.',
  password: (v) => (v.length >= 6 && /[A-Za-z]/.test(v) && /\d/.test(v)) ? '' : 'Use at least 6 characters with a letter and a number.'
};

function validateField(input) {
  const message = validators[input.id](input.value);
  input.classList.toggle('is-invalid', message !== '');
  input.classList.toggle('is-valid', message === '');
  input.nextElementSibling.textContent = message;
  return message === '';
}

function validateForm() {
  let valid = true;
  Object.keys(validators).forEach((id) => { if (!validateField($(id))) valid = false; });
  const genderOk = document.querySelector('input[name="gender"]:checked') !== null;
  $('genderError').classList.toggle('d-none', genderOk);
  const termsOk = $('terms').checked;
  $('terms').classList.toggle('is-invalid', !termsOk);
  return valid && genderOk && termsOk;
}

/* 9. Local Storage */
function getStudents() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || []; } catch (e) { return []; }
}
function saveStudent(student) {
  const list = getStudents();
  list.push(student);
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch (e) { /* storage blocked */ }
}
function renderStudents() {
  const list = getStudents();
  const body = $('studentTableBody');
  body.innerHTML = list.length === 0
    ? '<tr><td colspan="2" class="text-muted">No students yet.</td></tr>'
    : list.slice(-5).reverse().map((s) => `<tr><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.program)}</td></tr>`).join('');
  $('studentTotal').textContent = list.length;
  const last = list[list.length - 1];
  $('heroGreeting').querySelector('span').textContent = last ? `Welcome back, ${last.name}.` : 'Register to get your portal access.';
}

/* 5. Show student name after registration + confirmation modal */
function handleRegister(event) {
  event.preventDefault();
  if (!validateForm()) return;

  const student = {
    name: $('fullName').value.trim(),
    email: $('email').value.trim(),
    phone: $('phone').value.trim(),
    program: $('program').value,
    semester: $('semester').value,
    gender: document.querySelector('input[name="gender"]:checked').value,
    registeredOn: new Date().toISOString()
  };
  saveStudent(student); // password is intentionally not stored

  const alertBox = $('welcomeAlert');
  alertBox.innerHTML = `<i class="bi bi-check-circle-fill"></i> Registration successful. Welcome, <strong>${escapeHTML(student.name)}</strong>!`;
  alertBox.classList.remove('d-none');

  $('modalName').textContent = student.name;
  $('modalEmail').textContent = student.email;
  $('modalProgram').textContent = student.program;
  $('modalSemester').textContent = student.semester;
  bootstrap.Modal.getOrCreateInstance($('confirmModal')).show();

  event.target.reset();
  clearValidationStyles();
  renderStudents();
}
function clearValidationStyles() {
  document.querySelectorAll('#regForm .is-valid, #regForm .is-invalid').forEach((el) => el.classList.remove('is-valid', 'is-invalid'));
  $('genderError').classList.add('d-none');
}

/* 8. Count total courses */
function updateCourseCount() {
  const total = document.querySelectorAll('.course-item').length;
  document.querySelectorAll('.course-total').forEach((el) => { el.textContent = total; });
}

/* 6. Add a course dynamically */
function addCourse(event) {
  event.preventDefault();
  const name = $('newCourseName').value.trim();
  const code = $('newCourseCode').value.trim().toUpperCase();
  const hours = Number($('newCourseHours').value);
  const msg = $('addCourseMsg');

  if (name.length < 3 || code.length < 3 || !(hours >= 1 && hours <= 4)) {
    msg.className = 'small mt-2 text-danger';
    msg.textContent = 'Enter a name, a code (3+ characters) and credit hours from 1 to 4.';
    return;
  }
  const exists = [...document.querySelectorAll('.course-code')].some((el) => el.textContent === code);
  if (exists) {
    msg.className = 'small mt-2 text-danger';
    msg.textContent = 'A course with this code already exists.';
    return;
  }

  const col = document.createElement('div');
  col.className = 'col-sm-6 col-lg-4 course-item course-new';
  col.innerHTML = `
    <article class="card course-card h-100">
      <div class="card-body">
        <div class="course-icon"><i class="bi bi-journal-bookmark-fill"></i></div>
        <h3 class="h5 card-title">${escapeHTML(name)}</h3>
        <p class="course-code">${escapeHTML(code)}</p>
        <p class="card-text">New course added by the department.</p>
        <span class="badge badge-green"><i class="bi bi-clock"></i> ${hours} credit hours</span>
      </div>
      <div class="card-footer"><a href="#registration" class="btn btn-sm btn-orange">Enroll now</a></div>
    </article>`;
  $('courseList').appendChild(col);

  event.target.reset();
  msg.className = 'small mt-2 text-success';
  msg.textContent = `${name} was added.`;
  updateCourseCount();
  searchCourses();
}

/* 7. Search courses */
function searchCourses() {
  const term = $('courseSearch').value.trim().toLowerCase();
  const items = document.querySelectorAll('.course-item');
  let shown = 0;
  items.forEach((item) => {
    const match = item.textContent.toLowerCase().includes(term);
    item.classList.toggle('d-none', !match);
    if (match) shown++;
  });
  $('noCourse').classList.toggle('d-none', shown !== 0);
  $('searchInfo').textContent = term ? `Showing ${shown} of ${items.length} courses.` : '';
}

function clearStudents() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* storage blocked */ }
  $('welcomeAlert').classList.add('d-none');
  renderStudents();
}

/* ===== Start-up ===== */
document.addEventListener('DOMContentLoaded', () => {
  let saved = 'light';
  try { saved = localStorage.getItem(THEME_KEY) || 'light'; } catch (e) { /* storage blocked */ }
  applyTheme(saved);

  updateDateTime();
  setInterval(updateDateTime, 1000);
  updateCourseCount();
  renderStudents();

  $('headingBtn').addEventListener('click', changeHeading);
  $('themeToggle').addEventListener('click', toggleTheme);
  $('regForm').addEventListener('submit', handleRegister);
  $('regForm').addEventListener('reset', () => setTimeout(clearValidationStyles, 0));
  Object.keys(validators).forEach((id) => {
    $(id).addEventListener('blur', () => validateField($(id)));
    $(id).addEventListener('input', () => { if ($(id).classList.contains('is-invalid')) validateField($(id)); });
  });
  document.querySelectorAll('input[name="gender"]').forEach((r) => r.addEventListener('change', () => $('genderError').classList.add('d-none')));
  $('terms').addEventListener('change', () => $('terms').classList.toggle('is-invalid', !$('terms').checked));
  $('addCourseForm').addEventListener('submit', addCourse);
  $('courseSearch').addEventListener('input', searchCourses);
  $('clearStudents').addEventListener('click', clearStudents);
});
