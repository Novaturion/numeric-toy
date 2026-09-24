const COPY_ICON = `<svg class="bi bi-clipboard" xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16" aria-hidden="true">
	<path d="M4 1.5H3a2 2 0 0 0-2 2V14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V3.5a2 2 0 0 0-2-2h-1v1h1a1 1 0 0 1 1 1V14a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V3.5a1 1 0 0 1 1-1h1v-1z" />
	<path d="M9.5 1a.5.5 0 0 1 .5.5v1a.5.5 0 0 1-.5.5h-3a.5.5 0 0 1-.5-.5v-1a.5.5 0 0 1 .5-.5h3zm-3-1A1.5 1.5 0 0 0 5 1.5v1A1.5 1.5 0 0 0 6.5 4h3A1.5 1.5 0 0 0 11 2.5v-1A1.5 1.5 0 0 0 9.5 0h-3z" />
</svg>`;

const main = document.getElementsByTagName('main')[0];

main.innerHTML = Object.keys(FORMATS).map(
	(type) => isFloat(type) ? getFloatSection(type) : getIntSection(type)
).join('\n');

main.addEventListener('click', onClick);
main.addEventListener('keydown', onKeyDown);
main.addEventListener('input', (event) => onInput(event.target));
main.addEventListener('focusout', (event) => {
	if (event.target.matches('input')) {
		onCommit(event.target);
	}
});

for (const type in FORMATS) {
	refresh(type);
}

function getIntSection(id) {
	const size = FORMATS[id].bytes * 8;
	return `<h1 class="mb-3">${FORMATS[id].header}</h1>
		<table id="${id}" class="d-table font-mono text-center mb-3">
			${getBitIndices(id, size)}
			${getIntBits(id, size)}
		</table>
		<div class="row">
			${getHexInput(id)}
			${getDecIntInput(id, true)}
			${getDecIntInput(id, false)}
		</div>`;
}

function getFloatSection(id) {
	const { exponent, mantissa } = FORMATS[id];
	return `<h1 class="mb-3">${FORMATS[id].header}</h1>
		<table id="${id}" class="d-table font-mono text-center mb-3">
			${getBitIndices(id, 1 + exponent + mantissa)}
			${getFloatBits(id, exponent, mantissa)}
		</table>
		<div class="row">
			${getHexInput(id)}
			${getDecFloatInput(id)}
		</div>`;
}

function getBitIndices(id, size) {
	let row = `<tr id="bit-indices-${id}" class="d-table-row">\n`;
	for (let i = size - 1; i >= 0; --i) {
		const background = Math.trunc((size - 1 - i) / 4) % 2 ? '' : 'bg-secondary';
		row += `<td class="d-table-cell d-fixed-table-cell font-sm ${background}">${i}</td>\n`;
	}
	return row + '</tr>';
}

function getBit(id, index, background, label) {
	return `<td id="bit-${index}-${id}" class="d-table-cell bit ${background}" role="button" tabindex="0" aria-label="${label} bit ${index}">0</td>\n`;
}

function getFloatBits(id, exponentSize, mantissaSize) {
	const size = exponentSize + mantissaSize;
	let row = `<tr id="bit-values-${id}" class="d-table-row d-table-cell-hover cursor-pointer">\n` +
		getBit(id, size, 'bg-primary', 'Sign');

	for (let i = size - 1; i >= mantissaSize; --i) {
		row += getBit(id, i, 'bg-danger', 'Exponent');
	}

	for (let i = mantissaSize - 1; i >= 0; --i) {
		row += getBit(id, i, 'bg-success', 'Mantissa');
	}

	return row + '</tr>';
}

function getIntBits(id, size) {
	let row = `<tr id="bit-values-${id}" class="d-table-row d-table-cell-hover cursor-pointer">\n` +
		getBit(id, size - 1, 'bg-primary', 'Sign');

	for (let i = size - 2; i >= 0; --i) {
		row += getBit(id, i, 'bg-lighter-dark', 'Value');
	}

	return row + '</tr>';
}

function getInput(inputId, prefixId, prefix, placeholder, label) {
	return `<div class="col input-group mb-3">
		<span class="input-group-text border-0 bg-dark text-light" id="${prefixId}">${prefix}</span>
		<input type="text" id="input-${inputId}" class="form-control border-0 bg-dark text-light" placeholder="${placeholder}"
			spellcheck="false" autocomplete="off" aria-label="${label}" aria-describedby="${prefixId}">
		<button type="button" id="copy-${inputId}" class="btn btn-outline-secondary text-light copy-button" title="Copy" aria-label="Copy ${label.toLowerCase()}">
			${COPY_ICON}
		</button>
	</div>`;
}

function getHexInput(id) {
	return getInput('hex-' + id, 'hex-input-prefix-' + id, '0x', 'ffeedd', 'Hex value');
}

function getDecFloatInput(id) {
	const prefix = `<span>
		-1<sup id="sign-power-${id}">0</sup>
		* 2<sup id="exponent-${id}">0</sup>
		* <span id="fraction-${id}">1.0</span>
		=
	</span>`;
	return getInput('dec-' + id, 'dec-input-prefix-' + id, prefix, '3.14', 'Decimal value');
}

function getDecIntInput(id, isSigned) {
	const signId = (isSigned ? 'signed' : 'unsigned') + '-' + id;
	return getInput(
		'dec-' + signId, 'dec-input-prefix-' + signId,
		isSigned ? 'signed' : 'unsigned', isSigned ? '-1024' : '1024',
		(isSigned ? 'Signed' : 'Unsigned') + ' decimal value'
	);
}
