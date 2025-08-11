// Service Worker for background sync
const CACHE_NAME = 'stoic-journal-v1';
const SYNC_TAG = 'journal-sync';

// Install event
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  self.skipWaiting();
});

// Activate event
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  event.waitUntil(self.clients.claim());
});

// Background sync event
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === SYNC_TAG) {
    event.waitUntil(syncJournalData());
  }
});

// Sync journal data function
async function syncJournalData() {
  try {
    // Get pending sync data from IndexedDB or localStorage
    const pendingData = await getPendingSyncData();
    
    if (!pendingData || pendingData.length === 0) {
      console.log('No pending sync data found');
      return;
    }

    console.log('Syncing', pendingData.length, 'journal entries...');

    // Attempt to sync each entry
    for (const syncItem of pendingData) {
      try {
        const response = await fetch('/api/journal/sync-beacon', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: syncItem.userId,
            syncData: [syncItem],
            timestamp: Date.now()
          })
        });

        if (response.ok) {
          console.log('Successfully synced entry:', syncItem.entryId);
          // Remove from pending sync data
          await removePendingSyncData(syncItem.entryId);
        } else {
          console.error('Failed to sync entry:', syncItem.entryId, response.status);
        }
      } catch (error) {
        console.error('Error syncing entry:', syncItem.entryId, error);
      }
    }
  } catch (error) {
    console.error('Background sync failed:', error);
  }
}

// Get pending sync data from storage
async function getPendingSyncData() {
  try {
    // Try to get from IndexedDB first, fallback to localStorage
    const data = localStorage.getItem('pending_journal_sync');
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error getting pending sync data:', error);
    return [];
  }
}

// Remove synced data from storage
async function removePendingSyncData(entryId) {
  try {
    const data = await getPendingSyncData();
    const filtered = data.filter(item => item.entryId !== entryId);
    localStorage.setItem('pending_journal_sync', JSON.stringify(filtered));
  } catch (error) {
    console.error('Error removing pending sync data:', error);
  }
}

// Handle fetch events (optional - for offline support)
self.addEventListener('fetch', (event) => {
  // Only handle journal API requests
  if (event.request.url.includes('/api/journal/')) {
    event.respondWith(
      fetch(event.request).catch(() => {
        // If fetch fails, store the request for later sync
        if (event.request.method === 'POST') {
          storeFailedRequest(event.request);
        }
        return new Response(
          JSON.stringify({ error: 'Offline - will sync when online' }),
          { 
            status: 202,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
  }
});

// Store failed requests for later sync
async function storeFailedRequest(request) {
  try {
    const body = await request.text();
    const failedRequest = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      body: body,
      timestamp: Date.now()
    };

    const existing = await getPendingSyncData();
    existing.push(failedRequest);
    localStorage.setItem('pending_journal_sync', JSON.stringify(existing));
    
    // Register for background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(SYNC_TAG);
    }
  } catch (error) {
    console.error('Error storing failed request:', error);
  }
}
