
const main = document.getElementsByTagName("main")[0];

main.innerHTML += getFloatSection("float16", "16-bit float (half)", 5, 10);
main.innerHTML += getFloatSection("float32", "32-bit float (single)", 8, 23);
main.innerHTML += getFloatSection("float64", "64-bit float (double)", 11, 52);

main.innerHTML += getIntSection("int8", "8-bit int", 8);
main.innerHTML += getIntSection("int16", "16-bit int", 16);
main.innerHTML += getIntSection("int32", "32-bit int", 32);
main.innerHTML += getIntSection("int64", "64-bit int", 64);

function getIntSection(id, header, size) {
	return '<h1 class="mb-3">' + header + '</h1>' +
		'<table id="' + id + '" class="d-table font-mono text-center mb-3">' +
		getBitIndeces(id, size) + '\n' +
		getIntBits(id, size) + '\n' +
		'</table>' +
		'<div class="row">' +
		getHexInput(id, capitalize("int")) +
		getDecIntInput(id, true) +
		getDecIntInput(id, false) +
		'</div>';
}

function getFloatSection(id, header, exponentSize, mantissaSize) {
	return '<h1 class="mb-3">' + header + '</h1>' +
		'<table id="' + id + '" class="d-table font-mono text-center mb-3">' +
		getBitIndeces(id, 1 + exponentSize + mantissaSize) + '\n' +
		getFloatBits(id, exponentSize, mantissaSize) + '\n' +
		'</table>' +
		'<div class="row">' +
		getHexInput(id, capitalize("float")) +
		getDecFloatInput(id) +
		'</div>';
}

function getBitIndeces(id, size) {
	let row = '<tr id="bit-indeces-' + id + '" class="d-table-row">\n';
	for (let i = size - 1; i > -1; i--) {
		row += '<td class="d-table-cell d-lg-fixed-table-cell font-sm ' + (Math.trunc((size - 1 - i) / 4) % 2 ? '' : 'bg-secondary') + '">' + i + '</td>\n';
	}
	return row + '</tr>\n';

}

function getHexInput(id, type) {
	return '<div class="col input-group mb-3">\n' +
		'<span class="input-group-text border-0 bg-dark text-light" id="hex-input-prefix-' + id + '">0x</span>\n' +
		'<input type="text" id="input-hex-' + id + '" class="form-control border-0 bg-dark text-light" placeholder="ffeedd"\n' +
		'aria-label="Hex value" aria-describedby="hex-input-prefix-' + id + '" onblur="update' + type + '(this, \'' + id + '\')" ' +
		'oninput="filterInput(this, \'0123456789abcdef\', 16)" onkeydown="onEnterKey(event, this)">\n' +
		'<button id="copy-hex-' + id + '" class="btn btn-outline-secondary" onclick="copyToClipboard(this)">\n' +
		'<svg class="text-light" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"\n' +
		'class="bi bi-clipboard" viewBox="0 0 16 16">\n' +
		'<path\n' +
		'd="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />\n' +
		'<path\n' +
		'd="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />\n' +
		'</svg>\n' +
		'</button>\n' +
		'</div>\n';
}

function getFloatBits(id, exponentSize, mantissaSize) {
	let row = '<tr id="bit-values-' + id + '" class="d-table-row d-table-cell-hover cursor-pointer">\n' +
		'<td class="d-table-cell bg-primary bit-sign" onclick="updateFloat(this, \'' + id + '\')">0</td>\n';

	for (let i = 0; i < exponentSize; i++) {
		row += '<td class="d-table-cell bg-success" data-index="' + i + '" onclick="updateFloat(this, \'' + id + '\')">0</td>\n';
	}

	for (let i = 0; i < mantissaSize; i++) {

		row += '<td class="d-table-cell bg-danger" data-index="' + i + '" onclick="updateFloat(this, \'' + id + '\')">0</td>\n';
	}

	return row + '</tr>\n';
}

function getIntBits(id, size) {
	let row = '<tr id="bit-values-' + id + '" class="d-table-row d-table-cell-hover cursor-pointer">\n' +
		'<td class="d-table-cell bg-primary bit-sign" onclick="updateInt(this, \'' + id + '\')">0</td>\n';

	for (let i = 0; i < size - 1; i++) {
		row += '<td class="d-table-cell bg-lighter-dark" data-index="' + i + '" onclick="updateInt(this, \'' + id + '\')">0</td>\n';
	}

	return row + '</tr>\n';
}

function getDecFloatInput(id) {
	return '<div class="col input-group mb-3">\n' +
		'<span class="input-group-text border-0 bg-dark text-light" id="dec-input-prefix-' + id + '">\n' +
		'<span">\n' +
		'-1<sup id="sign-power-' + id + '">0</sup>\n' +
		'* 2<sup id="exponent-' + id + '">0</sup>\n' +
		'* <span id="fraction-' + id + '">1.0</span>\n' +
		'=\n' +
		'</span>\n' +
		'</span>\n' +
		'<input type="text" id="input-dec-' + id + '" class="form-control border-0 bg-dark text-light" placeholder="3.14"\n' +
		'aria-label="Decimal value" aria-describedby="dec-input-prefix-' + id + '" onblur="updateFloat(this, \'' + id + '\')" ' +
		'oninput="filterInput(this, \'.-+aefinty0123456789\', 19)" onkeydown="onEnterKey(event, this)">\n' +
		'<button id="copy-dec-' + id + '" class="btn btn-outline-secondary" onclick="copyToClipboard(this)">\n' +
		'<svg class="text-light" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"\n' +
		'class="bi bi-clipboard" viewBox="0 0 16 16">\n' +
		'<path\n' +
		'd="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />\n' +
		'<path\n' +
		'd="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />\n' +
		'</svg>\n' +
		'</button>\n' +
		'</div>\n';
}

function getDecIntInput(id, isSigned) {
	const sign = isSigned ? 'signed' : 'unsigned';
	const signId = sign + '-' + id;
	return '<div class="col input-group mb-3">\n' +
		'<span class="input-group-text border-0 bg-dark text-light" id="dec-input-prefix-' + signId + '">\n' +
		sign +
		'</span>\n' +
		'<input type="text" id="input-dec-' + signId + '" class="form-control border-0 bg-dark text-light" placeholder="1024"\n' +
		'aria-label="Decimal value" aria-describedby="dec-input-prefix-' + id + '" onblur="updateInt(this, \'' + id + '\')" ' +
		'oninput="filterInput(this, \'' + (isSigned ? '-' : '') + '0123456789\', 19)" onkeydown="onEnterKey(event, this)">\n' +
		'<button id="copy-dec-' + signId + '" class="btn btn-outline-secondary" onclick="copyToClipboard(this)">\n' +
		'<svg class="text-light" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"\n' +
		'class="bi bi-clipboard" viewBox="0 0 16 16">\n' +
		'<path\n' +
		'd="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />\n' +
		'<path\n' +
		'd="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />\n' +
		'</svg>\n' +
		'</button>\n' +
		'</div>\n';
}
