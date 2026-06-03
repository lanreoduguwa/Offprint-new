const Contact    = require("../models/Contact");
const Newsletter = require("../models/Newsletter");

// ════════════════════════════════════════════
//  GET /admin
//  HTML Admin Dashboard
// ════════════════════════════════════════════
const adminDashboard = async (req, res) => {
  const contacts   = await Contact.find().sort({ createdAt: -1 });
  const newsletter = await Newsletter.find().sort({ createdAt: -1 });

  const contactRows = contacts.map(c => `
    <tr>
      <td>${c._id}</td>
      <td>${c.firstName} ${c.lastName}</td>
      <td>${c.email}</td>
      <td>${c.phone || "-"}</td>
      <td>${c.message}</td>
      <td>${new Date(c.createdAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</td>
      <td>
        <button onclick="deleteRecord('contact','${c._id}',this)" 
          style="background:red;color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;">
          Delete
        </button>
      </td>
    </tr>`).join("");

  const subRows = newsletter.map(n => `
    <tr>
      <td>${n._id}</td>
      <td>${n.email}</td>
      <td>${new Date(n.createdAt).toLocaleString("en-NG", { timeZone: "Africa/Lagos" })}</td>
      <td>
        <button onclick="deleteRecord('newsletter','${n._id}',this)"
          style="background:red;color:white;border:none;padding:4px 10px;border-radius:4px;cursor:pointer;">
          Remove
        </button>
      </td>
    </tr>`).join("");

  res.send(`<!DOCTYPE html>
  <html>
  <head>
    <title>Offprint Admin</title>
    <style>
      * { box-sizing:border-box; margin:0; padding:0; }
      body  { font-family:sans-serif; padding:24px; background:#0c3b2e; color:white; }
      h1    { color:#c6a437; margin-bottom:6px; }
      h2    { color:#c6a437; margin:30px 0 12px; }
      .subtitle { color:#aaa; font-size:13px; margin-bottom:24px; }
      table { width:100%; border-collapse:collapse; background:#fff; color:#000; border-radius:8px; overflow:hidden; margin-bottom:10px; }
      th    { background:#c6a437; color:#000; padding:10px 12px; text-align:left; font-size:13px; }
      td    { padding:8px 12px; border-bottom:1px solid #eee; font-size:13px; word-break:break-word; max-width:250px; }
      tr:hover td { background:#fffbe6; }
      .badge { background:#c6a437; color:#000; padding:3px 12px; border-radius:20px; font-weight:bold; font-size:13px; }
      .empty { text-align:center; padding:20px; color:#999; }
    </style>
  </head>
  <body>
    <h1>🖨️ Offprint Admin Dashboard</h1>
    <p class="subtitle">All data stored in MongoDB · Refresh page to see latest</p>

    <h2>Contact Submissions <span class="badge">${contacts.length}</span></h2>
    <table>
      <thead>
        <tr><th>ID</th><th>Name</th><th>Email</th><th>Phone</th><th>Message</th><th>Date</th><th>Action</th></tr>
      </thead>
      <tbody>
        ${contactRows || `<tr><td colspan="7" class="empty">No submissions yet</td></tr>`}
      </tbody>
    </table>

    <h2>Newsletter Subscribers <span class="badge">${newsletter.length}</span></h2>
    <table>
      <thead>
        <tr><th>ID</th><th>Email</th><th>Date Subscribed</th><th>Action</th></tr>
      </thead>
      <tbody>
        ${subRows || `<tr><td colspan="4" class="empty">No subscribers yet</td></tr>`}
      </tbody>
    </table>

    <script>
      async function deleteRecord(type, id, btn) {
        if (!confirm("Are you sure you want to delete this record?")) return;
        const url = type === "contact" ? "/api/contact/" + id : "/api/newsletter/" + id;
        const res  = await fetch(url, { method: "DELETE" });
        const data = await res.json();
        if (data.success) {
          btn.closest("tr").remove();
        } else {
          alert("Delete failed: " + data.error);
        }
      }
    </script>
  </body>
  </html>`);
};

module.exports = { adminDashboard };
