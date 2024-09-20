
function capitalize(value) {
	return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
}

function resetBits(id) {
	const bits = document.getElementById('bit-values-' + id).children;
	for (let i = 0; i < bits.length; i++) {
		bits[i].innerText = '0';
	}
}

function resetInputs(id) {
	document.getElementById('input-hex-' + id).value = '';

	if (id.includes('float')) {
		document.getElementById('input-dec-' + id).value = '';
	}
	else {
		document.getElementById('input-dec-signed-' + id).value = '';
		document.getElementById('input-dec-unsigned-' + id).value = '';
	}
}

function clearInput(value) {
	return value.toLowerCase()
		.trim()
		.replace('0x', '')
		.replace(/[-]+/g, '-')
		.replace(/[\.]+/g, '.');
}

function validateInput(value, id) {
	let regexp = '';

	if (id.includes('hex')) {
		regexp = /^\b[a-f\d]+\b$/;
	}
	else if (id.includes('float')) {
		regexp = /^[+-]*\b[aefinty\d]+[.]{0,1}[\d]*(e[-+]{1}[\d]+){0,1}\b\.*f{0,1}$/;
	}
	else if (id.includes('int')) {
		regexp = /^[+-]*\b[\d]+\b$/;
	}

	return regexp.test(value);
}
