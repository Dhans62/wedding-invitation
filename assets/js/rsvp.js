/**
 * rsvp.js
 * Handle form RSVP menggunakan Formspree.
 *
 * CARA SETUP FORMSPREE:
 * 1. Daftar di https://formspree.io (gratis, 50 submit/bulan)
 * 2. Buat form baru → salin endpoint URL
 * 3. Ganti nilai FORMSPREE_ENDPOINT di bawah
 */
(function () {
  'use strict';

  // ================================================
  // GANTI INI dengan endpoint Formspree kamu
  // Contoh: 'https://formspree.io/f/xabcdefg'
  // ================================================
  const FORMSPREE_ENDPOINT = 'https://formspree.io/f/GANTI_INI';

  // ================================================
  // ELEMENTS
  // ================================================
  function getEls() {
    return {
      btnSubmit:    document.getElementById('btnSubmit'),
      btnText:      document.getElementById('btnSubmitText'),
      nameInput:    document.getElementById('rsvpName'),
      messageInput: document.getElementById('rsvpMessage'),
      successMsg:   document.getElementById('formSuccess'),
      errorMsg:     document.getElementById('formError'),
    };
  }

  // ================================================
  // COLLECT FORM DATA
  // ================================================
  function collectData() {
    const { nameInput, messageInput } = getEls();

    const hadirRadio = document.querySelector('input[name="hadir"]:checked');
    const acaraChecked = Array.from(
      document.querySelectorAll('input[name="acara"]:checked')
    ).map(el => el.value);

    return {
      nama:    nameInput ? nameInput.value.trim() : '',
      hadir:   hadirRadio ? hadirRadio.value : '',
      acara:   acaraChecked.join(', ') || '-',
      ucapan:  messageInput ? messageInput.value.trim() : '',
    };
  }

  // ================================================
  // VALIDATE
  // ================================================
  function validate(data) {
    if (!data.nama) {
      return 'Mohon isi nama Anda.';
    }
    if (!data.hadir) {
      return 'Mohon pilih konfirmasi kehadiran.';
    }
    return null;
  }

  // ================================================
  // SUBMIT
  // ================================================
  async function submitForm() {
    const { btnSubmit, btnText, successMsg, errorMsg } = getEls();

    // Reset pesan
    successMsg.classList.add('hidden');
    errorMsg.classList.add('hidden');

    const data = collectData();
    const validationError = validate(data);

    if (validationError) {
      errorMsg.textContent = validationError;
      errorMsg.classList.remove('hidden');
      return;
    }

    // Loading state
    btnSubmit.disabled = true;
    btnText.textContent = 'Mengirim...';

    try {
      const response = await fetch(FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          Nama:       data.nama,
          Kehadiran:  data.hadir,
          Acara:      data.acara,
          Ucapan:     data.ucapan || '-',
        }),
      });

      if (response.ok) {
        // Sukses — sembunyikan form, tampilkan pesan
        successMsg.classList.remove('hidden');
        btnSubmit.classList.add('hidden');

        // Reset field
        const { nameInput, messageInput } = getEls();
        if (messageInput) messageInput.value = '';
        document.querySelectorAll('input[name="hadir"]').forEach(el => { el.checked = false; });
        document.querySelectorAll('input[name="acara"]').forEach(el => { el.checked = false; });
      } else {
        const json = await response.json();
        throw new Error(json.error || 'Server error');
      }
    } catch (err) {
      errorMsg.textContent = 'Terjadi kesalahan. Mohon coba kembali.';
      errorMsg.classList.remove('hidden');
      console.error('RSVP error:', err);

      // Reset button
      btnSubmit.disabled = false;
      btnText.textContent = 'Kirim';
    }
  }

  // ================================================
  // INIT
  // ================================================
  function init() {
    const { btnSubmit } = getEls();
    if (!btnSubmit) return;
    btnSubmit.addEventListener('click', submitForm);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
