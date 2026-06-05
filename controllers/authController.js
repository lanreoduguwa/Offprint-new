const jwt    = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const Admin  = require("../models/Admin");

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

// ════════════════════════════════════════════
//  GET /admin/login
// ════════════════════════════════════════════
const showLogin = (req, res) => {
  res.send(`<!DOCTYPE html>
  <html><head><title>Offprintz Admin Login</title>
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:sans-serif;background:#0c3b2e;display:flex;justify-content:center;align-items:center;min-height:100vh}
    .card{background:#fff;border-radius:12px;padding:40px;width:100%;max-width:400px;box-shadow:0 8px 32px rgba(0,0,0,.3)}
    h1{color:#0c3b2e;text-align:center;margin-bottom:6px;font-size:1.6rem}
    p{color:#888;text-align:center;margin-bottom:28px;font-size:13px}
    label{display:block;font-weight:600;color:#333;margin-bottom:6px;font-size:14px}
    input{width:100%;padding:12px;border:2px solid #ddd;border-radius:6px;font-size:14px;margin-bottom:18px}
    input:focus{border-color:#c6a437;outline:none}
    button{width:100%;padding:13px;background:#c6a437;color:#0c3b2e;border:none;border-radius:6px;font-size:15px;font-weight:700;cursor:pointer}
    button:hover{background:#0c3b2e;color:#c6a437}
    .error{background:#fee;border:1px solid #fcc;color:#c00;padding:10px;border-radius:6px;margin-bottom:16px;font-size:13px;text-align:center}
  </style></head>
  <body><div class="card">
    <h1>🖨️ Admin Login</h1>
    <p>Offprintz Global Media Concepts</p>
    ${req.query.error ? `<div class="error">${req.query.error}</div>` : ""}
    <form method="POST" action="/admin/login">
      <label>Username</label>
      <input type="text" name="username" required autofocus placeholder="Enter username">
      <label>Password</label>
      <input type="password" name="password" required placeholder="Enter password">
      <button type="submit">Login</button>
    </form>
  </div></body></html>`);
};

// ════════════════════════════════════════════
//  POST /admin/login
// ════════════════════════════════════════════
const login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ username });
    if (!admin) return res.redirect("/admin/login?error=Invalid+username+or+password");

    const match = await bcrypt.compare(password, admin.passwordHash);
    if (!match) return res.redirect("/admin/login?error=Invalid+username+or+password");

    const token = generateToken(admin._id);
    res.cookie("adminToken", token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      maxAge:   7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect("/admin");
  } catch (err) {
    console.error("Login error:", err.message);
    return res.redirect("/admin/login?error=Server+error.+Try+again.");
  }
};

// ════════════════════════════════════════════
//  GET /admin/logout
// ════════════════════════════════════════════
const logout = (req, res) => {
  res.clearCookie("adminToken");
  res.redirect("/admin/login");
};

// ════════════════════════════════════════════
//  POST /admin/setup
// ════════════════════════════════════════════
const setup = async (req, res) => {
  try {
    const exists = await Admin.findOne();
    if (exists) return res.json({ success: false, error: "Admin already exists." });

    const { username, password } = req.body;
    if (!username || !password)
      return res.status(400).json({ success: false, error: "Username and password required." });

    const passwordHash = await bcrypt.hash(password, 12);
    await Admin.create({ username, passwordHash });
    return res.json({ success: true, message: `Admin '${username}' created. Login at /admin/login` });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
};

// ════════════════════════════════════════════
//  GET /admin  — Dashboard
// ════════════════════════════════════════════
const adminDashboard = (req, res) => {
  res.send(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Offprintz Admin Dashboard</title>
<style>
  :root{--gold:#c6a437;--dg:#0c3b2e;--red:#e03131;--green:#2f9e44;--radius:10px}
  *{box-sizing:border-box;margin:0;padding:0}
  body{font-family:'Segoe UI',sans-serif;background:#f4f4f4;color:#222;min-height:100vh}

  .topbar{background:var(--dg);padding:0 28px;height:60px;display:flex;align-items:center;justify-content:space-between;position:sticky;top:0;z-index:100;box-shadow:0 2px 12px rgba(0,0,0,.25)}
  .topbar-brand{font-size:1.1rem;font-weight:800;color:var(--gold);letter-spacing:1px}
  .topbar-brand span{color:#fff;font-weight:400}
  .topbar-right{display:flex;gap:12px;align-items:center}
  .topbar-right a{color:rgba(255,255,255,.7);text-decoration:none;font-size:13px;padding:6px 14px;border:1px solid rgba(255,255,255,.2);border-radius:6px;transition:.2s}
  .topbar-right a:hover{color:#fff;border-color:#fff}

  .wrapper{max-width:1100px;margin:0 auto;padding:28px 20px}

  .stats{display:grid;grid-template-columns:repeat(5,1fr);gap:16px;margin-bottom:28px}
  .stat-card{background:#fff;border-radius:var(--radius);padding:20px 24px;border-left:4px solid var(--gold);box-shadow:0 2px 8px rgba(0,0,0,.06)}
  .stat-card .label{font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px}
  .stat-card .value{font-size:2rem;font-weight:800;color:var(--dg)}

  .panel{background:#fff;border-radius:var(--radius);box-shadow:0 2px 8px rgba(0,0,0,.06);overflow:hidden;margin-bottom:28px}
  .panel-header{background:var(--dg);padding:16px 24px;display:flex;align-items:center;justify-content:space-between}
  .panel-header h2{color:var(--gold);font-size:1rem;font-weight:700;letter-spacing:.5px}
  .panel-body{padding:24px}

  .form-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px}
  .form-grid.full{grid-template-columns:1fr}
  .fg{display:flex;flex-direction:column;gap:6px}
  .fg label{font-size:13px;font-weight:600;color:#555}
  .fg input,.fg select,.fg textarea{padding:10px 12px;border:2px solid #e5e5e5;border-radius:8px;font-size:14px;font-family:inherit;transition:.2s;background:#fafafa}
  .fg input:focus,.fg select:focus,.fg textarea:focus{border-color:var(--gold);outline:none;background:#fff}
  .fg textarea{resize:vertical;min-height:80px}
  .form-actions{margin-top:18px;display:flex;gap:10px;flex-wrap:wrap}

  .btn{padding:10px 22px;border:none;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;transition:.2s;font-family:inherit}
  .btn-gold{background:var(--gold);color:var(--dg)}
  .btn-gold:hover{background:var(--dg);color:var(--gold)}
  .btn-outline{background:transparent;border:2px solid var(--gold);color:var(--dg)}
  .btn-outline:hover{background:var(--gold)}
  .btn-danger{background:var(--red);color:#fff}
  .btn-danger:hover{background:#b02222}
  .btn-sm{padding:6px 14px;font-size:12px}

  #img-preview{width:100%;max-height:200px;object-fit:cover;border-radius:8px;margin-top:8px;display:none;border:2px solid var(--gold)}

  .portfolio-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:18px}
  .p-card{border:1px solid #eee;border-radius:var(--radius);overflow:hidden;transition:.25s;position:relative}
  .p-card:hover{box-shadow:0 6px 20px rgba(0,0,0,.1);transform:translateY(-2px)}
  .p-card img{width:100%;height:180px;object-fit:cover;display:block}
  .p-card-body{padding:12px 14px}
  .p-card-body h3{font-size:14px;font-weight:700;color:var(--dg);margin-bottom:4px}
  .p-card-body .cat{font-size:11px;background:var(--gold);color:var(--dg);padding:2px 8px;border-radius:12px;font-weight:700;display:inline-block;margin-bottom:6px}
  .p-card-body .desc{font-size:12px;color:#666;margin-bottom:10px;line-height:1.5}
  .p-card-body .actions{display:flex;gap:8px}
  .featured-badge{position:absolute;top:10px;right:10px;background:var(--dg);color:var(--gold);font-size:11px;padding:3px 8px;border-radius:12px;font-weight:700}

  /* Data table */
  .data-table{width:100%;border-collapse:collapse;font-size:13px}
  .data-table th{background:#f0f0f0;padding:10px 12px;text-align:left;font-weight:700;color:#444;border-bottom:2px solid #ddd}
  .data-table td{padding:10px 12px;border-bottom:1px solid #eee;vertical-align:top}
  .data-table tr:last-child td{border-bottom:none}
  .data-table tr:hover td{background:#fafafa}
  .msg-cell{max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
  .date-cell{color:#888;white-space:nowrap}

  #toast{position:fixed;bottom:28px;right:28px;padding:14px 22px;border-radius:10px;font-size:14px;font-weight:600;color:#fff;opacity:0;pointer-events:none;transition:opacity .35s;z-index:9999;max-width:320px}
  #toast.show{opacity:1}
  #toast.success{background:#2f9e44}
  #toast.error{background:var(--red)}

  .modal-bg{position:fixed;inset:0;background:rgba(0,0,0,.55);display:none;align-items:center;justify-content:center;z-index:500;padding:20px}
  .modal-bg.open{display:flex}
  .modal{background:#fff;border-radius:14px;padding:28px;width:100%;max-width:560px;max-height:90vh;overflow-y:auto}
  .modal h3{margin-bottom:20px;color:var(--dg);font-size:1.1rem}

  .empty{text-align:center;padding:3rem;color:#aaa}
  .spinner{width:32px;height:32px;border:3px solid rgba(198,164,55,.3);border-top-color:var(--gold);border-radius:50%;animation:spin .8s linear infinite;margin:2rem auto}
  @keyframes spin{to{transform:rotate(360deg)}}

  @media(max-width:800px){
    .stats{grid-template-columns:1fr 1fr}
    .form-grid{grid-template-columns:1fr}
    .wrapper{padding:16px}
    .data-table{font-size:12px}
  }
</style>
</head>
<body>

<header class="topbar">
  <div class="topbar-brand">🖨️ Offprint <span>Admin</span></div>
  <div class="topbar-right">
    <a href="/" target="_blank">View Site ↗</a>
    <a href="/admin/logout">Logout</a>
  </div>
</header>

<div class="wrapper">

  <!-- Stats Row -->
  <div class="stats">
    <div class="stat-card"><div class="label">Portfolio Items</div><div class="value" id="stat-total">—</div></div>
    <div class="stat-card"><div class="label">Featured</div><div class="value" id="stat-featured">—</div></div>
    <div class="stat-card"><div class="label">Categories</div><div class="value" id="stat-cats">—</div></div>
    <div class="stat-card"><div class="label">Enquiries</div><div class="value" id="stat-contacts">—</div></div>
    <div class="stat-card"><div class="label">Subscribers</div><div class="value" id="stat-subs">—</div></div>
  </div>

  <!-- Add Portfolio Item -->
  <div class="panel">
    <div class="panel-header"><h2>➕ Add New Portfolio Item</h2></div>
    <div class="panel-body">
      <form id="add-form" enctype="multipart/form-data">
        <div class="form-grid">
          <div class="fg">
            <label>Title *</label>
            <input type="text" name="title" placeholder="e.g. Corporate Branding for ABC Ltd" required>
          </div>
          <div class="fg">
            <label>Category *</label>
            <select name="category" required>
              <option value="">— Select category —</option>
              <option>Branding</option><option>Printing</option><option>Packaging</option>
              <option>Book Publishing</option><option>Gift Items</option><option>Estate</option><option>Others</option>
            </select>
          </div>
        </div>
        <div class="form-grid full" style="margin-top:14px">
          <div class="fg">
            <label>Description</label>
            <textarea name="description" placeholder="Brief description (optional)"></textarea>
          </div>
        </div>
        <div class="form-grid" style="margin-top:14px">
          <div class="fg">
            <label>Image *</label>
            <input type="file" name="image" accept="image/*" id="img-input" required>
            <img id="img-preview" alt="Preview">
          </div>
          <div class="fg" style="justify-content:center">
            <label style="display:flex;align-items:center;gap:10px;cursor:pointer;margin-top:28px">
              <input type="checkbox" name="featured" value="true" style="width:18px;height:18px;accent-color:var(--gold)">
              Mark as Featured ⭐
            </label>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-gold" id="add-btn">Upload & Save</button>
          <button type="reset" class="btn btn-outline" onclick="resetPreview()">Clear</button>
        </div>
        <p id="add-status" style="margin-top:12px;font-size:13px;font-weight:600"></p>
      </form>
    </div>
  </div>

  <!-- Portfolio Items -->
  <div class="panel">
    <div class="panel-header">
      <h2>🖼️ Portfolio Items</h2>
      <button class="btn btn-outline btn-sm" onclick="loadPortfolio()">↻ Refresh</button>
    </div>
    <div class="panel-body">
      <div id="portfolio-list"><div class="spinner"></div></div>
    </div>
  </div>

  <!-- Contact Enquiries -->
  <div class="panel">
    <div class="panel-header">
      <h2>📩 Contact Enquiries</h2>
      <button class="btn btn-outline btn-sm" onclick="loadContacts()">↻ Refresh</button>
    </div>
    <div class="panel-body">
      <div id="contacts-list"><div class="spinner"></div></div>
    </div>
  </div>

  <!-- Newsletter Subscribers -->
  <div class="panel">
    <div class="panel-header">
      <h2>📧 Newsletter Subscribers</h2>
      <button class="btn btn-outline btn-sm" onclick="loadSubscribers()">↻ Refresh</button>
    </div>
    <div class="panel-body">
      <div id="subscribers-list"><div class="spinner"></div></div>
    </div>
  </div>

</div><!-- /wrapper -->

<!-- Edit Modal -->
<div class="modal-bg" id="edit-modal">
  <div class="modal">
    <h3>✏️ Edit Portfolio Item</h3>
    <form id="edit-form">
      <input type="hidden" id="edit-id">
      <div class="form-grid">
        <div class="fg"><label>Title *</label><input type="text" id="edit-title" required></div>
        <div class="fg"><label>Category *</label>
          <select id="edit-category" required>
            <option>Branding</option><option>Printing</option><option>Packaging</option>
            <option>Book Publishing</option><option>Gift Items</option><option>Estate</option><option>Others</option>
          </select>
        </div>
      </div>
      <div class="form-grid full" style="margin-top:14px">
        <div class="fg"><label>Description</label><textarea id="edit-description"></textarea></div>
      </div>
      <div class="form-grid" style="margin-top:14px">
        <div class="fg">
          <label>Replace Image (optional)</label>
          <input type="file" id="edit-image" accept="image/*">
          <img id="edit-img-preview" style="width:100%;max-height:160px;object-fit:cover;border-radius:8px;margin-top:8px;display:none;border:2px solid var(--gold)" alt="Preview">
        </div>
        <div class="fg" style="justify-content:center">
          <label style="display:flex;align-items:center;gap:10px;cursor:pointer;margin-top:28px">
            <input type="checkbox" id="edit-featured" style="width:18px;height:18px;accent-color:var(--gold)">
            Mark as Featured ⭐
          </label>
        </div>
      </div>
      <div class="form-actions">
        <button type="submit" class="btn btn-gold">Save Changes</button>
        <button type="button" class="btn btn-outline" onclick="closeEditModal()">Cancel</button>
      </div>
      <p id="edit-status" style="margin-top:12px;font-size:13px;font-weight:600"></p>
    </form>
  </div>
</div>

<div id="toast"></div>

<script>
const API = "/api/portfolio";

// ── Toast ──────────────────────────────────────
function toast(msg, type = "success") {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.className = "show " + type;
  setTimeout(() => { t.className = ""; }, 3500);
}

function fmtDate(iso) {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-GB", { day:"2-digit", month:"short", year:"numeric" });
}

// ── Portfolio ──────────────────────────────────
async function loadPortfolio() {
  const list = document.getElementById("portfolio-list");
  list.innerHTML = '<div class="spinner"></div>';
  try {
    const res  = await fetch(API, { credentials: "include" });
    const data = await res.json();
    if (!data.success) { list.innerHTML = '<div class="empty">Failed to load portfolio.</div>'; return; }

    document.getElementById("stat-total").textContent    = data.total;
    document.getElementById("stat-featured").textContent = data.data.filter(i => i.featured).length;
    document.getElementById("stat-cats").textContent     = [...new Set(data.data.map(i => i.category))].length;

    if (!data.data.length) {
      list.innerHTML = '<div class="empty"><p>No portfolio items yet. Add your first one above!</p></div>';
      return;
    }

    list.innerHTML = '<div class="portfolio-grid">' + data.data.map(item => {
      const safeItem = encodeURIComponent(JSON.stringify(item));
      return \`<div class="p-card">
        \${item.featured ? '<span class="featured-badge">⭐ Featured</span>' : ''}
        <img src="\${item.imageUrl}" alt="\${item.title}" loading="lazy">
        <div class="p-card-body">
          <span class="cat">\${item.category}</span>
          <h3>\${item.title}</h3>
          \${item.description ? '<p class="desc">' + item.description + '</p>' : ''}
          <div class="actions">
            <button class="btn btn-outline btn-sm" onclick="openEditModal(decodeURIComponent('\${safeItem}'))">Edit</button>
            <button class="btn btn-danger btn-sm" onclick="deleteItem('\${item._id}')">Delete</button>
          </div>
        </div>
      </div>\`;
    }).join('') + '</div>';
  } catch(e) {
    list.innerHTML = '<div class="empty">Network error. Try refreshing.</div>';
  }
}

// ── Image preview ──────────────────────────────
document.getElementById("img-input").addEventListener("change", function() {
  const f = this.files[0]; if (!f) return;
  const p = document.getElementById("img-preview");
  p.src = URL.createObjectURL(f); p.style.display = "block";
});
function resetPreview() {
  const p = document.getElementById("img-preview");
  p.style.display = "none"; p.src = "";
}

// ── Add form ───────────────────────────────────
document.getElementById("add-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const btn    = document.getElementById("add-btn");
  const status = document.getElementById("add-status");
  const fd     = new FormData(e.target);
  btn.textContent = "Uploading…"; btn.disabled = true; status.textContent = "";
  try {
    const res  = await fetch(API, { method: "POST", body: fd, credentials: "include" });
    const data = await res.json();
    if (data.success) { toast("✅ Item added!"); e.target.reset(); resetPreview(); loadPortfolio(); }
    else { status.textContent = "❌ " + (data.error || "Failed."); status.style.color = "#e03131"; }
  } catch { status.textContent = "❌ Network error."; status.style.color = "#e03131"; }
  btn.textContent = "Upload & Save"; btn.disabled = false;
});

// ── Delete portfolio ───────────────────────────
async function deleteItem(id) {
  if (!confirm("Delete this item? This cannot be undone.")) return;
  try {
    const res  = await fetch(API + "/" + id, { method: "DELETE", credentials: "include" });
    const data = await res.json();
    if (data.success) { toast("🗑️ Deleted."); loadPortfolio(); }
    else toast("Failed: " + data.error, "error");
  } catch { toast("Network error.", "error"); }
}

// ── Edit Modal ─────────────────────────────────
function openEditModal(itemStr) {
  const item = JSON.parse(itemStr);
  document.getElementById("edit-id").value          = item._id;
  document.getElementById("edit-title").value       = item.title;
  document.getElementById("edit-category").value    = item.category;
  document.getElementById("edit-description").value = item.description || "";
  document.getElementById("edit-featured").checked  = item.featured;
  document.getElementById("edit-img-preview").style.display = "none";
  document.getElementById("edit-status").textContent = "";
  document.getElementById("edit-modal").classList.add("open");
}
function closeEditModal() { document.getElementById("edit-modal").classList.remove("open"); }
document.getElementById("edit-modal").addEventListener("click", (e) => {
  if (e.target === document.getElementById("edit-modal")) closeEditModal();
});
document.getElementById("edit-image").addEventListener("change", function() {
  const f = this.files[0]; if (!f) return;
  const p = document.getElementById("edit-img-preview");
  p.src = URL.createObjectURL(f); p.style.display = "block";
});
document.getElementById("edit-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const id     = document.getElementById("edit-id").value;
  const status = document.getElementById("edit-status");
  const fd     = new FormData();
  fd.append("title",       document.getElementById("edit-title").value);
  fd.append("category",    document.getElementById("edit-category").value);
  fd.append("description", document.getElementById("edit-description").value);
  fd.append("featured",    document.getElementById("edit-featured").checked ? "true" : "false");
  const img = document.getElementById("edit-image").files[0];
  if (img) fd.append("image", img);
  status.textContent = "Saving…"; status.style.color = "#888";
  try {
    const res  = await fetch(API + "/" + id, { method: "PUT", body: fd, credentials: "include" });
    const data = await res.json();
    if (data.success) { toast("✅ Updated!"); closeEditModal(); loadPortfolio(); }
    else { status.textContent = "❌ " + (data.error || "Failed."); status.style.color = "#e03131"; }
  } catch { status.textContent = "❌ Network error."; status.style.color = "#e03131"; }
});

// ── Contacts ───────────────────────────────────
async function loadContacts() {
  const list = document.getElementById("contacts-list");
  list.innerHTML = '<div class="spinner"></div>';
  try {
    const res  = await fetch("/api/contact", { credentials: "include" });
    const data = await res.json();
    if (!data.success) { list.innerHTML = '<div class="empty">Failed to load enquiries.</div>'; return; }

    document.getElementById("stat-contacts").textContent = data.total;

    if (!data.data.length) {
      list.innerHTML = '<div class="empty"><p>No enquiries yet.</p></div>';
      return;
    }

    list.innerHTML = \`<table class="data-table">
      <thead><tr>
        <th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th><th></th>
      </tr></thead>
      <tbody>\${data.data.map(c => \`
        <tr>
          <td>\${c.firstName} \${c.lastName || ""}</td>
          <td><a href="mailto:\${c.email}">\${c.email}</a></td>
          <td>\${c.phone || "—"}</td>
          <td class="msg-cell" title="\${c.message}">\${c.message}</td>
          <td class="date-cell">\${fmtDate(c.createdAt)}</td>
          <td><button class="btn btn-danger btn-sm" onclick="deleteContact('\${c._id}')">Delete</button></td>
        </tr>
      \`).join("")}</tbody>
    </table>\`;
  } catch(e) {
    list.innerHTML = '<div class="empty">Network error.</div>';
  }
}

async function deleteContact(id) {
  if (!confirm("Delete this enquiry?")) return;
  try {
    const res  = await fetch("/api/contact/" + id, { method: "DELETE", credentials: "include" });
    const data = await res.json();
    if (data.success) { toast("🗑️ Enquiry deleted."); loadContacts(); }
    else toast("Failed: " + data.error, "error");
  } catch { toast("Network error.", "error"); }
}

// ── Subscribers ────────────────────────────────
async function loadSubscribers() {
  const list = document.getElementById("subscribers-list");
  list.innerHTML = '<div class="spinner"></div>';
  try {
    const res  = await fetch("/api/newsletter", { credentials: "include" });
    const data = await res.json();
    if (!data.success) { list.innerHTML = '<div class="empty">Failed to load subscribers.</div>'; return; }

    document.getElementById("stat-subs").textContent = data.total;

    if (!data.data.length) {
      list.innerHTML = '<div class="empty"><p>No subscribers yet.</p></div>';
      return;
    }

    list.innerHTML = \`<table class="data-table">
      <thead><tr><th>#</th><th>Email</th><th>Subscribed</th><th></th></tr></thead>
      <tbody>\${data.data.map((s, i) => \`
        <tr>
          <td>\${i + 1}</td>
          <td><a href="mailto:\${s.email}">\${s.email}</a></td>
          <td class="date-cell">\${fmtDate(s.createdAt)}</td>
          <td><button class="btn btn-danger btn-sm" onclick="deleteSubscriber('\${s._id}')">Remove</button></td>
        </tr>
      \`).join("")}</tbody>
    </table>\`;
  } catch(e) {
    list.innerHTML = '<div class="empty">Network error.</div>';
  }
}

async function deleteSubscriber(id) {
  if (!confirm("Remove this subscriber?")) return;
  try {
    const res  = await fetch("/api/newsletter/" + id, { method: "DELETE", credentials: "include" });
    const data = await res.json();
    if (data.success) { toast("🗑️ Subscriber removed."); loadSubscribers(); }
    else toast("Failed: " + data.error, "error");
  } catch { toast("Network error.", "error"); }
}

// ── Init ───────────────────────────────────────
loadPortfolio();
loadContacts();
loadSubscribers();
</script>
</body></html>`);
};

module.exports = { showLogin, login, logout, setup, adminDashboard };