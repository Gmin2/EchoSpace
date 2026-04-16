import { Link, useLocation } from "react-router-dom";
import { cn } from "../lib/utils";

export const Navbar = () => {
  const location = useLocation();

  // Hide navbar in workspace
  if (location.pathname.startsWith("/workspace")) return null;

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-6 bg-black border border-white/10 rounded-full px-6 py-3 text-primary shadow-2xl">
      <Link to="/" className="font-bold tracking-tight pr-4 border-r border-white/10 hover:opacity-80 transition-opacity">
        EchoSpace
      </Link>
      <div className="flex items-center gap-6 text-sm font-medium">
        <Link
          to="/"
          className={cn(
            "transition-opacity hover:opacity-100",
            location.pathname === "/" ? "opacity-100" : "opacity-60"
          )}
        >
          Home
        </Link>
        <Link
          to="/spaces"
          className={cn(
            "transition-opacity hover:opacity-100",
            location.pathname === "/spaces" ? "opacity-100" : "opacity-60"
          )}
        >
          Explore
        </Link>
        <Link
          to="/create"
          className={cn(
            "transition-opacity hover:opacity-100",
            location.pathname === "/create" ? "opacity-100" : "opacity-60"
          )}
        >
          Create
        </Link>
      </div>
    </nav>
  );
};
