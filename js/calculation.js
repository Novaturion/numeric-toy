
function updateFloat(element, id) {
	const bits = Array.from(document.getElementById('bit-values-' + id).children);
	const bitsCount = bits.length;
	const bytesCount = bitsCount / 8;
	const bytes = new DataView(new Uint8Array(bytesCount).buffer);

	let getFloat = () => { };
	let getUint = () => { };
	let setFloat = (value) => { };
	switch (bitsCount) {
		case 16:
			getFloat = () => { return float16.getFloat16(bytes, 0); };
			getUint = () => { return bytes.getUint16(0); }
			setFloat = (value) => { float16.setFloat16(bytes, 0, value); };
			break;
		case 32:
			getFloat = () => { return bytes.getFloat32(0); }
			getUint = () => { return bytes.getUint32(0); }
			setFloat = (value) => { bytes.setFloat32(0, value); }
			break;
		case 64:
			getFloat = () => { return bytes.getFloat64(0); }
			getUint = () => { return bytes.getBigUint64(0); }
			setFloat = (value) => { bytes.setFloat64(0, value); }
			break;

		default:
			break;
	}

	if (element.id.startsWith('input')) {
		if (!element.value) {
			clearFloatInputs(id);
			return;
		}

		let bitsString = '';
		if (element.id.includes('hex')) {
			for (let i = 0; i < element.value.length; i += 2) {
				let value = (parseInt(element.value.slice(i, i + 2), 16) >>> 0);
				bytes.setUint8(i / 2, value);
				bitsString += value.toString(2).padStart(8, '0');
			}
		}
		else {
			setFloat(parseFloat(element.value));
			bitsString = getUint().toString(2).padStart(bitsCount, '0');
		}

		for (let i = 0; i < bitsCount; i++) {
			bits[i].innerText = bitsString.charAt(i);
		}
	}
	else {
		element.innerText = toggleBit(element.innerText);
		const bitsString = bits.map(
			(bit) => { return bit.innerText; }
		).join('');

		for (let i = 0; i < bytes.buffer.byteLength; i++) {
			bytes.setUint8(i, parseInt(bitsString.substring(i * 8, i * 8 + 8), 2));
		}
	}

	const signBit = bits[0].innerText;
	const exponentBits = bits.filter(
		(bit) => { return bit.classList.contains('bg-success'); }
	).map(
		(bit) => { return bit.innerText }
	);
	const fractionBits = bits.reverse().filter(
		(bit) => { return bit.classList.contains('bg-danger'); }
	).map(
		(bit) => { return bit.innerText; }
	);

	let exponent = parseInt(exponentBits.join(''), 2) - ((1 << exponentBits.length - 1) - 1);

	const fractionSize = bitsCount - exponentBits.length - 1;

	let fraction = 1;
	for (const index of fractionBits) {
		fraction += Math.pow(2, -(fractionSize - index));
	}

	document.getElementById('sign-power-' + id).innerText = signBit;
	document.getElementById('exponent-' + id).innerText = exponent;
	document.getElementById('fraction-' + id).innerText = fraction;

	let float = getFloat();
	if (exponentBits.every((bit) => { return bit === '1' })) {
		float = fractionBits.length > 0 ? NaN : (signBit === '0' ? Infinity : -Infinity);
	}

	document.getElementById('input-hex-' + id).value = getUint().toString(16).toLowerCase();
	document.getElementById('input-dec-' + id).value = float;
}

function updateInt(element, id) {
	const bits = Array.from(document.getElementById('bit-values-' + id).children);
	const bitsCount = bits.length;
	const bytesCount = bitsCount / 8;
	const bytes = new DataView(new Uint8Array(bytesCount).buffer);

	let getInt = () => { };
	let getUint = () => { };
	let setUint = (value) => { };
	switch (bitsCount) {
		case 8:
			getInt = () => { return bytes.getInt8(0); };
			getUint = () => { return bytes.getUint8(0); }
			setUint = (value) => { return bytes.setUint8(0, value); }
			break;
		case 16:
			getInt = () => { return bytes.getInt16(0); };
			getUint = () => { return bytes.getUint16(0); }
			setUint = (value) => { return bytes.setUint16(0, value); }
			break;
		case 32:
			getInt = () => { return bytes.getInt32(0); }
			getUint = () => { return bytes.getUint32(0); }
			setUint = (value) => { return bytes.setUint32(0, value); }
			break;
		case 64:
			getInt = () => { return bytes.getBigInt64(0); }
			getUint = () => { return bytes.getBigUint64(0); }
			setUint = (value) => { return bytes.setBigUint64(0, value); }
			break;

		default:
			break;
	}

	if (element.id.startsWith('input')) {
		if (!element.value) {
			clearIntInputs(id);
			return;
		}

		let value = bitsCount > 32
			? BigInt.asUintN(bitsCount, BigInt(element.value))
			: parseInt(element.value, element.id.includes('hex') ? 16 : 10);
		setUint(value);

		const bitsString = getUint().toString(2).padStart(bitsCount, '0');
		for (let i = 0; i < bitsCount; i++) {
			bits[i].innerText = bitsString.charAt(i);
		}
	}
	else {
		element.innerText = toggleBit(element.innerText);
		const bitsString = bits.map(
			(bit) => { return bit.innerText; }
		).join('');

		for (let i = 0; i < bytes.buffer.byteLength; i++) {
			bytes.setUint8(i, parseInt(bitsString.substring(i * 8, i * 8 + 8), 2));
		}

	}

	document.getElementById('input-hex-' + id).value = getUint().toString(16).toLowerCase();
	document.getElementById('input-dec-signed-' + id).value = getInt();
	document.getElementById('input-dec-unsigned-' + id).value = getUint();
}

function clearFloatInputs(id) {
	document.getElementById('input-hex-' + id).value = '';
	document.getElementById('input-dec-' + id).value = '';
	clearBits(id);
}

function clearIntInputs(id) {
	document.getElementById('input-hex-' + id).value = '';
	document.getElementById('input-dec-signed-' + id).value = '';
	document.getElementById('input-dec-unsigned-' + id).value = '';
	clearBits(id);
}

function clearBits(id) {
	const bits = document.getElementById('bit-values-' + id).children;
	for (let i = 0; i < bits.length; i++) {
		bits[i].innerText = '0';
	}
}