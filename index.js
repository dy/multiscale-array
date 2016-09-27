/**
 * @module  multiscale-array
 *
 * Create power-of-two scales for and array
 */
'use strict';

module.exports = createScales;

function createScales (buffer, opts) {
	if (!buffer) throw Error('An array should be passed as a first argument');

	if (opts instanceof Function) {
		opts = {reduce: opts}
	}
	opts = opts || {};

	let maxScale = opts.maxScale || Math.pow(2, 16);

	if (maxScale < 2) throw Error('Bad scales');

	let reduce = opts.reduce || ((a, b) => a*.5 + b*.5);

	//list of data  for scales, scale index is the power of 2
	let scales = [buffer];

	for (let group = 2, idx = 1; group <= maxScale; group*=2, idx++) {
		scales[idx] = [];
	}

	scales.scales = scales;
	scales.update = update;
	update();

	return scales;

	//recalculate stats for the range
	function update (start, end) {
		if (start == null) start = 0;
		if (end == null) end = buffer.length;

		for (let group = 2, idx = 1; group <= maxScale; group*=2, idx++) {
			let scaleBuffer = scales[idx];
			let prevScaleBuffer = scales[idx - 1];
			let len = Math.ceil(end/group);

			//ensure size
			if (scaleBuffer.length < len) scaleBuffer.length = len;

			let groupStart = Math.floor(start/group), groupEnd = len;

			for (let i = groupStart; i < groupEnd; i++) {
				let left = prevScaleBuffer[i*2];
				if (left === undefined) left = 0;
				let right = prevScaleBuffer[i*2+1];
				if (right === undefined) right = left;
				scaleBuffer[i] = reduce(left, right);
			}
		}

		return scales;
	}
}
