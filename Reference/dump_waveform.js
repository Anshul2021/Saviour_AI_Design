const fs = require('fs');
const filepath = 'c:\\Users\\Gyan\\Desktop\\Saviour App\\Reference\\mixkit-clock-ticker-single-1061.wav';

const buffer = fs.readFileSync(filepath);
let pos = 12;
let sampleRate = 0, bitsPerSample = 0, channels = 0, dataPos = 0, dataSize = 0;

while (pos < buffer.length) {
  const chunkId = buffer.toString('ascii', pos, pos + 4);
  const chunkSize = buffer.readUInt32LE(pos + 4);
  if (chunkId === 'fmt ') {
    channels = buffer.readUInt16LE(pos + 10);
    sampleRate = buffer.readUInt32LE(pos + 12);
    bitsPerSample = buffer.readUInt16LE(pos + 22);
  } else if (chunkId === 'data') {
    dataPos = pos + 8;
    dataSize = chunkSize;
    break;
  }
  pos += 8 + chunkSize;
}

function readInt24LE(buf, offset) {
  let val = buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16);
  if (val & 0x800000) val |= 0xFF000000;
  return val;
}

const bytesPerSample = bitsPerSample / 8;
const numSamples = dataSize / (channels * bytesPerSample);

// Find peak index
let maxAmp = 0, peakIndex = 0;
for (let i = 0; i < numSamples; i++) {
  const byteIdx = dataPos + i * channels * bytesPerSample;
  const val = readInt24LE(buffer, byteIdx) / 8388608.0;
  if (Math.abs(val) > maxAmp) {
    maxAmp = Math.abs(val);
    peakIndex = i;
  }
}

console.log(`Dumping 80 samples from peakIndex (${peakIndex}):`);
for (let i = 0; i < 80; i++) {
  const idx = peakIndex + i;
  const byteIdx = dataPos + idx * channels * bytesPerSample;
  const val = readInt24LE(buffer, byteIdx) / 8388608.0;
  // Print a simple ASCII bar representing the amplitude
  const width = Math.round(Math.abs(val) * 60);
  const bar = (val >= 0 ? '+' : '-').repeat(width);
  console.log(`${i.toString().padStart(2, '0')} (${(i / sampleRate * 1000).toFixed(3)}ms): ${val.toFixed(5).padStart(8)} | ${bar}`);
}
