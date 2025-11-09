import { useAuth } from '../hooks/useAuth';
import { AdminApp } from '../AdminApp';
import { UserApp } from '../UserApp';
import { Login } from '../components/auth/Login';

export const AppRouter = () => {
  const { user, login, logout } = useAuth();

  if (!user) {
    return <Login onLogin={login} />;
  }

  // NOTE: In a real app, the props passed here would be more complex,
  // involving data fetching, state management (e.g., Redux/Zustand), etc.
  // For this refactor, we are focusing on the routing structure.

  if (user.role === 'admin') {
    return <AdminApp onLogout={logout} />;
  }

  if (user.role === 'user') {
    // The original UserApp had a more complex props structure.
    // We are simplifying it here for the sake of the routing example.
    // A real implementation would require a more robust state management solution.
    return <UserApp user={user} onLogout={logout} />;
  }

  // Fallback in case of an unknown role
  return <Login onLogin={login} />;
};
