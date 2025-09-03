import axios from "axios";

const API_BASE_URL = "http://localhost:3001";

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`Fazendo requisição para: ${config.url}`);
    return config;
  },
  (error) => {
    console.error("Erro na requisição:", error);
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `✅ Resposta recebida de: ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    console.error(
      "❌ Erro na resposta:",
      error.response?.data || error.message
    );
    return Promise.reject(error);
  }
);

class ApiService {
  static async getSalesRefunds() {
    try {
      const response = await apiClient.get("/api/sales-refunds");

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
          count: response.data.count,
        };
      } else {
        throw new Error("Resposta da API em formato inválido");
      }
    } catch (error) {
      console.error("Erro ao buscar vendas e devoluções:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
        data: [],
      };
    }
  }

  static async getStats() {
    try {
      const response = await apiClient.get("/api/stats");

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        throw new Error("Erro ao buscar estatísticas");
      }
    } catch (error) {
      console.error("Erro ao buscar estatísticas:", error);
      return {
        success: false,
        error: error.message,
        data: {
          total_transactions: 0,
          total_sales: 0,
          total_refunds: 0,
          matched_pairs: 0,
          unmatched_transactions: 0,
        },
      };
    }
  }

  static async checkHealth() {
    try {
      const response = await apiClient.get("/api/health");
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error("Backend não está respondendo:", error);
      return {
        success: false,
        error: "Backend offline ou inacessível",
      };
    }
  }
  static async reloadCSV(csvFilePath) {
    try {
      const response = await apiClient.post("/api/load-csv", {
        csvFilePath: csvFilePath,
      });

      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      console.error("Erro ao recarregar CSV:", error);
      return {
        success: false,
        error: error.response?.data?.error || error.message,
      };
    }
  }
}

export default ApiService;
