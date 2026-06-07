# Cisterni — Installation & Start Guide

Tank monitoring system: reads a PLC over Modbus (USB-serial), stores data in
PostgreSQL, and shows a live dashboard in the browser. The whole app (UI + API)
runs on **one** address: `http://localhost:4000`.

---

## 1. Install the two prerequisites (once per machine)

| Software | Windows | Linux (Debian/Ubuntu) |
|---|---|---|
| **Node.js LTS (18+)** | https://nodejs.org → download LTS, run installer | `sudo apt install nodejs npm` |
| **PostgreSQL** | https://www.postgresql.org/download/windows/ → run installer, **remember the password** you set for user `postgres` | `sudo apt install postgresql` |
| **Git** | https://git-scm.com/download/win | `sudo apt install git` |

> During the PostgreSQL install you choose a password for the `postgres` user.
> Write it down — you will put it in the config in step 3.

---

## 2. Download the app

Open a terminal (Windows: **PowerShell** or **Command Prompt**) and run:

```bash
git clone https://github.com/kiko1134/cisterni.git
cd cisterni
```

## 3. Set up (one command — it asks you a few questions)

- **Windows:** double-click **`setup.bat`**  (or run `npm run setup`)
- **macOS:** double-click **`setup.command`**  (or run `npm run setup`)
- **Linux:** run `npm run setup`

It installs everything, builds the dashboard, then **asks you**:
- your **PostgreSQL password** (from step 1)
- how the PLC is connected — **USB** or **Ethernet**
- the **serial port** (e.g. `COM3`) or the **PLC IP address** (e.g. `192.168.0.5`)

…and writes the config for you. No file editing needed.

## 4. Start

- **Windows:** double-click **`start.bat`**  (or run `npm start`)
- **macOS:** double-click **`start.command`**  (or run `npm start`)
- **Linux:** run `npm start`

On first start it automatically creates the database and tables. Then open:

```
http://localhost:4000
```

That's it. To stop: press `Ctrl + C` in the terminal (or close the window).

> To change settings later (different port, new password): run **`npm run configure`**.

---

## Updating to a new version

```bash
cd cisterni
git pull
npm run setup
npm start
```

---

## Auto-start on boot (optional, recommended for plant PCs)

So the app starts by itself after a reboot and restarts if it crashes:

```bash
npm install -g pm2
pm2 start npm --name cisterni -- start      # run from the cisterni folder
pm2 save
pm2 startup                                  # follow the printed instruction
```

---

## Troubleshooting

- **Browser shows nothing** → make sure `npm start` is still running; open `http://localhost:4000`.
- **`❌ MODBUS connection failed`** → check `MODBUS_PORT` in `backend/.env` matches the real port (Windows: Device Manager → Ports; Linux: `ls /dev/ttyUSB*`). The dashboard still works without the PLC, just with no new data.
- **Database error on start** → the `DB_PASSWORD` in `backend/.env` must match your PostgreSQL install password.
- **Levels show 0.0%** → raw mass is small for big tanks; increase `MODBUS_MASS_SCALE` in `backend/.env` and restart.
- **View from another PC on the network** → open `http://<this-PC-IP>:4000` (allow port 4000 through the firewall).
