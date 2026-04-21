import { Toaster } from "@/components/ui/sonner";
import { RouterProvider } from "@tanstack/react-router";
import { ErrorBoundary } from "./components/ui/ErrorBoundary";
import { AuthProvider } from "./lib/auth";
import { router } from "./routes";

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <RouterProvider router={router} />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </ErrorBoundary>
  );
}
