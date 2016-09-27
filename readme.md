# samplestorage

Samples storage with overallocation and multiscale stats. In single-scale mode it is just an array optimized for big data input, in multiscale mode it is like 1d mipmaps, with _min_, _max_ and _average_ stats (can be customized). Direct purpose is storing data for waveform rendering, like [gl-waveform](https://github.com/audio-lab/gl-waveform), [wavearea](https://github.com/audio-lab/wavearea), but probably can be used for generic big-data rendering.

```js
const Storage = require('samplestorage');

//default options, can be omitted
let samples = Storage({
	//stats to calculate for each scale, based on 2 samples of lower scale
	//null means there is no scales
	stats: {
		//convolution with 2-samples kernel
		avg: (a, b) => a*.5 + b*.5,
		max: Math.max,
		min: Math.min
	},

	//overallocation block size, larger takes more memory, lesser hits performance
	//because array.push() is O(N)
	allocBlockSize: Math.pow(2, 16),

	//collect stats up to the scale, must be power of 2 or null. If 1 — it works as a simple array with overallocation
	maxScale: allocBlockSize
});

//put new data, calculates stats automatically
let length = samples.push(data);

//get data for the range, for NPOT scales it will linearly subsample result.
//scale is the same as group size, or number of samples per bar
let {max, min} = samples.get({from: 0, to: -0, scale: 2, data: ['max', 'min']});

//or simply get data for the range
{max, min} = samples.get(0, 100);
```

The storage can be used as a web-worker:

```js
const samples = require('samplestorage/worker')();

samples.push(data, length => {});
samples.get(opts, data => {});
```

