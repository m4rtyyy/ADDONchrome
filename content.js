// ServiceNow → MyTime | content.js
// Confirmed selectors from debug:
// State:  id="element.sc_task.state"  OR  name="sc_task.state"
// Number: name="sc_task.number"

(function () {

  const TERP_MAP = {
    'posti mese sweden': { terp: '204331', task: '' },
    'posti mese':        { terp: '204351', task: '' },
    'posti onsite':      { terp: '211721', task: '' },
    'posti':             { terp: '205891', task: '' },
    'metsaboard':        { terp: '240686', task: '20.1.1' },
    'metsa':             { terp: '303477', task: '' },
    'afry':              { terp: '210194', task: 'TM.Infra.DB' },
    'abb':               { terp: '210100', task: '20.1.6' },
    'ellevio':           { terp: '251445', task: '10.1' },
    'folksam':           { terp: '242737', task: '21.02' },
    'elisa':             { terp: '141657', task: '03.2' },
    'suominen':          { terp: '216924', task: 'TM.TDL_DB' },
    'wartsila':          { terp: '233865', task: '40.5.6' },
    'valmet':            { terp: '188122', task: '14.3' },
    'ssab':              { terp: '290458', task: '20.TM.DB.SPECIALIST' },
    'mondi':             { terp: '294710', task: '20.1' },
    'nordpool':          { terp: '294797', task: '3.1.8' },
    'mills':             { terp: '243523', task: '3' },
    'lassila':           { terp: '220228', task: '01.01' },
    'tikanoja':          { terp: '220228', task: '01.01' },
    'steveco':           { terp: '152153', task: '20.1.3' },
    'tapiola':           { terp: '288348', task: '04.03' },
    'lahitapiola':       { terp: '288348', task: '04.03' },
    'zstsf':             { terp: '', task: '' },
  };

  function readField(name) {
    const el = document.querySelector(`[name="${name}"]`)
            || document.querySelector(`[id="element.${name}"]`);
    if (!el) return '';
    return (el.value || el.textContent || '').trim();
  }

  function getStateText() {
    const el = document.querySelector('[name="sc_task.state"]')
            || document.querySelector('[id="element.sc_task.state"]');
    if (!el) return '';
    if (el.tagName === 'SELECT') return el.options[el.selectedIndex]?.text?.trim() ?? '';
    return el.value?.trim() ?? '';
  }

  function lookupTerp(company) {
    const hay = (company || '').toLowerCase();
    for (const [key, val] of Object.entries(TERP_MAP)) {
      if (hay.includes(key)) return val;
    }
    return null;
  }

  let fired = false;

  function tryFire() {
    if (fired) return;
    const state = getStateText();
    if (!state.toLowerCase().includes('closed complete')) return;
    fired = true;

    const number    = readField('sc_task.number');
    const shortDesc = readField('sc_task.short_description');
    const company   = readField('sc_task.company');
    const closedAt  = (readField('sc_task.closed_at') || new Date().toISOString()).slice(0, 10);

    console.log('[SN→MyTime] 🚀 Firing!', { number, company, state });

    chrome.runtime.sendMessage({
      type: 'TASK_CLOSED',
      payload: { ticketNumber: number, shortDesc, company, closedAt, terpSuggestion: lookupTerp(company) }
    });
  }

  function attach() {
    const stateEl = document.querySelector('[name="sc_task.state"]')
                 || document.querySelector('[id="element.sc_task.state"]');

    if (!stateEl) {
      setTimeout(attach, 500);
      return;
    }

    console.log('[SN→MyTime] ✅ State field found, watching...');

    stateEl.addEventListener('change', () => {
      const s = getStateText();
      console.log('[SN→MyTime] State →', s);
      if (!s.toLowerCase().includes('closed complete')) { fired = false; return; }
      tryFire();
    });
  }

  attach();

})();
