/**
 * countdown.js
 * Mengelola dua countdown: Akad Nikah dan Resepsi.
 * Otomatis mengganti tampilan setelah tanggal lewat.
 */
(function () {
  'use strict';

  // ================================================
  // KONFIGURASI — sesuaikan di sini jika ada perubahan
  // ================================================
  const EVENTS = {
    akad: {
      // 27 Mei 2026 jam 08:00 WIB (UTC+7 = UTC-nya jam 01:00)
      target: new Date('2026-05-27T01:00:00Z'),
      boxId:      'countdownAkad',
      doneId:     'akadDone',
      daysId:     'akad-days',
      hoursId:    'akad-hours',
      minutesId:  'akad-minutes',
      secondsId:  'akad-seconds',
    },
    resepsi: {
      // 3 Juni 2026 jam 09:00 WIB (UTC+7)
      target: new Date('2026-06-03T02:00:00Z'),
      boxId:      'countdownResepsi',
      doneId:     'resepsiDone',
      daysId:     'resepsi-days',
      hoursId:    'resepsi-hours',
      minutesId:  'resepsi-minutes',
      secondsId:  'resepsi-seconds',
    },
  };

  // ================================================
  // HELPERS
  // ================================================
  function pad(n) {
    return String(Math.floor(n)).padStart(2, '0');
  }

  function updateCountdown(event) {
    const now  = Date.now();
    const diff = event.target.getTime() - now;

    const box  = document.getElementById(event.boxId);
    const done = document.getElementById(event.doneId);

    if (!box || !done) return;

    if (diff <= 0) {
      // Acara sudah lewat
      box.classList.add('hidden');
      done.classList.remove('hidden');
      return;
    }

    // Acara belum lewat — tampilkan countdown
    done.classList.add('hidden');
    box.classList.remove('hidden');

    const totalSec = Math.floor(diff / 1000);
    const days    = Math.floor(totalSec / 86400);
    const hours   = Math.floor((totalSec % 86400) / 3600);
    const minutes = Math.floor((totalSec % 3600) / 60);
    const seconds = totalSec % 60;

    const d = document.getElementById(event.daysId);
    const h = document.getElementById(event.hoursId);
    const m = document.getElementById(event.minutesId);
    const s = document.getElementById(event.secondsId);

    if (d) d.textContent = pad(days);
    if (h) h.textContent = pad(hours);
    if (m) m.textContent = pad(minutes);
    if (s) s.textContent = pad(seconds);
  }

  function initCountdowns() {
    // Pertama kali langsung update
    Object.values(EVENTS).forEach(updateCountdown);

    // Update setiap detik
    setInterval(function () {
      Object.values(EVENTS).forEach(updateCountdown);
    }, 1000);
  }

  // ================================================
  // INIT
  // ================================================
  window.WeddingCountdown = { init: initCountdowns };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCountdowns);
  } else {
    initCountdowns();
  }
})();
