import { useUserSession } from "../context/UserSessionContext";
import TakDitemukan from "../../routes/TakDitemukan";

interface RoleRouteProps {
  children: React.ReactNode;
  allowedRoles: ("admin" | "moderator" | "user")[];
  notFoundMode?: boolean;
}

export default function RoleRoute({ children, allowedRoles, notFoundMode }: RoleRouteProps) {
  const { user, loading } = useUserSession();

  if (loading) {
    return <p>Loading user...</p>; // or a spinner
  }

  const role = user?.role as "admin" | "moderator" | "user" | undefined;
  const hasAccess = role !== undefined && allowedRoles.includes(role);

  if (!hasAccess) {
    return notFoundMode ? <TakDitemukan /> : <p>Access denied</p>;
  }

  return <>{children}</>;
}