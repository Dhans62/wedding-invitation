/**
 * audio.js
 * Mengelola backsound:
 * - Play saat "Buka Undangan" diklik (dipanggil dari main.js)
 * - Loop otomatis (sudah di-set di HTML: loop)
 * - Lanjut dari posisi terakhir saat tab kembali aktif
 * - Pause otomatis saat tab tidak aktif (Page Visibility API)
 * - Floating button mute/unmute
 */
(function () {
  'use strict';

  const state = {
    initialized: false,
    muted: false,
  };

  // ================================================
  // ELEMENTS
  // ================================================
  function getEls() {
    return {
      audio:       document.getElementById('bgAudio'),
      btnAudio:    document.getElementById('btnAudio'),
      iconOn:      document.getElementById('iconMusicOn'),
      iconOff:     document.getElementById('iconMusicOff'),
    };
  }

  // ================================================
  // UI UPDATE
  // ================================================
  function syncUI(playing) {
    const { btnAudio, iconOn, iconOff } = getEls();
    if (!btnAudio) return;

    if (playing) {
      btnAudio.classList.add('playing');
      iconOn.classList.remove('hidden');
      iconOff.classList.add('hidden');
    } else {
      btnAudio.classList.remove('playing');
      iconOn.classList.add('hidden');
      iconOff.classList.remove('hidden');
    }
  }

  // ================================================
  // PLAY
  // ================================================
  function play() {
    const { audio } = getEls();
    if (!audio || state.muted) return;

    // preload on first play
    if (audio.readyState === 0) {
      audio.load();
    }

    audio.play().then(function () {
      syncUI(true);
    }).catch(function (err) {
      // Browser blokir — tidak perlu error log ke user
      console.warn('Audio play blocked:', err.message);
    });
  }

  function pause() {
    const { audio } = getEls();
    if (!audio) return;
    audio.pause();
    syncUI(false);
  }

  // ================================================
  // TOGGLE MUTE / UNMUTE
  // ================================================
  function toggleAudio() {
    const { audio } = getEls();
    if (!audio) return;

    if (state.muted) {
      state.muted = false;
      play();
    } else {
      state.muted = true;
      pause();
    }
  }

  // ================================================
  // PAGE VISIBILITY API
  // Pause saat tab tidak aktif, lanjut saat kembali
  // ================================================
  function initVisibilityHandler() {
    document.addEventListener('visibilitychange', function () {
      if (state.muted) return;

      if (document.hidden) {
        pause();
      } else {
        play();
      }
    });
  }

  // ================================================
  // INIT — dipanggil oleh main.js setelah klik "Buka Undangan"
  // ================================================
  function init() {
    if (state.initialized) return;
    state.initialized = true;

    const { btnAudio } = getEls();

    // Tampilkan floating button
    if (btnAudio) {
      btnAudio.classList.remove('hidden');
      btnAudio.addEventListener('click', toggleAudio);
    }

    initVisibilityHandler();
    play();
  }

  // ================================================
  // EXPOSE
  // ================================================
  window.WeddingAudio = { init: init };
})();
