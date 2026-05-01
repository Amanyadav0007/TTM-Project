import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from './Button';
import { LayoutDashboard, LogOut } from 'lucide-react';

export const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="glass sticky top-0 z-50 w-full border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-primary text-white p-1.5 rounded-lg">
                <LayoutDashboard size={20} />
              </div>
              <span className="font-bold text-xl tracking-tight text-primary">TeamTasks</span>
            </Link>
            {user && (
              <div className="ml-8 hidden md:flex space-x-4 text-sm font-medium text-gray-500">
                <Link to="/" className="hover:text-primary transition-colors">Dashboard</Link>
                <Link to="/projects" className="hover:text-primary transition-colors">Projects</Link>
              </div>
            )}
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <div className="hidden sm:flex flex-col text-right mr-2">
                  <span className="text-sm font-semibold text-gray-900">{user.username}</span>
                  <span className="text-xs text-gray-500 capitalize">{user.role}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Log out">
                  <LogOut size={20} />
                </Button>
              </>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost">Login</Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
