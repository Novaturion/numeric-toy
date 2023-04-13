
function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function toggleBit(value) {
	return parseInt(value) ^ 1;
}

function filterInput(element, alphabet, maxChars) {
	element.value = element.value.slice(0, maxChars).toLowerCase();
	const isValid = element.value.split('').every((char) => { return alphabet.includes(char); });

	if (!isValid) {
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
		const isHex = element.id.includes('hex');
		await navigator.clipboard.writeText(
			(isHex ? '0x' : '') + document.getElementById(element.id.replace('copy', 'input')).value
		);
	} catch (error) {
		console.error('Failed to copy text: ', error);
	}
	element.blur();
}