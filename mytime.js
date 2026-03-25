// mytime.js - fills hours and date into MyTime weekly grid
(function () {

  function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

  function setVal(el, value) {
    const tracker = el._valueTracker;
    if (tracker) tracker.setValue('');
    el.value = value;
    el.dispatchEvent(new Event('input',  { bubbles: true }));
    el.dispatchEvent(new Event('change', { bubbles: true }));
    el.dispatchEvent(new Event('blur',   { bubbles: true }));
  }

  // Find day column index from date string "YYYY-MM-DD"
  // MyTime header shows dates like "23.03." or "23.03"
  function findDayCol(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length < 3) return -1;
    const day   = String(parseInt(parts[2])).padStart(2, '0');
    const month = String(parseInt(parts[1])).padStart(2, '0');
    const targets = [`${day}.${month}`, `${day}.${month}.`];
    const headers = document.querySelectorAll('thead th, thead td');
    let idx = -1;
    headers.forEach((h, i) => {
      const t = h.textContent.replace(/\s/g, '');
      if (targets.some(x => t.includes(x))) idx = i;
    });
    return idx;
  }

  // Navigate mini-calendar to the right week
  async function goToWeek(dateStr) {
    const day = parseInt(dateStr.split('-')[2]);
    const cells = document.querySelectorAll('table td');
    for (const cell of cells) {
      if (cell.textContent.trim() === String(day)) {
        cell.click();
        await sleep(800);
        return;
      }
    }
  }

  // Show overlay with booking info + "Copy description" button
  function showOverlay(booking) {
    const div = document.createElement('div');
    div.style.cssText = `
      position:fixed; bottom:20px; right:20px; z-index:99999;
      background:#0f172a; border:1px solid #6366f1; border-radius:12px;
      padding:16px 18px; color:#e2e8f0;
      font-family:-apple-system,sans-serif; font-size:13px; width:320px;
      box-shadow:0 8px 32px rgba(0,0,0,.5);
    `;
    div.innerHTML = `
      <div style="font-weight:700;color:#818cf8;margin-bottom:8px">⏱ ServiceNow → MyTime</div>
      <div style="font-size:12px;color:#94a3b8;margin-bottom:4px">${booking.ticketNumber} · ${booking.date}</div>
      <div style="font-weight:600;margin-bottom:4px">${booking.hours}h booked</div>
      <div style="font-size:11px;color:#64748b;margin-bottom:12px">${booking.shortDesc}</div>
      <div style="display:flex;gap:8px">
        <button id="sn-copy" style="flex:1;padding:8px;background:#1e293b;border:1px solid #334155;border-radius:6px;color:#94a3b8;font-size:11px;cursor:pointer">📋 Copy description</button>
        <button id="sn-ok" style="flex:1;padding:8px;background:#6366f1;border:none;border-radius:6px;color:white;font-size:11px;font-weight:600;cursor:pointer">Got it ✓</button>
      </div>
    `;
    document.body.appendChild(div);
    document.getElementById('sn-copy')?.addEventListener('click', () => {
      navigator.clipboard.writeText(booking.shortDesc);
      document.getElementById('sn-copy').textContent = '✓ Copied!';
    });
    document.getElementById('sn-ok')?.addEventListener('click', () => div.remove());
    setTimeout(() => div?.remove(), 60000);
  }

  async function run() {
    const result = await chrome.storage.session.get(['mytimeBooking']);
    const booking = result.mytimeBooking;
    if (!booking) return;
    await chrome.storage.session.remove(['mytimeBooking']);

    // Wait for grid
    await sleep(2000);

    // Navigate to correct week
    await goToWeek(booking.date);

    // Find correct day column
    const dayCol = findDayCol(booking.date);
    console.log('[SN→MyTime] day column index:', dayCol);

    // Find first empty row and fill hours in correct day cell
    const rows = document.querySelectorAll('tbody tr');
    let filled = false;

    for (const row of rows) {
      const cells = row.querySelectorAll('td');
      // Day columns start at index 4 (after Project, Name, Task, Type)
      const colIdx = dayCol >= 0 ? dayCol : 4;
      if (colIdx >= cells.length) continue;

      const cell = cells[colIdx];
      const input = cell.querySelector('input[type="number"], input[type="text"], input');
      if (input && !input.value) {
        input.focus();
        setVal(input, String(booking.hours));
        filled = true;
        break;
      }
    }

    console.log('[SN→MyTime] Hours filled:', filled);
    showOverlay(booking);
  }

  if (document.readyState === 'complete') run();
  else window.addEventListener('load', run);
})();
