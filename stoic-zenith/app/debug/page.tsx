'use client';

import React from 'react';
import { SupabaseDebug } from '@/components/debug/SupabaseDebug';

export default function DebugPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">Debug Console</h1>
        <SupabaseDebug />
      </div>
    </div>
  );
}
