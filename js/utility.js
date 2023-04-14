
function toggleBit(value) {
	return parseInt(value) ^ 1;
}

function clamp(value, min, max) {
	console.log(value, min, max);
	if (typeof (value) === 'bigint') {
		return value > max ? max : value < min ? min : value;
	}

	return Math.min(Math.max(value, min), max);
}

function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function filterInput(element, alphabet) {
	element.value = element.value.toLowerCase()
		.replace(/[-]+/g, '-')
		.replace(/[\.]+/g, '.');

	if (!element.value.split('').every((char) => { return alphabet.includes(char); })) {
		element.value = element.value.slice(0, -1);
	}
}

function onEnterKey(event, element) {
	if (event.keyCode === 13) {
		event.preventDefault();
		element.blur();
	}
}

async function copyToClipboard(element) {
	try {
		await navigator.clipboard.writeText(
			(element.id.includes('hex') ? '0x' : '') + document.getElementById(element.id.replace('copy', 'input')).value
		);
	} catch (error) {
		console.error('Failed to copy text: ', error);
	}
	element.blur();
}