import { BrowserRouter, useLocation } from "react-router-dom";
import { Suspense } from 'react';
import { AppRoutes } from "./router";
import { I18nextProvider } from "react-i18next";
import i18n from "./i18n";
import MainLayout from "./components/layout/MainLayout";

function AppContent() {
  return (
    <MainLayout>
      <AppRoutes />
    </MainLayout>
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
