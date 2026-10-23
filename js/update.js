// `exclude` is an input to leave untouched, e.g. the one the user is typing into.
function update(element, exclude = null) {
	const type = getType(element.id);
	const view = new DataView(new ArrayBuffer(FORMATS[type].bytes));

	if (element.classList.contains('bit')) {
		element.innerText = element.innerText === '1' ? '0' : '1';
		writeUint(view, readBits(type));
	}
	else {
		const value = parseInput(clearInput(element.value, element.id), element.id);
		typeof value === 'bigint'
			? writeUint(view, value)
			: writeFloat(view, value);
	}

	render(type, view, exclude);
}

// Re-renders a section from its current bits, e.g. to restore a cleared input.
function refresh(type) {
	const view = new DataView(new ArrayBuffer(FORMATS[type].bytes));
	writeUint(view, readBits(type));
	render(type, view);
}

function render(type, view, exclude = null) {
	// Every input of the section gets overwritten, so stale invalid markers no longer apply.
	for (const input of document.querySelectorAll(`input[id$="-${type}"]`)) {
		input.classList.remove('is-invalid');
	}

	updateBits(type, view);
	isFloat(type)
		? updateFloat(type, view, exclude)
		: updateInt(type, view, exclude);
}

function setBit(bit, value) {
	bit.innerText = value;
}

function readBits(type) {
	const bits = document.getElementById('bit-values-' + type).children;
	return BigInt('0b' + Array.from(bits, (bit) => bit.innerText).join(''));
}

function updateBits(type, view) {
	const bits = document.getElementById('bit-values-' + type).children;
	const binary = readUint(view).toString(2).padStart(bits.length, '0');
	for (let i = 0; i < bits.length; ++i) {
		bits[i].innerText = binary[i];
	}
}

function setInputValue(id, value, exclude) {
	const input = document.getElementById(id);
	if (input !== exclude) {
		input.value = value;
	}
	return input;
}

function updateFloat(type, view, exclude) {
	const format = FORMATS[type];
	const uintValue = readUint(view);
	const floatValue = readFloat(view);

	const maxExponent = (1 << format.exponent) - 1;
	const bias = maxExponent >> 1;

	const signBit = Number(uintValue >> BigInt(format.exponent + format.mantissa));
	const exponent = Number(uintValue >> BigInt(format.mantissa)) & maxExponent;
	const mantissa = Number(uintValue & ((1n << BigInt(format.mantissa)) - 1n));

	let exponentText;
	let fractionText;
	if (exponent === maxExponent) {
		exponentText = '∞';
		fractionText = mantissa ? 'NaN' : '1.0';
	}
	else {
		// Subnormals (and zero) have no implicit leading 1 and use the minimum exponent.
		const isSubnormal = exponent === 0;
		const fraction = (isSubnormal ? 0 : 1) + mantissa / 2 ** format.mantissa;
		exponentText = isSubnormal ? 1 - bias : exponent - bias;
		fractionText = Number.isInteger(fraction) ? fraction.toFixed(1) : String(fraction);
	}

	document.getElementById('sign-power-' + type).innerText = signBit;
	document.getElementById('exponent-' + type).innerText = exponentText;
	document.getElementById('fraction-' + type).innerText = fractionText;

	setInputValue('input-hex-' + type, formatHex(uintValue, format.bytes), exclude);
	const decimal = setInputValue('input-dec-' + type, formatFloat(floatValue, format.bytes), exclude);
	decimal.title = 'As double: ' + formatFloat(floatValue, 8);
}

function updateInt(type, view, exclude) {
	const format = FORMATS[type];
	const uintValue = readUint(view);

	setInputValue('input-hex-' + type, formatHex(uintValue, format.bytes), exclude);
	setInputValue('input-dec-signed-' + type, BigInt.asIntN(format.bytes * 8, uintValue), exclude);
	setInputValue('input-dec-unsigned-' + type, uintValue, exclude);
}

function formatHex(value, bytes) {
	return value.toString(16).padStart(bytes * 2, '0');
}
