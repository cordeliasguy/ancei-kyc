import React, { useRef } from 'react'
import { Button } from './ui/button'
import { PrinterIcon as Print, Download, ArrowLeft } from 'lucide-react'
import type { Client } from '@server/routes/clients'
import { Link } from '@tanstack/react-router'

type Props = {
  formData: Client
  onGeneratePDF?: () => void
}

const KYCPDFGenerator: React.FC<Props> = ({ formData, onGeneratePDF }) => {
  const pdfRef = useRef<HTMLDivElement>(null)

  const generatePDF = async () => {
    if (!pdfRef.current) return

    try {
      // Dynamically import jsPDF and html2canvas-pro
      const jsPDF = (await import('jspdf')).default
      const html2canvas = (await import('html2canvas-pro')).default

      const element = pdfRef.current

      // Configure html2canvas-pro for better quality
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight
      })

      const imgData = canvas.toDataURL('image/png')

      // Create PDF
      const pdf = new jsPDF('p', 'mm', 'a4')
      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = pdfWidth
      const imgHeight = (canvas.height * pdfWidth) / canvas.width

      let heightLeft = imgHeight
      let position = 0

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
      heightLeft -= pdfHeight

      // Add additional pages if needed
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight
        pdf.addPage()
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight)
        heightLeft -= pdfHeight
      }

      // Download the PDF
      const fileName = `KYC_${formData.name.replace(/[^a-zA-Z0-9]/g, '_')}_${new Date().toISOString().split('T')[0]}.pdf`
      pdf.save(fileName)

      onGeneratePDF?.()
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  const formatDate = () => {
    const now = new Date()
    return now.toLocaleDateString('ca-ES', {
      day: '2-digit',
      month: 'long',
      year: 'numeric'
    })
  }

  return (
    <div className="space-y-4">
      <div className="mb-6 flex items-center justify-between print:hidden">
        <Button variant="outline" className="mb-4 bg-transparent" asChild>
          <Link to="/">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => window.print()}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Print className="h-4 w-4" />
            Print
          </Button>
          <Button
            onClick={generatePDF}
            className="flex items-center gap-2 cursor-pointer"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* KYC Document */}
      <div ref={pdfRef} className="mx-auto max-w-4xl p-8 bg-white">
        {/* Header */}
        <div className="text-center mb-8 border-b pb-4">
          <div className="text-sm text-gray-600 mb-2">
            Edifici Centre Júlia, Av/ Carlemany, 115, 5a planta - AD700
            Escaldes-Engordany - Principat d'Andorra
          </div>
          <div className="text-sm text-gray-600 mb-4">
            Tel.: (+376) 808 175 - ancei@ancei.com - www.ancei.com
          </div>
          <div className="text-right text-sm">
            Signatura del client: ___________________
          </div>
        </div>

        {/* Page Number */}
        <div className="text-right text-sm mb-4">1</div>

        {/* Title */}
        <div className="text-center mb-6">
          <h1 className="text-xl font-bold">IDENTIFICACIÓ DEL CLIENT (KYC)¹</h1>
          <h2 className="text-lg font-semibold mt-2">☐ PERSONA JURÍDICA</h2>
        </div>

        {/* Company Information */}
        <div className="space-y-6">
          <div>
            <div className="font-semibold mb-2">Denominació social</div>
            <div className="border-b border-gray-300 pb-1">{formData.name}</div>
          </div>

          <div>
            <div className="font-semibold mb-2">Domicili social</div>
            <div className="border-b border-gray-300 pb-1 whitespace-pre-line">
              {formData.address}
            </div>
          </div>

          {/* Representatives */}
          {formData.type === 'legal' && (
            <div>
              <div className="font-semibold mb-2">
                Representants (persona física)
              </div>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">
                      Nom i cognoms
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Actua com a
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.representatives.map((rep, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{rep.name}</td>
                      <td className="border border-gray-300 p-2">{rep.role}</td>
                    </tr>
                  ))}
                  {/* Empty rows for additional entries */}
                  {Array.from({
                    length: Math.max(0, 3 - formData.representatives.length)
                  }).map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td className="border border-gray-300 p-2 h-8"></td>
                      <td className="border border-gray-300 p-2 h-8"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Beneficial Owners */}
          {formData.type === 'legal' && (
            <div>
              <div className="font-semibold mb-2">Beneficiaris efectius</div>
              <table className="w-full border-collapse">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">
                      Nom i cognoms
                    </th>
                    <th className="border border-gray-300 p-2 text-left">
                      Percentatge participació (D i I)
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {formData.beneficiaries.map((ben, index) => (
                    <tr key={index}>
                      <td className="border border-gray-300 p-2">{ben.name}</td>
                      <td className="border border-gray-300 p-2">
                        D: {ben.directPercentage}% / I: {ben.indirectPercentage}
                        %
                      </td>
                    </tr>
                  ))}
                  {/* Empty rows for additional entries */}
                  {Array.from({
                    length: Math.max(0, 3 - formData.beneficiaries.length)
                  }).map((_, index) => (
                    <tr key={`empty-${index}`}>
                      <td className="border border-gray-300 p-2 h-8"></td>
                      <td className="border border-gray-300 p-2 h-8"></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Economic Activity */}
          <div>
            <div className="font-semibold mb-2">
              Activitat econòmica de la societat
            </div>
            <div className="border border-gray-300 p-2 min-h-[60px] whitespace-pre-line">
              {formData.economicActivity}
            </div>
          </div>

          {/* Operating Countries */}
          {formData.type === 'legal' && (
            <div>
              <div className="font-semibold mb-2">
                Països on desenvolupa la seva activitat i sistemes de
                distribució de productes / serveis
              </div>
              <div className="border border-gray-300 p-2 min-h-[60px] whitespace-pre-line">
                {formData.operatingCountries.join(', ')}
              </div>
            </div>
          )}

          {/* PEP Information */}
          <div>
            <div className="font-semibold mb-2">
              Persona políticament exposada (PEP)
            </div>
            <div className="border border-gray-300 p-2 min-h-[60px]">
              {formData.isPEP ? `Sí - ${formData.pepDetails}` : 'No'}
            </div>
          </div>

          {/* PEP Relation */}
          <div>
            <div className="font-semibold mb-2">Relació amb algun PEP</div>
            <div className="border border-gray-300 p-2 min-h-[60px] whitespace-pre-line">
              {formData.pepRelation || 'Cap relació'}
            </div>
          </div>

          {/* Origin of Funds */}
          <div>
            <div className="font-semibold mb-2">Origen dels fons</div>
            <div className="border border-gray-300 p-2 min-h-[60px] whitespace-pre-line">
              {formData.fundsOrigin}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-xs text-gray-600">
          ¹ És obligació del client mantenir actualitzades les dades de forma
          que corresponguin a la realitat en cada moment. Serà motiu de
          resolució contractual qualsevol fet que doni sospites d'una activitat
          delictiva per part del client. Al mateix temps, es comunica al client
          que, en aplicació de la Llei 10/2017, de prevenció i lluita contra el
          blanqueig de diners o valors i el finançament del terrorisme, el
          tractament de les dades personals del present document, NO estan
          subjectes a la normativa en matèria de protecció de dades personals
          (art. 38.3)
        </div>

        {/* Page Break */}
        <div className="page-break-before mt-12 pt-8">
          {/* Header for page 2 */}
          <div className="text-center mb-8 border-b pb-4">
            <div className="text-sm text-gray-600 mb-2">
              Edifici Centre Júlia, Av/ Carlemany, 115, 5a planta - AD700
              Escaldes-Engordany - Principat d'Andorra
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Tel.: (+376) 808 175 - ancei@ancei.com - www.ancei.com
            </div>
            <div className="text-right text-sm">
              Signatura del client: ___________________
            </div>
          </div>

          {/* Page Number */}
          <div className="text-right text-sm mb-4">2</div>

          {/* Requested Services */}
          <div className="mb-8">
            <div className="font-semibold mb-2">Serveis sol·licitats</div>
            <div className="border-b border-gray-300 pb-1">
              {formData.requestedServices}
            </div>
          </div>

          {/* Declaration */}
          <div className="mb-8">
            <div className="font-semibold mb-4">
              Manifestació relativa als fons aportats
            </div>
            <div className="space-y-4">
              <p>El client manifesta i expressament declara que</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  Els fons aportats a ANCEI, SA no provenen d'activitats
                  relacionades amb activitats de blanqueig de capitals i
                  finançament al terrorisme.
                </li>
                <li>
                  Els fons aportats a ANCEI, SA han estat degudament declarats
                  al seu país de residència fiscal i, a la vegada, que han pagat
                  els impostos que li corresponien.
                </li>
                <li>
                  El representants declaren tenir la capacitat legal per actuar
                  en nom de l'empresa.
                </li>
              </ul>
            </div>
          </div>

          {/* Signatures */}
          <div className="mb-8">
            <p className="mb-6">
              I en prova de conformitat, signen ambdues parts el present
              document
            </p>
            <p className="mb-8">
              Data i lloc: Escaldes-Engordany, {formatDate()}
            </p>

            <div className="flex justify-between mt-16">
              <div className="text-center">
                <div className="border-t border-gray-400 w-48 mb-2"></div>
                <div>
                  Sr.{' '}
                  {(formData.type === 'legal' &&
                    formData.representatives[0]?.name) ||
                    '_______________'}
                </div>
              </div>
              <div className="text-center">
                <div className="border-t border-gray-400 w-48 mb-2"></div>
                <div>Responsable del Client</div>
              </div>
            </div>
          </div>

          {/* Internal Data Section */}
          <div className="mt-12 border-t pt-8">
            <div className="font-semibold mb-4">DADES PER OMPLIR PER ANCEI</div>

            <table className="w-full border-collapse mb-4">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 text-left">
                    Mesures de diligència
                  </th>
                  <th className="border border-gray-300 p-2 text-left">
                    Acceptació per part de de l'OCIC
                    <br />
                    (Signatura, nom i data)
                  </th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-gray-300 p-2">
                    <div>• Simplificada</div>
                    <div>• Convencional</div>
                    <div>• Reforçada</div>
                  </td>
                  <td className="border border-gray-300 p-2 h-20"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">
                    <div>• Escriptura constitució</div>
                    <div>• Nomenament representant</div>
                    <div>• Gràfic estructura propietat</div>
                    <div>• Altres</div>
                  </td>
                  <td className="border border-gray-300 p-2 h-24"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">
                    <div>• Namebook.es</div>
                    <div>Data de recerca: ___________</div>
                  </td>
                  <td className="border border-gray-300 p-2 h-16"></td>
                </tr>
                <tr>
                  <td className="border border-gray-300 p-2">
                    <div>• Llistat ONU</div>
                    <div>Data de recerca: ___________</div>
                  </td>
                  <td className="border border-gray-300 p-2 h-16"></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Updates Section - Page 4 */}
        <div className="page-break-before mt-12 pt-8">
          {/* Header for page 4 */}
          <div className="text-center mb-8 border-b pb-4">
            <div className="text-sm text-gray-600 mb-2">
              Edifici Centre Júlia, Av/ Carlemany, 115, 5a planta - AD700
              Escaldes-Engordany - Principat d'Andorra
            </div>
            <div className="text-sm text-gray-600 mb-4">
              Tel.: (+376) 808 175 - ancei@ancei.com - www.ancei.com
            </div>
            <div className="text-right text-sm">
              Signatura del client: ___________________
            </div>
          </div>

          {/* Page Number */}
          <div className="text-right text-sm mb-4">4</div>

          {/* Updates Section */}
          <div>
            <div className="font-semibold mb-4 text-center">ACTUALITZACIÓ</div>

            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2 text-left w-3/4">
                    Nous serveis sol·licitats
                  </th>
                  <th className="border border-gray-300 p-2 text-left w-1/4">
                    Data
                  </th>
                </tr>
              </thead>
              <tbody>
                {/* Empty rows for future updates */}
                {Array.from({ length: 20 }).map((_, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2 h-8"></td>
                    <td className="border border-gray-300 p-2 h-8"></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KYCPDFGenerator
