document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('update-case-note-form');
  const saved = sessionStorage.getItem(caseNoteId);

  if (saved) {
    const data = JSON.parse(saved);
    Object.entries(data).forEach(([name, value]) => {
      const field = form.elements[name];
      if (field) field.value = value;
    });
  }

  function saveFormToSession() {
    const pathParts = window.location.pathname.split('/');
    const caseNoteId = pathParts[pathParts.length - 1];
    const data = {};
    new FormData(form).forEach((value, key) => {
      if (['_csrf', 'isExternal', 'username', 'currentLength'].includes(key)) return;
      data[key] = value;
    });
    sessionStorage.setItem(caseNoteId, JSON.stringify(data));
  }

  form.querySelectorAll('textarea').forEach(el => {
    el.addEventListener('input', saveFormToSession);
    el.addEventListener('change', saveFormToSession);
  });
});
