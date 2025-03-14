import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 20,
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    color: "#111827",
    fontWeight: "bold",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: "#374151",
    fontWeight: "bold",
  },
  table: {
    display: "flex",
    width: "auto",
    borderStyle: "solid",
    borderWidth: 1,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  tableRow: {
    margin: "auto",
    flexDirection: "row",
  },
  tableCol: {
    width: "50%",
    borderStyle: "solid",
    borderWidth: 1,
    borderLeftWidth: 0,
    borderTopWidth: 0,
    padding: 5,
  },
  tableCell: {
    margin: 5,
    fontSize: 10,
  },
  total: {
    marginTop: 20,
    paddingTop: 20,
    borderTop: 1,
    borderTopColor: "#e5e7eb",
    fontSize: 14,
    fontWeight: "bold",
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    color: "#6b7280",
    textAlign: "center",
  },
})

type Subscription = {
  name: string
  amount: number
  frequency: string
  renewalDate: Date
}

export function MonthlyReportPDF({ currentMonth, subscriptions }: { currentMonth: Date, subscriptions: Subscription[] }) {
  // Filtrer les abonnements qui ont leur renouvellement dans le mois en cours
  const currentMonthSubscriptions = subscriptions.filter(sub => {
    const renewalDate = new Date(sub.renewalDate)
    return renewalDate.getMonth() === currentMonth.getMonth() && 
           renewalDate.getFullYear() === currentMonth.getFullYear()
  })

  // Calculer le total des dépenses du mois
  const totalMonthly = currentMonthSubscriptions.reduce((sum, sub) => sum + sub.amount, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Rapport Mensuel des Dépenses</Text>
          <Text style={styles.subtitle}>
            {format(currentMonth, "MMMM yyyy", { locale: fr })}
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dépenses du Mois</Text>
          <View style={styles.table}>
            <View style={styles.tableRow}>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Nom</Text>
              </View>
              <View style={styles.tableCol}>
                <Text style={styles.tableCell}>Montant</Text>
              </View>
            </View>
            {currentMonthSubscriptions.map((sub, index) => (
              <View key={index} style={styles.tableRow}>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{sub.name}</Text>
                </View>
                <View style={styles.tableCol}>
                  <Text style={styles.tableCell}>{sub.amount.toFixed(2)} €</Text>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.total}>
          <Text>Total des dépenses du mois : {totalMonthly.toFixed(2)} €</Text>
        </View>

        <Text style={styles.footer}>
          Généré le {format(new Date(), "dd MMMM yyyy", { locale: fr })}
        </Text>
      </Page>
    </Document>
  )
} 