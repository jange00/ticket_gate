import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  HeroSection,
  StatsSection,
  FeaturesSection,
  HowItWorksSection,
  FeaturedEventsSection,
  TestimonialsSection,
  AboutSection,
  BenefitsSection,
  PricingSection,
  FAQSection,
  IntegrationsSection,
  CTASection,
} from '../components/landing';
import SplashScreen from '../components/landing/SplashScreen';

const HomePage = () => {
  const [showSplash, setShowSplash] = useState(false);
  const [showContent, setShowContent] = useState(true);

  useEffect(() => {
    // Check if this is the first visit or a page refresh
    const hasSeenSplash = sessionStorage.getItem('hasSeenSplash');
    const navEntry = performance.getEntriesByType('navigation')[0];
    const isPageRefresh = navEntry && navEntry.type === 'reload';
    
    // Show splash only on first visit or page refresh (not when navigating back)
    if (!hasSeenSplash || isPageRefresh) {
      setShowSplash(true);
      setShowContent(false);
      // Mark that splash has been shown in this session
      sessionStorage.setItem('hasSeenSplash', 'true');
    } else {
      // If navigating back (not refresh), show content immediately
      setShowContent(true);
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setShowContent(true);
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      {showContent && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="min-h-screen relative"
        >
          <HeroSection />
          <StatsSection />
          <FeaturesSection />
          <HowItWorksSection />
          <FeaturedEventsSection />
          <TestimonialsSection />
          <AboutSection />
          <BenefitsSection />
          <PricingSection />
          <FAQSection />
          <IntegrationsSection />
          <CTASection />
        </motion.div>
      )}
    </>
  );
};

export default HomePage;
