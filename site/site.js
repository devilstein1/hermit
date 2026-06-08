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
    var btnDownload = $('btnDownload');
    var btnEncrypt = $('btnEncrypt');
    var statusRow = $('encStatus');
    var progress = $('progressBar');
    var progressLog = $('progressLog');

    if (btnDownload) btnDownload.disabled = isBusy;
    if (btnEncrypt) btnEncrypt.disabled = isBusy;
    if (statusRow) statusRow.classList.toggle('is-hidden', !isBusy);
    if (progress) progress.classList.toggle('active', isBusy);
    if (progressLog) progressLog.classList.toggle('is-hidden', !isBusy);
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

    for (var i = 0; i < files.length; i++) fd.append('files', files[i]);

    return { formData: fd };
  }

  function parseSseChunk(buffer, onEvent) {
    var parts = buffer.split('\n\n');
    var remainder = parts.pop();

    for (var i = 0; i < parts.length; i++) {
      var block = parts[i];
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

  function runEncryption(endpoint, requireBot, doneMessage) {
    var built = buildFormData(requireBot);
    if (built.error) {
      setMsg('msg', built.error, true);
      return;
    }

    setBusy(true);
    clearProgressLog();
    setMsg('encMsg', 'Starting...', false);

    var start = Date.now();
    var timerEl = $('timer');
    var timerId = window.setInterval(function () {
      if (timerEl) timerEl.textContent = ((Date.now() - start) / 1000).toFixed(0) + 's';
    }, 1000);

    fetch(endpoint, { method: 'POST', body: built.formData })
      .then(function (response) {
        if (!response.ok) {
          return response.json().then(function (d) {
            throw new Error(d.error || 'Request failed');
          });
        }

        if (!response.body || !response.body.getReader) {
          throw new Error('Streaming not supported');
        }

        var reader = response.body.getReader();
        var decoder = new TextDecoder();
        var buffer = '';

        function handleEvent(event) {
          if (event.type === 'progress') {
            appendProgressLog(event.message, classifyProgressMessage(event.message));
            setMsg('encMsg', event.message, false);
          } else if (event.type === 'done') {
            if (event.download_url) {
              appendProgressLog('Download ready.', 'finish');
              setMsg('encMsg', 'Download starting...', false);
              window.location.href = event.download_url;
            } else {
              appendProgressLog(event.message || doneMessage, 'finish');
              setMsg('encMsg', event.message || doneMessage, false);
            }
          } else if (event.type === 'error') {
            appendProgressLog(event.message || 'Error', 'err');
            throw new Error(event.message || 'Error');
          }
        }

        function readChunk() {
          return reader.read().then(function (result) {
            if (result.done) return;
            buffer += decoder.decode(result.value, { stream: true });
            buffer = parseSseChunk(buffer, handleEvent);
            return readChunk();
          });
        }

        return readChunk().then(function () {
          if (buffer) parseSseChunk(buffer + '\n\n', handleEvent);
        });
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

  function encryptAndDownload() {
    runEncryption('/api/download', false, 'Download complete.');
  }

  function encryptAndSend() {
    runEncryption('/api/encrypt', true, 'Done. Sent to bot.');
  }

  document.addEventListener('DOMContentLoaded', function () {
    initFileDrop();

    var btnCheck = $('btnCheck');
    if (btnCheck) btnCheck.addEventListener('click', checkCreds);

    var btnDownload = $('btnDownload');
    if (btnDownload) btnDownload.addEventListener('click', encryptAndDownload);

    var btnEncrypt = $('btnEncrypt');
    if (btnEncrypt) btnEncrypt.addEventListener('click', encryptAndSend);
  });
})();
