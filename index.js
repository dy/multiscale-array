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
	function update (arr, start, end) {
		if (typeof arr === 'number' || arr == null) {
			end = start;
			start = arr;
		}
		//update array, if passed one
		else {
			if (arr.length == null) throw Error('New data should be array[ish]')

			//rescind lengths if new data is smaller
			if (arr.length < scales[0].length) {
				for (let group = 2, idx = 1; group <= maxScale; group*=2, idx++) {
					let len = Math.ceil(arr.length/group);
					scales[idx].length = len;
				}
			}

			scales[0] = arr;
		}

		if (start == null) start = 0;
		if (end == null) end = scales[0].length;

		for (let group = 2, idx = 1; group <= maxScale; group*=2, idx++) {
			let scaleBuffer = scales[idx];
			let prevScaleBuffer = scales[idx - 1];
			let len = Math.ceil(end/group);

			//ensure size
			if (scaleBuffer.length < len) scaleBuffer.length = len;

			let groupStart = Math.floor(start/group);

			for (let i = groupStart; i < len; i++) {
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
