import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const sampleRate = 22050;
const durationSec = 90;
const numChannels = 1;
const bitsPerSample = 16;
const numSamples = sampleRate * durationSec;
const bytesPerSample = bitsPerSample / 8;
const dataSize = numSamples * numChannels * bytesPerSample;
const byteRate = sampleRate * numChannels * bytesPerSample;
const blockAlign = numChannels * bytesPerSample;
const headerSize = 44;

const buffer = Buffer.alloc(headerSize + dataSize);
buffer.write("RIFF", 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write("WAVE", 8);
buffer.write("fmt ", 12);
buffer.writeUInt32LE(16, 16);
buffer.writeUInt16LE(1, 20);
buffer.writeUInt16LE(numChannels, 22);
buffer.writeUInt32LE(sampleRate, 24);
buffer.writeUInt32LE(byteRate, 28);
buffer.writeUInt16LE(blockAlign, 32);
buffer.writeUInt16LE(bitsPerSample, 34);
buffer.write("data", 36);
buffer.writeUInt32LE(dataSize, 40);

const out = join(dirname(fileURLToPath(import.meta.url)), "..", "public", "sample", "desk.wav");
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, buffer);
console.log(`wrote ${out} (${buffer.length} bytes, ${durationSec}s silence)`);
