'use client';

import React, { ReactNode } from 'react';
import { useAuthContext } from './AuthProvider';
import LoginScreen from './LoginScreen';
import { Skeleton } from '@/components/ui/skeleton';
import { Brain } from 'lucide-react';

// Hourglass Animation Styles
const hourglassStyles = `
  .hourglassBackground {
    position: relative;
    background-color: rgb(71, 60, 60);
    height: 130px;
    width: 130px;
    border-radius: 50%;
    margin: 30px auto;
  }

  .hourglassContainer {
    position: absolute;
    top: 30px;
    left: 40px;
    width: 50px;
    height: 70px;
    -webkit-animation: hourglassRotate 2s ease-in 0s infinite;
    animation: hourglassRotate 2s ease-in 0s infinite;
    transform-style: preserve-3d;
    perspective: 1000px;
  }

  .hourglassContainer div,
  .hourglassContainer div:before,
  .hourglassContainer div:after {
    transform-style: preserve-3d;
  }

  @-webkit-keyframes hourglassRotate {
    0% {
      transform: rotateX(0deg);
    }

    50% {
      transform: rotateX(180deg);
    }

    100% {
      transform: rotateX(180deg);
    }
  }

  @keyframes hourglassRotate {
    0% {
      transform: rotateX(0deg);
    }

    50% {
      transform: rotateX(180deg);
    }

    100% {
      transform: rotateX(180deg);
    }
  }

  .hourglassCapTop {
    top: 0;
  }

  .hourglassCapTop:before {
    top: -25px;
  }

  .hourglassCapTop:after {
    top: -20px;
  }

  .hourglassCapBottom {
    bottom: 0;
  }

  .hourglassCapBottom:before {
    bottom: -25px;
  }

  .hourglassCapBottom:after {
    bottom: -20px;
  }

  .hourglassGlassTop {
    transform: rotateX(90deg);
    position: absolute;
    top: -16px;
    left: 3px;
    border-radius: 50%;
    width: 44px;
    height: 44px;
    background-color: #999999;
  }

  .hourglassGlass {
    perspective: 100px;
    position: absolute;
    top: 32px;
    left: 20px;
    width: 10px;
    height: 6px;
    background-color: #999999;
    opacity: 0.5;
  }

  .hourglassGlass:before,
  .hourglassGlass:after {
    content: '';
    display: block;
    position: absolute;
    background-color: #999999;
    left: -17px;
    width: 44px;
    height: 28px;
  }

  .hourglassGlass:before {
    top: -27px;
    border-radius: 0 0 25px 25px;
  }

  .hourglassGlass:after {
    bottom: -27px;
    border-radius: 25px 25px 0 0;
  }

  .hourglassCurves:before,
  .hourglassCurves:after {
    content: '';
    display: block;
    position: absolute;
    top: 32px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background-color: #333;
    animation: hideCurves 2s ease-in 0s infinite;
  }

  .hourglassCurves:before {
    left: 15px;
  }

  .hourglassCurves:after {
    left: 29px;
  }

  @-webkit-keyframes hideCurves {
    0% {
      opacity: 1;
    }

    25% {
      opacity: 0;
    }

    30% {
      opacity: 0;
    }

    40% {
      opacity: 1;
    }

    100% {
      opacity: 1;
    }
  }

  @keyframes hideCurves {
    0% {
      opacity: 1;
    }

    25% {
      opacity: 0;
    }

    30% {
      opacity: 0;
    }

    40% {
      opacity: 1;
    }

    100% {
      opacity: 1;
    }
  }

  .hourglassSandStream:before {
    content: '';
    display: block;
    position: absolute;
    left: 24px;
    width: 3px;
    background-color: white;
    -webkit-animation: sandStream1 2s ease-in 0s infinite;
    animation: sandStream1 2s ease-in 0s infinite;
  }

  .hourglassSandStream:after {
    content: '';
    display: block;
    position: absolute;
    top: 36px;
    left: 19px;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-bottom: 6px solid #fff;
    animation: sandStream2 2s ease-in 0s infinite;
  }

  @-webkit-keyframes sandStream1 {
    0% {
      height: 0;
      top: 35px;
    }

    50% {
      height: 0;
      top: 45px;
    }

    60% {
      height: 35px;
      top: 8px;
    }

    85% {
      height: 35px;
      top: 8px;
    }

    100% {
      height: 0;
      top: 8px;
    }
  }

  @keyframes sandStream1 {
    0% {
      height: 0;
      top: 35px;
    }

    50% {
      height: 0;
      top: 45px;
    }

    60% {
      height: 35px;
      top: 8px;
    }

    85% {
      height: 35px;
      top: 8px;
    }

    100% {
      height: 0;
      top: 8px;
    }
  }

  @-webkit-keyframes sandStream2 {
    0% {
      opacity: 0;
    }

    50% {
      opacity: 0;
    }

    51% {
      opacity: 1;
    }

    90% {
      opacity: 1;
    }

    91% {
      opacity: 0;
    }

    100% {
      opacity: 0;
    }
  }

  @keyframes sandStream2 {
    0% {
      opacity: 0;
    }

    50% {
      opacity: 0;
    }

    51% {
      opacity: 1;
    }

    90% {
      opacity: 1;
    }

    91% {
      opacity: 0;
    }

    100% {
      opacity: 0;
    }
  }

  .hourglassSand:before,
  .hourglassSand:after {
    content: '';
    display: block;
    position: absolute;
    left: 6px;
    background-color: white;
    perspective: 500px;
  }

  .hourglassSand:before {
    top: 8px;
    width: 39px;
    border-radius: 3px 3px 30px 30px;
    animation: sandFillup 2s ease-in 0s infinite;
  }

  .hourglassSand:after {
    border-radius: 30px 30px 3px 3px;
    animation: sandDeplete 2s ease-in 0s infinite;
  }

  @-webkit-keyframes sandFillup {
    0% {
      opacity: 0;
      height: 0;
    }

    60% {
      opacity: 1;
      height: 0;
    }

    100% {
      opacity: 1;
      height: 17px;
    }
  }

  @keyframes sandFillup {
    0% {
      opacity: 0;
      height: 0;
    }

    60% {
      opacity: 1;
      height: 0;
    }

    100% {
      opacity: 1;
      height: 17px;
    }
  }

  @-webkit-keyframes sandDeplete {
    0% {
      opacity: 0;
      top: 45px;
      height: 17px;
      width: 38px;
      left: 6px;
    }

    1% {
      opacity: 1;
      top: 45px;
      height: 17px;
      width: 38px;
      left: 6px;
    }

    24% {
      opacity: 1;
      top: 45px;
      height: 17px;
      width: 38px;
      left: 6px;
    }

    25% {
      opacity: 1;
      top: 41px;
      height: 17px;
      width: 38px;
      left: 6px;
    }

    50% {
      opacity: 1;
      top: 41px;
      height: 17px;
      width: 38px;
      left: 6px;
    }

    90% {
      opacity: 1;
      top: 41px;
      height: 0;
      width: 10px;
      left: 20px;
    }
  }

  @keyframes sandDeplete {
    0% {
      opacity: 0;
      top: 45px;
      height: 17px;
      width: 38px;
      left: 6px;
    }

    1% {
      opacity: 1;
      top: 45px;
      height: 17px;
      width: 38px;
      left: 6px;
    }

    24% {
      opacity: 1;
      top: 45px;
      height: 17px;
      width: 38px;
      left: 6px;
    }

    25% {
      opacity: 1;
      top: 41px;
      height: 17px;
      width: 38px;
      left: 6px;
    }

    50% {
      opacity: 1;
      top: 41px;
      height: 17px;
      width: 38px;
      left: 6px;
    }

    90% {
      opacity: 1;
      top: 41px;
      height: 0;
      width: 10px;
      left: 20px;
    }
  }
`;

interface ProtectedRouteProps {
  children: ReactNode;
  fallback?: ReactNode;
}

export function ProtectedRoute({ children, fallback }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return <LoadingFallback />;
  }

  if (!isAuthenticated) {
    return fallback || <LoginScreen />;
  }

  return <>{children}</>;
}

function LoadingFallback() {
  const [hasTimedOut, setHasTimedOut] = React.useState(false);
  
  // Check if user was previously authenticated for different timeout behavior
  const wasAuthenticated = React.useMemo(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('was-authenticated') === 'true';
    }
    return false;
  }, []);

  React.useEffect(() => {
    // Only set timeout for new users, not returning users
    if (!wasAuthenticated) {
      const timeoutId = setTimeout(() => {
        console.warn('⏰ Loading screen timeout (new user) - showing fallback');
        setHasTimedOut(true);
      }, 5000); // Reduced timeout to 5 seconds for new users

      return () => clearTimeout(timeoutId);
    }
    // No timeout for returning users - they should load quickly
  }, [wasAuthenticated]);

  // For returning users, show a much shorter loading experience
  if (wasAuthenticated && !hasTimedOut) {
    return (
      <>
        <style>{hourglassStyles}</style>
        <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="hourglassBackground">
              <div className="hourglassContainer">
                <div className="hourglassCapTop"></div>
                <div className="hourglassGlassTop"></div>
                <div className="hourglassGlass"></div>
                <div className="hourglassCurves"></div>
                <div className="hourglassSandStream"></div>
                <div className="hourglassSand"></div>
                <div className="hourglassCapBottom"></div>
              </div>
            </div>
            <p className="text-stone text-sm">
              Restoring your session...
            </p>
          </div>
        </div>
      </>
    );
  }

  // For new users or timeout cases
  if (hasTimedOut) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-xl">
              <Brain className="w-8 h-8 text-white" />
            </div>
          </div>
          
          <div className="space-y-3">
            <h2 className="text-xl font-serif font-semibold text-ink">
              {wasAuthenticated ? 'Connection taking longer than expected' : 'Loading took too long'}
            </h2>
            <p className="text-stone text-sm">
              {wasAuthenticated 
                ? 'Your session is being restored. Please refresh to continue.'
                : 'Please refresh the page or try logging in again'
              }
            </p>
          </div>
          
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-cta text-white rounded-lg hover:bg-cta/80 transition-colors"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  // Default loading for new users
  return (
    <>
      <style>{hourglassStyles}</style>
      <div className="min-h-screen bg-gradient-to-br from-hero via-parchment to-accent/10 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="flex justify-center">
            <div className="hourglassBackground">
              <div className="hourglassContainer">
                <div className="hourglassCapTop"></div>
                <div className="hourglassGlassTop"></div>
                <div className="hourglassGlass"></div>
                <div className="hourglassCurves"></div>
                <div className="hourglassSandStream"></div>
                <div className="hourglassSand"></div>
                <div className="hourglassCapBottom"></div>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <Skeleton className="h-8 w-48 mx-auto bg-white/20" />
            <Skeleton className="h-4 w-32 mx-auto bg-white/20" />
          </div>
          
          <div className="space-y-2">
            <p className="text-stone text-sm">
              Loading your stoic journey...
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProtectedRoute;