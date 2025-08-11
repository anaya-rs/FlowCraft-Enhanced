import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { Settings, FileText, BarChart3, Cog } from "lucide-react";

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="h-full min-h-screen w-56 bg-glass-dark backdrop-blur-xl shadow-lg flex flex-col gap-2 p-4 border-r border-white/10">
      <NavLink
        to="/dashboard"
        className={({ isActive }) =>
          `flex items-center space-x-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isActive ? "bg-gradient-orange text-white shadow" : "text-gray-300 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        <BarChart3 className="w-5 h-5" />
        <span>Dashboard</span>
      </NavLink>
      <NavLink
        to="/documents"
        className={({ isActive }) =>
          `flex items-center space-x-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isActive ? "bg-gradient-orange text-white shadow" : "text-gray-300 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        <FileText className="w-5 h-5" />
        <span>Documents</span>
      </NavLink>
      <NavLink
        to="/configuration"
        className={({ isActive }) =>
          `flex items-center space-x-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isActive ? "bg-gradient-orange text-white shadow" : "text-gray-300 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        <Cog className="w-5 h-5" />
        <span>Configuration</span>
      </NavLink>
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          `flex items-center space-x-3 px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
            isActive ? "bg-gradient-orange text-white shadow" : "text-gray-300 hover:bg-white/10 hover:text-white"
          }`
        }
      >
        <Settings className="w-5 h-5" />
        <span>Settings</span>
      </NavLink>
      <button
        onClick={handleLogout}
        className="mt-auto px-4 py-2 rounded-lg bg-red-600/80 text-white font-medium hover:bg-red-700/90 transition"
      >
        Logout
      </button>
    </nav>
  );
};

export default Sidebar;