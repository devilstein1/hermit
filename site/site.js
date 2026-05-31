(function () {
  function $(id) {
    return document.getElementById(id);
  }

  function checkedValues(name) {
    var nodes = document.querySelectorAll('input[name="' + name + '"]:checked');
    var values = [];
    for (var i = 0; i < nodes.length; i++) values.push(nodes[i].value);
    return values;
  }

  function setMsg(id, text, isErr) {
    var el = $(id);
    if (!el) return;
    el.textContent = text;
    el.className = isErr ? 'err' : 'ok';
  }

  function setInputFiles(input, fileList) {
    try {
      input.files = fileList;
      return true;
    } catch (e) {}

    try {
      var dt = new DataTransfer();
      for (var i = 0; i < fileList.length; i++) dt.items.add(fileList[i]);
      input.files = dt.files;
      return true;
    } catch (e2) {}

    return false;
  }

  function renderTags(files) {
    var tagsEl = $('fileTags');
    if (!tagsEl) return;
    tagsEl.innerHTML = '';

    for (var i = 0; i < files.length; i++) {
      var tag = document.createElement('span');
      tag.className = 'file-tag';
      tag.textContent = files[i].name;
      tagsEl.appendChild(tag);
    }
  }

  function initFileDrop() {
    var drop = $('fileDrop');
    var filesInput = $('files');
    if (!drop || !filesInput) return;

    filesInput.addEventListener('change', function () {
      renderTags(filesInput.files);
    });

    drop.addEventListener('dragover', function (e) {
      e.preventDefault();
      drop.classList.add('drag-over');
    });

    drop.addEventListener('dragleave', function () {
      drop.classList.remove('drag-over');
    });

    drop.addEventListener('drop', function (e) {
      e.preventDefault();
      drop.classList.remove('drag-over');
      if (!e.dataTransfer || !e.dataTransfer.files || !e.dataTransfer.files.length) return;
      setInputFiles(filesInput, e.dataTransfer.files);
      renderTags(filesInput.files);
    });
  }

  function checkCreds() {
    var token = ($('token') ? $('token').value : '').trim();
    var chatId = ($('chat_id') ? $('chat_id').value : '').trim();

    if (!token || !chatId) {
      setMsg('msg', 'Enter token and chat ID', true);
      return;
    }

    setMsg('msg', 'Checking...', false);

    fetch('/api/check', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: token, chat_id: chatId })
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        setMsg('msg', d.ok ? 'Valid credentials' : (d.error || 'Invalid'), !d.ok);
      })
      .catch(function () {
        setMsg('msg', 'Request failed', true);
      });
  }

  function setBusy(isBusy) {
    var btn = $('btnEncrypt');
    var statusRow = $('encStatus');
    var progress = $('progressBar');

    if (btn) btn.disabled = isBusy;
    if (statusRow) statusRow.classList.toggle('is-hidden', !isBusy);
    if (progress) progress.classList.toggle('active', isBusy);
  }

  function encryptAndSend() {
    var token = ($('token') ? $('token').value : '').trim();
    var chatId = ($('chat_id') ? $('chat_id').value : '').trim();
    var filesInput = $('files');
    var files = filesInput ? filesInput.files : [];
    var platforms = checkedValues('platform');
    var versions = checkedValues('version');

    if (!token || !chatId) {
      setMsg('msg', 'Enter token and chat ID', true);
      return;
    }

    if (!files || !files.length) {
      setMsg('msg', 'Select at least one file', true);
      return;
    }

    if (!platforms.length) {
      setMsg('msg', 'Select a platform', true);
      return;
    }

    if (!versions.length) {
      setMsg('msg', 'Select a Python version', true);
      return;
    }

    setBusy(true);
    setMsg('encMsg', 'Encrypting...', false);

    var start = Date.now();
    var timerEl = $('timer');
    var timerId = window.setInterval(function () {
      if (timerEl) timerEl.textContent = ((Date.now() - start) / 1000).toFixed(0) + 's';
    }, 1000);

    var fd = new FormData();
    fd.append('token', token);
    fd.append('chat_id', chatId);
    fd.append('anti_input', $('anti_input') && $('anti_input').checked ? '1' : '0');
    fd.append('anti_bypass', $('anti_bypass') && $('anti_bypass').checked ? '1' : '0');
    fd.append('apply_minifier', $('apply_minifier') && $('apply_minifier').checked ? '1' : '0');
    fd.append('stein_best', $('stein_best') && $('stein_best').checked ? '1' : '0');
    fd.append('strings', $('strings') && $('strings').checked ? '1' : '0');
    fd.append('platforms', platforms.join(','));
    fd.append('versions', versions.join(','));

    for (var i = 0; i < files.length; i++) fd.append('files', files[i]);

    fetch('/api/encrypt', { method: 'POST', body: fd })
      .then(function (r) {
        if (!r.ok) {
          return r.json().then(function (d) {
            throw new Error(d.error || 'Failed');
          });
        }
        return r.json();
      })
      .then(function () {
        setMsg('encMsg', 'Done. Sent to bot.', false);
      })
      .catch(function (err) {
        setMsg('encMsg', err.message || 'Error', true);
      })
      .finally(function () {
        window.clearInterval(timerId);
        if (timerEl) timerEl.textContent = '';
        setBusy(false);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFileDrop();

    var btnCheck = $('btnCheck');
    if (btnCheck) btnCheck.addEventListener('click', checkCreds);

    var btnEncrypt = $('btnEncrypt');
    if (btnEncrypt) btnEncrypt.addEventListener('click', encryptAndSend);
  });
})();
