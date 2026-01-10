import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const AppLayout = () => {
  return (
    <div className="min-h-screen flex flex-col relative">
      <Header />
      <main className="flex-grow relative">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;

