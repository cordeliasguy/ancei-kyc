import React, { useRef } from 'react'
import { Button } from './ui/button'
import { FileText, Download } from 'lucide-react'
import type { Client } from '@server/routes/clients'

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

  const formatPercentage = (direct: number, indirect: number) => {
    if (direct > 0 && indirect > 0) {
      return `${direct}% (D) / ${indirect}% (I)`
    } else if (direct > 0) {
      return `${direct}% (D)`
    } else if (indirect > 0) {
      return `${indirect}% (I)`
    }
    return '0%'
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Button onClick={generatePDF} className="flex items-center gap-2">
          <Download className="h-4 w-4" />
          Generate PDF
        </Button>
        <Button
          variant="outline"
          onClick={() => window.print()}
          className="flex items-center gap-2"
        >
          <FileText className="h-4 w-4" />
          Print Preview
        </Button>
      </div>

      {/* PDF Content - Hidden but rendered */}
      <div
        ref={pdfRef}
        className="bg-white p-8 shadow-lg max-w-4xl mx-auto"
        style={{
          fontFamily: 'Arial, sans-serif',
          fontSize: '12px',
          lineHeight: '1.4',
          color: '#000',
          minHeight: '297mm', // A4 height
          width: '210mm' // A4 width
        }}
      >
        {/* Header */}
        <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
          <div className="text-xs text-gray-600 mb-2">
            Edifici Centre Júlia, Av/ Carlemany, 115, 5a planta - AD700
            Escaldes-Engordany - Principat d'Andorra
          </div>
          <div className="text-xs text-gray-600 mb-4">
            Tel.: (+376) 808 175 - ancei@ancei.com - www.ancei.com
          </div>
          <div className="text-right text-xs">
            Signatura del client: ___________________
          </div>
        </div>

        <div className="text-right text-xs mb-4">1</div>

        {/* Title */}
        <h1 className="text-lg font-bold text-center mb-6">
          IDENTIFICACIÓ DEL CLIENT (KYC)
        </h1>

        <h2 className="text-base font-bold mb-4">1 PERSONA JURÍDICA</h2>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Company Name */}
          <div>
            <div className="font-semibold mb-1">Denominació social</div>
            <div className="border-b border-gray-400 pb-1 min-h-[20px]">
              {formData.name || 'XXX, SLU'}
            </div>
          </div>

          {/* Address */}
          <div>
            <div className="font-semibold mb-1">Domicili social</div>
            <div className="border-b border-gray-400 pb-1 min-h-[20px]">
              {formData.address || 'C/ XXX'}
            </div>
          </div>

          {/* Representatives */}
          {formData.type === 'legal' && (
            <div>
              <div className="font-semibold mb-2">
                Representants (persona física)
              </div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="font-medium text-center border-b border-gray-300 pb-1">
                  Nom i cognoms
                </div>
                <div className="font-medium text-center border-b border-gray-300 pb-1">
                  Actua com a
                </div>
              </div>
              {formData.representatives.map((rep, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                  <div className="border-b border-gray-400 pb-1 min-h-[20px]">
                    {rep.name}
                  </div>
                  <div className="border-b border-gray-400 pb-1 min-h-[20px]">
                    {rep.role}
                  </div>
                </div>
              ))}
              {/* Add empty rows if needed */}
              {Array.from({
                length: Math.max(0, 3 - formData.representatives.length)
              }).map((_, index) => (
                <div
                  key={`empty-${index}`}
                  className="grid grid-cols-2 gap-4 mb-2"
                >
                  <div className="border-b border-gray-400 pb-1 min-h-[20px]"></div>
                  <div className="border-b border-gray-400 pb-1 min-h-[20px]"></div>
                </div>
              ))}
            </div>
          )}

          {/* Beneficial Owners */}
          {formData.type === 'legal' && (
            <div>
              <div className="font-semibold mb-2">Beneficiaris efectius</div>
              <div className="grid grid-cols-2 gap-4 mb-2">
                <div className="font-medium text-center border-b border-gray-300 pb-1">
                  Nom i cognoms
                </div>
                <div className="font-medium text-center border-b border-gray-300 pb-1">
                  Percentatge participació (D i I)
                </div>
              </div>
              {formData.beneficiaries.map((ben, index) => (
                <div key={index} className="grid grid-cols-2 gap-4 mb-2">
                  <div className="border-b border-gray-400 pb-1 min-h-[20px]">
                    {ben.name}
                  </div>
                  <div className="border-b border-gray-400 pb-1 min-h-[20px]">
                    {formatPercentage(
                      ben.directPercentage,
                      ben.indirectPercentage
                    )}
                  </div>
                </div>
              ))}
              {/* Add empty rows if needed */}
              {Array.from({
                length: Math.max(0, 3 - formData.beneficiaries.length)
              }).map((_, index) => (
                <div
                  key={`empty-ben-${index}`}
                  className="grid grid-cols-2 gap-4 mb-2"
                >
                  <div className="border-b border-gray-400 pb-1 min-h-[20px]"></div>
                  <div className="border-b border-gray-400 pb-1 min-h-[20px]"></div>
                </div>
              ))}
            </div>
          )}

          {/* Economic Activity */}
          <div>
            <div className="font-semibold mb-1">
              Activitat econòmica de la societat
            </div>
            <div className="border-b border-gray-400 pb-1 min-h-[40px] whitespace-pre-wrap">
              {formData.economicActivity}
            </div>
          </div>

          {/* Operating Countries */}
          {formData.type === 'legal' && (
            <div>
              <div className="font-semibold mb-1">
                Països on desenvolupa la seva activitat i sistemes de
                distribució de productes / serveis
              </div>
              <div className="border-b border-gray-400 pb-1 min-h-[40px]">
                {formData.operatingCountries.join(', ')}
              </div>
            </div>
          )}

          {/* PEP Information */}
          <div>
            <div className="font-semibold mb-1">
              Persona políticament exposada (PEP)
            </div>
            <div className="border-b border-gray-400 pb-1 min-h-[20px]">
              {formData.isPEP ? 'Sí' : 'No'}
              {formData.isPEP &&
                formData.pepDetails &&
                ` - ${formData.pepDetails}`}
            </div>
          </div>

          {/* PEP Relation */}
          <div>
            <div className="font-semibold mb-1">Relació amb algun PEP</div>
            <div className="border-b border-gray-400 pb-1 min-h-[20px]">
              {formData.pepRelation || ''}
            </div>
          </div>

          {/* Origin of Funds */}
          <div>
            <div className="font-semibold mb-1">Origen dels fons</div>
            <div className="border-b border-gray-400 pb-1 min-h-[40px] whitespace-pre-wrap">
              {formData.fundsOrigin}
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-xs text-gray-600">
          <sup>1</sup> És obligació del client mantenir actualitzades les dades
          de forma que corresponguin a la realitat en cada moment. Serà motiu de
          resolució contractual qualsevol fet que doni sospites d'una activitat
          delictiva per part del client. Al mateix temps, es comunica al client
          que, en aplicació de la Llei 10/2017, de prevenció i lluita contra el
          blanqueig de diners o valors i el finançament del terrorisme, el
          tractament de les dades personals del present document, NO estan
          subjectes a la normativa en matèria de protecció de dades personals
          (art. 38.3)
        </div>

        {/* Page Break */}
        <div style={{ pageBreakBefore: 'always' }} className="pt-8">
          {/* Header for page 2 */}
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
            <div className="text-xs text-gray-600 mb-2">
              Edifici Centre Júlia, Av/ Carlemany, 115, 5a planta - AD700
              Escaldes-Engordany - Principat d'Andorra
            </div>
            <div className="text-xs text-gray-600 mb-4">
              Tel.: (+376) 808 175 - ancei@ancei.com - www.ancei.com
            </div>
            <div className="text-right text-xs">
              Signatura del client: ___________________
            </div>
          </div>

          <div className="text-right text-xs mb-4">2</div>

          {/* Requested Services */}
          <div className="mb-6">
            <div className="font-semibold mb-2">Serveis sol·licitats</div>
            <div className="border-b border-gray-400 pb-1 min-h-[20px]">
              {formData.requestedServices.join(', ') ||
                'Comptabilitat, IGI, IS.'}
            </div>
          </div>

          {/* Declaration */}
          <div className="mb-8">
            <div className="font-semibold mb-4">
              Manifestació relativa als fons aportats
            </div>
            <div className="mb-4">
              El client manifesta i expressament declara que
            </div>
            <ul className="space-y-2 ml-4">
              <li>
                • Els fons aportats a ANCEI, SA no provenen d'activitats
                relacionades amb activitats de blanqueig de capitals i
                finançament al terrorisme.
              </li>
              <li>
                • Els fons aportats a ANCEI, SA han estat degudament declarats
                al seu país de residència fiscal i, a la vegada, que han pagat
                els impostos que li corresponien.
              </li>
              <li>
                • El representants declaren tenir la capacitat legal per actuar
                en nom de l'empresa.
              </li>
            </ul>
          </div>

          {/* Signatures */}
          <div className="mb-8">
            <div className="mb-4">
              I en prova de conformitat, signen ambdues parts el present
              document
            </div>
            <div className="mb-6">
              <strong>Data i lloc:</strong> Escaldes-Engordany, {formatDate()}
            </div>
            <div className="grid grid-cols-2 gap-8">
              <div className="text-center">
                <div className="border-b border-gray-400 mb-2 pb-8"></div>
                <div>
                  Sr.{' '}
                  {(formData.type === 'legal' &&
                    formData.representatives[0]?.name) ||
                    'XXX'}
                </div>
              </div>
              <div className="text-center">
                <div className="border-b border-gray-400 mb-2 pb-8"></div>
                <div>Responsable del Client</div>
              </div>
            </div>
          </div>

          {/* ANCEI Data Section */}
          <div className="mt-12">
            <div className="font-semibold mb-4">DADES PER OMPLIR PER ANCEI</div>
            <div className="grid grid-cols-2 gap-8">
              <div>
                <div className="font-medium mb-2">Mesures de diligència</div>
                <div className="space-y-1">
                  <div>☐ Simplificada</div>
                  <div>☐ Convencional</div>
                  <div>☐ Reforçada</div>
                </div>
              </div>
              <div>
                <div className="font-medium mb-2">
                  Acceptació per part de de l'OCIC
                </div>
                <div>(Signatura, nom i data)</div>
                <div className="border border-gray-400 h-16 mt-2"></div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <div>☐ Escriptura constitució</div>
              <div>☐ Nomenament representant</div>
              <div>☐ Gràfic estructura propietat</div>
              <div>☐ Altres</div>
            </div>

            <div className="mt-6 space-y-4">
              <div>
                <span>☐ Namebook.es</span>
                <span className="ml-8">Data de recerca: _______________</span>
              </div>
              <div>
                <span>☐ Llistat ONU</span>
                <span className="ml-8">Data de recerca: _______________</span>
              </div>
            </div>
          </div>
        </div>

        {/* Page 3 - Updates */}
        <div style={{ pageBreakBefore: 'always' }} className="pt-8">
          <div className="text-center mb-6 pb-4 border-b-2 border-gray-300">
            <div className="text-xs text-gray-600 mb-2">
              Edifici Centre Júlia, Av/ Carlemany, 115, 5a planta - AD700
              Escaldes-Engordany - Principat d'Andorra
            </div>
            <div className="text-xs text-gray-600 mb-4">
              Tel.: (+376) 808 175 - ancei@ancei.com - www.ancei.com
            </div>
            <div className="text-right text-xs">
              Signatura del client: ___________________
            </div>
          </div>

          <div className="text-right text-xs mb-4">4</div>

          <div className="font-semibold text-lg mb-6">ACTUALITZACIÓ</div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="font-medium border-b border-gray-300 pb-1">
              Nous serveis sol·licitats
            </div>
            <div className="font-medium border-b border-gray-300 pb-1">
              Data
            </div>
          </div>

          {/* Empty rows for updates */}
          {Array.from({ length: 10 }).map((_, index) => (
            <div key={index} className="grid grid-cols-2 gap-4 mb-2">
              <div className="border-b border-gray-400 pb-1 min-h-[20px]"></div>
              <div className="border-b border-gray-400 pb-1 min-h-[20px]"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default KYCPDFGenerator
