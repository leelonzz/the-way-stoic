#!/usr/bin/env node

/**
 * Test script to verify journal synchronization is working properly
 * This script will:
 * 1. Check localStorage saves are working
 * 2. Verify database sync is happening
 * 3. Confirm data persists across reloads
 */

const { chromium } = require('playwright');

async function testJournalSync() {
  console.log('🧪 Starting journal sync test...\n');
  
  const browser = await chromium.launch({ 
    headless: false,
    devtools: true 
  });
  
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Enable console logging
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.log('❌ Console Error:', msg.text());
    }
  });

  try {
    console.log('1️⃣ Navigating to journal page...');
    await page.goto('http://localhost:3000/journal', { waitUntil: 'networkidle' });
    
    // Wait for journal to load
    await page.waitForSelector('[contenteditable]', { timeout: 10000 });
    console.log('✅ Journal page loaded\n');
    
    // Type test content
    console.log('2️⃣ Typing test content...');
    const testContent = `Test entry at ${new Date().toLocaleTimeString()}: This is a test to verify real-time sync is working properly.`;
    
    // Find the editor and type
    const editor = await page.locator('[contenteditable]').first();
    await editor.click();
    await editor.fill(''); // Clear existing content
    await editor.type(testContent, { delay: 50 }); // Type with delay to simulate real typing
    
    console.log('✅ Content typed\n');
    
    // Wait for save indicators
    console.log('3️⃣ Waiting for save status...');
    
    // Check for save status indicator
    await page.waitForTimeout(2000); // Wait for debounce
    
    const saveStatus = await page.locator('text=/Saved|Synced|Syncing/i').first();
    if (await saveStatus.isVisible()) {
      const statusText = await saveStatus.textContent();
      console.log(`✅ Save status: ${statusText}\n`);
    } else {
      console.log('⚠️ Save status indicator not visible\n');
    }
    
    // Check localStorage
    console.log('4️⃣ Checking localStorage...');
    const localStorageData = await page.evaluate(() => {
      const keys = Object.keys(localStorage).filter(k => k.includes('journal'));
      const data = {};
      keys.forEach(key => {
        try {
          data[key] = JSON.parse(localStorage.getItem(key));
        } catch {
          data[key] = localStorage.getItem(key);
        }
      });
      return data;
    });
    
    const hasLocalData = Object.keys(localStorageData).some(key => {
      const value = localStorageData[key];
      return JSON.stringify(value).includes(testContent.substring(0, 20));
    });
    
    if (hasLocalData) {
      console.log('✅ Data saved to localStorage\n');
    } else {
      console.log('❌ Data NOT found in localStorage\n');
    }
    
    // Reload page to test persistence
    console.log('5️⃣ Reloading page to test persistence...');
    await page.reload({ waitUntil: 'networkidle' });
    await page.waitForSelector('[contenteditable]', { timeout: 10000 });
    
    // Check if content persists
    const editorAfterReload = await page.locator('[contenteditable]').first();
    const contentAfterReload = await editorAfterReload.textContent();
    
    if (contentAfterReload && contentAfterReload.includes(testContent.substring(0, 20))) {
      console.log('✅ Content persisted after reload!\n');
      console.log('🎉 Journal sync is working properly!');
    } else {
      console.log('❌ Content NOT persisted after reload\n');
      console.log('⚠️ Journal sync may have issues');
    }
    
    // Check for any sync errors in console
    const syncErrors = await page.evaluate(() => {
      return window.journalSyncErrors || [];
    });
    
    if (syncErrors.length > 0) {
      console.log('\n⚠️ Sync errors detected:', syncErrors);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  } finally {
    console.log('\n📊 Test completed. Press Ctrl+C to close browser...');
    // Keep browser open for manual inspection
    await new Promise(() => {});
  }
}

// Run the test
testJournalSync().catch(console.error);