import { Link } from 'react-router-dom';
import Logo from '../ui/Logo';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="mb-4">
              <Logo size={36} animated={false} showText={true} textColor="white" />
            </div>
            <p className="text-gray-400 text-sm">
              Your trusted platform for event management and ticketing.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Events</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/events" className="hover:text-white transition-colors">Browse Events</Link></li>
              <li><Link to="/events/create" className="hover:text-white transition-colors">Create Event</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Account</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link to="/dashboard" className="hover:text-white transition-colors">Dashboard</Link></li>
              <li><Link to="/dashboard/tickets" className="hover:text-white transition-colors">My Tickets</Link></li>
              <li><Link to="/dashboard/settings" className="hover:text-white transition-colors">Settings</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Contact Us</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>&copy; {new Date().getFullYear()} TicketGate. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;

