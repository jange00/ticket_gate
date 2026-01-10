import { motion } from 'framer-motion';
import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AuthLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-white relative overflow-hidden">
      {/* Header - Sticky */}
      <Header />
      
      {/* Main content area */}
      <main className="flex-grow flex items-center justify-center p-4 relative">
        {/* Subtle grid pattern background */}
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{
          backgroundImage: 'linear-gradient(rgba(0,0,0,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.1) 1px, transparent 1px)',
          backgroundSize: '50px 50px'
        }} />

        {/* Subtle gradient overlay */}
        <div className="absolute inset-0 bg-orange-50/20 pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto relative z-10">
          {/* Page content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <Outlet />
          </motion.div>
        </div>
      </main>
      
      {/* Footer - Sticky */}
      <Footer />
    </div>
  );
};

export default AuthLayout;
