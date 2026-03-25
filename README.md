# ServiceNow → MyTime Chrome Plugin

Automatically detects when you close a TASK or CTASK in ServiceNow,
pops up an hours dialog, then opens MyTime and auto-fills the booking form.

---

## 📦 Installation (Developer / Unpacked)

1. Open Chrome and go to: `chrome://extensions`
2. Enable **Developer mode** (top-right toggle)
3. Click **"Load unpacked"**
4. Select this folder: `servicenow-mytime-plugin/`
5. The plugin icon (purple ⏱) appears in your Chrome toolbar

---

## ▶️ How it works

1. You open a TASK or CTASK in ServiceNow
2. You change the **State** field to **"Closed Complete"**
3. A dialog pops up asking for **hours** (description & TERP are auto-filled)
4. You confirm → MyTime opens in a new tab with everything pre-filled
5. Review and click **Save** in MyTime

---

## ⚙️ TERP Code Detection

The plugin tries to detect the TERP code automatically from the ticket's
**Company** or **Customer** field by matching against a built-in list.

If it can't match, the dialog shows a warning and you enter it manually.

You can also **add/edit TERP mappings** directly from the toolbar popup
(click the plugin icon in Chrome toolbar).

---

## 🔧 Customising TERP Codes

### Option A — Toolbar popup (easiest)
Click the plugin icon → use the "TERP Overrides" section to add customer → TERP mappings.

### Option B — Edit content.js directly
Open `content.js` and find the `TERP_MAP` object near the top.
Add entries like:
```js
'customer name': { terp: '123456', task: '10.1' },
```
Then reload the extension in `chrome://extensions`.

---

## ⚠️ Notes

- MyTime auto-fill is **best-effort** — field selectors may need tuning
  if TietoEvry updates their MyTime UI. Check `mytime.js` to adjust selectors.
- The plugin only triggers **once per state change** to avoid duplicate dialogs.
- No data is sent anywhere — everything stays local in Chrome storage.

---

## 📁 File Structure

```
servicenow-mytime-plugin/
├── manifest.json       # Extension config
├── background.js       # Service worker — orchestrates flow
├── content.js          # Injected into ServiceNow — detects state change
├── mytime.js           # Injected into MyTime — auto-fills form
├── icons/
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
└── popup/
    ├── popup.html      # Toolbar popup (settings)
    ├── popup.js
    ├── dialog.html     # Hours input dialog
    └── dialog.js
```
