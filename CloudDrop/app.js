// ---------- Supabase import (official JS client v2 from CDN) ----------
import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm";
import { SUPABASE_URL, SUPABASE_KEY, BUCKET } from "./supabase-config.js";

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// ---------- Settings ----------
const MAX_SIZE = 5 * 1024 * 1024; // 5 MB (also enforced by the bucket in setup.sql)
const ALLOWED_TYPES = [
  "image/png", "image/jpeg", "image/gif", "image/webp",
  "application/pdf", "text/plain", "application/zip",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
];

let currentUser = null;

// ---------- DOM helpers ----------
const $ = (id) => document.getElementById(id);
const show = (e) => e.classList.remove("hidden");
const hide = (e) => e.classList.add("hidden");

function setMsg(e, text, type) {
  e.textContent = text || "";
  e.className = "msg" + (type ? " " + type : "");
}

function formatSize(bytes) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

function fileIcon(name) {
  const ext = name.split(".").pop().toLowerCase();
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "🖼️";
  if (ext === "pdf") return "📕";
  if (["doc", "docx"].includes(ext)) return "📘";
  if (["xls", "xlsx"].includes(ext)) return "📗";
  if (ext === "zip") return "🗜️";
  if (ext === "txt") return "📄";
  return "📁";
}

// Build elements with textContent so file names can never inject HTML.
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function friendlyError(err) {
  const msg = (err && err.message) || "";
  if (/failed to fetch|network/i.test(msg)) return "Network problem. Check your internet connection and try again.";
  if (/invalid login credentials/i.test(msg)) return "Wrong email or password.";
  if (/already registered/i.test(msg)) return "An account with this email already exists. Try logging in.";
  if (/email not confirmed/i.test(msg)) return "Confirm your email first (check your inbox), or turn off email confirmation in Supabase for testing.";
  if (/row-level security|unauthorized|not authorized/i.test(msg)) return "Permission denied. Make sure you ran setup.sql and are logged in.";
  if (/not found/i.test(msg)) return "That file no longer exists.";
  if (/exceeded the maximum allowed size|too large|payload/i.test(msg)) return "File is too large.";
  if (/mime type/i.test(msg)) return "This file type is not allowed.";
  return msg || "Something went wrong. Please try again.";
}

// ---------- Authentication ----------
let signupMode = false;

$("authSwitch").addEventListener("click", (e) => {
  e.preventDefault();
  signupMode = !signupMode;
  $("authTitle").textContent = signupMode ? "Create account" : "Log in";
  $("authBtn").textContent = signupMode ? "Sign up" : "Log in";
  $("authSwitchText").textContent = signupMode ? "Already have an account?" : "No account?";
  $("authSwitch").textContent = signupMode ? "Log in" : "Sign up";
  setMsg($("authMsg"), "");
});

$("authBtn").addEventListener("click", async () => {
  const email = $("email").value.trim();
  const password = $("password").value;
  if (!email || !password) {
    setMsg($("authMsg"), "Enter your email and password.", "error");
    return;
  }
  $("authBtn").disabled = true;
  try {
    if (signupMode) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      // If email confirmation is ON, there is no session yet.
      if (!data.session) {
        setMsg($("authMsg"), "Account created. Check your email to confirm, then log in.", "ok");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      setMsg($("authMsg"), "");
    }
  } catch (err) {
    setMsg($("authMsg"), friendlyError(err), "error");
  } finally {
    $("authBtn").disabled = false;
  }
});

$("logoutBtn").addEventListener("click", () => supabase.auth.signOut());

// Runs whenever the user logs in or out.
supabase.auth.onAuthStateChange((_event, session) => {
  currentUser = session ? session.user : null;
  if (currentUser) {
    hide($("authView"));
    show($("appView"));
    show($("userBox"));
    $("userEmail").textContent = currentUser.email;
    loadFiles();
  } else {
    show($("authView"));
    hide($("appView"));
    hide($("userBox"));
    $("fileList").replaceChildren();
  }
});

// ---------- Upload ----------
$("uploadBtn").addEventListener("click", () => $("fileInput").click());

$("fileInput").addEventListener("change", async (e) => {
  const files = Array.from(e.target.files);
  e.target.value = "";
  for (const file of files) await uploadFile(file);
  loadFiles();
});

function validate(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return `"${file.name}" has an unsupported file type.`;
  if (file.size > MAX_SIZE) return `"${file.name}" is ${formatSize(file.size)}. The limit is ${formatSize(MAX_SIZE)}.`;
  if (file.size === 0) return `"${file.name}" is empty.`;
  return null;
}

// supabase-js has no upload-progress callback, so we call the Storage REST API
// directly with XMLHttpRequest, which does report progress.
async function uploadFile(file) {
  const problem = validate(file);
  if (problem) {
    setMsg($("uploadMsg"), problem, "error");
    return;
  }

  const { data: sessionData } = await supabase.auth.getSession();
  const token = sessionData.session && sessionData.session.access_token;
  if (!token) {
    setMsg($("uploadMsg"), "Your session expired. Please log in again.", "error");
    return;
  }

  // Path = <user-id>/<timestamp>_<safe filename>. The user-id folder is what the policies check.
  const safeName = file.name.replace(/[^\w.\-]/g, "_");
  const path = `${currentUser.id}/${Date.now()}_${safeName}`;

  const form = new FormData();
  form.append("cacheControl", "3600");
  form.append("", file); // same format supabase-js uses internally

  setMsg($("uploadMsg"), "");
  show($("progressWrap"));
  $("uploadBtn").disabled = true;

  await new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${path}`);
    xhr.setRequestHeader("Authorization", `Bearer ${token}`);
    xhr.setRequestHeader("apikey", SUPABASE_KEY);
    xhr.setRequestHeader("x-upsert", "false");

    xhr.upload.onprogress = (ev) => {
      if (ev.lengthComputable) {
        const pct = Math.round((ev.loaded / ev.total) * 100);
        $("progressBar").style.width = pct + "%";
        $("progressText").textContent = pct + "%";
      }
    };

    const finish = () => {
      hide($("progressWrap"));
      $("progressBar").style.width = "0";
      $("uploadBtn").disabled = false;
      resolve();
    };

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        setMsg($("uploadMsg"), `Uploaded "${file.name}".`, "ok");
      } else {
        let detail = "";
        try { detail = JSON.parse(xhr.responseText).message || ""; } catch (_) {}
        setMsg($("uploadMsg"), `Upload of "${file.name}" failed. ${friendlyError({ message: detail })}`, "error");
      }
      finish();
    };
    xhr.onerror = () => {
      setMsg($("uploadMsg"), `Upload of "${file.name}" failed. Network problem. Check your connection.`, "error");
      finish();
    };
    xhr.send(form);
  });
}

// ---------- List files ----------
async function loadFiles() {
  const list = $("fileList");
  setMsg($("listMsg"), "");
  hide($("empty"));
  show($("loading"));
  list.replaceChildren();

  try {
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .list(currentUser.id, { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (error) throw error;

    // Ignore Supabase's hidden folder placeholder.
    const items = (data || []).filter((f) => f.name !== ".emptyFolderPlaceholder" && f.id);

    let total = 0;
    items.forEach((f) => {
      const size = (f.metadata && f.metadata.size) || 0;
      total += size;
      list.appendChild(renderItem(f, size));
    });

    $("statFiles").textContent = items.length;
    $("statSize").textContent = formatSize(total);
    if (items.length === 0) show($("empty"));
  } catch (err) {
    setMsg($("listMsg"), "Could not load files. " + friendlyError(err), "error");
  } finally {
    hide($("loading"));
  }
}

function displayName(fullName) {
  return fullName.replace(/^\d+_/, ""); // remove the timestamp prefix
}

function renderItem(file, size) {
  const name = displayName(file.name);
  const li = el("li", "file-item");

  li.appendChild(el("div", "file-icon", fileIcon(name)));

  const info = el("div", "file-info");
  info.appendChild(el("div", "file-name", name));
  info.appendChild(el(
    "div", "file-meta",
    `${formatSize(size)} • ${new Date(file.created_at).toLocaleString()}`
  ));
  li.appendChild(info);

  const actions = el("div", "file-actions");
  const dl = el("button", "btn btn-small btn-outline", "Download");
  dl.addEventListener("click", () => downloadFile(file.name, name));
  const del = el("button", "btn btn-small btn-danger", "Delete");
  del.addEventListener("click", () => deleteFile(file.name, name, li)); // li passed for the slide-out animation
  actions.append(dl, del);
  li.appendChild(actions);

  return li;
}

// ---------- Download ----------
async function downloadFile(storedName, name) {
  setMsg($("listMsg"), "");
  try {
    // A signed URL is a temporary link (60 seconds) because the bucket is private.
    // The { download } option makes the browser save the file instead of previewing it.
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(`${currentUser.id}/${storedName}`, 60, { download: name });
    if (error) throw error;

    const a = document.createElement("a");
    a.href = data.signedUrl;
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    a.remove();
  } catch (err) {
    setMsg($("listMsg"), "Download failed. " + friendlyError(err), "error");
    if (/not found/i.test((err && err.message) || "")) loadFiles();
  }
}

// ---------- Delete ----------
async function deleteFile(storedName, name, li) {
  if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([`${currentUser.id}/${storedName}`]);
    if (error) throw error;
    setMsg($("listMsg"), `Deleted "${name}".`, "ok");
    // Slide the row out before the list reloads.
    if (li) {
      li.classList.add("removing");
      await new Promise((r) => setTimeout(r, 450));
    }
  } catch (err) {
    setMsg($("listMsg"), "Delete failed. " + friendlyError(err), "error");
    return;
  }
  loadFiles();
}
