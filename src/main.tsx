import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import "./styles/globals.css";
import App from './app/App.tsx'
import "@fontsource/onest/400.css";
import "@fontsource/onest/500.css";
import "@fontsource/onest/600.css";
import "@fontsource/onest/700.css";

const start = async () => {
  // Dev-only mock backend (?mock / ?mock=off), see src/mock/devMock.ts
  if (import.meta.env.DEV) {
    const { setupDevMock } = await import("./mock/devMock");
    setupDevMock();
  }

  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
};

start();
