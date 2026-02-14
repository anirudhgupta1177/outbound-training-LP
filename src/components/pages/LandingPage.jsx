import { Suspense, lazy, useEffect } from 'react';
import Navbar from '../sections/Navbar';
import Hero from '../sections/Hero';
import MobileCTA from '../ui/MobileCTA';

// #region agent log
const debugLog = (location, message, data) => {
  fetch('http://127.0.0.1:7242/ingest/a3ca0b1c-20f2-45d3-8836-7eac2fdb4cb3',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location,message,data,timestamp:Date.now(),runId:'video-debug',hypothesisId:'E-G'})}).catch(()=>{});
};
// #endregion

// Lazy load below-the-fold sections for faster initial render
const BeforeAfter = lazy(() => import('../sections/BeforeAfter'));
const Testimonials = lazy(() => import('../sections/Testimonials'));
const SystemFunnel = lazy(() => import('../sections/SystemFunnel'));
const CompleteSystem = lazy(() => import('../sections/CompleteSystem'));
const DashboardShowcase = lazy(() => import('../sections/DashboardShowcase'));
const Personas = lazy(() => import('../sections/Personas'));
const Instructor = lazy(() => import('../sections/Instructor'));
const ValueStack = lazy(() => import('../sections/ValueStack'));
const FAQ = lazy(() => import('../sections/FAQ'));
const Footer = lazy(() => import('../sections/Footer'));

// Minimal loading placeholder for sections
const SectionLoader = () => (
  <div className="py-12 md:py-20 flex items-center justify-center">
    <div className="w-8 h-8 border-3 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
  </div>
);

export default function LandingPage() {
  // #region agent log - Performance tracking
  useEffect(() => {
    const startTime = performance.now();
    debugLog('LandingPage.jsx', 'Page mounted', { 
      hypothesisId: 'E-G',
      userAgent: navigator.userAgent,
      isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent),
      isSafari: /^((?!chrome|android).)*safari/i.test(navigator.userAgent),
      screenWidth: window.innerWidth,
      screenHeight: window.innerHeight,
      devicePixelRatio: window.devicePixelRatio
    });
    
    // Log after paint
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        const paintTime = performance.now() - startTime;
        debugLog('LandingPage.jsx', 'Initial paint complete', { 
          paintTimeMs: Math.round(paintTime),
          hypothesisId: 'G' 
        });
      });
    });
    
    // Log performance metrics if available
    if (window.performance && performance.getEntriesByType) {
      setTimeout(() => {
        const navTiming = performance.getEntriesByType('navigation')[0];
        const paintTiming = performance.getEntriesByType('paint');
        debugLog('LandingPage.jsx', 'Performance metrics', {
          domContentLoaded: navTiming?.domContentLoadedEventEnd,
          loadComplete: navTiming?.loadEventEnd,
          firstPaint: paintTiming?.find(p => p.name === 'first-paint')?.startTime,
          firstContentfulPaint: paintTiming?.find(p => p.name === 'first-contentful-paint')?.startTime,
          hypothesisId: 'G'
        });
      }, 3000);
    }
  }, []);
  // #endregion
  
  return (
    <div className="min-h-screen bg-dark">
      {/* Critical above-the-fold content - rendered immediately */}
      <Navbar />
      
      <main>
        <Hero />
        
        {/* Section divider */}
        <div className="section-divider" />
        
        {/* Below-the-fold content - lazy loaded */}
        <Suspense fallback={<SectionLoader />}>
          <BeforeAfter />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <div className="hidden md:block">
            <SystemFunnel />
          </div>
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Instructor />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <CompleteSystem />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <div className="hidden md:block">
            <DashboardShowcase />
          </div>
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <ValueStack />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <Personas />
        </Suspense>
        
        <Suspense fallback={<SectionLoader />}>
          <FAQ />
        </Suspense>
      </main>
      
      <Suspense fallback={null}>
        <Footer />
      </Suspense>
      
      {/* Mobile sticky CTA */}
      <MobileCTA />
    </div>
  );
}

