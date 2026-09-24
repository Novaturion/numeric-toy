function onInput(element) {
	const value = clearInput(element.value, element.id);
	element.classList.toggle('is-invalid', value !== '' && parseInput(value, element.id) === null);
}

function onCommit(element) {
	element.value = clearInput(element.value, element.id);
	if (element.value === '') {
		element.classList.remove('is-invalid');
		refresh(getType(element.id));
		return;
	}
	if (parseInput(element.value, element.id) === null) {
		element.classList.add('is-invalid');
		return;
	}

	element.classList.remove('is-invalid');
	update(element);
}

function onKeyDown(event) {
	const element = event.target;
	if (element.matches('input') && event.key === 'Enter') {
		event.preventDefault();
		onCommit(element);
	}
	else if (element.matches('.bit') && (event.key === 'Enter' || event.key === ' ')) {
		event.preventDefault();
		update(element);
	}
}

function onClick(event) {
	const bit = event.target.closest('.bit');
	if (bit) {
		update(bit);
		return;
	}

	const copyButton = event.target.closest('.copy-button');
	if (copyButton) {
		onCopyButtonClick(copyButton);
	}
}

async function onCopyButtonClick(element) {
	const input = document.getElementById(element.id.replace('copy', 'input'));
	const text = (element.id.includes('hex') ? '0x' : '') + input.value;
	try {
		await navigator.clipboard.writeText(text);
		showToast('Copied ' + text, true);
	} catch (error) {
		showToast('Failed to copy text: ' + error, false);
	}
	element.blur();
}

function showToast(message, isSuccess) {
	const toast = document.getElementById('toast');
	toast.classList.toggle('bg-success', isSuccess);
	toast.classList.toggle('bg-danger', !isSuccess);
	document.getElementById('toast-body').innerText = message;
	bootstrap.Toast.getOrCreateInstance(toast).show();
}
