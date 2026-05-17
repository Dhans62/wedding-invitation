/**
 * main.js
 * Orkestrator utama:
 * - Tombol "Buka Undangan" → transisi + audio
 * - Scroll reveal untuk semua section
 * - Toggle amplop digital
 * - Salin nomor rekening
 */
(function () {
  'use strict';

  // ================================================
  // BUKA UNDANGAN
  // ================================================
  function initOpenButton() {
    const btnOpen     = document.getElementById('btnOpen');
    const cover       = document.getElementById('cover');
    const mainContent = document.getElementById('mainContent');

    if (!btnOpen || !cover || !mainContent) return;

    btnOpen.addEventListener('click', function () {
      // Nonaktifkan tombol agar tidak diklik dua kali
      btnOpen.disabled = true;

      // Animasi keluar cover
      cover.classList.add('exiting');

      // Setelah animasi cover selesai (~700ms)
      setTimeout(function () {
        cover.style.display = 'none';

        // Tampilkan main content
        mainContent.removeAttribute('aria-hidden');
        mainContent.classList.add('visible');

        // Scroll ke atas
        window.scrollTo({ top: 0, behavior: 'instant' });

        // Inisiasi audio
        if (window.WeddingAudio) {
          window.WeddingAudio.init();
        }

        // Trigger scroll reveal untuk elemen yang sudah di viewport
        checkReveal();
      }, 700);
    });
  }

  // ================================================
  // SCROLL REVEAL
  // ================================================
  function initScrollReveal() {
    // Tambahkan class .reveal ke semua elemen yang ingin di-reveal
    const targets = document.querySelectorAll(
      '.section-bismillah .container > *, ' +
      '.section-mempelai .section-intro, ' +
      '.section-mempelai .couple-card, ' +
      '.section-mempelai .couple-separator, ' +
      '.section-event .event-card, ' +
      '.section-galeri .section-title, ' +
      '.section-galeri .ornament-line, ' +
      '.section-galeri .gallery-item, ' +
      '.section-rsvp .section-title, ' +
      '.section-rsvp .ornament-line, ' +
      '.section-rsvp .section-subtitle, ' +
      '.section-rsvp .rsvp-form, ' +
      '.section-amplop .section-title, ' +
      '.section-amplop .ornament-line, ' +
      '.section-amplop .section-subtitle, ' +
      '.section-amplop .btn-gift-toggle, ' +
      '.section-penutup .container > *'
    );

    targets.forEach(function (el) {
      el.classList.add('reveal');
    });

    checkReveal();
  }

  function checkReveal() {
    const elements = document.querySelectorAll('.reveal:not(.visible)');
    elements.forEach(function (el) {
      if (isInViewport(el)) {
        el.classList.add('visible');
      }
    });
  }

  function isInViewport(el) {
    const rect = el.getBoundingClientRect();
    return rect.top < window.innerHeight * 0.88;
  }

  function initScrollListener() {
    let ticking = false;
    window.addEventListener('scroll', function () {
      if (!ticking) {
        requestAnimationFrame(function () {
          checkReveal();
          ticking = false;
        });
        ticking = true;
      }
    }, { passive: true });
  }

  // ================================================
  // AMPLOP DIGITAL — toggle buka/tutup
  // ================================================
  function initGiftToggle() {
    const btnOpen  = document.getElementById('btnGiftToggle');
    const btnClose = document.getElementById('btnGiftClose');
    const content  = document.getElementById('giftContent');

    if (!btnOpen || !content) return;

    function openGift() {
      content.classList.remove('hidden');
      // Timeout agar display:block terapply dulu sebelum class .open
      requestAnimationFrame(function () {
        content.classList.add('open');
        btnOpen.setAttribute('aria-expanded', 'true');
        content.setAttribute('aria-hidden', 'false');
      });
    }

    function closeGift() {
      content.classList.remove('open');
      btnOpen.setAttribute('aria-expanded', 'false');
      content.setAttribute('aria-hidden', 'true');
      // Tunggu transisi selesai baru hidden
      setTimeout(function () {
        // Cek lagi supaya tidak konflik kalau user buka ulang cepat
        if (!content.classList.contains('open')) {
          content.classList.add('hidden');
        }
      }, 500);
    }

    btnOpen.addEventListener('click', function () {
      if (content.classList.contains('open')) {
        closeGift();
      } else {
        openGift();
      }
    });

    if (btnClose) {
      btnClose.addEventListener('click', closeGift);
    }
  }

  // ================================================
  // COPY REKENING
  // ================================================
  function initCopyButton() {
    const btnCopy = document.getElementById('btnCopyRek');
    const numEl   = document.getElementById('rekeningNum');

    if (!btnCopy || !numEl) return;

    btnCopy.addEventListener('click', function () {
      const text = numEl.textContent.trim().replace(/\s/g, '');
      copyText(text, btnCopy);
    });
  }

  // Global helper — dipanggil juga dari inline HTML jika ada
  window.copyText = function (text, btn) {
    navigator.clipboard.writeText(text).then(function () {
      const textEl = btn.querySelector('.btn-copy-text');
      const original = textEl ? textEl.textContent : 'Salin';

      if (textEl) textEl.textContent = 'Tersalin';
      btn.style.background = 'var(--color-primary)';
      btn.style.color = 'var(--color-bg)';

      setTimeout(function () {
        if (textEl) textEl.textContent = original;
        btn.style.background = '';
        btn.style.color = '';
      }, 2000);
    }).catch(function () {
      // Fallback untuk browser lama
      const temp = document.createElement('textarea');
      temp.value = text;
      temp.style.position = 'fixed';
      temp.style.opacity = '0';
      document.body.appendChild(temp);
      temp.select();
      document.execCommand('copy');
      document.body.removeChild(temp);
    });
  };

  // ================================================
  // INIT SEMUA
  // ================================================
  function init() {
    initOpenButton();
    initScrollReveal();
    initScrollListener();
    initGiftToggle();
    initCopyButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
