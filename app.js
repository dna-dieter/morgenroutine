var DATA_BASE = './data/';

function formatDate(d) {
    var days = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
    var months = ['Januar', 'Februar', 'M\u00e4rz', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
    return days[d.getDay()] + ', ' + d.getDate() + '. ' + months[d.getMonth()] + ' ' + d.getFullYear();
}

function pctClass(val) { return val >= 0 ? 'positive' : 'negative'; }
function pctSign(val) { return val >= 0 ? '+' : ''; }

document.getElementById('current-date').textContent = formatDate(new Date());

async function loadJSON(file) {
    try {
        var resp = await fetch(DATA_BASE + file + '.json?t=' + Date.now());
        if (!resp.ok) throw new Error(file + ': ' + resp.status);
        return await resp.json();
    } catch (e) {
        console.warn('Fehler beim Laden von ' + file + ':', e.message);
        return null;
    }
}

function renderNachtbatch(data) {
    var dot = document.getElementById('nb-dot');
    var summary = document.getElementById('nb-summary');
    var jobs = document.getElementById('nb-jobs');
    if (!data || !data.jobs) { dot.className = 'nb-dot unknown'; summary.textContent = 'Keine Daten'; return; }
    var allOk = data.jobs.every(function(j) { return j.status === 'success'; });
    var anyFail = data.jobs.some(function(j) { return j.status === 'error'; });
    if (allOk) {
        dot.className = 'nb-dot success';
        summary.textContent = 'Alle ' + data.jobs.length + ' Jobs erfolgreich';
    } else if (anyFail) {
        dot.className = 'nb-dot error';
        var failCount = data.jobs.filter(function(j) { return j.status === 'error'; }).length;
        summary.textContent = failCount + '/' + data.jobs.length + ' Jobs fehlgeschlagen';
    } else {
        dot.className = 'nb-dot partial';
        summary.textContent = 'Teilweise erfolgreich';
    }
    jobs.innerHTML = data.jobs.map(function(j) {
        var icon = j.status === 'success' ? 'ok' : j.status === 'error' ? 'fail' : 'skip';
        var symbol = j.status === 'success' ? '\u25cf' : j.status === 'error' ? '\u2715' : '\u25cb';
        return '<div class="nb-job"><span class="nb-job-icon ' + icon + '">' + symbol + '</span> ' + j.name + ' (' + j.time + ')</div>';
    }).join('');
}

function renderAmpel(data) {
    if (!data) return;
    var dot = document.getElementById('ampel-dot');
    var text = document.getElementById('ampel-text');
    var details = document.getElementById('ampel-details');
    var colors = { gruen: 'green', gelb: 'yellow', rot: 'red' };
    var labels = { gruen: 'GR\u00dcN \u2014 Volle Positionsgr\u00f6\u00dfe', gelb: 'GELB \u2014 Reduzierte Gr\u00f6\u00dfe', rot: 'ROT \u2014 Kein Neueinstieg' };
    dot.className = 'ampel-dot ' + (colors[data.signal] || 'yellow');
    text.textContent = labels[data.signal] || data.signal;
    details.innerHTML = '<span>VIX-Regime: <strong>' + (data.vix_regime || '\u2014') + '</strong></span><span>Positionsgr\u00f6\u00dfe: <strong>' + (data.position_size || '\u2014') + '</strong></span><span>Marktphase: <strong>' + (data.market_phase || '\u2014') + '</strong></span>';
}

function renderMarket(data) {
    var grid = document.getElementById('market-grid');
    if (!data || !data.indices) { grid.innerHTML = '<div class="no-data">Keine Marktdaten</div>'; return; }
    grid.innerHTML = data.indices.map(function(idx) {
        return '<div class="market-item"><div class="ticker">' + idx.name + '</div><div class="price">' + idx.price + '</div><div class="change ' + pctClass(idx.change_pct) + '">' + pctSign(idx.change_pct) + idx.change_pct + '%</div><div class="label">' + (idx.label || '') + '</div></div>';
    }).join('');
    var badge = document.getElementById('market-phase-badge');
    if (data.weinstein_phase) { badge.textContent = 'Phase ' + data.weinstein_phase; badge.className = 'card-badge phase-' + data.weinstein_phase; }
}

function renderBreadth(data) {
    var c = document.getElementById('breadth-container');
    if (!data || !data.indicators) { c.innerHTML = '<div class="no-data">Keine Breadth-Daten</div>'; return; }
    c.innerHTML = data.indicators.map(function(ind) {
        var color = ind.value >= 60 ? 'var(--accent-green)' : ind.value >= 40 ? 'var(--accent-yellow)' : 'var(--accent-red)';
        return '<div class="breadth-item"><div class="breadth-label"><span style="color:var(--text-secondary)">' + ind.name + '</span><span style="color:' + color + ';font-weight:600">' + ind.value + '%</span></div><div class="breadth-bar"><div class="breadth-fill" style="width:' + ind.value + '%;background:' + color + '"></div></div></div>';
    }).join('');
}

function renderWatchlist(data) {
    var c = document.getElementById('watchlist-container');
    var count = document.getElementById('watchlist-count');
    if (!data || !data.stocks || !data.stocks.length) { c.innerHTML = '<div class="no-data">Watchlist leer</div>'; return; }
    count.textContent = data.stocks.length + ' Titel';
    c.innerHTML = '<table><thead><tr><th>Ticker</th><th>Kurs</th><th>\u0394%</th><th>RS</th><th>Setup</th><th>Phase</th><th>Notiz</th></tr></thead><tbody>' + data.stocks.map(function(s) {
        return '<tr><td class="ticker-name">' + s.ticker + '</td><td>' + s.price + '</td><td class="' + pctClass(s.change_pct) + '">' + pctSign(s.change_pct) + s.change_pct + '%</td><td>' + (s.rs_rating || '\u2014') + '</td><td><span class="setup-type">' + (s.setup || '\u2014') + '</span></td><td><span class="phase-badge phase-' + (s.phase || 0) + '">P' + (s.phase || '?') + '</span></td><td style="color:var(--text-secondary);font-size:.8rem">' + (s.note || '') + '</td></tr>';
    }).join('') + '</tbody></table>';
}

function renderSetups(data) {
    var c = document.getElementById('setups-container');
    var count = document.getElementById('setup-count');
    if (!data || !data.signals || !data.signals.length) { c.innerHTML = '<div class="no-data">Keine aktiven Signale</div>'; return; }
    count.textContent = data.signals.length;
    c.innerHTML = data.signals.map(function(s) {
        return '<div class="setup-item"><div><span class="ticker-name">' + s.ticker + '</span><span style="color:var(--text-muted);font-size:.8rem;margin-left:6px">' + (s.note || '') + '</span></div><span class="setup-type">' + s.type + '</span></div>';
    }).join('');
}

function renderPositions(data) {
    var c = document.getElementById('positions-container');
    var badge = document.getElementById('positions-pnl-badge');
    if (!data || !data.positions || !data.positions.length) { c.innerHTML = '<div class="no-data">Keine offenen Positionen</div>'; badge.textContent = '0 Positionen'; badge.className = 'card-badge badge-blue'; return; }
    var totalPnl = data.total_pnl || 0;
    badge.textContent = pctSign(totalPnl) + totalPnl + '% Gesamt';
    badge.className = 'card-badge ' + (totalPnl >= 0 ? 'badge-green' : 'badge-red');
    c.innerHTML = '<table><thead><tr><th>Ticker</th><th>Einstieg</th><th>Aktuell</th><th>P&L %</th><th>Stopp</th><th>Typ</th></tr></thead><tbody>' + data.positions.map(function(p) {
        return '<tr><td class="ticker-name">' + p.ticker + '</td><td>' + p.entry + '</td><td>' + p.current + '</td><td class="' + pctClass(p.pnl_pct) + '" style="font-weight:600">' + pctSign(p.pnl_pct) + p.pnl_pct + '%</td><td style="color:var(--accent-red)">' + p.stop + '</td><td><span class="setup-type">' + (p.setup_type || '\u2014') + '</span></td></tr>';
    }).join('') + '</tbody></table>';
}

function renderDiscord(data) {
    var c = document.getElementById('discord-container');
    var count = document.getElementById('discord-msg-count');
    if (!data || !data.messages || !data.messages.length) { c.innerHTML = '<div class="no-data">Keine neuen Discord-Nachrichten</div>'; return; }
    count.textContent = data.messages.length + ' Msgs';
    c.innerHTML = data.messages.slice(0, 5).map(function(m) {
        return '<div class="discord-msg"><div class="discord-author ' + (m.author === 'Olli' ? 'olli' : 'christian') + '">' + m.author + '</div><div class="discord-text">' + m.text + '</div><div class="discord-time">' + (m.channel || '') + ' \u00b7 ' + (m.time || '') + '</div></div>';
    }).join('');
}

function renderCalendar(data) {
    var c = document.getElementById('calendar-container');
    if (!data || !data.events || !data.events.length) { c.innerHTML = '<div class="no-data">Keine Termine</div>'; return; }
    var mn = ['Jan','Feb','M\u00e4r','Apr','Mai','Jun','Jul','Aug','Sep','Okt','Nov','Dez'];
    c.innerHTML = data.events.map(function(e) {
        var d = new Date(e.date);
        var tc = e.type === 'earnings' ? 'type-earnings' : e.type === 'fed' ? 'type-fed' : 'type-data';
        return '<div class="cal-item"><div class="cal-date"><div class="day">' + d.getDate() + '</div><div class="month">' + mn[d.getMonth()] + '</div></div><div><div style="font-size:.85rem">' + e.title + '</div><span class="cal-event-type ' + tc + '">' + e.type + '</span></div></div>';
    }).join('');
}

function toggleCheck(el) {
    var cb = el.querySelector('input[type="checkbox"]');
    cb.checked = !cb.checked;
    el.classList.toggle('checked', cb.checked);
}

async function init() {
    var results = await Promise.all([
        loadJSON('market'), loadJSON('breadth'), loadJSON('watchlist'), loadJSON('setups'),
        loadJSON('positions'), loadJSON('discord'), loadJSON('calendar'), loadJSON('ampel'), loadJSON('nachtbatch')
    ]);
    renderNachtbatch(results[8]);
    renderAmpel(results[7]);
    renderMarket(results[0]);
    renderBreadth(results[1]);
    renderWatchlist(results[2]);
    renderSetups(results[3]);
    renderPositions(results[4]);
    renderDiscord(results[5]);
    renderCalendar(results[6]);
    var ts = (results[0] && results[0].timestamp) || (results[7] && results[7].timestamp) || new Date().toISOString();
    document.getElementById('data-timestamp').textContent = new Date(ts).toLocaleString('de-DE');
}

init();
