"use client"

import { InteractiveHoverButton } from "@/components/magicui/interactive-hover-button"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import { jsPDF } from "jspdf"

interface PDFDownloadButtonProps {
  currentMonth: Date
  subscriptions: Array<{
    name: string
    amount: number
    category: string
  }>
}

export function PDFDownloadButton({ currentMonth, subscriptions }: PDFDownloadButtonProps) {
  const generatePDF = () => {
    const doc = new jsPDF()
    const fileName = `rapport_depenses_${format(currentMonth, "MMMM_yyyy")}.pdf`

    // En-tête
    doc.setFontSize(24)
    doc.text("Rapport Mensuel des Dépenses", 20, 20)
    doc.setFontSize(14)
    doc.text(format(currentMonth, "MMMM yyyy", { locale: fr }), 20, 30)

    // Tableau des dépenses
    doc.setFontSize(16)
    doc.text("Dépenses du Mois", 20, 50)
    
    // En-têtes du tableau
    doc.setFontSize(12)
    doc.text("Nom", 20, 60)
    doc.text("Montant", 100, 60)

    // Lignes du tableau
    let y = 70
    subscriptions.forEach((sub) => {
      doc.text(sub.name, 20, y)
      doc.text(`${sub.amount.toFixed(2)} €`, 100, y)
      y += 10
    })

    // Total
    const total = subscriptions.reduce((sum, sub) => sum + sub.amount, 0)
    doc.setFontSize(14)
    doc.text(`Total des dépenses du mois : ${total.toFixed(2)} €`, 20, y + 10)

    // Pied de page
    doc.setFontSize(10)
    doc.text(
      `Généré le ${format(new Date(), "dd MMMM yyyy", { locale: fr })}`,
      20,
      doc.internal.pageSize.height - 20
    )

    // Sauvegarder le PDF
    doc.save(fileName)
  }

  return (
    <InteractiveHoverButton onClick={generatePDF}>
      Télécharger PDF
    </InteractiveHoverButton>
  )
} 