/* ----------------- CONFIG DATA (Edit here) ----------------- */

// Student details: email => info
let studentDetails = {
  "stud1@gmail.com": { name:"Arun Kumar", year:"1st Year", college:"ABC College", roll:"101" },
  "stud2@gmail.com": { name:"Bala Priya", year:"1st Year", college:"ABC College", roll:"102" },
  "stud3@gmail.com": { name:"Charan", year:"2nd Year", college:"ABC College", roll:"103" },
  "stud4@gmail.com": { name:"Deepak", year:"1st Year", college:"XYZ College", roll:"201" },
  "stud5@gmail.com": { name:"Elango", year:"2nd Year", college:"XYZ College", roll:"202" },
  "stud6@gmail.com": { name:"Farhan", year:"1st Year", college:"LMN College", roll:"301" },
  "stud7@gmail.com": { name:"Gokul", year:"3rd Year", college:"LMN College", roll:"302" },
  "stud8@gmail.com": { name:"Hemal", year:"2nd Year", college:"ABC College", roll:"104" },
  "stud9@gmail.com": { name:"Isha", year:"3rd Year", college:"XYZ College", roll:"203" },
  "stud10@gmail.com": { name:"Jai", year:"2nd Year", college:"LMN College", roll:"303" }
};

// Sections: section => [studentEmails]
let sections = {
  "A": ["stud1@gmail.com","stud2@gmail.com","stud3@gmail.com","stud8@gmail.com"],
  "B": ["stud4@gmail.com","stud5@gmail.com"],
  "C": ["stud6@gmail.com","stud7@gmail.com","stud9@gmail.com"],
  "D": ["stud10@gmail.com"],
  // E..L empty samples (admin page shows A->L)
  "E": [], "F": [], "G": [], "H": [], "I": [], "J": [], "K": [], "L": []
};

// Section -> Faculty email (single faculty per section)
let sectionFaculty = {
  "A": { email: "fac.a@gmail.com", name: "Prof. A" },
  "B": { email: "fac.b@gmail.com", name: "Prof. B" },
  "C": { email: "fac.c@gmail.com", name: "Prof. C" },
  "D": { email: "fac.d@gmail.com", name: "Prof. D" },
  // others empty
  "E": { email: "", name: "" }, "F": {email:"", name:""}, "G": {email:"", name:""},
  "H": {email:"", name:""}, "I": {email:"", name:""}, "J": {email:"", name:""},
  "K": {email:"", name:""}, "L": {email:"", name:""}
};

// Admin email(s) allowed
let adminEmails = ["admin@gmail.com"];

/* ----------------- UTILS ----------------- */
function goHome(){ window.location = "index.html"; }
function logout(){ localStorage.removeItem('role'); localStorage.removeItem('email'); localStorage.removeItem('viewStudent'); goHome(); }

/* ----------------- LOGIN (index.html) ----------------- */
function login(){
  let role = document.getElementById('role').value.trim();
  let email = document.getElementById('email').value.trim().toLowerCase();

  if(!email){
    alert('Enter email');
    return;
  }

  if(role === 'student'){
    // student must be in studentDetails
    if(!studentDetails[email]){
      alert('Invalid student email');
      return;
    }
  } else if(role === 'faculty'){
    // faculty must match at least one sectionFaculty email
    let found = false;
    for(let s in sectionFaculty){
      if(sectionFaculty[s].email && sectionFaculty[s].email.toLowerCase() === email) { found = true; break; }
    }
    if(!found){ alert('Invalid faculty email'); return; }
  } else if(role === 'admin'){
    if(!adminEmails.includes(email)){ alert('Invalid admin email'); return; }
  }

  localStorage.setItem('role', role);
  localStorage.setItem('email', email);

  // Redirect to correct dashboard
  if(role === 'student') window.location = 'student.html';
  if(role === 'faculty') window.location = 'faculty.html';
  if(role === 'admin') window.location = 'admin.html';
}

/* ----------------- STUDENT: upload & list (student.html) ----------------- */
function initStudentPage(){
  let role = localStorage.getItem('role');
  let email = localStorage.getItem('email');
  if(role !== 'student' || !email){ alert('Please login as student'); goHome(); return; }

  document.getElementById('stuInfo').innerHTML = `<strong>${email}</strong> (${ studentDetails[email] ? studentDetails[email].name : '' })`;
  loadStudentCerts();
}

function uploadCert(){
  let email = localStorage.getItem('email');
  let title = (document.getElementById('certTitle') || {}).value || '';
  let fileEl = document.getElementById('certFile');
  if(!title.trim()){ alert('Enter certificate title'); return; }
  if(!fileEl || !fileEl.files || !fileEl.files[0]){ alert('Choose file'); return; }

  let file = fileEl.files[0];
  let reader = new FileReader();
  reader.onload = function(e){
    let certs = JSON.parse(localStorage.getItem('certs__' + email) || '[]');
    certs.push({ title: title.trim(), filename: file.name, data: e.target.result, uploadedAt: new Date().toISOString() });
    localStorage.setItem('certs__' + email, JSON.stringify(certs));
    // clear form
    document.getElementById('certTitle').value = '';
    document.getElementById('certFile').value = '';
    loadStudentCerts();
  }
  reader.readAsDataURL(file);
}

function loadStudentCerts(){
  let email = localStorage.getItem('email');
  let listEl = document.getElementById('studentCertList');
  if(!listEl) return;
  let certs = JSON.parse(localStorage.getItem('certs__' + email) || '[]');
  if(certs.length === 0){
    listEl.innerHTML = '<p class="small">No certificates uploaded yet.</p>';
    return;
  }
  let html = '';
  certs.forEach((c,i) => {
    html += `<div class="list-item">
      <div>
        <strong>${i+1}. ${escapeHtml(c.title)}</strong><div class="small">${escapeHtml(c.filename)} • ${new Date(c.uploadedAt).toLocaleString()}</div>
      </div>
      <div>
        <a class="download" href="${c.data}" download="${sanitizeFilename(c.filename)}">Download</a>
      </div>
    </div>`;
  });
  listEl.innerHTML = html;
}

/* ----------------- FACULTY: view section students (faculty.html) ----------------- */
function initFacultyPage(){
  let role = localStorage.getItem('role');
  let email = localStorage.getItem('email');
  if(role !== 'faculty' || !email){ alert('Please login as faculty'); goHome(); return; }
  document.getElementById('facInfo').innerHTML = `<strong>${email}</strong>`;

  // find all sections this faculty is responsible for
  let mySections = [];
  for(let s in sectionFaculty){
    if(sectionFaculty[s].email && sectionFaculty[s].email.toLowerCase() === email.toLowerCase()){
      mySections.push(s);
    }
  }

  let secListEl = document.getElementById('facultySectionList');
  let studListEl = document.getElementById('facultyStudentList');
  secListEl.innerHTML = '';
  studListEl.innerHTML = '';

  if(mySections.length === 0){
    secListEl.innerHTML = `<p class="small">No sections assigned.</p>`;
    return;
  }

  // show sections
  mySections.forEach(s => {
    let fac = sectionFaculty[s];
    let el = document.createElement('div');
    el.className = 'list-item';
    el.innerHTML = `<div><strong>Section ${s}</strong><div class="small">${escapeHtml(fac.name)} • ${escapeHtml(fac.email)}</div></div>
                    <div><button onclick="showFacultySectionStudents('${s}')">View</button></div>`;
    secListEl.appendChild(el);
  });

  // auto show first section students
  showFacultySectionStudents(mySections[0]);
}

function showFacultySectionStudents(section){
  let students = sections[section] || [];
  let box = document.getElementById('facultyStudentList');
  box.innerHTML = `<h4>Section ${section} — Students (${students.length})</h4>`;
  if(students.length === 0){ box.innerHTML += '<p class="small">No students in this section.</p>'; return; }

  let html = '<div class="list">';
  students.forEach((email, idx) => {
    let info = studentDetails[email] || {};
    html += `<div class="list-item" onclick="openStudentProfileFromFaculty('${email}','${section}',${idx+1})">
              <div>
                <strong>${escapeHtml(info.name || email)}</strong>
                <div class="small">Roll: ${escapeHtml(info.roll || '-') } • ${escapeHtml(info.year || '')}</div>
              </div>
              <div class="small">S.No ${idx+1}</div>
            </div>`;
  });
  html += '</div>';
  box.innerHTML += html;
}

// when faculty clicks student -> set viewStudent and optional sNo, then open profile
function openStudentProfileFromFaculty(email, section, sno){
  localStorage.setItem('viewStudent', email);
  // store additional meta for profile page display
  localStorage.setItem('viewStudent_meta', JSON.stringify({ from:'faculty', section: section, sno: sno }));
  window.location = 'student_profile.html';
}

/* ----------------- ADMIN: sections A->L and students with S.No (admin.html) ----------------- */
function initAdminPage(){
  let role = localStorage.getItem('role');
  let email = localStorage.getItem('email');
  if(role !== 'admin' || !email){ alert('Please login as admin'); goHome(); return; }
  document.getElementById('adminInfo').innerHTML = `<strong>${email}</strong>`;

  // sections A..L
  let secList = document.getElementById('sectionList');
  secList.innerHTML = '';
  let keys = Object.keys(sections).sort();
  keys.forEach(s => {
    let fac = sectionFaculty[s] || { name:'', email:'' };
    let el = document.createElement('div');
    el.className = 'list-item';
    el.innerHTML = `<div><strong>Section ${s}</strong><div class="small">${escapeHtml(fac.name || '')} ${fac.email ? ' • ' + escapeHtml(fac.email) : ''}</div></div>
                    <div><button onclick="showAdminSection('${s}')">Open</button></div>`;
    secList.appendChild(el);
  });

  // clear detail area
  document.getElementById('sectionTitle').innerText = 'Section Details';
  document.getElementById('sectionFaculty').innerHTML = '';
  document.getElementById('sectionStudentList').innerHTML = '';
}

function showAdminSection(section){
  document.getElementById('sectionTitle').innerText = 'Section ' + section;
  let fac = sectionFaculty[section] || { name:'', email:'' };
  document.getElementById('sectionFaculty').innerHTML = `<p><strong>Faculty:</strong> ${escapeHtml(fac.name)} (${escapeHtml(fac.email)})</p>`;

  let students = sections[section] || [];
  let listHtml = '<h4>Students</h4>';
  if(students.length === 0){ listHtml += '<p class="small">No students in this section.</p>'; }
  else {
    listHtml += '<div class="list">';
    students.forEach((email, idx) => {
      let info = studentDetails[email] || {};
      listHtml += `<div class="list-item" onclick="openStudentProfileFromAdmin('${email}', '${section}', ${idx+1})">
                    <div>
                      <strong>${escapeHtml(info.name || email)}</strong>
                      <div class="small">Roll: ${escapeHtml(info.roll || '-') } • ${escapeHtml(info.year || '')}</div>
                    </div>
                    <div class="small">S.No ${idx+1}</div>
                   </div>`;
    });
    listHtml += '</div>';
  }
  document.getElementById('sectionStudentList').innerHTML = listHtml;
}

function openStudentProfileFromAdmin(email, section, sno){
  localStorage.setItem('viewStudent', email);
  localStorage.setItem('viewStudent_meta', JSON.stringify({ from:'admin', section: section, sno: sno }));
  window.location = 'student_profile.html';
}

/* ----------------- PROFILE PAGE (student_profile.html) ----------------- */
function loadProfilePage(){
  let email = localStorage.getItem('viewStudent');
  if(!email){ alert('No student selected'); history.back(); return; }

  let meta = JSON.parse(localStorage.getItem('viewStudent_meta') || '{}');

  // find S.No in its section if not provided
  let sno = meta.sno || findStudentSno(email, meta.section) || '-';
  document.getElementById('p_sno').innerText = sno;

  let info = studentDetails[email] || {};
  document.getElementById('p_name').innerText = info.name || '';
  document.getElementById('p_roll').innerText = info.roll || '';
  document.getElementById('p_year').innerText = info.year || '';
  document.getElementById('p_college').innerText = info.college || '';
  document.getElementById('p_email').innerText = email;

  // load certificates
  let certs = JSON.parse(localStorage.getItem('certs__' + email) || '[]');
  let box = document.getElementById('profileCertList');
  if(!box) return;
  if(certs.length === 0){
    box.innerHTML = '<p class="small">No certificates uploaded.</p>';
    return;
  }
  let html = '';
  certs.forEach((c, i) => {
    html += `<div class="list-item"><div><strong>${i+1}. ${escapeHtml(c.title)}</strong><div class="small">${escapeHtml(c.filename)}</div></div>
             <div><a class="download" href="${c.data}" download="${sanitizeFilename(c.filename)}">Download</a></div></div>`;
  });
  box.innerHTML = html;
}

function findStudentSno(email, section){
  if(!section) {
    // try to find any section that contains the student
    for(let s in sections){
      let idx = (sections[s] || []).indexOf(email);
      if(idx !== -1) return idx + 1;
    }
    return null;
  }
  let idx = (sections[section] || []).indexOf(email);
  return idx === -1 ? null : idx + 1;
}

/* ----------------- SMALL HELPERS ----------------- */
function escapeHtml(s){ if(!s && s !== 0) return ''; return String(s).replace(/[&<>"']/g, function(m){ return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'})[m]; }); }
function sanitizeFilename(fn){ return (fn || 'file').replace(/[^a-z0-9_\-\.]/ig,'_'); }
