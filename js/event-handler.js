// Applies every valid edit right away; invalid or empty input is only marked and changes nothing.
// The edited input keeps its text until it is committed, so typing is not disturbed.
function onInput(element) {
	const value = clearInput(element.value, element.id);
	if (value === '') {
		element.classList.remove('is-invalid');
		return;
	}
	if (parseInput(value, element.id) === null) {
		element.classList.add('is-invalid');
		return;
	}

	update(element, element);
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

// Bit painting: pressing a bit toggles it, and dragging with the button held
// sets every bit passed over (in the same row) to that new value.
let bitDrag = null;

function onBitPointerDown(event) {
	const bit = event.target.closest('.bit');
	if (!bit || event.button !== 0) {
		return;
	}

	const row = bit.parentElement;
	const value = bit.innerText === '1' ? '0' : '1';
	bitDrag = { row, value, last: Array.prototype.indexOf.call(row.children, bit) };
	setBit(bit, value);
	refresh(getType(bit.id));
}

function onBitPointerMove(event) {
	if (!bitDrag) {
		return;
	}
	if (!(event.buttons & 1)) {
		bitDrag = null;
		return;
	}

	const bit = document.elementFromPoint(event.clientX, event.clientY)?.closest('.bit');
	if (!bit || bit.parentElement !== bitDrag.row) {
		return;
	}

	// Fill every bit between the previous and current one, so fast moves do not skip any.
	const index = Array.prototype.indexOf.call(bitDrag.row.children, bit);
	const from = Math.min(index, bitDrag.last);
	const to = Math.max(index, bitDrag.last);
	for (let i = from; i <= to; ++i) {
		setBit(bitDrag.row.children[i], bitDrag.value);
	}
	bitDrag.last = index;
	refresh(getType(bit.id));
}

function onBitPointerUp() {
	bitDrag = null;
}

function onClick(event) {
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
