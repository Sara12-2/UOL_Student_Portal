/* =========================================================
   UNIVERSITY OF LAYYAH STUDENT PORTAL  |  script.js
   Lab Task # 7 — JavaScript Functionality (35 marks)

   ========================================================= */

/* ---------- 0) SMALL HELPERS ---------- */
const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* Prevent HTML injection when inserting user text with innerHTML */
function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, (ch) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

/* Safe Local Storage wrappers (some browsers block storage) */
const storage = {
  get(key, fallback = null) {
    try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; }
    catch (e) { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem(key, JSON.stringify(value)); } catch (e) { /* ignore */ }
  },
  remove(key) {
    try { localStorage.removeItem(key); } catch (e) { /* ignore */ }
  }
};

/* =========================================================
   LOGO FALLBACK
   If images/logo.png is missing, show the Bootstrap icon mark.
   ========================================================= */
(function logoFallback() {
  $$('.brand-logo').forEach((img) => {
    const fallback = img.parentElement.querySelector('.logo-fallback');
    const showFallback = () => {
      img.hidden = true;
      if (fallback) fallback.hidden = false;
    };
    img.addEventListener('error', showFallback);
    // If image is already broken on page load
    if (img.complete && img.naturalWidth === 0) showFallback();
  });
})();

/* =========================================================
   1) DISPLAY CURRENT DATE AND TIME  (updates every second)
   ========================================================= */
function updateClock() {
  const timeEl = $('#liveTime');
  const dateEl = $('#liveDate');
  const now = new Date();

  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString('en-PK', {
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  }
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString('en-PK', {
      weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
    });
  }
}
updateClock();
setInterval(updateClock, 1000);

/* Highlight today's row in the weekly schedule table (Mon=1 ... Fri=5) */
(function highlightToday() {
  const today = new Date().getDay();               // 0 = Sunday, 1 = Monday ...
  const row = $(`#scheduleTable tr[data-day="${today}"]`);
  if (row) row.classList.add('today-row');
})();

/* =========================================================
   2) CHANGE THE WEBSITE HEADING WHEN A BUTTON IS CLICKED
   ========================================================= */
(function changeHeading() {
  const btn     = $('#headingBtn');
  const heading = $('#mainHeading');
  if (!btn || !heading) return;

  const headings = [
    'Learn. Build. Lead.',
    'Your journey starts here.',
    'Welcome to University of Layyah.'
  ];
  let index = 0;

  btn.addEventListener('click', () => {
    index = (index + 1) % headings.length;   // loop back to first
    heading.textContent = headings[index];
  });
})();

/* =========================================================
   3) DARK / LIGHT MODE  (remembered in Local Storage)
   ========================================================= */
(function themeToggle() {
  const root  = document.documentElement;
  const btn   = $('#themeToggle');
  const icon  = $('#themeIcon');
  const label = $('#themeLabel');
  if (!btn) return;

  function applyTheme(mode) {
    root.setAttribute('data-bs-theme', mode);   // Bootstrap 5.3 reads this
    icon.className    = mode === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    label.textContent = mode === 'dark' ? 'Light' : 'Dark';
    storage.set('portal-theme', mode);
  }

  // Apply saved theme (default: light)
  const saved = storage.get('portal-theme', 'light');
  applyTheme(saved);

  btn.addEventListener('click', () => {
    const current = root.getAttribute('data-bs-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });
})();

/* =========================================================
   9) LOCAL STORAGE — save, read and render registered students
   ========================================================= */
const STUDENT_KEY = 'portal-students';

function getStudents() {
  const list = storage.get(STUDENT_KEY, []);
  return Array.isArray(list) ? list : [];
}
function saveStudents(list) {
  storage.set(STUDENT_KEY, list);
}

/* Greet the last registered student in the hero card */
function setGreeting(name) {
  const greeting = $('#heroGreeting');
  if (!greeting) return;
  greeting.innerHTML = name
    ? `<i class="bi bi-person-check-fill"></i><span>Welcome, <strong>${escapeHTML(name.split(' ')[0])}</strong>!</span>`
    : `<i class="bi bi-person-circle"></i><span>Register to get your portal access.</span>`;
}

/* Render the students table + update the student counter */
function renderStudents() {
  const tbody = $('#studentTableBody');
  const total = $('#studentTotal');
  const list  = getStudents();
  if (!tbody) return;

  tbody.innerHTML = list.length
    ? list.map((s) => `
        <tr>
          <td>
            <span class="student-name">${escapeHTML(s.name)}</span>
            <span class="student-meta">${escapeHTML(s.program)} · Semester ${escapeHTML(s.semester)}</span>
          </td>
        </tr>`).join('')
    : `<tr><td class="text-muted small text-center py-3">No students registered yet.</td></tr>`;

  if (total) total.textContent = list.length;
}

/* =========================================================
   4) VALIDATE REGISTRATION FORM FIELDS
   ========================================================= */
function markInvalid(input, message) {
  input.classList.add('is-invalid');
  const feedback = input.parentElement.querySelector('.invalid-feedback');
  if (feedback && message) feedback.textContent = message;
}
function markValid(input) {
  input.classList.remove('is-invalid');
}

/* One rule per field: returns error message, or '' when valid */
const rules = {
  fullName: (v) => /^[A-Za-z][A-Za-z .'-]{2,}$/.test(v.trim())
    ? '' : 'Enter your full name (letters only, at least 3 characters).',

  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim())
    ? '' : 'Enter a valid email address.',

  phone: (v) => /^03\d{2}-?\d{7}$/.test(v.trim())
    ? '' : 'Use the format 03XX-XXXXXXX.',

  dob: (v) => {
    if (!v) return 'Select your date of birth.';
    const born = new Date(v);
    const now  = new Date();
    if (born > now) return 'Date of birth cannot be in the future.';
    let age = now.getFullYear() - born.getFullYear();
    const hadBirthday = now.getMonth() > born.getMonth() ||
      (now.getMonth() === born.getMonth() && now.getDate() >= born.getDate());
    if (!hadBirthday) age--;
    return age >= 15 ? '' : 'You must be at least 15 years old.';
  },

  program: (v) => v ? '' : 'Select a program.',

  semester: (v) =>
    (v !== '' && Number.isInteger(Number(v)) && Number(v) >= 1 && Number(v) <= 8)
      ? '' : 'Semester must be between 1 and 8.',

  password: (v) => v.length >= 6
    ? '' : 'Password must be at least 6 characters.'
};

function validateField(id) {
  const input = $('#' + id);
  if (!input) return true;
  const error = rules[id](input.value);
  if (error) { markInvalid(input, error); return false; }
  markValid(input);
  return true;
}

function validateForm() {
  let ok = true;

  // Text / email / select / number / password fields
  Object.keys(rules).forEach((id) => {
    if (!validateField(id)) ok = false;
  });

  // Gender (radio buttons)
  const gender = document.querySelector('input[name="gender"]:checked');
  const genderError = $('#genderError');
  if (genderError) genderError.classList.toggle('d-none', !!gender);
  if (!gender) ok = false;

  // Confirmation checkbox
  const terms = $('#terms');
  terms.classList.toggle('is-invalid', !terms.checked);
  if (!terms.checked) ok = false;

  return ok;
}

/* Live re-validation as the user fixes a field */
Object.keys(rules).forEach((id) => {
  const input = $('#' + id);
  if (!input) return;
  const eventName = input.tagName === 'SELECT' ? 'change' : 'input';
  input.addEventListener(eventName, () => {
    if (input.classList.contains('is-invalid')) validateField(id);
  });
});
$$('input[name="gender"]').forEach((r) =>
  r.addEventListener('change', () => $('#genderError').classList.add('d-none'))
);
$('#terms').addEventListener('change', (e) =>
  e.target.classList.toggle('is-invalid', !e.target.checked)
);

/* =========================================================
   COURSE PICKED WITH AN "ENROLL" BUTTON
   ========================================================= */
let selectedCourse = '';

function showSelectedCourse() {
  const box = $('#selectedCourse');
  if (!box) return;
  if (!selectedCourse) { box.classList.add('d-none'); box.innerHTML = ''; return; }
  box.innerHTML = `
    <i class="bi bi-bookmark-check-fill"></i>
    <span>Enrolling in <strong>${escapeHTML(selectedCourse)}</strong></span>
    <button type="button" class="btn-close" id="clearCourse" aria-label="Remove selected course"></button>`;
  box.classList.remove('d-none');
  $('#clearCourse').addEventListener('click', () => { selectedCourse = ''; showSelectedCourse(); });
}

/* =========================================================
   5) SUBMIT — save student + show the name after registration
   ========================================================= */
(function submitRegistration() {
  const form = $('#regForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    if (!validateForm()) {
      const firstError = form.querySelector('.is-invalid');
      if (firstError) firstError.focus();
      return;
    }

    const email = $('#email').value.trim().toLowerCase();
    const list  = getStudents();

    // Duplicate email check
    if (list.some((s) => s.email.toLowerCase() === email)) {
      markInvalid($('#email'), 'This email is already registered.');
      $('#email').focus();
      return;
    }

    // Password is deliberately NOT saved
    const student = {
      name:     $('#fullName').value.trim(),
      email:    $('#email').value.trim(),
      phone:    $('#phone').value.trim(),
      dob:      $('#dob').value,
      program:  $('#program').value,
      semester: $('#semester').value,
      gender:   document.querySelector('input[name="gender"]:checked').value,
      address:  $('#address').value.trim(),
      course:   selectedCourse,
      registeredAt: new Date().toISOString()
    };

    list.push(student);
    saveStudents(list);
    renderStudents();

    // Show the student's name: alert + hero card + modal
    const welcome = $('#welcomeAlert');
    welcome.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i>Welcome, <strong>${escapeHTML(student.name)}</strong>! You are registered for <strong>${escapeHTML(student.program)}</strong>.`;
    welcome.classList.remove('d-none');
    setGreeting(student.name);

    $('#modalName').textContent     = student.name;
    $('#modalEmail').textContent    = student.email;
    $('#modalProgram').textContent  = student.program;
    $('#modalSemester').textContent = student.semester;
    $('#modalCourse').textContent   = student.course || 'Not selected';
    bootstrap.Modal.getOrCreateInstance($('#confirmModal')).show();

    // Reset the form state
    form.reset();
    selectedCourse = '';
    showSelectedCourse();
  });

  // "Clear form" button
  form.addEventListener('reset', () => {
    $$('#regForm .is-invalid').forEach((el) => el.classList.remove('is-invalid'));
    $('#genderError').classList.add('d-none');
    selectedCourse = '';
    showSelectedCourse();
  });

  // Trash button: remove all saved students
  $('#clearStudents').addEventListener('click', () => {
    if (!confirm('Remove all saved students?')) return;
    storage.remove(STUDENT_KEY);
    renderStudents();
    $('#welcomeAlert').classList.add('d-none');
    setGreeting('');
  });
})();

/* On page load: render saved students and greet the latest one */
renderStudents();
(function greetLatest() {
  const list = getStudents();
  if (list.length) setGreeting(list[list.length - 1].name);
})();

/* =========================================================
   8) COUNT AND DISPLAY TOTAL AVAILABLE COURSES
   ========================================================= */
function updateCourseTotal() {
  const count = $$('#courseList .course-item').length;
  $$('.course-total').forEach((el) => { el.textContent = count; });
}

/* =========================================================
   7) COURSE SEARCH (by name or code)
   ========================================================= */
function applySearch() {
  const input = $('#courseSearch');
  if (!input) return;
  const query = input.value.trim().toLowerCase();
  let visible = 0;

  $$('#courseList .course-item').forEach((item) => {
    const title = item.querySelector('.card-title').textContent.toLowerCase();
    const code  = item.querySelector('.course-code').textContent.toLowerCase();
    const match = title.includes(query) || code.includes(query);
    item.classList.toggle('d-none', !match);   // Bootstrap hide class
    if (match) visible++;
  });

  $('#noCourse').classList.toggle('d-none', visible !== 0);
  $('#searchInfo').textContent = query ? `${visible} course(s) found.` : '';
}
$('#courseSearch').addEventListener('input', applySearch);

/* =========================================================
   6) ADD A NEW COURSE DYNAMICALLY (DOM manipulation)
   ========================================================= */
(function addCourse() {
  const form = $('#addCourseForm');
  const msg  = $('#addCourseMsg');
  if (!form) return;

  const icons = ['bi-star-fill', 'bi-lightbulb-fill', 'bi-rocket-takeoff-fill', 'bi-bookmark-star-fill'];

  function showMessage(text, type) {
    msg.className = `small mt-2 fw-semibold text-${type}`;
    msg.textContent = text;
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = $('#newCourseName').value.trim();
    const code = $('#newCourseCode').value.trim().toUpperCase();
    const hrs  = Number($('#newCourseHours').value);

    // Validate
    if (!name || !code || !hrs)
      return showMessage('Please fill in all three fields.', 'danger');
    if (!/^[A-Z]{2,4}-?\d{3}$/.test(code))
      return showMessage('Course code should look like CS-401.', 'danger');
    if (!Number.isInteger(hrs) || hrs < 1 || hrs > 4)
      return showMessage('Credit hours must be between 1 and 4.', 'danger');

    const exists = [...$$('#courseList .course-code')]
      .some((el) => el.textContent.trim().toUpperCase() === code);
    if (exists)
      return showMessage(`A course with code ${code} already exists.`, 'danger');

    // Alternate green / orange cards
    const count = $$('#courseList .course-item').length;
    const tone  = count % 2 === 0 ? 'tone-orange' : 'tone-green';
    const icon  = icons[count % icons.length];

    // Build the new card as a DOM element
    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 course-item';
    col.innerHTML = `
      <article class="card course-card ${tone} h-100">
        <div class="card-top">
          <span class="course-icon"><i class="bi ${icon}"></i></span>
          <span class="course-code">${escapeHTML(code)}</span>
        </div>
        <div class="card-body">
          <h3 class="h5 card-title">${escapeHTML(name)}</h3>
          <p class="card-text">Newly added course.</p>
        </div>
        <div class="card-footer">
          <span class="badge badge-soft"><i class="bi bi-clock me-1"></i>${hrs} Credit Hrs</span>
          <span class="d-flex gap-1">
            <button type="button" class="btn btn-sm btn-remove" title="Remove this course"
                    aria-label="Remove ${escapeHTML(name)}"><i class="bi bi-trash3"></i></button>
            <a href="#registration" class="btn btn-sm btn-enroll">Enroll <i class="bi bi-arrow-right ms-1"></i></a>
          </span>
        </div>
      </article>`;

    $('#courseList').appendChild(col);
    updateCourseTotal();
    applySearch();     // keep current filter working

    form.reset();
    showMessage(`"${name}" was added.`, 'success');
    setTimeout(() => { msg.textContent = ''; }, 3000);
  });
})();

/* Enroll + Remove buttons — event delegation (works for new cards too) */
$('#courseList').addEventListener('click', (e) => {
  const enroll = e.target.closest('.btn-enroll');
  if (enroll) {
    const card = enroll.closest('.course-item');
    const code = card.querySelector('.course-code').textContent.trim();
    const name = card.querySelector('.card-title').textContent.trim();
    selectedCourse = `${code} ${name}`;
    showSelectedCourse();
    return;
  }

  const remove = e.target.closest('.btn-remove');
  if (remove) {
    remove.closest('.course-item').remove();
    updateCourseTotal();
    applySearch();
  }
});

/* Initial course count on page load */
updateCourseTotal();

/* Footer year */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();