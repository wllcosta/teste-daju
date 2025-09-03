import {
  CheckCircle,
  XCircle,
  Package,
  Building,
  FileText,
  DollarSign,
} from "lucide-react";

const styles = {
  container: {
    backgroundColor: "white",
    borderRadius: "12px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
    overflow: "hidden",
    margin: "20px 0",
  },
  header: {
    backgroundColor: "#f8f9fa",
    padding: "20px",
    borderBottom: "1px solid #e9ecef",
  },
  title: {
    fontSize: "1.5rem",
    fontWeight: "bold",
    color: "#333",
    margin: "0 0 8px 0",
    display: "flex",
    alignItems: "center",
    gap: "10px",
  },
  subtitle: {
    color: "#666",
    fontSize: "0.9rem",
  },
  tableContainer: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    backgroundColor: "#f1f3f4",
    padding: "12px 16px",
    textAlign: "left",
    fontWeight: "600",
    color: "#444",
    borderBottom: "2px solid #dee2e6",
    fontSize: "0.85rem",
    textTransform: "uppercase",
  },
  td: {
    padding: "12px 16px",
    borderBottom: "1px solid #e9ecef",
    color: "#555",
  },
  row: {
    transition: "background-color 0.2s",
    cursor: "pointer",
  },
  rowHover: {
    backgroundColor: "#f8f9fa",
  },
  badge: {
    padding: "4px 8px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "500",
  },
  badgeSuccess: {
    backgroundColor: "#d4edda",
    color: "#155724",
  },
  badgeInfo: {
    backgroundColor: "#cce7ff",
    color: "#004085",
  },
  emptyState: {
    textAlign: "center",
    padding: "60px 20px",
    color: "#666",
  },
  loadingState: {
    textAlign: "center",
    padding: "40px",
    color: "#666",
  },
  errorState: {
    textAlign: "center",
    padding: "40px",
    color: "#dc3545",
    backgroundColor: "#f8d7da",
    margin: "20px",
    borderRadius: "8px",
  },
};

const CurrencyValue = ({ value }) => {
  const formatted = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

  return <span style={{ fontWeight: "500" }}>{formatted}</span>;
};

const StatusBadge = ({ type }) => {
  const badgeProps = {
    paired: {
      icon: <CheckCircle size={12} />,
      text: "Pareado",
      style: { ...styles.badge, ...styles.badgeSuccess },
    },
    sale: {
      icon: <DollarSign size={12} />,
      text: "Venda",
      style: { ...styles.badge, ...styles.badgeInfo },
    },
  };

  const props = badgeProps[type] || badgeProps.paired;

  return (
    <span style={props.style}>
      {props.icon} {props.text}
    </span>
  );
};

const SalesTable = ({ data, loading, error }) => {
  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loadingState}>
          <div
            style={{
              border: "3px solid #f3f3f3",
              borderTop: "3px solid #007bff",
              borderRadius: "50%",
              width: "40px",
              height: "40px",
              animation: "spin 1s linear infinite",
              margin: "0 auto 20px",
            }}
          ></div>
          <p>Carregando dados do CSV...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.errorState}>
        <XCircle size={48} style={{ marginBottom: "16px" }} />
        <h3>Erro ao carregar dados</h3>
        <p>{error}</p>
        <small>Verifique se o backend está rodando em localhost:3001</small>
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.emptyState}>
          <Package size={48} style={{ marginBottom: "16px", color: "#ccc" }} />
          <h3>Nenhum par encontrado</h3>
          <p>Não foram encontrados pares de venda-devolução no CSV</p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>
          <FileText size={24} />
          Vendas e Devoluções Pareadas
        </h2>
        <p style={styles.subtitle}>
          {data.length} par{data.length !== 1 ? "es" : ""} encontrado
          {data.length !== 1 ? "s" : ""} no arquivo CSV
        </p>
      </div>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>
                <FileText size={14} style={{ marginRight: "6px" }} />
                Invoice
              </th>
              <th style={styles.th}>
                <Package size={14} style={{ marginRight: "6px" }} />
                Produto
              </th>
              <th style={styles.th}>
                <Building size={14} style={{ marginRight: "6px" }} />
                Empresa
              </th>
              <th style={styles.th}>Valor Venda</th>
              <th style={styles.th}>Valor Devolução</th>
              <th style={styles.th}>Diferença</th>
              <th style={styles.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => {
              const saleValue = item.transaction.sale.value;
              const refundValue = item.transaction.refund.value;
              const difference = saleValue - refundValue;

              return (
                <tr
                  key={index}
                  style={styles.row}
                  onMouseEnter={(e) =>
                    (e.target.parentElement.style.backgroundColor =
                      styles.rowHover.backgroundColor)
                  }
                  onMouseLeave={(e) =>
                    (e.target.parentElement.style.backgroundColor =
                      "transparent")
                  }
                >
                  <td style={styles.td}>
                    <strong>{item.invoice}</strong>
                  </td>

                  <td style={styles.td}>{item.transaction.sale.product}</td>

                  <td style={styles.td}>{item.transaction.sale.company}</td>

                  <td style={styles.td}>
                    <CurrencyValue value={saleValue} />
                  </td>

                  <td style={styles.td}>
                    <CurrencyValue value={refundValue} />
                  </td>

                  <td
                    style={{
                      ...styles.td,
                      color:
                        difference === 0
                          ? "#28a745"
                          : difference > 0
                          ? "#dc3545"
                          : "#ffc107",
                      fontWeight: "500",
                    }}
                  >
                    {difference === 0 ? (
                      "✓ Igual"
                    ) : (
                      <CurrencyValue value={Math.abs(difference)} />
                    )}
                  </td>

                  <td style={styles.td}>
                    <StatusBadge type="paired" />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SalesTable;
