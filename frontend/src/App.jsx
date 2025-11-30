import { useMemo, useState } from "react";
import { getToken, logout } from "./lib/api";
import { ToastProvider } from "./components/Toaster";
import Auth from "./pages/Auth";
import Providers from "./pages/Providers";

export default function App() {
  const [tick, setTick] = useState(0);
  const hasToken = useMemo(() => !!getToken(), [tick]);

  if (!hasToken) {
    return (
      <ToastProvider>
        <Auth onAuthed={() => setTick((t) => t + 1)} />
      </ToastProvider>
    );
  }

  return (
    <ToastProvider>
      <Providers
        onLogout={() => {
          logout();
          setTick((t) => t + 1);
        }}
      />
    </ToastProvider>
  );
}
