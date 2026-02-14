import { Suspense, lazy } from 'react';
import Navbar from '../sections/Navbar';
import Hero from '../sections/Hero';
import MobileCTA from '../ui/MobileCTA';

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

