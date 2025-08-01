
import React from 'react';
import dynamic from 'next/dynamic';

// Dynamically import components that use client-side auth to prevent SSR issues
const DynamicAppLayout = dynamic(
  () => import('@/components/layout/AppLayout').then(mod => ({ default: mod.AppLayout })),
  { ssr: false }
);

const DynamicDashboard = dynamic(
  () => import('./Dashboard'),
  { ssr: false }
);

const Index = () => {
  return (
    <DynamicAppLayout>
      <DynamicDashboard />
    </DynamicAppLayout>
  );
};

export default Index;
