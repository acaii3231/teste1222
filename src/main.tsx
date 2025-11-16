import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// Tratamento de erros globais
window.addEventListener('error', (event) => {
  console.error('Erro global capturado:', event.error);
});

window.addEventListener('unhandledrejection', (event) => {
  console.error('Promise rejeitada não tratada:', event.reason);
});

const rootElement = document.getElementById("root");

if (!rootElement) {
  throw new Error("Elemento root não encontrado!");
}

try {
  createRoot(rootElement).render(<App />);
} catch (error) {
  console.error('Erro ao renderizar aplicação:', error);
  rootElement.innerHTML = `
    <div style="padding: 20px; font-family: sans-serif;">
      <h1>Erro ao carregar aplicação</h1>
      <p>Verifique o console do navegador para mais detalhes.</p>
      <p style="color: red;">${error instanceof Error ? error.message : 'Erro desconhecido'}</p>
    </div>
  `;
}
