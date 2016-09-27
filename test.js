let Storage = require('./');
let test = require('tape');
let assert = require('assert');


test.skip('push data', () => {
	let storage = Storage();

	let data = Array(100).fill(1);

	let l = storage.push(data);
	assert.equal(l, 100);
	l = storage.push(data);
	assert.equal(l, 200);
	l = storage.push(data);
	assert.equal(l, 300);
	l = storage.push(data);
	assert.equal(l, 400);
	l = storage.push(data);
	assert.equal(l, 500);
	l = storage.push(data);
	assert.equal(l, 600);
});


test('get data', () => {
	let storage = Storage();

	let data = Array(100).fill(1);

	let l = storage.push(data);
	assert.equal(l, 100);
	l = storage.push(data);

	storage.get();
});


test('webworker', () => {

});


//TODO test stats:null

//TODO test maxScale: 1

//TODO test maxScale: 4

//TODO compare perf with array.push
