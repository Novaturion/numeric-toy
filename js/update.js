
function update(element) {
	const type = element.id.split('-').pop();
	const size = /(\d+)$/.exec(type)[0] / 8;

	const isBigInt = size > 4;

	const byteBuffer = new DataView(new Uint8Array(size).buffer);

	let makeInt = isBigInt ? BigInt : parseInt;
	let setUint = (value) => { };
	let setFloat = (value) => { };
	switch (size) {
		case 1:
			setUint = (value) => { return byteBuffer.setUint8(0, value); }
			break;
		case 2:
			setFloat = (value) => { float16.setFloat16(byteBuffer, 0, value); };
			setUint = (value) => { byteBuffer.setUint16(0, value); }
			break;
		case 4:
			setFloat = (value) => { byteBuffer.setFloat32(0, value); }
			setUint = (value) => { byteBuffer.setUint32(0, value); }
			break;
		case 8:
			setFloat = (value) => { byteBuffer.setFloat64(0, value); }
			setUint = (value) => { byteBuffer.setBigUint64(0, value); }
			break;

		default:
			break;
	}

	if (element.id.includes('bit')) {
		element.innerText = parseInt(element.innerText) ^ 1;
		const bitString = Array.from(element.parentElement.children).map(
			(bit) => { return bit.innerText; }
		).join('');

		setUint(
			isBigInt
				? makeInt('0b' + bitString)
				: makeInt(bitString, 2)
		);
	}
	else {
		if (element.id.includes('hex')) {
			let value = '0x' + element.value.slice(0, size * 2);
			setUint(makeInt(value));
		}
		else if (element.id.includes('float')) {
			setFloat(parseFloat(element.value));
		}
		else {
			setUint(makeInt(element.value));
		}

		updateBits(type, byteBuffer);
	}

	element.id.includes('float')
		? updateFloat(type, byteBuffer)
		: updateInt(type, byteBuffer);
}

function updateBits(type, byteBuffer) {
	const size = byteBuffer.buffer.byteLength;
	const maxBitIndex = size * 8 - 1;
	const bits = Array.from(document.getElementById('bit-values-' + type).children);

	let makeInt = size > 4 ? BigInt : parseInt;
	let uintValue = 0;
	switch (size) {
		case 1:
			uintValue = byteBuffer.getUint8(0);
			break;
		case 2:
			uintValue = byteBuffer.getUint16(0);
			break;
		case 4:
			uintValue = byteBuffer.getUint32(0);
			break;
		case 8:
			uintValue = byteBuffer.getBigUint64(0);
			break;

		default:
			break;
	}

	for (let i = maxBitIndex; i >= 0; --i) {
		bits[maxBitIndex - i].innerText = (uintValue >> makeInt(i)) & makeInt(1);
	}
}

function updateFloat(type, byteBuffer) {
	if (!type.includes('float')) {
		return;
	}

	const floatSizes = {
		2: { exponent: 5, mantissa: 10 },
		4: { exponent: 8, mantissa: 23 },
		8: { exponent: 11, mantissa: 52 }
	};

	const size = byteBuffer.buffer.byteLength;
	const mantissaSize = floatSizes[size].mantissa;
	const exponentSize = floatSizes[size].exponent;

	let makeInt = size > 4 ? BigInt : parseInt;
	let uintValue = 0;
	let floatValue = 0;
	switch (size) {
		case 2:
			uintValue = byteBuffer.getUint16(0);
			floatValue = float16.getFloat16(byteBuffer, 0);
			break;
		case 4:
			uintValue = byteBuffer.getUint32(0);
			floatValue = byteBuffer.getFloat32(0);
			break;
		case 8:
			uintValue = byteBuffer.getBigUint64(0);
			floatValue = byteBuffer.getFloat64(0);
			break;

		default:
			break;
	}

	const exponentMask = ((1 << exponentSize) - 1);
	const mantissaMask = (makeInt(1) << makeInt(mantissaSize)) - makeInt(1);

	const signBit = parseInt(uintValue >> makeInt(mantissaSize + exponentSize));
	const exponent = parseInt(uintValue >> makeInt(mantissaSize)) & exponentMask;
	const mantissa = uintValue & mantissaMask;

	let fraction = 1;
	for (let index = 1; index <= mantissaSize; ++index) {
		fraction += (parseInt(mantissa >> makeInt(mantissaSize - index)) & 1) * Math.pow(2, -index);
	}

	if (exponent === exponentMask) {
		floatValue = mantissa ? NaN : (signBit ? -Infinity : Infinity);
	}

	document.getElementById('sign-power-' + type).innerText = signBit;
	document.getElementById('exponent-' + type).innerText = exponent - (exponentMask >> 1);
	document.getElementById('fraction-' + type).innerText = fraction;

	document.getElementById('input-hex-' + type).value = uintValue.toString(16).toLowerCase();
	document.getElementById('input-dec-' + type).value = floatValue;
}

function updateInt(type, byteBuffer) {
	if (!type.includes('int')) {
		return;
	}

	let intValue = 0;
	let uintValue = 0;
	switch (byteBuffer.buffer.byteLength) {
		case 1:
			intValue = byteBuffer.getInt8(0);
			uintValue = byteBuffer.getUint8(0);
			break;
		case 2:
			intValue = byteBuffer.getInt16(0);
			uintValue = byteBuffer.getUint16(0);
			break;
		case 4:
			intValue = byteBuffer.getInt32(0);
			uintValue = byteBuffer.getUint32(0);
			break;
		case 8:
			intValue = byteBuffer.getBigInt64(0);
			uintValue = byteBuffer.getBigUint64(0);
			break;

		default:
			break;
	}

	document.getElementById('input-hex-' + type).value = uintValue.toString(16).toLowerCase();
	document.getElementById('input-dec-signed-' + type).value = intValue;
	document.getElementById('input-dec-unsigned-' + type).value = uintValue;
}
