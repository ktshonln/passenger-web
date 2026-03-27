import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useUser } from "../hooks/useUser";
import { FiLoader } from "react-icons/fi";

const ProtectedRoute = () => {
  const { data: user, isPending, isError } = useUser();
  const location = useLocation();

  if (isPending) {
    return (
      <div className="min-h-[60vh] flex justify-center items-center">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <FiLoader className="animate-spin text-brand" size={40} />
          <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">Authenticating...</p>
        </div>
      </div>
    );
  }

  if (isError || !user) {
    // Redirect them to the /login page, but save the current location they were trying to go to
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
