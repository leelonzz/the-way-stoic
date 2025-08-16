#!/usr/bin/env node

// Script to clear cache and test video URL removal
const { clearPhilosophersCache, getPhilosopherBiography } = require('./src/lib/philosopherData.ts');

console.log('Clearing philosopher cache...');
clearPhilosophersCache();

console.log('Testing video URLs for new philosophers...\n');

const newPhilosophers = [
  'antoninus-pius',
  'lucius-verus', 
  'commodus',
  'plato'
];

newPhilosophers.forEach(slug => {
  const biography = getPhilosopherBiography(slug);
  if (biography) {
    console.log(`${biography.name}:`);
    console.log(`  Link: "${biography.link}"`);
    console.log(`  Video URL: "${biography.videoUrl}"`);
    console.log(`  Has video: ${!!biography.videoUrl}`);
    console.log('');
  } else {
    console.log(`${slug}: Biography not found`);
  }
});

console.log('Cache cleared and data reloaded!');
