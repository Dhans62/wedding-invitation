/**
 * main.js
 * Orkestrator utama. Urutan init:
 * 1. Cek sessionStorage → skip cover jika sudah dibuka
 * 2. Scroll lock pada cover
 * 3. Tombol "Buka Undangan"
 * 4. IntersectionObserver untuk scroll reveal
 * 5. Gift toggle
 * 6. Copy rekening
 */
(function () {
  'use strict';

  // ================================================
  // SHOW MAIN CONTENT
  // withAnimation: false → langsung tampil (refresh)
  // withAnimation: true  → dengan transisi (klik buka)
  // ================================================
  function showMainContent(withAnimation) {
    const cover       = document.getElementById('cover');
    const mainContent = document.getElementById('mainContent');
    if (!mainContent) return;

    if (withAnimation) {
      // Animasi cover keluar
      if (cover) cover.classList.add('exiting');

      setTimeout(function () {
        if (cover) cover.style.display = 'none';

        // Buka scroll
        document.body.classList.remove('cover-active');

        // Tampilkan main content
        mainContent.style.display = 'block';
        mainContent.removeAttribute('aria-hidden');

        // Beri satu frame agar display:block diterapkan
        // sebelum opacity transition
        requestAnimationFrame(function () {
          requestAnimationFrame(function () {
            mainContent.classList.add('visible');
            window.scrollTo({ top: 0, behavior: 'instant' });

            // Mulai audio
            if (window.WeddingAudio) window.WeddingAudio.init();

            // Inisiasi observer setelah konten tampil
            initObserver();
          });
        });
      }, 700);

    } else {
      // Langsung — dari sessionStorage (refresh)
      if (cover) cover.style.display = 'none';
      document.body.classList.remove('cover-active');

      mainContent.style.display = 'block';
      mainContent.removeAttribute('aria-hidden');
      mainContent.classList.add('visible');

      // Langsung init observer
      initObserver();

      // Scroll ke posisi tersimpan (opsional)
      const savedPos = sessionStorage.getItem('scrollPos');
      if (savedPos) {
        setTimeout(function () {
          window.scrollTo({ top: parseInt(savedPos, 10), behavior: 'instant' });
        }, 50);
      }
    }
  }

  // ================================================
  // SESSION STORAGE — ingat state per sesi
  // Jika tamu refresh, langsung ke konten
  // Jika tamu baru (link baru), lihat cover dulu
  // ================================================
  function checkSession() {
    if (sessionStorage.getItem('invitationOpened') === 'true') {
      showMainContent(false);
      return true;
    }
    return false;
  }

  // Simpan posisi scroll agar bisa restore setelah refresh
  function initScrollPositionSave() {
    window.addEventListener('scroll', function () {
      sessionStorage.setItem('scrollPos', window.scrollY.toString());
    }, { passive: true });
  }

  // ================================================
  // OPEN BUTTON
  // ================================================
  function initOpenButton() {
    const btnOpen = document.getElementById('btnOpen');
    if (!btnOpen) return;

    btnOpen.addEventListener('click', function () {
      btnOpen.disabled = true;
      sessionStorage.setItem('invitationOpened', 'true');
      sessionStorage.removeItem('scrollPos');
      showMainContent(true);
    });
  }

  // ================================================
  // INTERSECTION OBSERVER — scroll reveal
  // Lebih smooth dari scroll event listener.
  // Tidak ada jank karena tidak berjalan di main thread.
  // ================================================
  var observer = null;

  function initObserver() {
    if (observer) {
      observer.disconnect();
    }

    // Tambah class reveal ke semua target
    var selectors = [
      '.section-bismillah .container > *',
      '.section-mempelai .section-intro',
      '.section-mempelai .couple-card',
      '.section-mempelai .couple-separator',
      '.section-event .event-card',
      '.section-galeri .section-title',
      '.section-galeri .ornament-line',
      '.section-galeri .gallery-item',
      '.section-rsvp .section-title',
      '.section-rsvp .ornament-line',
      '.section-rsvp .section-subtitle',
      '.section-rsvp .rsvp-form',
      '.section-amplop .section-title',
      '.section-amplop .ornament-line',
      '.section-amplop .section-subtitle',
      '.section-amplop .btn-gift-toggle',
      '.section-penutup .container > *',
    ];

    var targets = document.querySelectorAll(selectors.join(', '));

    // Beri delay berbeda per posisi untuk stagger effect
    targets.forEach(function (el, i) {
      // Hitung delay berdasarkan posisi dalam parent
      var siblings = el.parentElement ? el.parentElement.children : [];
      var sibIndex = Array.from(siblings).indexOf(el);
      var delay = Math.min(sibIndex * 80, 300); // max 300ms

      el.style.transitionDelay = delay + 'ms';
      el.classList.add('reveal');
    });

    observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve setelah muncul — tidak perlu watch lagi
          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.08,
      rootMargin: '0px 0px -30px 0px',
    });

    targets.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ================================================
  // GIFT TOGGLE
  // Tidak pakai .hidden — hanya CSS max-height + opacity
  // ================================================
  function initGiftToggle() {
    var btnToggle = document.getElementById('btnGiftToggle');
    var btnClose  = document.getElementById('btnGiftClose');
    var content   = document.getElementById('giftContent');
    if (!btnToggle || !content) return;

    function open() {
      content.classList.add('open');
      btnToggle.setAttribute('aria-expanded', 'true');
      content.setAttribute('aria-hidden', 'false');
    }

    function close() {
      content.classList.remove('open');
      btnToggle.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');
    }

    btnToggle.addEventListener('click', function () {
      content.classList.contains('open') ? close() : open();
    });

    if (btnClose) {
      btnClose.addEventListener('click', close);
    }
  }

  // ================================================
  // COPY REKENING
  // ================================================
  window.copyText = function (text, btn) {
    var textEl = btn ? btn.querySelector('.btn-copy-text') : null;
    var original = textEl ? textEl.textContent : 'Salin';

    function onSuccess() {
      if (textEl) textEl.textContent = 'Tersalin';
      if (btn) {
        btn.style.background = 'var(--color-primary)';
        btn.style.color = 'var(--color-bg)';
      }
      setTimeout(function () {
        if (textEl) textEl.textContent = original;
        if (btn) {
          btn.style.background = '';
          btn.style.color = '';
        }
      }, 2000);
    }

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(onSuccess).catch(fallback);
    } else {
      fallback();
    }

    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text;
        ta.style.cssText = 'position:fixed;opacity:0;top:0;left:0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        onSuccess();
      } catch (e) {
        console.warn('Copy failed:', e);
      }
    }
  };

  function initCopyButton() {
    var btnCopy = document.getElementById('btnCopyRek');
    var numEl   = document.getElementById('rekeningNum');
    if (!btnCopy || !numEl) return;

    btnCopy.addEventListener('click', function () {
      var text = numEl.textContent.replace(/\s|-/g, '');
      window.copyText(text, btnCopy);
    });
  }

  // ================================================
  // INIT
  // ================================================
  function init() {
    // 1. Lock scroll di cover
    document.body.classList.add('cover-active');

    // 2. Cek session — kalau sudah dibuka sebelumnya, skip cover
    var alreadyOpened = checkSession();

    // 3. Setup tombol buka (hanya relevan jika cover tampil)
    if (!alreadyOpened) {
      initOpenButton();
    }

    // 4. Setup lainnya
    initScrollPositionSave();
    initGiftToggle();
    initCopyButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
