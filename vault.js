masterKey = null;

let entriesBackup = [];

// Declare globally
let userSalt = null;

async function createAccount() {
  const res = await fetch('php/create_account.php');
  const j = await res.json();
  if (j.status === 'ok') {
    masterKey = j.hash;
    document.getElementById('accountInit').style.display = 'none';
    document.getElementById('registerSection').style.display = 'block';

    // Show master key and copy button
    const regSection = document.getElementById('registerSection');
    regSection.innerHTML = `
      <h3>Register</h3>
      <div style="margin-bottom:12px;">
        <strong>Your Master Key (save securely):</strong><br>
        <input id="masterKeyDisplay" value="${masterKey}" readonly style="width:100%;font-weight:bold;margin:8px 0;" />
        <button onclick="copyMasterKey()" style="width:auto;">Copy Master Key</button>
        <div style="font-size:13px;color:#e53935;margin-top:6px;">
          You need this key to recover your vault. Save it in a safe place!
        </div>
      </div>
      <input id="regUsername" placeholder="Choose username" />
      <input id="regPassword" type="password" placeholder="Choose password" />
      <button onclick="registerUser()">Create Vault</button>
      <button onclick="goBack()">← Back</button>
    `;
  } else {
    alert(j.error);
  }
}

// Add this function to your JS:
function copyMasterKey() {
  const input = document.getElementById('masterKeyDisplay');
  input.select();
  input.setSelectionRange(0, 99999); // For mobile
  document.execCommand('copy');
}

async function registerUser() {
  const username = document.getElementById('regUsername').value;
  const password = document.getElementById('regPassword').value;
  const res = await fetch('php/register_user.php', {
    method: 'POST',
    body: new URLSearchParams({ username, password, hash: masterKey })
  });
  const j = await res.json();
  if (j.status === 'ok') {
    showVault();
  } else alert(j.error);
}

async function login() {
  const username = document.getElementById('loginUsername').value;
  const password = document.getElementById('loginPassword').value;
  const res = await fetch('php/login.php', {
    method: 'POST',
    body: new URLSearchParams({ username, password })
  });
  const j = await res.json();
  if (j.status === 'ok') {
    masterKey = j.masterKey || null;

    // After login, set userSalt from server response
    userSalt = j.salt;

    showVault();
  } else alert(j.error);
}

function logout() {
  location.reload();
}

function showLogin() {
  document.querySelectorAll('#accountInit, #registerSection, #helpSection, #vault').forEach(el => el.style.display = 'none');
  document.getElementById('loginSection').style.display = 'block';
}

function showHelp() {
  document.getElementById('loginSection').style.display = 'none';
  document.getElementById('helpSection').style.display = 'block';
}

async function resetPassword() {
  const hash = document.getElementById('resetMasterKey').value;
  const newPass = document.getElementById('resetNewPassword').value;
  const res = await fetch('php/reset_password.php', {
    method: 'POST',
    body: new URLSearchParams({ hash, newPass })
  });
  const j = await res.json();
  alert(j.status === 'ok' ? "Password reset!" : j.error);
}

async function getUsername() {
  const hash = document.getElementById('lookupMasterKey').value;
  const res = await fetch('php/get_username.php', {
    method: 'POST',
    body: new URLSearchParams({ hash })
  });
  const j = await res.json();
  alert(j.status === 'ok' ? "Your username: " + j.username : j.error);
}

function goBack() {
  document.querySelectorAll('#registerSection, #loginSection, #helpSection').forEach(el => el.style.display = 'none');
  document.getElementById('accountInit').style.display = 'block';
}

// 🔐 AES-GCM clientseitige Verschlüsselung
async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );
  return await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: enc.encode(salt),
      iterations: 300000, // very strong
      hash: "SHA-256"
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

// 🔐 AES-GCM Verschlüsselung mit gültiger Schlüssel-Länge
async function encrypt(text, key) {
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const cryptoKey = await deriveKey(key, userSalt);
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    new TextEncoder().encode(text)
  );
  const ivStr = btoa(String.fromCharCode(...iv));
  const dataStr = btoa(String.fromCharCode(...new Uint8Array(encrypted)));
  return ivStr + "::" + dataStr;
}

async function decrypt(encoded, key) {
  const [ivB64, dataB64] = encoded.split('::');
  const iv = Uint8Array.from(atob(ivB64), c => c.charCodeAt(0));
  const data = Uint8Array.from(atob(dataB64), c => c.charCodeAt(0));
  const cryptoKey = await deriveKey(key, userSalt);
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    cryptoKey,
    data
  );
  return new TextDecoder().decode(decrypted);
}

async function saveEntry() {
  const name = document.getElementById('entryName').value;
  const user = document.getElementById('entryUser').value;
  const pass = document.getElementById('entryPass').value;
  const encryptedPass = await encrypt(pass, masterKey); // Verschlüsseln!
  await fetch('php/save_entry.php', {
    method: 'POST',
    body: new URLSearchParams({ name, user, pass: encryptedPass })
  });
  await loadEntries();
}

async function loadEntries() {
  const res = await fetch('php/load_entries.php');
  const j = await res.json();
  entriesBackup = j.entries.sort((a, b) => 
    a.name.toLowerCase().localeCompare(b.name.toLowerCase())
  );
  await renderFiltered('');
}

async function renderFiltered(query) {
  const container = document.getElementById('entries');
  container.innerHTML = '';
  // Für alle Einträge
  for (const e of entriesBackup
    .filter(e => e.name.toLowerCase().includes(query.toLowerCase()) || e.user.toLowerCase().includes(query.toLowerCase()))) {
    const div = document.createElement('div');
    div.className = 'entry';
    let passText = '********';
    if (e.pass && e.pass.includes('::')) {
      try {
        passText = await decrypt(e.pass, masterKey);
      } catch {
        passText = '[Fehler]';
      }
    }
    div.innerHTML = `
      <span class="entry-name">${e.name}</span>
      <span class="entry-user">${e.user}</span>
      <span class="entry-pass password-hidden" id="pass-${e.id}">${passText}</span>
      <span class="reveal" onclick="togglePassword('${e.id}')">👁</span>
      <button class="delete" onclick="deleteEntry('${e.id}')">Delete</button>
    `;
    container.appendChild(div);
  }
}

async function togglePassword(id) {
  const span = document.getElementById('pass-' + id);

  // Wenn das aktuelle Passwort sichtbar ist, einfach blurren und zurückkehren
  if (!span.classList.contains('password-hidden')) {
    span.classList.add('password-hidden');
    return;
  }

  // Alle anderen Passwörter blurren
  document.querySelectorAll('[id^="pass-"]').forEach(otherSpan => {
    if (!otherSpan.classList.contains('password-hidden')) {
      otherSpan.classList.add('password-hidden');
    }
  });

  const entry = entriesBackup.find(e => e.id === id);
  if (!entry) return;

  if (!entry.pass.includes('::')) {
    alert('Dieses Passwort ist nicht entschlüsselt gespeichert und kann nicht angezeigt werden.');
    return;
  }

  const real = await decrypt(entry.pass, masterKey);
  span.textContent = real;
  span.classList.remove('password-hidden');
}

async function deleteEntry(id) {
  await fetch('php/delete_entry.php', {
    method: 'POST',
    body: new URLSearchParams({ id })
  });
  loadEntries();
}


function showVault() {
  document.querySelectorAll('#accountInit, #registerSection, #loginSection, #helpSection').forEach(el => el.style.display = 'none');
  const vault = document.getElementById('vault');
  vault.style.display = 'block';

  vault.innerHTML = `
    <h3>Your Vault</h3>
    <input class="search" id="searchInput" placeholder="Search..." oninput="renderFiltered(this.value)" />
    <div id="entries"></div>
    <input id="entryName" placeholder="Entry Name" />
    <input id="entryUser" placeholder="Username/Email" />
    <input id="entryPass" placeholder="Password" type="password" />
    <button onclick="saveEntry()">Save Entry</button>
    <button onclick="logout()">Logout</button>
  `;

  loadEntries();
}
