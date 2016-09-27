let Storage = require('./');

let storage = Storage();

let data = Array(100).fill(1);
// setInterval(() => {
let l = storage.push(data);
// let data = storage.get(-10);
// console.log(data)
// }, 1000);
