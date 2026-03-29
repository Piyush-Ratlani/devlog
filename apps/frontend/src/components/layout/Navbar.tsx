import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const navLinks = [
  { lable: "Dashboard", path: "/dashboard" },
  { lable: "Entries", path: "/entries" },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <nav className="border-b border-gray-800 bg-gray-950 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/dashboard"
          className="text-brand-500 font-bold text-lg tracking-tight"
        >
          {`<DevLog />`}
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-1">
          {navLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${location.pathname === link.path ? "bg-gray-800 text-gray-100" : "text-gray-400 hover:text-gray-100 hover:bg-gray-800/50"}`}
            >
              {link.lable}
            </Link>
          ))}
        </div>

        {/* User + Logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-gray-200 text-sm font-medium">
              {user?.name}
            </span>
            <span className="text-gray-500 text-xs">{user?.email}</span>
          </div>
          <button
            onClick={handleLogout}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
