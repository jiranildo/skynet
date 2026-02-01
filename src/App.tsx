import { BrowserRouter, useLocation } from "react-router-dom";
import { Suspense } from 'react';
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import FloatingMenu from "./components/FloatingMenu";
import BetaLabel from "./components/BetaLabel";
import { useAuth } from "./context/AuthContext";

function AppContent() {
  const { user } = useAuth();
  const location = useLocation();
  const isAuthPage = ['/login', '/signup', '/admin/login'].includes(location.pathname);
  const showFloatingElements = user && !isAuthPage;

  return (
    <>
      <Suspense fallback={
        <div className="flex h-screen w-screen items-center justify-center bg-gray-50">
          <div className="text-center">
            <i className="ri-loader-4-line text-4xl text-indigo-600 animate-spin mb-4 block"></i>
            <p className="text-gray-500 font-medium">Carregando...</p>
          </div>
        </div>
      }>
        <AppRoutes />
      </Suspense>
      {showFloatingElements && (
        <FloatingMenu />
      )}
      <BetaLabel />
    </>
  );
}

function App() {
  return (
    <I18nextProvider i18n={i18n}>
      <BrowserRouter basename={__BASE_PATH__}>
        <AppContent />
      </BrowserRouter>
    </I18nextProvider>
  );
}

export default App;
