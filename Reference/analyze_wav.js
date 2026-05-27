const fs = require('fs');

const filepath = 'c:\\Users\\Gyan\\Desktop\\Saviour App\\Reference\\mixkit-clock-ticker-single-1061.wav';

function analyze() {
  if (!fs.existsSync(filepath)) {
    console.error('File does not exist:', filepath);
    return;
  }

  const buffer = fs.readFileSync(filepath);
  
  // Parse format subchunk
  let pos = 12;
  let sampleRate = 0;
  let bitsPerSample = 0;
  let channels = 0;
  let dataPos = 0;
  let dataSize = 0;

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

  console.log('Channels:', channels);
  console.log('Sample Rate:', sampleRate);
  console.log('Bits per Sample:', bitsPerSample);
  console.log('Data Size:', dataSize);

  const bytesPerSample = bitsPerSample / 8;
  const numSamples = dataSize / (channels * bytesPerSample);
  console.log('Num Samples:', numSamples);

  // Helper to read 24-bit integer
  function readInt24LE(buf, offset) {
    let val = buf[offset] | (buf[offset + 1] << 8) | (buf[offset + 2] << 16);
    if (val & 0x800000) {
      val |= 0xFF000000; // Sign extend to 32-bit
    }
    return val;
  }

  // Find peak amplitude and its index
  let maxAmp = 0;
  let peakIndex = 0;
  
  for (let i = 0; i < numSamples; i++) {
    const byteIdx = dataPos + i * channels * bytesPerSample;
    let val = 0;
    if (bitsPerSample === 24) {
      val = readInt24LE(buffer, byteIdx) / 8388608.0;
    } else if (bitsPerSample === 16) {
      val = buffer.readInt16LE(byteIdx) / 32768.0;
    }
    const absVal = Math.abs(val);
    if (absVal > maxAmp) {
      maxAmp = absVal;
      peakIndex = i;
    }
  }

  console.log(`Peak Amplitude: ${maxAmp.toFixed(4)} at sample ${peakIndex} (${(peakIndex / sampleRate).toFixed(4)}s)`);

  // Analyze the transient envelope shape starting from peak
  console.log('\n--- Transient Envelope (50 samples / ~1ms intervals starting from peak) ---');
  const samplesToPrint = 30;
  const printStep = Math.floor(sampleRate * 0.002); // 2ms steps (approx 88 samples)
  
  for (let i = 0; i < 20; i++) {
    const idx = peakIndex + i * printStep;
    if (idx >= numSamples) break;
    const byteIdx = dataPos + idx * channels * bytesPerSample;
    let val = 0;
    if (bitsPerSample === 24) {
      val = readInt24LE(buffer, byteIdx) / 8388608.0;
    } else if (bitsPerSample === 16) {
      val = buffer.readInt16LE(byteIdx) / 32768.0;
    }
    console.log(`t = +${(i * 2).toFixed(1)}ms: amplitude = ${Math.abs(val).toFixed(4)}`);
  }

  // Measure zero crossing rate (rough frequency estimation) around peak
  let zeroCrossings = 0;
  let lastVal = 0;
  const analysisRange = Math.floor(sampleRate * 0.01); // 10ms after peak
  for (let i = 0; i < analysisRange; i++) {
    const idx = peakIndex + i;
    if (idx >= numSamples) break;
    const byteIdx = dataPos + idx * channels * bytesPerSample;
    let val = 0;
    if (bitsPerSample === 24) {
      val = readInt24LE(buffer, byteIdx) / 8388608.0;
    } else if (bitsPerSample === 16) {
      val = buffer.readInt16LE(byteIdx) / 32768.0;
    }
    if (i > 0 && ((val >= 0 && lastVal < 0) || (val < 0 && lastVal >= 0))) {
      zeroCrossings++;
    }
    lastVal = val;
  }

  const durationSec = analysisRange / sampleRate;
  const estimatedFreq = (zeroCrossings / 2) / durationSec;
  console.log(`\nEstimated dominant frequency in first 10ms of peak: ${estimatedFreq.toFixed(1)} Hz`);
}

analyze();
