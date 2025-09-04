import { Navigate } from "react-router-dom";
import { useUserPerizinan } from "../context/UserPerizinanContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  tipeKonten?: string;
  action?: "buat" | "edit" | "setujui";
}

export default function ProtectedRoute({ children, tipeKonten, action }: ProtectedRouteProps) {
  const { permissions } = useUserPerizinan();

  // If permissions haven't loaded yet, don't decide
  const permissionsLoaded = Object.keys(permissions).length > 0;

  if (!permissionsLoaded) {
    return <p>Loading permissions...</p>; // or spinner
  }

  const hasPermission =
    tipeKonten && action
      ? permissions[tipeKonten]?.[`boleh_${action}` as const] ?? false
      : true;

  if (!hasPermission) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
