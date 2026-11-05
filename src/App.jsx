import { useState } from "react";
import "./App.css";

const defaultUsers = [
  {
    name: "Administrator",
    email: "admin@gmail.com",
    password: "admin123",
    role: "admin",
  },
  {
    name: "Student User",
    studentId: "STU001",
    email: "student@gmail.com",
    password: "student123",
    role: "student",
  },
];

function readStorage(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : fallback;
  } catch {
    return fallback;
  }
}

function createCaptcha() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)]
  ).join("");
}

function getGrade(average) {
  if (average >= 90) return "A+";
  if (average >= 80) return "A";
  if (average >= 70) return "B";
  if (average >= 60) return "C";
  if (average >= 50) return "D";
  return "F";
}

export default function App() {
  const [users, setUsers] = useState(() => {
    const saved = readStorage("users", null);
    if (saved) return saved;
    localStorage.setItem("users", JSON.stringify(defaultUsers));
    return defaultUsers;
  });
  const [reports, setReports] = useState(() => readStorage("reports", []));
  const [loggedInUser, setLoggedInUser] = useState(() =>
    readStorage("loggedInUser", null)
  );

  const [page, setPage] = useState("login");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginRole, setLoginRole] = useState("");
  const [loginCaptcha, setLoginCaptcha] = useState(createCaptcha);
  const [loginCaptchaInput, setLoginCaptchaInput] = useState("");
  const [loginMessage, setLoginMessage] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [registerName, setRegisterName] = useState("");
  const [registerRole, setRegisterRole] = useState("");
  const [registerStudentId, setRegisterStudentId] = useState("");
  const [registerEmail, setRegisterEmail] = useState("");
  const [registerPassword, setRegisterPassword] = useState("");
  const [registerCaptcha, setRegisterCaptcha] = useState(createCaptcha);
  const [registerCaptchaInput, setRegisterCaptchaInput] = useState("");
  const [registerMessage, setRegisterMessage] = useState("");
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [reportForm, setReportForm] = useState({
    studentId: "",
    studentName: "",
    htmlMarks: "",
    cssMarks: "",
    javascriptMarks: "",
    attendance: "",
  });
  const [reportMessage, setReportMessage] = useState("");

  function changeUsers(nextUsers) {
    setUsers(nextUsers);
    localStorage.setItem("users", JSON.stringify(nextUsers));
  }

  function changeReports(nextReports) {
    setReports(nextReports);
    localStorage.setItem("reports", JSON.stringify(nextReports));
  }

  function openLogin() {
    setPage("login");
    setLoginMessage("");
    setLoginCaptcha(createCaptcha());
    setLoginCaptchaInput("");
  }

  function openRegister() {
    setPage("register");
    setRegisterMessage("");
    setRegisterCaptcha(createCaptcha());
    setRegisterCaptchaInput("");
  }

  function handleLogin(event) {
    event.preventDefault();

    if (loginCaptchaInput.trim().toUpperCase() !== loginCaptcha) {
      setLoginMessage("Captcha is incorrect. Please try again.");
      setLoginCaptcha(createCaptcha());
      setLoginCaptchaInput("");
      return;
    }

    const foundUser = users.find(
      (user) =>
        user.email.toLowerCase() === loginEmail.trim().toLowerCase() &&
        user.password === loginPassword &&
        user.role === loginRole
    );

    if (!foundUser) {
      setLoginMessage("Email, password, or role is incorrect.");
      setLoginCaptcha(createCaptcha());
      setLoginCaptchaInput("");
      return;
    }

    localStorage.setItem("loggedInUser", JSON.stringify(foundUser));
    setLoggedInUser(foundUser);
    setLoginMessage("");
  }

  function handleRegister(event) {
    event.preventDefault();

    if (registerCaptchaInput.trim().toUpperCase() !== registerCaptcha) {
      setRegisterMessage("Captcha is incorrect. Please try again.");
      setRegisterCaptcha(createCaptcha());
      setRegisterCaptchaInput("");
      return;
    }

    if (!registerRole) {
      setRegisterMessage("Please select a role.");
      return;
    }

    if (registerRole === "student" && !registerStudentId.trim()) {
      setRegisterMessage("Student ID is required.");
      return;
    }

    const emailExists = users.some(
      (user) => user.email.toLowerCase() === registerEmail.trim().toLowerCase()
    );
    if (emailExists) {
      setRegisterMessage("This email is already registered.");
      return;
    }

    if (
      registerRole === "student" &&
      users.some(
        (user) =>
          user.studentId?.toLowerCase() === registerStudentId.trim().toLowerCase()
      )
    ) {
      setRegisterMessage("This Student ID is already registered.");
      return;
    }

    const newUser = {
      name: registerName.trim(),
      email: registerEmail.trim(),
      password: registerPassword,
      role: registerRole,
      ...(registerRole === "student"
        ? { studentId: registerStudentId.trim() }
        : {}),
    };

    changeUsers([...users, newUser]);
    setRegisterMessage("Registration successful. Please login.");
    setRegisterName("");
    setRegisterRole("");
    setRegisterStudentId("");
    setRegisterEmail("");
    setRegisterPassword("");
    setRegisterCaptchaInput("");
    setRegisterCaptcha(createCaptcha());
  }

  function logout() {
    localStorage.removeItem("loggedInUser");
    setLoggedInUser(null);
    setLoginEmail("");
    setLoginPassword("");
    setLoginRole("");
    openLogin();
  }

  function handleReportChange(event) {
    const { name, value } = event.target;
    setReportForm((current) => ({ ...current, [name]: value }));
  }

  function saveReport(event) {
    event.preventDefault();

    const student = users.find(
      (user) =>
        user.role === "student" &&
        user.studentId?.toLowerCase() === reportForm.studentId.trim().toLowerCase()
    );

    if (!student) {
      setReportMessage("Student ID not found. Register the student first.");
      return;
    }

    const marks = [
      Number(reportForm.htmlMarks),
      Number(reportForm.cssMarks),
      Number(reportForm.javascriptMarks),
      Number(reportForm.attendance),
    ];
    if (marks.some((mark) => !Number.isFinite(mark) || mark < 0 || mark > 100)) {
      setReportMessage("Enter marks and attendance between 0 and 100.");
      return;
    }

    const newReport = {
      ...reportForm,
      studentId: student.studentId,
      studentName: student.name,
    };
    const existingIndex = reports.findIndex(
      (report) => report.studentId === student.studentId
    );

    let updatedReports;
    if (existingIndex >= 0) {
      updatedReports = reports.map((report, index) =>
        index === existingIndex ? newReport : report
      );
      setReportMessage("Student report updated successfully.");
    } else {
      updatedReports = [...reports, newReport];
      setReportMessage("Student report added successfully.");
    }

    changeReports(updatedReports);
    setReportForm({
      studentId: "",
      studentName: "",
      htmlMarks: "",
      cssMarks: "",
      javascriptMarks: "",
      attendance: "",
    });
  }

  function deleteReport(studentId) {
    if (window.confirm("Are you sure you want to delete this report?")) {
      changeReports(reports.filter((report) => report.studentId !== studentId));
    }
  }

  if (loggedInUser?.role === "admin") {
    const studentCount = users.filter((user) => user.role === "student").length;

    return (
      <div className="dashboard-page">
        <header className="topbar">
          <h2>Student Report System</h2>
          <div className="topbar-right">
            <span>Hello, {loggedInUser.name}</span>
            <button className="light-button" onClick={logout}>Logout</button>
          </div>
        </header>

        <main className="dashboard-container">
          <section className="welcome">
            <h1>Administrator Dashboard</h1>
            <p>Add, update, view, and delete student academic reports.</p>
          </section>

          <section className="stats-grid">
            <div className="stat-card">
              <h2>{studentCount}</h2>
              <p>Registered Students</p>
            </div>
            <div className="stat-card">
              <h2>{reports.length}</h2>
              <p>Saved Reports</p>
            </div>
            <div className="stat-card">
              <h2>Admin</h2>
              <p>Current Role</p>
            </div>
          </section>

          <section className="content-card">
            <h2>Add or Update Student Report</h2>
            <form className="report-form" onSubmit={saveReport}>
              <input name="studentId" placeholder="Student ID (Example: STU001)" value={reportForm.studentId} onChange={handleReportChange} required />
              <input name="htmlMarks" type="number" min="0" max="100" placeholder="HTML Marks" value={reportForm.htmlMarks} onChange={handleReportChange} required />
              <input name="cssMarks" type="number" min="0" max="100" placeholder="CSS Marks" value={reportForm.cssMarks} onChange={handleReportChange} required />
              <input name="javascriptMarks" type="number" min="0" max="100" placeholder="JavaScript Marks" value={reportForm.javascriptMarks} onChange={handleReportChange} required />
              <input name="attendance" type="number" min="0" max="100" placeholder="Attendance Percentage" value={reportForm.attendance} onChange={handleReportChange} required />
              <button className="primary-button" type="submit">Save Student Report</button>
            </form>
            {reportMessage && <p className="form-message">{reportMessage}</p>}
          </section>

          <section className="content-card">
            <h2>All Student Reports</h2>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Student ID</th><th>Name</th><th>HTML</th><th>CSS</th>
                    <th>JavaScript</th><th>Attendance</th><th>Average</th>
                    <th>Grade</th><th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => {
                    const average = (
                      Number(report.htmlMarks) +
                      Number(report.cssMarks) +
                      Number(report.javascriptMarks)
                    ) / 3;
                    return (
                      <tr key={report.studentId}>
                        <td>{report.studentId}</td>
                        <td>{report.studentName}</td>
                        <td>{report.htmlMarks}</td>
                        <td>{report.cssMarks}</td>
                        <td>{report.javascriptMarks}</td>
                        <td>{report.attendance}%</td>
                        <td>{average.toFixed(2)}%</td>
                        <td>{getGrade(average)}</td>
                        <td>
                          <button className="delete-button" onClick={() => deleteReport(report.studentId)}>Delete</button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {reports.length === 0 && <p className="empty-message">No reports are available yet.</p>}
            </div>
          </section>
        </main>
      </div>
    );
  }

  if (loggedInUser?.role === "student") {
    const studentReport = reports.find(
      (report) => report.studentId === loggedInUser.studentId
    );

    let average = 0;
    if (studentReport) {
      average = (
        Number(studentReport.htmlMarks) +
        Number(studentReport.cssMarks) +
        Number(studentReport.javascriptMarks)
      ) / 3;
    }

    return (
      <div className="dashboard-page">
        <header className="topbar">
          <h2>Student Report System</h2>
          <div className="topbar-right">
            <span>Hello, {loggedInUser.name}</span>
            <button className="light-button" onClick={logout}>Logout</button>
          </div>
        </header>

        <main className="dashboard-container">
          <section className="welcome">
            <h1>Student Dashboard</h1>
            <p>View your academic performance and attendance details.</p>
          </section>

          {!studentReport ? (
            <section className="content-card no-report">
              <h2>No Report Available</h2>
              <p>Your report has not been added by the administrator yet. Please contact the administrator.</p>
            </section>
          ) : (
            <>
              <section className="stats-grid">
                <div className="stat-card"><h2>{average.toFixed(2)}%</h2><p>Overall Average</p></div>
                <div className="stat-card"><h2>{getGrade(average)}</h2><p>Final Grade</p></div>
                <div className="stat-card"><h2>{studentReport.attendance}%</h2><p>Attendance</p></div>
              </section>
              <section className="content-card">
                <h2>My Academic Report</h2>
                <div className="student-details">
                  <p><strong>Name:</strong> {studentReport.studentName}</p>
                  <p><strong>Student ID:</strong> {studentReport.studentId}</p>
                </div>
                <div className="table-wrap">
                  <table>
                    <thead><tr><th>Subject</th><th>Marks</th></tr></thead>
                    <tbody>
                      <tr><td>HTML</td><td>{studentReport.htmlMarks}</td></tr>
                      <tr><td>CSS</td><td>{studentReport.cssMarks}</td></tr>
                      <tr><td>JavaScript</td><td>{studentReport.javascriptMarks}</td></tr>
                    </tbody>
                  </table>
                </div>
              </section>
            </>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-box">
        <section className="brand-panel">
          <div className="logo">SRS</div>
          <h1>Student Report System</h1>
          <p>A simple platform for administrators to manage student reports and students to view academic performance.</p>
          <ul>
            <li>Login and Registration</li>
            <li>Administrator Module</li>
            <li>Student Module</li>
            <li>Captcha Verification</li>
            <li>Local Storage</li>
          </ul>
        </section>

        <section className="auth-panel">
          <div className="form-box">
            <div className="tabs">
              <button className={page === "login" ? "tab active" : "tab"} onClick={openLogin}>Login</button>
              <button className={page === "register" ? "tab active" : "tab"} onClick={openRegister}>Register</button>
            </div>

            {page === "login" ? (
              <>
                <h2>Welcome Back</h2>
                <p className="description">Login as Administrator or Student.</p>
                <form onSubmit={handleLogin}>
                  <label>Email Address</label>
                  <input type="email" placeholder="Enter email" value={loginEmail} onChange={(e) => setLoginEmail(e.target.value)} required />
                  <label>Password</label>
                  <div className="password-row">
                    <input type={showLoginPassword ? "text" : "password"} placeholder="Enter password" value={loginPassword} onChange={(e) => setLoginPassword(e.target.value)} required />
                    <button type="button" className="small-button" onClick={() => setShowLoginPassword(!showLoginPassword)}>{showLoginPassword ? "Hide" : "Show"}</button>
                  </div>
                  <label>Login As</label>
                  <select value={loginRole} onChange={(e) => setLoginRole(e.target.value)} required>
                    <option value="">Select role</option>
                    <option value="admin">Administrator</option>
                    <option value="student">Student</option>
                  </select>
                  <label>Captcha</label>
                  <div className="captcha-row">
                    <div className="captcha-code">{loginCaptcha}</div>
                    <button type="button" className="small-button" onClick={() => { setLoginCaptcha(createCaptcha()); setLoginCaptchaInput(""); }}>Refresh</button>
                  </div>
                  <input placeholder="Enter captcha" value={loginCaptchaInput} onChange={(e) => setLoginCaptchaInput(e.target.value)} required />
                  <button className="primary-button full-button" type="submit">Login</button>
                  {loginMessage && <p className="form-message error">{loginMessage}</p>}
                </form>
                <div className="demo-box">
                  <p><strong>Demo Admin:</strong> admin@gmail.com / admin123</p>
                  <p><strong>Demo Student:</strong> student@gmail.com / student123</p>
                </div>
              </>
            ) : (
              <>
                <h2>Create Account</h2>
                <p className="description">Register as a Student or Administrator.</p>
                <form onSubmit={handleRegister}>
                  <label>Full Name</label>
                  <input placeholder="Enter full name" value={registerName} onChange={(e) => setRegisterName(e.target.value)} required />
                  <label>Register As</label>
                  <select value={registerRole} onChange={(e) => setRegisterRole(e.target.value)} required>
                    <option value="">Select role</option>
                    <option value="admin">Administrator</option>
                    <option value="student">Student</option>
                  </select>
                  {registerRole === "student" && (
                    <>
                      <label>Student ID</label>
                      <input placeholder="Example: STU002" value={registerStudentId} onChange={(e) => setRegisterStudentId(e.target.value)} required />
                    </>
                  )}
                  <label>Email Address</label>
                  <input type="email" placeholder="Enter email" value={registerEmail} onChange={(e) => setRegisterEmail(e.target.value)} required />
                  <label>Password</label>
                  <div className="password-row">
                    <input type={showRegisterPassword ? "text" : "password"} placeholder="Create password" value={registerPassword} onChange={(e) => setRegisterPassword(e.target.value)} required />
                    <button type="button" className="small-button" onClick={() => setShowRegisterPassword(!showRegisterPassword)}>{showRegisterPassword ? "Hide" : "Show"}</button>
                  </div>
                  <label>Captcha</label>
                  <div className="captcha-row">
                    <div className="captcha-code">{registerCaptcha}</div>
                    <button type="button" className="small-button" onClick={() => { setRegisterCaptcha(createCaptcha()); setRegisterCaptchaInput(""); }}>Refresh</button>
                  </div>
                  <input placeholder="Enter captcha" value={registerCaptchaInput} onChange={(e) => setRegisterCaptchaInput(e.target.value)} required />
                  <button className="primary-button full-button" type="submit">Register</button>
                  {registerMessage && <p className="form-message">{registerMessage}</p>}
                </form>
                <div className="role-note">Select Administrator to create an Admin account. Select Student to create a Student account.</div>
              </>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
