
function onInput(element) {
    if (element.value && !validateInput(clearInput(element.value), element.id)) {
        element.classList.add('is-invalid');
        return;
    }
    element.classList.remove('is-invalid');
}

function onEnterKey(event, element) {
    if (event.keyCode !== 13) {
        return;
    }

    element.value = clearInput(element.value);
    if (element.value && !validateInput(element.value, element.id)) {
        return;
    }

    element.classList.remove('is-invalid');
    event.preventDefault();

    update(element);
}

function onBlur(element) {
    element.value = clearInput(element.value);
    if (element.value && !validateInput(element.value, element.id)) {
        return;
    }

    element.classList.remove('is-invalid');

    update(element);
}

function onBitButtonClick(element) {
    element.classList.remove('is-invalid');

    update(element);
}

async function onCopyButtonClick(element) {
    try {
        await navigator.clipboard.writeText(
            (element.id.includes('hex') ? '0x' : '') + document.getElementById(element.id.replace('copy', 'input')).value
        );
    } catch (error) {
        document.getElementById('copy-error-toast-body').innerText = 'Failed to copy text: ' + error;
        new bootstrap.Toast(document.getElementById('copy-error-toast')).show();
    }
    element.blur();
}
