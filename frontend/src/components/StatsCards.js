import React from "react";
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  CheckCircle2,
  XCircle,
  Database,
} from "lucide-react";

const styles = {
  container: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
    gap: "20px",
    margin: "20px 0",
  },
  card: {
    backgroundColor: "white",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    border: "1px solid #e9ecef",
    transition: "transform 0.2s, box-shadow 0.2s",
    cursor: "pointer",
  },
  cardHover: {
    transform: "translateY(-2px)",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
  },
  cardHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  cardTitle: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  cardIcon: {
    padding: "8px",
    borderRadius: "8px",
    backgroundColor: "#f3f4f6",
  },
  cardValue: {
    fontSize: "2rem",
    fontWeight: "bold",
    color: "#111827",
    marginBottom: "8px",
  },
  cardSubtext: {
    fontSize: "0.875rem",
    color: "#6b7280",
  },
  loadingCard: {
    backgroundColor: "#f8f9fa",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "120px",
  },
  errorCard: {
    backgroundColor: "#fef2f2",
    border: "1px solid #fecaca",
    color: "#dc2626",
  },
};

const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "#6b7280",
  iconBgColor = "#f3f4f6",
  onClick,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <div
      style={{
        ...styles.card,
        ...(isHovered ? styles.cardHover : {}),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div style={styles.cardHeader}>
        <h3 style={styles.cardTitle}>{title}</h3>
        <div
          style={{
            ...styles.cardIcon,
            backgroundColor: iconBgColor,
          }}
        >
          <Icon size={20} color={iconColor} />
        </div>
      </div>

      <div style={styles.cardValue}>{value}</div>

      {subtitle && <p style={styles.cardSubtext}>{subtitle}</p>}
    </div>
  );
};

const StatsCards = ({ stats, loading, error }) => {
  if (loading) {
    const loadingCards = Array(6)
      .fill(null)
      .map((_, index) => (
        <div key={index} style={styles.loadingCard}>
          <div
            style={{
              width: "40px",
              height: "40px",
              border: "3px solid #e5e7eb",
              borderTop: "3px solid #3b82f6",
              borderRadius: "50%",
              animation: "spin 1s linear infinite",
            }}
          ></div>
        </div>
      ));

    return <div style={styles.container}>{loadingCards}</div>;
  }

  if (error) {
    return (
      <div style={styles.container}>
        <div style={{ ...styles.card, ...styles.errorCard }}>
          <div style={styles.cardHeader}>
            <h3 style={styles.cardTitle}>Erro</h3>
            <XCircle size={20} color="#dc2626" />
          </div>
          <p>Não foi possível carregar as estatísticas</p>
          <small>{error}</small>
        </div>
      </div>
    );
  }

  const safeStats = {
    total_transactions: 0,
    total_sales: 0,
    total_refunds: 0,
    matched_pairs: 0,
    unmatched_transactions: 0,
    ...stats,
  };

  const matchRate =
    safeStats.total_sales > 0
      ? ((safeStats.matched_pairs / safeStats.total_sales) * 100).toFixed(1)
      : 0;

  const refundRate =
    safeStats.total_sales > 0
      ? ((safeStats.total_refunds / safeStats.total_sales) * 100).toFixed(1)
      : 0;

  const cardConfigs = [
    {
      title: "Total de Transações",
      value: safeStats.total_transactions.toLocaleString("pt-BR"),
      subtitle: "Registros processados do CSV",
      icon: Database,
      iconColor: "#3b82f6",
      iconBgColor: "#dbeafe",
      onClick: () =>
        console.log("Total transactions:", safeStats.total_transactions),
    },
    {
      title: "Total de Vendas",
      value: safeStats.total_sales.toLocaleString("pt-BR"),
      subtitle: `${(
        (safeStats.total_sales / safeStats.total_transactions) * 100 || 0
      ).toFixed(1)}% do total`,
      icon: TrendingUp,
      iconColor: "#10b981",
      iconBgColor: "#d1fae5",
      onClick: () => console.log("Total sales:", safeStats.total_sales),
    },
    {
      title: "Total de Devoluções",
      value: safeStats.total_refunds.toLocaleString("pt-BR"),
      subtitle: `Taxa de devolução: ${refundRate}%`,
      icon: TrendingDown,
      iconColor: "#f59e0b",
      iconBgColor: "#fef3c7",
      onClick: () => console.log("Total refunds:", safeStats.total_refunds),
    },
    {
      title: "Pares Encontrados",
      value: safeStats.matched_pairs.toLocaleString("pt-BR"),
      subtitle: `Taxa de matching: ${matchRate}%`,
      icon: CheckCircle2,
      iconColor: "#059669",
      iconBgColor: "#d1fae5",
      onClick: () => console.log("Matched pairs:", safeStats.matched_pairs),
    },
    {
      title: "Sem Par",
      value: safeStats.unmatched_transactions.toLocaleString("pt-BR"),
      subtitle: "Transações sem correspondência",
      icon: XCircle,
      iconColor: "#dc2626",
      iconBgColor: "#fee2e2",
      onClick: () =>
        console.log("Unmatched:", safeStats.unmatched_transactions),
    },
    {
      title: "Eficiência",
      value: `${matchRate}%`,
      subtitle: "Percentual de vendas com devolução",
      icon: BarChart3,
      iconColor: "#8b5cf6",
      iconBgColor: "#ede9fe",
      onClick: () => console.log("Match rate:", matchRate),
    },
  ];

  return (
    <>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      <div style={styles.container}>
        {cardConfigs.map((config, index) => (
          <StatCard
            key={index}
            title={config.title}
            value={config.value}
            subtitle={config.subtitle}
            icon={config.icon}
            iconColor={config.iconColor}
            iconBgColor={config.iconBgColor}
            onClick={config.onClick}
          />
        ))}
      </div>
    </>
  );
};

export default StatsCards;
