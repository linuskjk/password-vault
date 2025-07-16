# Password Vault

A secure, client-side password manager for Synology NAS and web hosting.

## Features

- **Client-side encryption:** Passwords are encrypted in your browser before being sent to the server.
- **AES-GCM encryption:** Strong, modern encryption algorithm.
- **PBKDF2 key derivation:** Uses SHA-256, a unique salt per user, and 300,000 iterations.
- **No secrets in localStorage/sessionStorage:** Secrets are only kept in memory.
- **Master key recovery:** Your master key is shown once at registration—save it securely!
- **Responsive UI:** Modern design, easy to use.
- **Copy master key:** One-click copy button during registration.

## How it works

Passwords are encrypted client-side using AES-GCM with a PBKDF2-derived key and a unique salt before being sent to the server.

## Setup

1. **Upload files**  
   Place all files (`index.html`, `vault.js`, `vault.css`, and `php/` backend scripts) in your Synology web folder.

2. **Server requirements**  
   - PHP backend for account and entry management.
   - HTTPS enabled (recommended).
   - Firewall rules blocking HTTP (port 80, 5000) for maximum security.

3. **First use**  
   - Click **Create Account**.
   - Save your master key securely (shown once).
   - Register your username and password.
   - Use the vault to store and manage passwords.

## Security Notes

- **Never lose your master key!** It is required for recovery.
- **All encryption/decryption happens in your browser.**
- **Passwords are never sent or stored in plain text.**
- **No secrets are stored in browser storage.**
- **Always use HTTPS.**

## FAQ

**Q: What encryption is used?**  
A: AES-GCM with a PBKDF2-derived key (SHA-256, unique salt, 300,000 iterations).

**Q: How do I recover my vault?**  
A: Use your master key shown at registration.

**Q: How do I force HTTPS?**  
A: Block HTTP ports in your Synology firewall and enable HTTPS in DSM.

## License
# password-vault
