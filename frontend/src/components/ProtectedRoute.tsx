import { ReactNode, useEffect } from "react";
import { useLocation } from "wouter";

interface ProtectedRouteProps {
  children: ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const [_, setLocation] = useLocation();
  const token = localStorage.getItem("tabib_token");

  useEffect(() => {
    if (!token) {
      setLocation("/phone");
    }
  }, [token, setLocation]);

  if (!token) return null;

  return <>{children}</>;
}
