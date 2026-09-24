const FORMATS = {
	float16: { bytes: 2, exponent: 5, mantissa: 10, header: '16-bit float (half)' },
	float32: { bytes: 4, exponent: 8, mantissa: 23, header: '32-bit float (single)' },
	float64: { bytes: 8, exponent: 11, mantissa: 52, header: '64-bit float (double)' },
	int8: { bytes: 1, header: '8-bit int' },
	int16: { bytes: 2, header: '16-bit int' },
	int32: { bytes: 4, header: '32-bit int' },
	int64: { bytes: 8, header: '64-bit int' }
};

const HEX_REGEXP = /^[\da-f]+$/;
const SIGNED_INT_REGEXP = /^[+-]?\d+$/;
const UNSIGNED_INT_REGEXP = /^\+?\d+$/;
const FLOAT_REGEXP = /^[+-]?(\d+\.?\d*|\.\d+)(e[+-]?\d+)?f?$/;
const FLOAT_SPECIAL_REGEXP = /^([+-]?)(inf|infinity|nan)$/;

// Element ids end with the format name, e.g. "input-dec-signed-int8" or "bit-3-float16".
function getType(id) {
	return id.split('-').pop();
}

function isFloat(type) {
	return 'exponent' in FORMATS[type];
}

function clearInput(value, id) {
	value = value.toLowerCase().trim();
	if (id.includes('hex') || !isFloat(getType(id))) {
		value = value.replace(/[\s_]/g, '');
	}
	if (id.includes('hex')) {
		value = value.replace(/^0x/, '');
	}
	return value;
}

// Returns the parsed value (a BigInt bit pattern for hex and int inputs, a Number for float inputs),
// or null when the value is invalid or out of range for the input's format.
function parseInput(value, id) {
	const bitCount = BigInt(FORMATS[getType(id)].bytes * 8);

	if (id.includes('hex')) {
		if (!HEX_REGEXP.test(value)) {
			return null;
		}
		const bits = BigInt('0x' + value);
		return bits < 1n << bitCount ? bits : null;
	}

	if (id.includes('signed')) {
		const isSigned = !id.includes('unsigned');
		if (!(isSigned ? SIGNED_INT_REGEXP : UNSIGNED_INT_REGEXP).test(value)) {
			return null;
		}
		const intValue = BigInt(value);
		const min = isSigned ? -(1n << (bitCount - 1n)) : 0n;
		const max = (isSigned ? 1n << (bitCount - 1n) : 1n << bitCount) - 1n;
		return min <= intValue && intValue <= max ? BigInt.asUintN(Number(bitCount), intValue) : null;
	}

	const special = FLOAT_SPECIAL_REGEXP.exec(value);
	if (special) {
		return special[2] === 'nan' ? NaN : (special[1] === '-' ? -Infinity : Infinity);
	}
	return FLOAT_REGEXP.test(value) ? Number(value.replace(/f$/, '')) : null;
}

function readUint(view) {
	switch (view.byteLength) {
		case 1: return BigInt(view.getUint8(0));
		case 2: return BigInt(view.getUint16(0));
		case 4: return BigInt(view.getUint32(0));
		case 8: return view.getBigUint64(0);
	}
}

function writeUint(view, value) {
	switch (view.byteLength) {
		case 1: return view.setUint8(0, Number(value));
		case 2: return view.setUint16(0, Number(value));
		case 4: return view.setUint32(0, Number(value));
		case 8: return view.setBigUint64(0, value);
	}
}

// Prefer the native float16 support when the browser has it.
function readFloat(view) {
	switch (view.byteLength) {
		case 2: return view.getFloat16 ? view.getFloat16(0) : float16.getFloat16(view, 0);
		case 4: return view.getFloat32(0);
		case 8: return view.getFloat64(0);
	}
}

function writeFloat(view, value) {
	switch (view.byteLength) {
		case 2: return view.setFloat16 ? view.setFloat16(0, value) : float16.setFloat16(view, 0, value);
		case 4: return view.setFloat32(0, value);
		case 8: return view.setFloat64(0, value);
	}
}

function roundFloat(value, bytes) {
	switch (bytes) {
		case 2: return Math.f16round ? Math.f16round(value) : float16.hfround(value);
		case 4: return Math.fround(value);
		case 8: return value;
	}
}

// Shortest decimal string that rounds back to the same value in the given format.
function formatFloat(value, bytes) {
	if (Object.is(value, -0)) {
		return '-0';
	}
	if (!isFinite(value) || bytes === 8) {
		return String(value);
	}
	for (let precision = 1; precision < 17; ++precision) {
		const shortest = Number(value.toPrecision(precision));
		if (roundFloat(shortest, bytes) === value) {
			return String(shortest);
		}
	}
	return String(value);
}
