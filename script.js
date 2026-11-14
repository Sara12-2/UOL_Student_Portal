/* =========================================================
   UNIVERSITY STUDENT PORTAL — script.js
   ========================================================= */

const $  = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);

/* =========================================================
   1) LIVE DATE & TIME
   ========================================================= */
function updateClock() {
  const el = $('#liveDateTime');
  if (!el) return;
  const now = new Date();
  el.textContent = now.toLocaleString('en-PK', {
    weekday: 'long', year: 'numeric', month: 'short',
    day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
}
updateClock();
setInterval(updateClock, 1000);

/* =========================================================
   2) CHANGE HEADING
   ========================================================= */
(function () {
  const btn = $('#headingBtn');
  const h1  = $('#mainHeading');
  if (!btn || !h1) return;

  const originalHTML = h1.innerHTML;
  let switched = false;

  btn.addEventListener('click', () => {
    switched = !switched;
    h1.innerHTML = switched
      ? 'Your Journey <span class="text-gradient">Starts Here.</span>'
      : originalHTML;
    btn.querySelector('i').className = switched
      ? 'bi bi-arrow-counterclockwise me-1'
      : 'bi bi-arrow-repeat me-1';
  });
})();

/* =========================================================
   3) DARK / LIGHT MODE
   ========================================================= */
(function () {
  const root  = document.documentElement;
  const btn   = $('#themeToggle');
  const icon  = $('#themeIcon');
  const label = $('#themeLabel');
  if (!btn) return;

  function applyTheme(mode) {
    root.setAttribute('data-bs-theme', mode);
    if (icon)  icon.className = mode === 'dark' ? 'bi bi-sun-fill' : 'bi bi-moon-stars-fill';
    if (label) label.textContent = mode === 'dark' ? 'Light' : 'Dark';
    localStorage.setItem('portal-theme', mode);
  }

  applyTheme(localStorage.getItem('portal-theme') || 'light');

  btn.addEventListener('click', () => {
    applyTheme(root.getAttribute('data-bs-theme') === 'dark' ? 'light' : 'dark');
  });
})();

/* =========================================================
   4) VALIDATION + 5) SHOW NAME + 9) LOCAL STORAGE
   ========================================================= */
const STUDENT_KEY = 'portal-students';

function getStudents() {
  try { return JSON.parse(localStorage.getItem(STUDENT_KEY) || '[]'); }
  catch { return []; }
}
function saveStudents(list) {
  localStorage.setItem(STUDENT_KEY, JSON.stringify(list));
}

function renderStudents() {
  const tbody = $('#studentTableBody');
  const total = $('#studentTotal');
  if (!tbody) return;

  const list = getStudents();
  tbody.innerHTML = list.length
    ? list.map(s => `<tr><td>${escapeHTML(s.name)}</td><td>${escapeHTML(s.program)}</td></tr>`).join('')
    : `<tr><td colspan="2" class="text-muted small text-center py-3">No students registered yet.</td></tr>`;

  if (total) total.textContent = list.length;
}

function escapeHTML(str) {
  return String(str).replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

function markInvalid(input, message) {
  input.classList.add('is-invalid');
  const fb = input.parentElement.querySelector('.invalid-feedback');
  if (fb) fb.textContent = message;
}
function markValid(input) {
  input.classList.remove('is-invalid');
}

function validateForm() {
  let ok = true;
  const name  = $('#fullName');
  const email = $('#email');
  const phone = $('#phone');
  const dob   = $('#dob');
  const prog  = $('#program');
  const sem   = $('#semester');
  const pass  = $('#password');
  const terms = $('#terms');

  if (name.value.trim().length < 3) { markInvalid(name, 'Enter full name (min 3 chars).'); ok = false; } else markValid(name);
  
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email.value.trim())) { markInvalid(email, 'Enter a valid email.'); ok = false; } else markValid(email);

  const phoneRe = /^03\d{2}-?\d{7}$/;
  if (!phoneRe.test(phone.value.trim())) { markInvalid(phone, 'Format: 03XX-XXXXXXX'); ok = false; } else markValid(phone);

  if (!dob.value) { markInvalid(dob, 'Select date of birth.'); ok = false; } else markValid(dob);
  if (!prog.value) { markInvalid(prog, 'Select a program.'); ok = false; } else markValid(prog);

  const semNum = Number(sem.value);
  if (!sem.value || semNum < 1 || semNum > 8) { markInvalid(sem, 'Semester 1-8.'); ok = false; } else markValid(sem);
  if (pass.value.length < 6) { markInvalid(pass, 'Min 6 characters.'); ok = false; } else markValid(pass);

  const genderEl = document.querySelector('input[name="gender"]:checked');
  const genderErr = $('#genderError');
  if (!genderEl) {
    if (genderErr) genderErr.classList.remove('d-none');
    ok = false;
  } else {
    if (genderErr) genderErr.classList.add('d-none');
  }

  if (!terms.checked) { terms.classList.add('is-invalid'); ok = false; } else terms.classList.remove('is-invalid');

  return ok;
}

(function () {
  const form = $('#regForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!validateForm()) return;

    const student = {
      name:     $('#fullName').value.trim(),
      email:    $('#email').value.trim(),
      phone:    $('#phone').value.trim(),
      dob:      $('#dob').value,
      program:  $('#program').value,
      semester: $('#semester').value,
      gender:   document.querySelector('input[name="gender"]:checked').value,
      address:  $('#address').value.trim(),
      registeredAt: new Date().toISOString()
    };

    const list = getStudents();
    list.push(student);
    saveStudents(list);
    renderStudents();

    const welcome = $('#welcomeAlert');
    welcome.classList.remove('d-none');
    welcome.innerHTML = `<i class="bi bi-check-circle-fill me-2"></i> Welcome, <strong>${escapeHTML(student.name)}</strong>! You are registered for <strong>${escapeHTML(student.program)}</strong>.`;

    const greeting = $('#heroGreeting');
    if (greeting) {
      greeting.innerHTML = `<i class="bi bi-person-check-fill text-green"></i> <span>Welcome, <strong>${escapeHTML(student.name.split(' ')[0])}</strong>!</span>`;
    }

    $('#modalName').textContent     = student.name;
    $('#modalEmail').textContent    = student.email;
    $('#modalProgram').textContent  = student.program;
    $('#modalSemester').textContent = student.semester;

    const modal = new bootstrap.Modal($('#confirmModal'));
    modal.show();

    form.reset();
    $$('#regForm .is-invalid').forEach(el => el.classList.remove('is-invalid'));
    setTimeout(() => $('#registration').scrollIntoView({ behavior: 'smooth' }), 400);
  });

  const clearBtn = $('#clearStudents');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      if (confirm('Remove all saved students?')) {
        localStorage.removeItem(STUDENT_KEY);
        renderStudents();
        $('#welcomeAlert').classList.add('d-none');
        $('#heroGreeting').innerHTML = `<i class="bi bi-person-circle"></i> <span>Register to get your portal access.</span>`;
      }
    });
  }
})();

renderStudents();

/* =========================================================
   6) ADD NEW COURSE + 8) UPDATE COUNT
   ========================================================= */
function updateCourseTotal() {
  const count = $$('#courseList .course-item').length;
  $$('.course-total').forEach(el => el.textContent = count);
}

(function () {
  const form = $('#addCourseForm');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const name = $('#newCourseName').value.trim();
    const code = $('#newCourseCode').value.trim();
    const hrs  = Number($('#newCourseHours').value);
    const msg  = $('#addCourseMsg');

    if (!name || !code || !hrs) {
      msg.className = 'small mt-2 text-danger fw-bold';
      msg.textContent = 'Please fill all fields.';
      return;
    }
    if (hrs < 1 || hrs > 4) {
      msg.className = 'small mt-2 text-danger fw-bold';
      msg.textContent = 'Credit hours must be 1-4.';
      return;
    }

    const col = document.createElement('div');
    col.className = 'col-md-6 col-lg-4 course-item';
    col.innerHTML = `
      <article class="card course-card h-100">
        <div class="card-header-custom bg-green-light">
          <div class="course-icon bg-green"><i class="bi bi-star-fill"></i></div>
          <span class="course-code text-green">${escapeHTML(code)}</span>
        </div>
        <div class="card-body">
          <h3 class="h5 card-title">${escapeHTML(name)}</h3>
          <p class="card-text">Newly added course.</p>
        </div>
        <div class="card-footer">
          <span class="badge badge-soft"><i class="bi bi-clock me-1"></i>${hrs} Credit Hrs</span>
          <a href="#registration" class="btn btn-sm btn-enroll">Enroll <i class="bi bi-arrow-right ms-1"></i></a>
        </div>
      </article>`;

    $('#courseList').appendChild(col);
    updateCourseTotal();

    form.reset();
    msg.className = 'small mt-2 text-success fw-bold';
    msg.textContent = `"${name}" added!`;
    setTimeout(() => msg.textContent = '', 3000);
  });
})();

updateCourseTotal();

/* =========================================================
   7) COURSE SEARCH
   ========================================================= */
(function () {
  const input = $('#courseSearch');
  if (!input) return;

  input.addEventListener('input', function () {
    const q = this.value.trim().toLowerCase();
    let visible = 0;

    $$('#courseList .course-item').forEach(item => {
      const match = item.textContent.toLowerCase().includes(q);
      item.style.display = match ? '' : 'none';
      if (match) visible++;
    });

    $('#noCourse').classList.toggle('d-none', visible !== 0);
    $('#searchInfo').textContent = q ? `${visible} course(s) found.` : '';
  });
})();

/* Footer Year */
const yearEl = $('#year');
if (yearEl) yearEl.textContent = new Date().getFullYear();