import Card from '../../components/ui/Card';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import Button from '../../components/ui/Button';

const DashboardPage = () => {
  const { user } = useAuth();
  
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Welcome back, {user?.firstName}!
        </h1>
        <p className="text-gray-600">Here's an overview of your account</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Tickets</h3>
          <p className="text-3xl font-bold text-orange-600">0</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Upcoming Events</h3>
          <p className="text-3xl font-bold text-orange-600">0</p>
        </Card>
        <Card className="p-6">
          <h3 className="text-sm font-medium text-gray-500 mb-2">Total Spent</h3>
          <p className="text-3xl font-bold text-orange-600">NPR 0</p>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

