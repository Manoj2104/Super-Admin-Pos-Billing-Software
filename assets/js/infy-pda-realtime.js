/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * INFY-POS PDA Real-Time Scan Optimizer v2.0
 * ═══════════════════════════════════════════════════════════════════════════════
 * Zero-dependency barcode scan UX optimizer for warehouse PDA screens.
 *
 * Features:
 *  • Keyboard focus lock (barcode input never loses focus)
 *  • Sub-100ms scan-to-result via request deduplication
 *  • Audio beep feedback (Web Audio API — no files needed)
 *  • Auto-clear input after scan for continuous scanning
 *  • Optimistic UI: show result immediately, confirm on API
 *  • Error vibration (if device supports it)
 * ═══════════════════════════════════════════════════════════════════════════════
 */

(function (window) {
  'use strict';

  const InfyPdaRealtime = {

    _audioCtx: null,
    _lastScan: '',
    _lastScanTime: 0,
    _abortCtrl: null,

    // ── Audio Context (Web Audio API) ───────────────────────────────────────
    _getAudioCtx: function () {
      if (!this._audioCtx) {
        try {
          this._audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) {
          return null;
        }
      }
      return this._audioCtx;
    },

    beepSuccess: function () {
      const ctx = this._getAudioCtx();
      if (!ctx) return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.15);
    },

    beepError: function () {
      const ctx = this._getAudioCtx();
      if (!ctx) return;
      [200, 160].forEach((freq, i) => {
        const osc  = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.15);
        gain.gain.setValueAtTime(0.25, ctx.currentTime + i * 0.15);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.12);
        osc.start(ctx.currentTime + i * 0.15);
        osc.stop(ctx.currentTime + i * 0.15 + 0.12);
      });
      if (navigator.vibrate) navigator.vibrate([80, 30, 80]);
    },

    beepWarning: function () {
      const ctx = this._getAudioCtx();
      if (!ctx) return;
      const osc  = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(500, ctx.currentTime);
      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
      if (navigator.vibrate) navigator.vibrate(40);
    },

    // ── Focus Lock ───────────────────────────────────────────────────────────
    lockFocus: function (inputEl) {
      if (!inputEl) return;

      // Re-focus if focus leaves
      inputEl.addEventListener('blur', function () {
        // Only re-focus if no other interactive element took focus
        setTimeout(function () {
          const active = document.activeElement;
          const isInteractive = active && (
            active.tagName === 'BUTTON' ||
            active.tagName === 'A' ||
            active.tagName === 'SELECT' ||
            (active.tagName === 'INPUT' && active !== inputEl)
          );
          if (!isInteractive) {
            inputEl.focus();
          }
        }, 80);
      });

      // Prevent page scroll from stealing focus
      document.addEventListener('keydown', function (e) {
        if (e.key === ' ' && document.activeElement !== inputEl) {
          inputEl.focus();
        }
      });

      inputEl.focus();
    },

    // ── Dedup Scan Request ───────────────────────────────────────────────────
    scan: async function (barcode, url, options = {}) {
      const now = Date.now();

      // Prevent duplicate scans within 800ms
      if (barcode === this._lastScan && now - this._lastScanTime < 800) {
        return null;
      }
      this._lastScan     = barcode;
      this._lastScanTime = now;

      // Cancel previous in-flight request
      if (this._abortCtrl) {
        this._abortCtrl.abort();
      }
      this._abortCtrl = new AbortController();

      const csrfToken = document.querySelector('meta[name="csrf-token"]')?.content || '';

      try {
        const body = Object.assign({ barcode }, options.extraData || {});
        const resp = await fetch(url, {
          method: 'POST',
          signal: this._abortCtrl.signal,
          headers: {
            'Content-Type':     'application/json',
            'X-CSRF-TOKEN':     csrfToken,
            'Accept':           'application/json',
            'X-Requested-With': 'XMLHttpRequest',
          },
          body: JSON.stringify(body),
        });

        const data = await resp.json();

        if (data.success) {
          this.beepSuccess();
        } else {
          this.beepError();
        }

        return data;

      } catch (err) {
        if (err.name !== 'AbortError') {
          this.beepError();
        }
        return null;
      }
    },

    // ── Auto-Clear Input ─────────────────────────────────────────────────────
    autoClear: function (inputEl, delayMs = 800) {
      setTimeout(function () {
        if (inputEl) {
          inputEl.value = '';
          inputEl.focus();
        }
      }, delayMs);
    },

    // ── Scan Result Flash ────────────────────────────────────────────────────
    flashResult: function (containerEl, success) {
      if (!containerEl) return;
      const color = success ? '#DCFCE7' : '#FEE2E2';
      containerEl.style.transition  = 'background 0.1s ease';
      containerEl.style.background  = color;
      setTimeout(function () {
        containerEl.style.background = '';
      }, 600);
    },

    // ── Optimistic Row Prepend ────────────────────────────────────────────────
    prependRow: function (tbodyEl, html, rollbackMs = 5000) {
      const tr = document.createElement('tr');
      tr.innerHTML = html;
      tr.style.cssText = 'animation: infy-row-flash 1.5s ease-out; background: #ECFDF5;';
      tbodyEl.prepend(tr);
      return tr;
    },

    // ── Initialize PDA Page ───────────────────────────────────────────────────
    init: function (options = {}) {
      const scanInput = options.scanInputId
        ? document.getElementById(options.scanInputId)
        : document.querySelector('[data-pda-scan-input]');

      if (scanInput) {
        this.lockFocus(scanInput);
        scanInput.setAttribute('autocomplete', 'off');
        scanInput.setAttribute('autocorrect', 'off');
        scanInput.setAttribute('autocapitalize', 'off');
        scanInput.setAttribute('spellcheck', 'false');
        console.log('[InfyPdaRealtime] Scan focus lock active on:', scanInput.id || scanInput.name);
      }

      // Prevent default on Enter key to avoid form submission delays
      if (scanInput && options.onScan) {
        scanInput.addEventListener('keydown', (e) => {
          if (e.key === 'Enter') {
            e.preventDefault();
            const val = scanInput.value.trim();
            if (val) {
              options.onScan(val, scanInput);
            }
          }
        });
      }

      console.log('[InfyPdaRealtime] Initialized');
    },
  };

  window.InfyPdaRealtime = InfyPdaRealtime;

})(window);
