// ============================================================
//  ServiceNow → MyTime  |  popup/popup.js
// ============================================================

const DEFAULT_TERP_MAP = {
  'metsa':        { terp: '303477', task: '' },
  'metsaboard':   { terp: '240686', task: '20.1.1' },
  'posti':        { terp: '205891', task: '' },
  'posti mese':   { terp: '204351', task: '' },
  'afry':         { terp: '210194', task: 'TM.Infra.DB' },
  'abb':          { terp: '210100', task: '20.1.6' },
  'ellevio':      { terp: '251445', task: '10.1' },
  'folksam':      { terp: '242737', task: '21.02' },
  'elisa':        { terp: '141657', task: '03.2' },
  'suominen':     { terp: '216924', task: 'TM.TDL_DB' },
  'wartsila':     { terp: '233865', task: '40.5.6' },
  'valmet':       { terp: '188122', task: '14.3' },
  'ssab':         { terp: '290458', task: '20.TM.DB.SPECIALIST' },
  'mondi':        { terp: '294710', task: '20.1' },
  'nordpool':     { terp: '294797', task: '3.1.8' },
  'mills':        { terp: '243523', task: '3' },
  'lassila':      { terp: '220228', task: '01.01' },
};

let terpMap = {};

async function load() {
  const result = await chrome.storage.sync.get(['terpMap', 'enabled']);
  terpMap = result.terpMap || DEFAULT_TERP_MAP;
  const enabled = result.enabled !== false;

  document.getElementById('enableToggle').checked = enabled;
  updateStatus(enabled);
  renderTerpList();
}

function updateStatus(enabled) {
  document.getElementById('statusDot').className = 'dot ' + (enabled ? 'green' : 'gray');
  document.getElementById('statusText').textContent = enabled
    ? 'Watching ServiceNow' : 'Disabled';
}

function renderTerpList() {
  const list = document.getElementById('terpList');
  list.innerHTML = '';
  const entries = Object.entries(terpMap);
  if (!entries.length) {
    list.innerHTML = '<div style="padding:10px;color:#475569;font-size:11px;text-align:center">No overrides yet</div>';
    return;
  }
  for (const [name, val] of entries) {
    const row = document.createElement('div');
    row.className = 'terp-item';
    row.innerHTML = `
      <span class="terp-name">${name}</span>
      <span class="terp-code">${val.terp}${val.task ? ' / ' + val.task : ''}</span>
      <span class="terp-del" data-key="${name}" title="Remove">✕</span>
    `;
    list.appendChild(row);
  }
  list.querySelectorAll('.terp-del').forEach(btn => {
    btn.addEventListener('click', () => {
      delete terpMap[btn.dataset.key];
      save();
    });
  });
}

function save() {
  chrome.storage.sync.set({ terpMap }, renderTerpList);
}

document.getElementById('enableToggle').addEventListener('change', e => {
  const enabled = e.target.checked;
  chrome.storage.sync.set({ enabled });
  updateStatus(enabled);
});

document.getElementById('addBtn').addEventListener('click', () => {
  const name = document.getElementById('addName').value.trim().toLowerCase();
  const terp = document.getElementById('addTerp').value.trim();
  const task = document.getElementById('addTask').value.trim();
  if (!name || !terp) return;
  terpMap[name] = { terp, task };
  document.getElementById('addName').value = '';
  document.getElementById('addTerp').value = '';
  document.getElementById('addTask').value = '';
  save();
});

load();
