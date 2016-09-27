/**
 * @module  samplestorage
 *
 * Multiscale representation of collected waveform data: min, max, avg.
 * Prototype for audio data.
 */
'use strict';

// const clamp = require('mumath/clamp');
// const fromDb = require('decibels/to-gain');
// const toDb = require('decibels/from-gain');
const idx = require('negative-index');

module.exports = Storage;

function Storage (opts) {
	opts = opts || {};

	let allocBlockSize = opts.allocBlockSize || Math.pow(2, 16);
	let maxScale = opts.maxScale || Math.pow(2, 16);

	//reducers are (convolvers in general) any fn of 2 samples returning some value
	let reducers = opts.stats;
	if (reducers === undefined) reducers = {
		min: Math.min,
		max: Math.max,
		avg: (a, b) => a*.5 + b*.5
	};

	let buffer = [];
	let last = 0;


	//grouped data for reducers here, {min: map, max: map, avg: map, ...}
	let stats = {};
	let statNames = !reducers ? [] : Object.keys(reducers);
	statNames.forEach((name) => {
		stats[name] = [buffer];
	});

	push.update = update;
	push.push = push;
	push.get = get;

	return push;


	//put new samples
	function push (chunk) {
		let newLength = chunk.length + last;

		ensureSize(newLength);

		for (let i = 0; i < chunk.length; i++) {
			buffer[last + i] = chunk[i];
		}

		last = newLength;

		update(last - chunk.length, last);

		return last;
	}

	function ensureSize (size) {
		if (buffer.length > size) return;

		//ensure size of storage
		buffer = buffer.concat(Array(allocBlockSize).fill(0));
		statNames.forEach(name => {
			stats[name][0] = buffer;
		});

		if (!statNames.length || maxScale <= 1) return;

		//ensure size of all little scales
		for (let group = 2, idx = 1; group <= maxScale; group*=2, idx++) {
			statNames.forEach(name => {
				let scales = stats[name];
				if (!scales[idx]) scales[idx] = [];
				let scaleBuffer = scales[idx];
				scaleBuffer = scaleBuffer.concat(Array(Math.max(allocBlockSize/group, 1)).fill(0));
				scales[idx] = scaleBuffer;
			});
		}
	}

	//recalculate stats for the range
	function update (start, end) {
		if (!statNames.length || maxScale <= 1) return;

		if (start == null) start = 0;
		if (end == null) end = last;

		start = idx(start, last);
		end = idx(end, last);

		for (let group = 2, idx = 1; group <= maxScale; group*=2, idx++) {
			let groupStart = Math.floor(start/group), groupEnd = Math.floor(end/group);

			statNames.forEach(name => {
				let scales = stats[name];
				let scaleBuffer = scales[idx];
				let prevScaleBuffer = scales[idx-1];
				let convolve = reducers[name];
				for (let i = groupStart; i < groupEnd; i++) {
					let left = prevScaleBuffer[i*2];
					let right = prevScaleBuffer[i*2+1];
					scaleBuffer[i] = convolve(left, right);
				}
			});
		}
	}


	function get ( opts) {
		let {width, number, offset, log, min, max} = opts;

		number = Math.floor(number);

		let start = offset == null ? -number : offset;
		if (start < 0) {
			start = samples.length + start;
		}
		start = Math.max(start, 0);

		let data, amp, x;

		//collect tops/bottoms first
		let tops = Array(width), bottoms = Array(width);
		let maxTop, maxBottom, sum, count;
		for (let x = .5, idx = 0; x < width; x++, idx++) {
			let i = number * x / width;

			let lx = Math.floor(x);
			let rx = Math.ceil(x);
			let li = number * lx / width;
			let ri = number * rx / width;

			// ignore out of range data
			if (Math.ceil(ri) + start >= samples.length) {
				break;
			}

			maxTop = -1;
			maxBottom = 1;
			count = 0;

			for (let i = Math.max(Math.floor(li), 0); i < ri; i++) {
				amp = f(samples[i + start], log, min, max);

				sum += amp;
				count++;

				maxTop = Math.max(maxTop, amp);
				maxBottom = Math.min(maxBottom, amp);
			}

			if (maxTop === maxBottom) maxBottom -= .002;
			tops[idx] = maxTop;
			bottoms[idx] = maxBottom;
		}

		data = [tops, bottoms];

		return data;
	}
}



function inter (data, idx) {
	let lIdx = Math.floor( idx ),
		rIdx = Math.ceil( idx );

	let t = idx - lIdx;

	let left = data[lIdx], right = data[rIdx];

	return left * (1 - t) + right * t;
}


function f(ratio, log, min, max) {
	if (log) {
		let db = toDb(Math.abs(ratio));
		db = clamp(db, min, max);

		let dbRatio = (db - min) / (max - min);

		ratio = ratio < 0 ? -dbRatio : dbRatio;
	}
	else {
		min = fromDb(min);
		max = fromDb(max);
		let v = clamp(Math.abs(ratio), min, max);

		v = (v - min) / (max - min);
		ratio = ratio < 0 ? -v : v;
	}

	return clamp(ratio, -1, 1);
}
