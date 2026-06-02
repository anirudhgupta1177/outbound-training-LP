import { Suspense, lazy } from 'react';
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
const CursorGlow = lazy(() => import('../ui/CursorGlow'));
const LiveActivityToast = lazy(() => import('../ui/LiveActivityToast'));

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
      <main>
        <Hero />

        {/* Trusted By Strip */}
        <div className="py-6 md:py-8 border-y border-white/5">
          <div className="max-w-5xl mx-auto px-4">
            <p className="text-center text-xs text-text-muted uppercase tracking-widest mb-4">Trusted by teams using</p>
            <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12 opacity-40 grayscale">
              {['Instantly', 'Clay', 'Make', 'HeyReach', 'Smartlead'].map(name => (
                <span key={name} className="font-display font-bold text-lg md:text-xl text-white select-none">{name}</span>
              ))}
            </div>
          </div>
        </div>

        {/* Section divider */}
        <div className="relative">
          <div className="section-divider" />
          <div className="h-px bg-gradient-to-r from-transparent via-gold/30 to-transparent" />
        </div>

        {/* Below-the-fold content - lazy loaded */}
        <div className="text-center pt-8 md:pt-12">
          <span className="text-xs uppercase tracking-[0.2em] text-gold/60 font-medium">01 — Results</span>
          <div className="w-8 h-px bg-gold/30 mx-auto mt-2" />
        </div>
        <Suspense fallback={<SectionLoader />}>
          <Testimonials />
        </Suspense>

        <Suspense fallback={<SectionLoader />}>
          <BeforeAfter />
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

      {/* Mobile sticky CTA */}
      <MobileCTA />

      <Suspense fallback={null}>
        <CursorGlow />
        <LiveActivityToast />
      </Suspense>
    </div>
  );
}

