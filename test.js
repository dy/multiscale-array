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
