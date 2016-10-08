'use strict';

let Storage = require('./');
let assert = require('assert');


let data = Array(100).fill(1);

let scales = Storage(data);

for (let i = 25; i < 75; i++) {
	data[i] = .5;
}

assert.deepEqual(scales[5], [1, 1, 1, 1]);


scales.update(25, 75);
assert.deepEqual(scales[5], [0.890625, 0.5, 0.828125, 1]);


for (let i = 0; i < 50; i++) {
	data.push(.5);
}

assert.deepEqual(scales[5], [0.890625, 0.5, 0.828125, 1]);
scales.update();
assert.deepEqual(scales[5], [0.890625, 0.5, 0.828125, .5625, .5]);


let data2 = Array(100).fill(0);
scales.update(data2);
assert.deepEqual(scales[5], [0, 0, 0, 0]);

scales.subset(-50);
assert.deepEqual(scales[5], [0, 0]);
