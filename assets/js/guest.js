/**
 * guest.js
 * Membaca parameter ?to= dari URL dan menampilkan nama tamu.
 * Harus di-load sebelum main.js.
 */
(function () {
  'use strict';

  function getGuestName() {
    try {
      const params = new URLSearchParams(window.location.search);
      const raw = params.get('to');
      if (!raw || raw.trim() === '') return null;
      return decodeURIComponent(raw.trim());
    } catch (e) {
      // decodeURIComponent bisa throw jika encoding rusak
      return null;
    }
  }

  function renderGuestName() {
    const name = getGuestName();
    const el = document.getElementById('guestName');
    const rsvpNameInput = document.getElementById('rsvpName');

    if (!el) return;

    if (name) {
      el.textContent = name;

      // Pre-fill nama di form RSVP
      if (rsvpNameInput) {
        rsvpNameInput.value = name;
      }
    }
    // Jika tidak ada nama, fallback sudah ada di HTML: "Tamu Undangan"
  }

  // Expose ke global kalau dibutuhkan modul lain
  window.WeddingGuest = {
    getName: getGuestName,
  };

  // Jalankan saat DOM siap
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderGuestName);
  } else {
    renderGuestName();
  }
})();
