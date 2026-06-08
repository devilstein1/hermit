(function () {
  var currentMode = 'download';
  var currentBundle = 'individual';

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

  function updateModeUI() {
    var isBot = currentMode === 'bot';
    var credsFields = $('credsFields');
    var btnLabel = $('btnRunLabel');
    var toggle = $('modeToggle');
    var hint = $('modeHint');
    var labels = document.querySelectorAll('.mode-toggle-label');

    if (credsFields) credsFields.classList.toggle('is-hidden', !isBot);
    if (toggle) {
      toggle.setAttribute('data-mode', isBot ? 'bot' : 'download');
      toggle.setAttribute('aria-checked', isBot ? 'true' : 'false');
    }
    for (var i = 0; i < labels.length; i++) {
      labels[i].classList.toggle('is-active', labels[i].getAttribute('data-mode') === currentMode);
    }
    if (btnLabel) btnLabel.textContent = 'Encrypt';
    if (hint) {
      hint.textContent = isBot
        ? 'Files will be encrypted and sent to your Telegram bot.'
        : 'No bot credentials needed — files download directly.';
    }
  }

  function setMode(mode) {
    currentMode = mode === 'bot' ? 'bot' : 'download';
    updateModeUI();
    updateBundleUI();
  }

  function toggleMode() {
    setMode(currentMode === 'bot' ? 'download' : 'bot');
  }

  function updateBundleUI() {
    var isBot = currentMode === 'bot';
    var sw = $('bundleSwitch');
    var hint = $('bundleHint');
    var field = $('bundleField');
    var options = document.querySelectorAll('#bundleSwitch .pill-option');

    if (field) field.classList.toggle('is-hidden', isBot);

    if (sw) sw.setAttribute('data-mode', currentBundle);
    for (var i = 0; i < options.length; i++) {
      var isActive = options[i].getAttribute('data-value') === currentBundle;
      options[i].classList.toggle('is-active', isActive);
      options[i].setAttribute('aria-checked', isActive ? 'true' : 'false');
    }
    if (hint) {
      if (currentBundle === 'zip') {
        hint.textContent = 'All files bundled into one ZIP and downloaded at the end.';
      } else {
        hint.textContent = 'Each file downloaded as soon as it finishes.';
      }
    }
  }

  function setBundle(mode) {
    currentBundle = mode === 'zip' ? 'zip' : 'individual';
    updateBundleUI();
  }

  function setBusy(isBusy) {
    var btnRun = $('btnRun');
    var statusRow = $('encStatus');
    var progress = $('progressBar');
    var progressLog = $('progressLog');
    var toggle = $('modeToggle');
    var bundle = $('bundleSwitch');

    if (btnRun) btnRun.disabled = isBusy;
    if (toggle) toggle.classList.toggle('is-disabled', isBusy);
    if (bundle) bundle.classList.toggle('is-disabled', isBusy);
    if (statusRow) statusRow.classList.toggle('is-hidden', !isBusy);
    if (progress) progress.classList.toggle('active', isBusy);
    if (progressLog) progressLog.classList.toggle('is-hidden', !isBusy);
  }

  function triggerFileDownload(url, name) {
    var a = document.createElement('a');
    a.href = url;
    if (name) a.download = name;
    a.rel = 'noopener';
    a.style.display = 'none';
    document.body.appendChild(a);
    a.click();
    window.setTimeout(function () {
      if (a.parentNode) a.parentNode.removeChild(a);
    }, 1000);
  }

  function clearProgressLog() {
    var progressLog = $('progressLog');
    if (progressLog) progressLog.innerHTML = '';
  }

  function appendProgressLog(message, kind) {
    var progressLog = $('progressLog');
    if (!progressLog) return;

    var line = document.createElement('span');
    line.className = 'log-line ' + (kind || '');

    if (kind === 'version') {
      line.textContent = message;
    } else if (message.indexOf('Done for ') === 0) {
      line.textContent = message;
      line.classList.add('done');
    } else if (message.indexOf('Sent ') === 0) {
      line.textContent = message;
      line.classList.add('sent');
    } else {
      line.textContent = message;
    }

    progressLog.appendChild(line);
    progressLog.scrollTop = progressLog.scrollHeight;
  }

  function buildFormData(requireBot) {
    var token = ($('token') ? $('token').value : '').trim();
    var chatId = ($('chat_id') ? $('chat_id').value : '').trim();
    var filesInput = $('files');
    var files = filesInput ? filesInput.files : [];
    var platforms = checkedValues('platform');
    var versions = checkedValues('version');

    if (requireBot && (!token || !chatId)) {
      return { error: 'Enter token and chat ID' };
    }

    if (!files || !files.length) {
      return { error: 'Select at least one file' };
    }

    if (!platforms.length) {
      return { error: 'Select a platform' };
    }

    if (!versions.length) {
      return { error: 'Select a Python version' };
    }

    var fd = new FormData();
    if (requireBot) {
      fd.append('token', token);
      fd.append('chat_id', chatId);
    }
    fd.append('anti_input', $('anti_input') && $('anti_input').checked ? '1' : '0');
    fd.append('anti_bypass', $('anti_bypass') && $('anti_bypass').checked ? '1' : '0');
    fd.append('apply_minifier', $('apply_minifier') && $('apply_minifier').checked ? '1' : '0');
    fd.append('stein_best', $('stein_best') && $('stein_best').checked ? '1' : '0');
    fd.append('strings', $('strings') && $('strings').checked ? '1' : '0');
    fd.append('platforms', platforms.join(','));
    fd.append('versions', versions.join(','));
    fd.append('bundle_mode', requireBot ? 'individual' : currentBundle);

    for (var i = 0; i < files.length; i++) fd.append('files', files[i]);

    return { formData: fd };
  }

  function parseSseChunk(buffer, onEvent) {
    var parts = buffer.split('\n\n');
    var remainder = parts.pop();

    for (var i = 0; i < parts.length; i++) {
      var block = parts[i].replace(/\r/g, '');
      var lines = block.split('\n');
      for (var j = 0; j < lines.length; j++) {
        if (lines[j].indexOf('data: ') === 0) {
          try {
            onEvent(JSON.parse(lines[j].slice(6)));
          } catch (e) {}
        }
      }
    }

    return remainder || '';
  }

  function classifyProgressMessage(message) {
    if (/^\d+\.\d+ Version$/.test(message)) return 'version';
    if (message.indexOf('Done for ') === 0) return 'done';
    if (message.indexOf('Sent ') === 0) return 'sent';
    return '';
  }

  function readSseStream(response, onEvent) {
    if (!response.body || !response.body.getReader) {
      return Promise.reject(new Error('Streaming not supported'));
    }

    var reader = response.body.getReader();
    var decoder = new TextDecoder();
    var buffer = '';

    function pump() {
      return reader.read().then(function (result) {
        if (result.value) {
          buffer += decoder.decode(result.value, { stream: true });
          buffer = parseSseChunk(buffer, onEvent);
        }
        if (result.done) {
          if (buffer.trim()) {
            parseSseChunk(buffer.replace(/\r/g, '') + '\n\n', onEvent);
          }
          return;
        }
        return pump();
      });
    }

    return pump();
  }

  function runEncryption() {
    var requireBot = currentMode === 'bot';
    var endpoint = requireBot ? '/api/encrypt' : '/api/download';
    var doneMessage = requireBot ? 'Done. Sent to bot.' : 'Download complete.';
    var built = buildFormData(requireBot);

    if (built.error) {
      var statusRow = $('encStatus');
      var progressLog = $('progressLog');
      if (statusRow) statusRow.classList.remove('is-hidden');
      if (progressLog) progressLog.classList.remove('is-hidden');
      clearProgressLog();
      setMsg('encMsg', built.error, true);
      appendProgressLog(built.error, 'err');
      return;
    }

    setBusy(true);
    clearProgressLog();
    setMsg('encMsg', 'Starting...', false);
    appendProgressLog('Starting encryption...', '');

    var start = Date.now();
    var timerEl = $('timer');
    var timerId = window.setInterval(function () {
      if (timerEl) timerEl.textContent = ((Date.now() - start) / 1000).toFixed(0) + 's';
    }, 1000);

    fetch(endpoint, { method: 'POST', body: built.formData })
      .then(function (response) {
        var contentType = (response.headers.get('content-type') || '').toLowerCase();

        if (!response.ok) {
          if (contentType.indexOf('application/json') !== -1) {
            return response.json().then(function (d) {
              throw new Error(d.error || 'Request failed');
            });
          }
          throw new Error('Request failed (' + response.status + ')');
        }

        function handleEvent(event) {
          if (event.type === 'progress') {
            appendProgressLog(event.message, classifyProgressMessage(event.message));
            setMsg('encMsg', event.message, false);
          } else if (event.type === 'file_ready') {
            var name = event.name || 'file';
            appendProgressLog('Downloading ' + name, 'downloaded');
            setMsg('encMsg', 'Downloading ' + name, false);
            triggerFileDownload(event.download_url, event.name);
          } else if (event.type === 'done') {
            if (event.download_url) {
              appendProgressLog('Bundle ready: ' + (event.name || 'archive'), 'finish');
              setMsg('encMsg', 'Downloading bundle...', false);
              triggerFileDownload(event.download_url, event.name);
            } else {
              appendProgressLog(event.message || doneMessage, 'finish');
              setMsg('encMsg', event.message || doneMessage, false);
            }
          } else if (event.type === 'error') {
            appendProgressLog(event.message || 'Error', 'err');
            throw new Error(event.message || 'Error');
          }
        }

        return readSseStream(response, handleEvent);
      })
      .catch(function (err) {
        setMsg('encMsg', err.message || 'Error', true);
        appendProgressLog(err.message || 'Error', 'err');
      })
      .finally(function () {
        window.clearInterval(timerId);
        if (timerEl) timerEl.textContent = '';
        setBusy(false);
      });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFileDrop();
    updateModeUI();
    updateBundleUI();

    var btnCheck = $('btnCheck');
    if (btnCheck) btnCheck.addEventListener('click', checkCreds);

    var toggle = $('modeToggle');
    if (toggle) {
      toggle.addEventListener('click', toggleMode);
      toggle.addEventListener('keydown', function (e) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          toggleMode();
        }
      });
    }

    var labels = document.querySelectorAll('.mode-toggle-label');
    for (var i = 0; i < labels.length; i++) {
      labels[i].addEventListener('click', function (e) {
        e.stopPropagation();
        setMode(this.getAttribute('data-mode'));
      });
    }

    var bundleOptions = document.querySelectorAll('#bundleSwitch .pill-option');
    for (var b = 0; b < bundleOptions.length; b++) {
      bundleOptions[b].addEventListener('click', function () {
        setBundle(this.getAttribute('data-value'));
      });
    }

    var btnRun = $('btnRun');
    if (btnRun) btnRun.addEventListener('click', runEncryption);
  });
})();
