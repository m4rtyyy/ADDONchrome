// dialog.js - simple: just hours + date
async function init() {
  const result = await chrome.storage.session.get(['pendingBooking']);
  const payload = result.pendingBooking;

  if (!payload) {
    document.getElementById('ticketNumber').textContent = 'No pending ticket';
    return;
  }

  document.getElementById('ticketNumber').textContent = payload.ticketNumber || '';
  document.getElementById('ticketDesc').textContent = payload.shortDesc || '';
  document.getElementById('ticketMeta').textContent = payload.closedAt || '';
  document.getElementById('bookingDate').value = payload.closedAt || new Date().toISOString().slice(0, 10);
  document.getElementById('hours').focus();

  window._payload = payload;
}

document.getElementById('btnSubmit').addEventListener('click', () => {
  const hours = parseFloat(document.getElementById('hours').value);
  if (!hours || hours <= 0) {
    document.getElementById('hours').style.borderColor = '#ef4444';
    document.getElementById('hours').focus();
    return;
  }

  const booking = {
    ticketNumber: window._payload?.ticketNumber || '',
    shortDesc:    window._payload?.shortDesc || '',
    hours,
    date: document.getElementById('bookingDate').value,
  };

  chrome.storage.session.set({ mytimeBooking: booking }, () => {
    chrome.tabs.create({ url: 'https://mytime.tietoevry.com' });
    window.close();
  });
});

document.getElementById('btnCancel').addEventListener('click', () => {
  chrome.storage.session.remove(['pendingBooking']);
  window.close();
});

init();
