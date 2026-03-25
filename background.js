chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === 'TASK_CLOSED') {
    console.log('[BG] TASK_CLOSED:', msg.payload);
    chrome.storage.session.set({ pendingBooking: msg.payload });
    chrome.windows.create({
      url: chrome.runtime.getURL('popup/dialog.html'),
      type: 'popup', width: 490, height: 440, focused: true,
    });
    sendResponse({ ok: true });
  }
  if (msg.type === 'HOURS_SUBMITTED') {
    chrome.storage.session.set({ mytimeBooking: msg.payload }, () => {
      chrome.tabs.create({ url: 'https://mytime.tietoevry.com' });
    });
    sendResponse({ ok: true });
  }
  if (msg.type === 'GET_PENDING') {
    chrome.storage.session.get(['pendingBooking'], r => sendResponse(r.pendingBooking || null));
    return true;
  }
  if (msg.type === 'CLEAR_PENDING') {
    chrome.storage.session.remove(['pendingBooking']);
    sendResponse({ ok: true });
  }
});
