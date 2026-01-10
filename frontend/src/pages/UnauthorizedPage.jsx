import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Button from '../components/ui/Button';

const UnauthorizedPage = () => {
  const { user, redirectByRole } = useAuth();

  const handleGoToDashboard = () => {
    if (user) {
      redirectByRole(user.role);
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center max-w-md mx-auto px-4">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">403</h1>
        <h2 className="text-2xl font-semibold text-gray-700 mb-4">
          Access Denied
        </h2>
        <p className="text-gray-600 mb-8">
          You don't have permission to access this page.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button onClick={handleGoToDashboard}>
            Go to My Dashboard
          </Button>
          <Link to="/events">
            <Button variant="outline">
              Browse Events
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default UnauthorizedPage;












