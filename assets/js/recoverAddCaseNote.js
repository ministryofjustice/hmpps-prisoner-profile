document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-case-note-form');
    const saved = sessionStorage.getItem('addCaseNoteForm');

    if (saved) {
        const data = JSON.parse(saved);
        const typeField = form.elements['type'];
        const subTypeField = form.elements['subType'];

        if (typeField && data.type) {
            typeField.value = data.type;
            typeField.dispatchEvent(new Event('change'));
        }
        
        if (subTypeField && data.subType) {
            subTypeField.value = data.subType;
        }

        Object.entries(data).forEach(([name, value]) => {
            if (['_csrf', 'refererUrl', 'type', 'subType'].includes(name)) return;
            const field = form.elements[name];
            if (field) field.value = value;
        });
    }

    function saveFormToSession() {
        const data = {};
        new FormData(form).forEach((value, key) => {
            if (['_csrf', 'refererUrl'].includes(key)) return;
            data[key] = value;
        });
        sessionStorage.setItem('addCaseNoteForm', JSON.stringify(data));
    }

    form.querySelectorAll('input, textarea, select').forEach(el => {
        el.addEventListener('input', saveFormToSession);
        el.addEventListener('change', saveFormToSession);
    });
});
