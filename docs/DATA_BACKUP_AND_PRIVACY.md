# Data Backup, Privacy & Cloud Sync Guide

Your sanctuary is built with strict privacy and data ownership principles. You are never locked into any platform, and your thoughts are 100% private to you.

---

## 💾 How Backups Work

### 1-Click JSON Backup Export
1. Click the **Settings** gear icon in the dashboard.
2. Click **Export JSON**.
3. A complete backup file (e.g. `aryamaan-sanctuary-backup-2026-08-16.json`) will download to your computer.
4. This file contains every quote, tag, reflection, and setting in standard readable format.

### Restoring from Backup
1. In **Settings**, click **Import JSON**.
2. Select your backup file.
3. Your data will instantly restore into the sanctuary without overwriting existing entries.

---

## ☁️ Supabase Cloud Sync

* **Why use Supabase?** It allows your phone and your laptop to stay in sync automatically without paying for expensive cloud servers.
* **How to enable**:
  1. Create a free project at [supabase.com](https://supabase.com).
  2. Run the SQL script from `supabase/schema.sql` in the Supabase SQL Editor.
  3. Copy your **Project URL** and **Anon Key** from Project Settings &rarr; API.
  4. Paste them into the dashboard **Settings** modal or `server/.env`.
