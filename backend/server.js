const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");

class ITransactionRepository {
  findAll() {
    throw new Error("Method must be implemented");
  }
  save() {
    throw new Error("Method must be implemented");
  }
  clear() {
    throw new Error("Method must be implemented");
  }
}

class Transaction {
  constructor(cdProduto, cdEmpresa, inEstorno, nrDocOrigem, value = null) {
    this.cdProduto = parseInt(cdProduto);
    this.cdEmpresa = parseInt(cdEmpresa);
    this.inEstorno = inEstorno; 
    this.nrDocOrigem = nrDocOrigem.toString();
    this.value = value || Math.floor(Math.random() * 100) + 10;
  }

  isSale() {
    return this.inEstorno === "F";
  }

  isRefund() {
    return this.inEstorno === "T";
  }

  getMatchKey() {
    return `${this.cdProduto}-${this.cdEmpresa}-${this.nrDocOrigem}`;
  }

  toJSON() {
    return {
      product: this.cdProduto,
      company: this.cdEmpresa,
      is_reversal: this.isRefund(),
      value: this.value,
    };
  }
}

class InMemoryTransactionRepository extends ITransactionRepository {
  constructor() {
    super();
    this.transactions = new Map(); 
    this.counter = 0;
  }

  save(transaction) {
    const id = ++this.counter;
    this.transactions.set(id, transaction);
    return id;
  }

  findAll() {
    return Array.from(this.transactions.values());
  }

  clear() {
    this.transactions.clear();
    this.counter = 0;
  }

  getSize() {
    return this.transactions.size;
  }
}

class CSVProcessorService {
  static parseCSV(csvContent) {
    const lines = csvContent.trim().split("\n");
    const transactions = [];

    const startIndex = lines[0].toLowerCase().includes("cd_produto") ? 1 : 0;

    for (let i = startIndex; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line) {
        try {
          const columns = line.split(",").map((col) => col.trim());
          if (columns.length >= 4) {
            const [cdProduto, cdEmpresa, inEstorno, nrDocOrigem] = columns;
            transactions.push(
              new Transaction(cdProduto, cdEmpresa, inEstorno, nrDocOrigem)
            );
          }
        } catch (error) {
          console.warn(`Erro ao processar linha ${i + 1}: ${line}`);
        }
      }
    }

    return transactions;
  }

  static loadFromFile(filePath) {
    try {
      const csvContent = fs.readFileSync(filePath, "utf8");
      return this.parseCSV(csvContent);
    } catch (error) {
      throw new Error(`Erro ao carregar CSV: ${error.message}`);
    }
  }
}

class TransactionMatchingService {
  constructor(repository) {
    this.repository = repository;
  }

  findMatchedPairs() {
    const transactions = this.repository.findAll();

    const salesMap = new Map();
    const refundsMap = new Map();

    transactions.forEach((transaction) => {
      const key = transaction.getMatchKey();

      if (transaction.isSale()) {
        if (!salesMap.has(key)) {
          salesMap.set(key, []);
        }
        salesMap.get(key).push(transaction);
      } else {
        if (!refundsMap.has(key)) {
          refundsMap.set(key, []);
        }
        refundsMap.get(key).push(transaction);
      }
    });

    const matchedPairs = [];

    salesMap.forEach((sales, key) => {
      const refunds = refundsMap.get(key) || [];

      for (let i = 0; i < Math.min(sales.length, refunds.length); i++) {
        const sale = sales[i];
        const refund = refunds[i];

        matchedPairs.push({
          invoice: sale.nrDocOrigem,
          transaction: {
            sale: sale.toJSON(),
            refund: refund.toJSON(),
          },
        });
      }
    });

    return matchedPairs;
  }

  getUnmatchedTransactions() {
    const transactions = this.repository.findAll();
    const matched = new Set();
    const pairs = this.findMatchedPairs();

    pairs.forEach((pair) => {
      const key = `${pair.transaction.sale.product}-${pair.transaction.sale.company}-${pair.invoice}`;
      matched.add(key + "-F");
      matched.add(key + "-T");
    });

    return transactions.filter((transaction) => {
      const key = transaction.getMatchKey() + "-" + transaction.inEstorno;
      return !matched.has(key);
    });
  }
}

class SalesRefundApplication {
  constructor() {
    this.repository = new InMemoryTransactionRepository();
    this.matchingService = new TransactionMatchingService(this.repository);
    this.csvProcessor = CSVProcessorService;

    this.initializeWithSampleData();
  }

  initializeWithSampleData() {
    const sampleTransactions = [
      new Transaction(200, 3, "F", "33333", 40),
      new Transaction(200, 3, "T", "33333", 40),

      new Transaction(300, 2, "F", "44444", 20),
      new Transaction(300, 2, "T", "44444", 20), 
    ];

    sampleTransactions.forEach((transaction) => {
      this.repository.save(transaction);
    });

    console.log(
      `Base de dados inicializada com ${this.repository.getSize()} transações`
    );
  }

  loadFromCSVFile(csvFilePath) {
    try {
      this.repository.clear();
      const transactions = this.csvProcessor.loadFromFile(csvFilePath);

      transactions.forEach((transaction) => {
        this.repository.save(transaction);
      });

      console.log(
        `✅ Carregadas ${transactions.length} transações do CSV: ${csvFilePath}`
      );
      return {
        success: true,
        count: transactions.length,
        message: `${transactions.length} transações carregadas com sucesso`,
      };
    } catch (error) {
      console.error("❌ Erro ao carregar CSV:", error.message);
      throw error;
    }
  }

  getMatchedPairs() {
    return this.matchingService.findMatchedPairs();
  }

  getStats() {
    const all = this.repository.findAll();
    const matched = this.getMatchedPairs();
    const unmatched = this.matchingService.getUnmatchedTransactions();

    return {
      total_transactions: all.length,
      total_sales: all.filter((t) => t.isSale()).length,
      total_refunds: all.filter((t) => t.isRefund()).length,
      matched_pairs: matched.length,
      unmatched_transactions: unmatched.length,
    };
  }
}

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const salesRefundApp = new SalesRefundApplication();

app.get("/api/sales-refunds", (req, res) => {
  try {
    const matchedPairs = salesRefundApp.getMatchedPairs();

    res.json({
      success: true,
      data: matchedPairs,
      count: matchedPairs.length,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/stats", (req, res) => {
  try {
    const stats = salesRefundApp.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

app.post("/api/load-csv", (req, res) => {
  try {
    const { csvFilePath } = req.body;

    if (!csvFilePath) {
      return res.status(400).json({
        success: false,
        error: "csvFilePath é obrigatório",
      });
    }

    const result = salesRefundApp.loadFromCSVFile(csvFilePath);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
});

app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "DajuLabs API está funcionando!",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

app.listen(PORT, () => {
  console.log("API rodando!");
  console.log(`Servidor: http://localhost:${PORT}`);
  console.log(`API Endpoint: http://localhost:${PORT}/api/sales-refunds`);
  console.log(`Stats: http://localhost:${PORT}/api/stats`);
  console.log("");
});

process.on("SIGTERM", () => {
  console.log("Servidor sendo finalizado...");
  process.exit(0);
});

module.exports = app;
