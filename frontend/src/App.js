// src/App.js
// 🏠 Componente principal que conecta frontend com backend

import React, { useState, useEffect } from "react";
import "./App.css";

// 📊 Importar componentes que criamos
import SalesTable from "./components/SalesTable";
import StatsCards from "./components/StatsCards";
import ApiService from "./services/api";

// 🎨 Importar ícones
import {
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Server,
  Activity,
} from "lucide-react";

// 🎨 ESTILOS GLOBAIS
const styles = {
  app: {
    minHeight: "100vh",
    backgroundColor: "#f8f9fa",
    fontFamily:
      '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  header: {
    background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    color: "white",
    padding: "40px 0",
    textAlign: "center",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
  },
  headerTitle: {
    fontSize: "2.5rem",
    fontWeight: "bold",
    margin: "0 0 8px 0",
    textShadow: "0 2px 4px rgba(0,0,0,0.3)",
  },
  headerSubtitle: {
    fontSize: "1.2rem",
    opacity: 0.9,
    margin: "0",
  },
  container: {
    maxWidth: "1200px",
    margin: "0 auto",
    padding: "0 20px",
  },
  content: {
    padding: "40px 20px",
  },
  toolbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "white",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
    marginBottom: "30px",
  },
  toolbarLeft: {
    display: "flex",
    alignItems: "center",
    gap: "15px",
  },
  toolbarRight: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  button: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    borderRadius: "8px",
    border: "none",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s",
    fontSize: "0.9rem",
  },
  primaryButton: {
    backgroundColor: "#007bff",
    color: "white",
  },
  primaryButtonHover: {
    backgroundColor: "#0056b3",
  },
  statusIndicator: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "20px",
    fontSize: "0.85rem",
    fontWeight: "500",
  },
  statusOnline: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  statusOffline: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
  },
  statusLoading: {
    backgroundColor: "#fff3cd",
    color: "#856404",
  },
  errorBanner: {
    backgroundColor: "#f8d7da",
    color: "#721c24",
    padding: "15px",
    borderRadius: "8px",
    marginBottom: "20px",
    border: "1px solid #f5c6cb",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
};

function App() {
  // 🏗️ ESTADOS DO COMPONENTE
  const [salesData, setSalesData] = useState([]); // Dados das vendas/devoluções
  const [statsData, setStatsData] = useState(null); // Estatísticas
  const [loading, setLoading] = useState(true); // Estado de carregamento
  const [error, setError] = useState(null); // Erros
  const [backendStatus, setBackendStatus] = useState("checking"); // Status do backend
  const [lastUpdate, setLastUpdate] = useState(null); // Timestamp da última atualização

  // 🔄 FUNÇÃO PARA CARREGAR DADOS DO BACKEND
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log("🔄 Iniciando carregamento dos dados...");

      // 1️⃣ BUSCAR VENDAS E DEVOLUÇÕES (dados principais)
      console.log("📊 Buscando vendas e devoluções...");
      const salesResponse = await ApiService.getSalesRefunds();

      if (!salesResponse.success) {
        throw new Error(
          salesResponse.error || "Erro ao buscar vendas e devoluções"
        );
      }

      // 2️⃣ BUSCAR ESTATÍSTICAS
      console.log("📈 Buscando estatísticas...");
      const statsResponse = await ApiService.getStats();

      if (!statsResponse.success) {
        console.warn("⚠️ Erro ao buscar estatísticas:", statsResponse.error);
        // Continua mesmo se estatísticas falharem
      }

      // 3️⃣ ATUALIZAR ESTADOS
      setSalesData(salesResponse.data || []);
      setStatsData(statsResponse.data || null);
      setBackendStatus("online");
      setLastUpdate(new Date());

      console.log("✅ Dados carregados com sucesso!");
      console.log("📊 Vendas encontradas:", salesResponse.data?.length || 0);
      console.log("📈 Estatísticas:", statsResponse.data);
    } catch (err) {
      console.error("❌ Erro ao carregar dados:", err);
      setError(err.message);
      setBackendStatus("offline");
      setSalesData([]);
      setStatsData(null);
    } finally {
      setLoading(false);
    }
  };

  // 🏥 FUNÇÃO PARA VERIFICAR STATUS DO BACKEND
  const checkBackendHealth = async () => {
    try {
      const response = await ApiService.checkHealth();
      setBackendStatus(response.success ? "online" : "offline");
    } catch (err) {
      setBackendStatus("offline");
    }
  };

  // 🔄 FUNÇÃO PARA ATUALIZAR DADOS (botão refresh)
  const handleRefresh = () => {
    console.log("🔄 Usuário solicitou atualização dos dados");
    fetchData();
  };

  // ⚡ EFEITO PARA CARREGAR DADOS NA INICIALIZAÇÃO
  useEffect(() => {
    console.log("🚀 App inicializando...");

    // Carregar dados imediatamente
    fetchData();

    // Verificar status do backend
    checkBackendHealth();

    // Configurar verificação periódica do backend (a cada 30 segundos)
    const healthCheckInterval = setInterval(checkBackendHealth, 30000);

    // Cleanup na desmontagem do componente
    return () => {
      clearInterval(healthCheckInterval);
    };
  }, []); // Array vazio = executa apenas na montagem

  // 🎨 RENDERIZAR STATUS DO BACKEND
  const renderBackendStatus = () => {
    const statusConfig = {
      online: {
        icon: <CheckCircle size={16} />,
        text: "Backend Online",
        style: styles.statusOnline,
      },
      offline: {
        icon: <AlertTriangle size={16} />,
        text: "Backend Offline",
        style: styles.statusOffline,
      },
      checking: {
        icon: <Activity size={16} />,
        text: "Verificando...",
        style: styles.statusLoading,
      },
    };

    const config = statusConfig[backendStatus] || statusConfig.checking;

    return (
      <div style={{ ...styles.statusIndicator, ...config.style }}>
        {config.icon}
        {config.text}
      </div>
    );
  };

  // 🎯 RENDERIZAÇÃO PRINCIPAL
  return (
    <div style={styles.app}>
      {/* CABEÇALHO */}
      <header style={styles.header}>
        <div style={styles.container}>
          <h1 style={styles.headerTitle}>DajuLabs</h1>
          <p style={styles.headerSubtitle}>
            Sistema de Análise de Vendas e Devoluções
          </p>
        </div>
      </header>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={styles.content}>
        <div style={styles.container}>
          {/* BARRA DE FERRAMENTAS */}
          <div style={styles.toolbar}>
            <div style={styles.toolbarLeft}>
              <Server size={20} color="#666" />
              <span style={{ color: "#666", fontWeight: "500" }}>
                Dados do CSV: {salesData.length} pares encontrados
              </span>
            </div>

            <div style={styles.toolbarRight}>
              {lastUpdate && (
                <span style={{ color: "#666", fontSize: "0.85rem" }}>
                  Última atualização: {lastUpdate.toLocaleTimeString("pt-BR")}
                </span>
              )}

              {renderBackendStatus()}

              <button
                style={{
                  ...styles.button,
                  ...styles.primaryButton,
                }}
                onClick={handleRefresh}
                disabled={loading}
                onMouseEnter={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor =
                      styles.primaryButtonHover.backgroundColor;
                  }
                }}
                onMouseLeave={(e) => {
                  if (!loading) {
                    e.target.style.backgroundColor =
                      styles.primaryButton.backgroundColor;
                  }
                }}
              >
                <RefreshCw
                  size={16}
                  style={{
                    animation: loading ? "spin 1s linear infinite" : "none",
                  }}
                />
                {loading ? "Atualizando..." : "Atualizar"}
              </button>
            </div>
          </div>

          {/* BANNER DE ERRO */}
          {error && (
            <div style={styles.errorBanner}>
              <AlertTriangle size={20} />
              <div>
                <strong>Erro de Conexão:</strong> {error}
                <br />
                <small>
                  Verifique se o backend está rodando em localhost:3001
                </small>
              </div>
            </div>
          )}

          {/* CARDS DE ESTATÍSTICAS */}
          <StatsCards
            stats={statsData}
            loading={loading}
            error={
              statsData === null && !loading
                ? "Estatísticas indisponíveis"
                : null
            }
          />

          {/* TABELA DE DADOS */}
          <SalesTable data={salesData} loading={loading} error={error} />
        </div>
      </main>

      {/* CSS PARA ANIMAÇÃO DE SPIN */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

// 📝 EXPLICAÇÃO DO QUE CADA PARTE FAZ:
//
// 1. ESTADOS (useState):
//    - salesData: Array com pares venda-devolução do seu CSV
//    - statsData: Objeto com estatísticas (total vendas, devoluções, etc.)
//    - loading: Boolean para mostrar spinners
//    - error: String com mensagens de erro
//    - backendStatus: Status da conexão com backend
//    - lastUpdate: Timestamp da última atualização
//
// 2. FUNÇÃO fetchData():
//    - Chama ApiService.getSalesRefunds() para pegar dados do CSV
//    - Chama ApiService.getStats() para pegar estatísticas
//    - Atualiza todos os estados baseado nas respostas
//    - Trata erros e logs para debug
//
// 3. useEffect():
//    - Executa fetchData() quando o componente monta
//    - Configura verificação de saúde do backend a cada 30s
//    - Faz cleanup dos intervalos quando componente desmonta
//
// 4. COMPONENTES FILHOS:
//    - StatsCards: Recebe statsData e mostra cards coloridos
//    - SalesTable: Recebe salesData e mostra tabela com pares
//    - Ambos recebem loading/error para estados condicionais
//
// 5. INTERFACE:
//    - Cabeçalho com gradiente
//    - Toolbar com status e botão atualizar
//    - Banner de erro (se houver)
//    - Cards de estatísticas
//    - Tabela de dados
//
// 6. INTERATIVIDADE:
//    - Botão "Atualizar" chama fetchData()
//    - Status do backend em tempo real
//    - Efeitos hover nos botões
//    - Animação de loading
//
// 💡 ESTE É O "CÉREBRO" DO APP:
// - Gerencia todos os dados
// - Coordena comunicação com backend
// - Distribui dados para componentes filhos
// - Trata erros globalmente

export default App;
