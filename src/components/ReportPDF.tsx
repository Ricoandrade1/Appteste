import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer"

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 30,
  },
  section: {
    margin: 10,
    padding: 10,
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    marginBottom: 10,
  },
  table: {
    display: "table",
    width: "100%",
    borderStyle: "solid",
    borderWidth: 1,
    borderColor: "#000",
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#000",
  },
  tableHeader: {
    backgroundColor: "#f0f0f0",
  },
  tableCell: {
    padding: 5,
    flex: 1,
    fontSize: 12,
  },
  summary: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
  },
})

interface ReportPDFProps {
  products: Array<{
    id: number
    name: string
    stock: number
    price: number
  }>
  barbers: Array<{
    id: number
    name: string
    services: number
    rating: number
    balance: number
  }>
}

export const ReportPDF = ({ products, barbers }: ReportPDFProps) => {
  const totalBalance = barbers.reduce((sum, barber) => sum + barber.balance, 0)
  const totalProducts = products.reduce((sum, product) => sum + product.stock, 0)

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.title}>Relatório da Barbearia</Text>
          
          <Text style={styles.subtitle}>Barbeiros</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Nome</Text>
              <Text style={styles.tableCell}>Serviços</Text>
              <Text style={styles.tableCell}>Avaliação</Text>
              <Text style={styles.tableCell}>Saldo</Text>
            </View>
            {barbers.map((barber) => (
              <View key={barber.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{barber.name}</Text>
                <Text style={styles.tableCell}>{barber.services}</Text>
                <Text style={styles.tableCell}>{barber.rating}</Text>
                <Text style={styles.tableCell}>€{barber.balance.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.subtitle}>Produtos</Text>
          <View style={styles.table}>
            <View style={[styles.tableRow, styles.tableHeader]}>
              <Text style={styles.tableCell}>Produto</Text>
              <Text style={styles.tableCell}>Estoque</Text>
              <Text style={styles.tableCell}>Preço</Text>
            </View>
            {products.map((product) => (
              <View key={product.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{product.name}</Text>
                <Text style={styles.tableCell}>{product.stock}</Text>
                <Text style={styles.tableCell}>€{product.price.toFixed(2)}</Text>
              </View>
            ))}
          </View>

          <View style={styles.summary}>
            <Text>Resumo:</Text>
            <Text>Total de Barbeiros: {barbers.length}</Text>
            <Text>Total em Comissões: €{totalBalance.toFixed(2)}</Text>
            <Text>Total de Produtos em Estoque: {totalProducts}</Text>
          </View>
        </View>
      </Page>
    </Document>
  )
}
