import jsPDF from 'jspdf'
import 'jspdf-autotable'
import type { KYCFormData } from '@/lib/types'
import type {
  FormRelatedPerson,
  FormManagementPerson,
  FormShareholder,
  FormUbo,
  EntityType
} from '@server/sharedTypes'

type GenerateKycPDFProps = {
  formData: KYCFormData
  relatedPersons?: FormRelatedPerson[]
  signatureDataUrl?: string | null
  formType?: EntityType
  managementMembers?: FormManagementPerson[]
  shareholders?: FormShareholder[]
  ubos?: FormUbo[]
}

export const generateKycPDF = ({
  formData,
  relatedPersons = [],
  signatureDataUrl,
  formType = 'natural',
  managementMembers = [],
  shareholders = [],
  ubos = []
}: GenerateKycPDFProps) => {
  const doc = new jsPDF()

  // Configuration
  const pageWidth = doc.internal.pageSize.getWidth()
  const margin = 14
  let yPosition = 20

  // Helper function to add disclaimer
  const addDisclaimer = (companyName: string): number => {
    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)

    const disclaimerPart1 =
      'Les dades que vostè ens facilita seran incloses en un fitxer el tractament del qual és responsable'
    const disclaimerPart2 =
      "amb la finalitat de donar compliment a la legislació vigent en matèria de Prevenció de Blanqueig de Capitals i Finançament del Terrorisme i seran tractades amb la més absoluta confidencialitat dins del marc de la citada normativa amb l'aplicació de les mesures de protecció de dades personals aplicables, no podent ser emprades per una altra finalitat."

    const part1Lines = doc.splitTextToSize(
      disclaimerPart1,
      pageWidth - 2 * margin
    )
    doc.text(part1Lines, margin, yPosition)

    const lastLine = part1Lines[part1Lines.length - 1]
    const lastLineWidth = doc.getTextWidth(lastLine)
    let currentX = margin + lastLineWidth + 1
    let currentY = yPosition + (part1Lines.length - 1) * 4

    doc.setFont('helvetica', 'bolditalic')
    doc.setTextColor(0, 0, 0)
    const companyWidth = doc.getTextWidth(companyName)

    if (currentX + companyWidth > pageWidth - margin) {
      currentY += 4
      currentX = margin
    }

    doc.text(companyName, currentX, currentY)
    currentX += companyWidth + 1

    doc.setFont('helvetica', 'normal')
    doc.setTextColor(80, 80, 80)

    const remainingSpace = pageWidth - margin - currentX
    const part2Words = disclaimerPart2.trim().split(' ')
    let part2Text = ''
    let firstWord = true

    for (const word of part2Words) {
      const testText = firstWord ? word : part2Text + ' ' + word
      const testWidth = doc.getTextWidth(testText)

      if (firstWord && testWidth < remainingSpace) {
        part2Text = word
        firstWord = false
      } else if (!firstWord && testWidth < remainingSpace) {
        part2Text += ' ' + word
      } else {
        break
      }
    }

    if (part2Text) {
      doc.text(part2Text, currentX, currentY)
      const remainingText = disclaimerPart2
        .trim()
        .substring(part2Text.length)
        .trim()
      if (remainingText) {
        currentY += 4
        const remainingLines = doc.splitTextToSize(
          remainingText,
          pageWidth - 2 * margin
        )
        doc.text(remainingLines, margin, currentY)
        yPosition = currentY + remainingLines.length * 4
      } else {
        yPosition = currentY + 14
      }
    } else {
      currentY += 4
      const part2Lines = doc.splitTextToSize(
        disclaimerPart2,
        pageWidth - 2 * margin
      )
      doc.text(part2Lines, margin, currentY)
      yPosition = currentY + part2Lines.length * 4
    }

    doc.setTextColor(0, 0, 0)
    doc.setFont('helvetica', 'normal')

    return yPosition
  }

  // Helper function to add section header
  const addSectionHeader = (title: string) => {
    checkPageBreak(20)
    doc.setTextColor(192, 0, 0)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')

    const textWidth = doc.getTextWidth(title.toUpperCase())
    const centerX = (pageWidth - textWidth) / 2

    doc.text(title.toUpperCase(), centerX, yPosition + 7)
    doc.setTextColor(0, 0, 0)
    yPosition += 15
  }

  // Helper function to check if new page is needed
  const checkPageBreak = (requiredSpace: number = 20) => {
    if (yPosition + requiredSpace > doc.internal.pageSize.getHeight() - 20) {
      doc.addPage()
      yPosition = 20
      return true
    }
    return false
  }

  // Helper function to add field
  const addField = (label: string, value: string | boolean | undefined) => {
    checkPageBreak(15)
    doc.setFontSize(9)
    doc.setFont('helvetica', 'bold')
    doc.text(label + ':', margin, yPosition)
    doc.setFont('helvetica', 'normal')

    const displayValue =
      value === true || value?.toString().toLowerCase() === 'yes'
        ? 'Sí'
        : value === false || value?.toString().toLowerCase() === 'no'
          ? 'No'
          : value || 'N/A'

    const lines = doc.splitTextToSize(displayValue, pageWidth - margin * 2 - 50)

    doc.text(lines, margin + 75, yPosition)
    yPosition += lines.length * 5 + 3
  }

  const renderDueDiligenceSection = () => {
    checkPageBreak(80)
    addSectionHeader('MESURES DE DILIGÈNCIA')

    // Risk Assessment
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(192, 0, 0)
    doc.text('Valoració del Risc', margin, yPosition)
    doc.setTextColor(0, 0, 0)
    yPosition += 7

    doc.setFontSize(9)
    doc.setFont('helvetica', 'normal')

    // Risk level checkboxes
    const riskOptions = [
      { label: 'Risc Baix', value: formData.riskLevel === 'low' },
      { label: 'Risc Mig', value: formData.riskLevel === 'medium' },
      { label: 'Risc Alt', value: formData.riskLevel === 'high' }
    ]

    const checkboxY = yPosition
    riskOptions.forEach((option, index) => {
      const checkboxX = margin + index * 65

      // Draw checkbox
      doc.rect(checkboxX, checkboxY - 3, 3, 3)
      if (option.value) {
        doc.text('X', checkboxX + 0.5, checkboxY - 0.5)
      }
      doc.text(option.label, checkboxX + 5, checkboxY)
    })
    yPosition += 10

    // Namebook section
    doc.setFont('helvetica', 'bold')
    doc.text('Namebook:', margin, yPosition)
    doc.setFont('helvetica', 'normal')

    // Namebook checkbox
    doc.rect(margin + 30, yPosition - 3, 3, 3)
    if (formData.isNamebookChecked) {
      doc.text('X', margin + 30.5, yPosition - 0.5)
    }

    doc.text('Data:', margin + 100, yPosition)
    const namebookDateText = formData.namebookDate
      ? new Date(formData.namebookDate).toLocaleDateString('ca-ES')
      : '_________________'
    doc.text(namebookDateText, margin + 115, yPosition)
    yPosition += 8

    // Llistat ONU section
    doc.setFont('helvetica', 'bold')
    doc.text('Llistat ONU:', margin, yPosition)
    doc.setFont('helvetica', 'normal')

    // ONU checkbox
    doc.rect(margin + 30, yPosition - 3, 3, 3)
    if (formData.isOnuListChecked) {
      doc.text('X', margin + 30.5, yPosition - 0.5)
    }

    doc.text('Data:', margin + 100, yPosition)
    const onuDateText = formData.onuListDate
      ? new Date(formData.onuListDate).toLocaleDateString('ca-ES')
      : '_________________'
    doc.text(onuDateText, margin + 115, yPosition)
    yPosition += 8

    // Web section
    doc.setFont('helvetica', 'bold')
    doc.text('Web:', margin, yPosition)
    doc.setFont('helvetica', 'normal')

    // Web checkbox
    doc.rect(margin + 30, yPosition - 3, 3, 3)
    if (formData.isWebChecked) {
      doc.text('X', margin + 30.5, yPosition - 0.5)
    }

    doc.text('Data:', margin + 100, yPosition)
    const webDateText = formData.webDate
      ? new Date(formData.webDate).toLocaleDateString('ca-ES')
      : '_________________'
    doc.text(webDateText, margin + 115, yPosition)
    yPosition += 10

    // Favorable / No Favorable section
    const favorableOptions = [
      { label: 'Favorable', value: formData.ocicOpinion === 'favorable' },
      { label: 'No Favorable', value: formData.ocicOpinion === 'unfavorable' }
    ]

    const favorableY = yPosition
    favorableOptions.forEach((option, index) => {
      const checkboxX = margin + index * 65

      // Draw checkbox
      doc.rect(checkboxX, favorableY - 3, 3, 3)
      if (option.value) {
        doc.text('X', checkboxX + 0.5, favorableY - 0.5)
      }
      doc.text(option.label, checkboxX + 5, favorableY)
    })
    yPosition += 10

    // Comments section
    doc.setFont('helvetica', 'bold')
    doc.text('Comentaris OCIC:', margin, yPosition)
    yPosition += 5

    doc.setFont('helvetica', 'normal')

    // Draw comment box
    const commentBoxHeight = 25
    doc.rect(margin, yPosition, pageWidth - 2 * margin, commentBoxHeight)

    if (formData.ocicComments) {
      const commentLines = doc.splitTextToSize(
        formData.ocicComments,
        pageWidth - 2 * margin - 4
      )
      doc.text(commentLines.slice(0, 4), margin + 2, yPosition + 4)
    }

    yPosition += commentBoxHeight + 10
  }

  // Title
  doc.setTextColor(192, 0, 0)
  doc.setFontSize(16)
  doc.setFont('helvetica', 'bold')
  const titleText =
    formType === 'legal'
      ? 'FORMULARI IDENTIFICACIÓ DE CLIENT (KYC) - PERSONA JURÍDICA'
      : 'FORMULARI IDENTIFICACIÓ DE CLIENT (KYC) - PERSONA FÍSICA'
  doc.text(titleText, pageWidth / 2, yPosition, {
    align: 'center'
  })
  doc.setTextColor(0, 0, 0)
  yPosition += 15

  // Disclaimer
  yPosition = addDisclaimer('Ancei Consultoria Estratègica Internacional SA')

  // Render based on form type
  if (formType === 'legal') {
    renderLegalForm()
  } else {
    renderNaturalForm()
  }

  function renderNaturalForm() {
    // DADES PERSONALS
    addSectionHeader('DADES PERSONALS')
    addField('Nom i Cognoms', formData.fullName || '')
    addField('Data de Naixement', formData.birthDate || '')
    addField('País de Naixement', formData.birthCountry || '')
    addField('Nacionalitat', formData.nationality || '')
    addField('Tipus de Document', formData.documentType?.toUpperCase())
    addField('Número de Document', formData.documentNumber || '')
    addField(
      'Gènere',
      formData.gender === 'male'
        ? 'Home'
        : formData.gender === 'female'
          ? 'Dona'
          : 'N/A'
    )
    addField(
      'Activitat Professional',
      formatProfessionalActivity(formData.professionalActivity || '')
    )
    addField('Càrrec Ocupat', formData.profession || '')
    addField('Estat Civil', formData.maritalStatus || '')
    addField('Nom i Cognoms Parella', formData.partnerFullName || '')
    addField(
      'Règim Econòmic Matrimonial',
      formatMaritalRegime(formData.maritalEconomicRegime || '')
    )
    addField('Telèfon de Contacte', formData.phone || '')
    addField('Correu Electrònic', formData.email || '')
    yPosition += 5

    renderAddresses()
    renderDeclarations1()
    renderBusinessInfo()
    renderPEPSection(relatedPersons)
  }

  function renderLegalForm() {
    // DADES DE LA SOCIETAT
    addSectionHeader('DADES DE LA SOCIETAT')
    addField('Raó social', formData.companyName || '')
    addField('Telèfon / Mòbil', formData.companyPhone || '')
    addField('Correu electrònic', formData.companyEmail || '')
    addField('Data de constitució', formData.registrationDate || '')
    addField('Lloc de constitució', formData.registrationCity || '')
    addField('NIF/NRT', formData.taxId || '')
    addField('Objecte social', formData.companyPurpose || '')
    addField('Àmbit geogràfic', formData.geographicScope || '')
    addField('Facturació anual', formData.annualRevenue || '')
    yPosition += 5

    renderAddresses()

    // SUCURSALS
    addSectionHeader('SUCURSALS')
    addField('Té sucursals', formData.hasBranches || '')
    if (formData.hasBranches === 'yes') {
      addField('Detalls de sucursals', formData.branchesDetails || '')
    }
    addField('És matriu', formData.isMainBranch || '')
    if (formData.isMainBranch === 'yes') {
      addField('Detalls matriu', formData.mainBranchDetails || '')
    }
    addField(
      'Cotitza en mercat regulat',
      formData.isListedOnRegulatedMarket || ''
    )
    if (formData.isListedOnRegulatedMarket === 'yes') {
      addField('Detalls mercat regulat', formData.regulatedMarketDetails || '')
    }
    yPosition += 5

    renderBusinessInfo()

    // ÒRGAN D'ADMINISTRACIÓ
    if (managementMembers.length > 0) {
      const filledMembers = managementMembers.filter(m => m.fullName)
      if (filledMembers.length > 0) {
        addSectionHeader("ÒRGAN D'ADMINISTRACIÓ")
        filledMembers.forEach((member, index) => {
          checkPageBreak(25)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.text(`Membre ${index + 1}:`, margin, yPosition)
          yPosition += 5
          addField('Nom Complet', member.fullName)
          addField('Càrrec', member.position || '')
          addField('Document', member.documentNumber || '')
          addField('Data Naixement', member.dateOfBirth || '')
          yPosition += 3
        })
      }
    }

    // ACCIONISTES
    if (shareholders.length > 0) {
      const filledShareholders = shareholders.filter(s => s.fullName)
      if (filledShareholders.length > 0) {
        addSectionHeader('ACCIONISTES')
        filledShareholders.forEach((shareholder, index) => {
          checkPageBreak(25)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.text(`Accionista ${index + 1}:`, margin, yPosition)
          yPosition += 5
          addField('Nom Complet', shareholder.fullName)
          addField('Document', shareholder.documentNumber || '')
          addField('Percentatge', shareholder.ownershipPercentage || '')
          addField('Activitat', shareholder.professionalActivity || '')
          yPosition += 3
        })
      }
    }

    // UBOs
    if (ubos.length > 0) {
      const filledUbos = ubos.filter(u => u.fullName)
      if (filledUbos.length > 0) {
        addSectionHeader('BENEFICIARIS EFECTIUS (UBO)')
        filledUbos.forEach((ubo, index) => {
          checkPageBreak(20)
          doc.setFontSize(9)
          doc.setFont('helvetica', 'bold')
          doc.text(`UBO ${index + 1}:`, margin, yPosition)
          yPosition += 5
          addField('Nom Complet', ubo.fullName)
          addField('Nacionalitat', ubo.nationality || '')
          addField('Document', ubo.documentNumber || '')
          addField('Posició', ubo.position || '')
          yPosition += 3
        })
      }
    }

    // REPRESENTANT
    addSectionHeader('REPRESENTANT DE LA SOCIETAT')
    addField('Nom i Cognoms', formData.representativeFullName || '')
    addField('Data de Naixement', formData.representativeDateOfBirth || '')
    addField('País Naixement', formData.representativeCountryOfBirth || '')
    addField('Nacionalitat', formData.representativeNationality || '')
    addField('Tipus Document', formData.representativeDocumentType || '')
    addField('Número Document', formData.representativeDocumentNumber || '')
    addField('Gènere', formData.representativeGender || '')
    addField(
      'Activitat Professional',
      formData.representativeProfessionalActivity || ''
    )
    addField('Càrrec', formData.representativeProfession || '')
    addField('Telèfon', formData.representativePhone || '')
    addField('Correu', formData.representativeEmail || '')
    yPosition += 5

    renderDeclarations1()
    renderPEPSection(relatedPersons)
  }

  function renderAddresses() {
    checkPageBreak(40)
    addSectionHeader('DOMICILI')

    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(192, 0, 0)
    doc.text('DOMICILI FISCAL:', margin, yPosition)
    doc.setTextColor(0, 0, 0)
    yPosition += 7

    addField('Adreça', formData.fiscalAddress || '')
    addField('Codi Postal', formData.fiscalPostalCode || '')
    addField('Localitat', formData.fiscalCity || '')
    addField('País', formData.fiscalCountry || '')
    yPosition += 5

    if (formData.postalAddress) {
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.setTextColor(192, 0, 0)
      doc.text('DOMICILI POSTAL:', margin, yPosition)
      doc.setTextColor(0, 0, 0)
      yPosition += 7

      addField('Adreça', formData.postalAddress)
      addField('Codi Postal', formData.postalPostalCode || '')
      addField('Localitat', formData.postalCity || '')
      addField('País', formData.postalCountry || '')
      yPosition += 5
    }
  }

  function renderDeclarations1() {
    checkPageBreak(40)
    addSectionHeader('DECLARACIONS')
    addField(
      'Fons NO relacionats amb blanqueig',
      formData.fundsNotFromMoneyLaundering || ''
    )
    if (formData.fundsSource) {
      addField('Procedència dels fons', formData.fundsSourceDetails || '')
    }
    addField('Actua per compte propi', formData.actingOnOwnBehalf || '')
    if (formData.actingOnBehalfOfThirdParty) {
      addField('Tercer representat', formData.thirdPartyRepresented || '')
    }
    yPosition += 5
  }

  function renderBusinessInfo() {
    checkPageBreak(40)
    addSectionHeader('PROPÒSIT I ÍNDOLE DE LA RELACIÓ DE NEGOCI')

    if (formData.businessPurpose) {
      checkPageBreak(30)
      doc.setFontSize(9)
      doc.setFont('helvetica', 'bold')
      doc.text('Motiu:', margin, yPosition)
      yPosition += 5
      doc.setFont('helvetica', 'normal')
      const businessLines = doc.splitTextToSize(
        formData.businessPurpose,
        pageWidth - 2 * margin
      )
      doc.text(businessLines, margin, yPosition)
      yPosition += businessLines.length * 5 + 5
    }

    addField('Ús habitual de diners en efectiu', formData.cashUsage || '')
    addField('Sector de risc', formData.isRiskySector || '')
    if (formData.isRiskySector === 'yes' && formData.riskySector) {
      addField('Tipus de sector', formatRiskySector(formData.riskySector))
    }
    yPosition += 5
  }

  function renderPEPSection(people: FormRelatedPerson[]) {
    checkPageBreak(40)
    addSectionHeader('PERSONA POLÍTICAMENT EXPOSADA (PEP)')

    if (formType === 'natural') {
      addField('És PEP', formData.isPEP || '')
      addField(
        'Desenvolupa càrrec públic (propi)',
        formData.isSelfExposed || ''
      )
      addField(
        'Desenvolupa càrrec públic (família)',
        formData.isFamilyExposed || ''
      )
      addField(
        'Desenvolupa càrrec públic (persones afins)',
        formData.isAssociatesExposed || ''
      )
    } else {
      addField(
        'Ha exercit funció pública',
        formData.hasHeldPublicFunction || ''
      )
      addField(
        'Família ha exercit funció pública',
        formData.familyHasHeldPublicFunction || ''
      )
      addField(
        'Persones afins han exercit funció pública',
        formData.closePersonHasHeldPublicFunction || ''
      )
    }
    yPosition += 5

    const filledPeople = people.filter(p => p.fullName)
    if (filledPeople.length > 0) {
      checkPageBreak(60)
      doc.setFontSize(10)
      doc.setFont('helvetica', 'bold')
      doc.text('PERSONES RELACIONADES', margin, yPosition)
      yPosition += 10

      filledPeople.forEach((person, index) => {
        checkPageBreak(25)
        doc.setFontSize(9)
        doc.setFont('helvetica', 'bold')
        doc.text(`Persona ${index + 1}:`, margin, yPosition)
        yPosition += 5

        addField('Nom Complet', person.fullName)
        addField('Càrrec', person.position || '')
        addField('Període', person.period || '')
        addField('País', person.country || '')
        addField('Relació', person.relationship || '')
        yPosition += 3
      })
    }
  }

  renderDueDiligenceSection()

  // FINAL DECLARATIONS
  checkPageBreak(40)
  addSectionHeader('DECLARO')
  addField(
    'Autoritza verificació de dades',
    formData.authorizedVerification || ''
  )
  addField('No està en procediment tributari', formData.noTaxProcedure || '')
  addField('Origen lícit dels fons', formData.legalFundsOrigin || '')
  yPosition += 10

  // SIGNATURE
  if (signatureDataUrl) {
    checkPageBreak(50)
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    const signatureLabel =
      formType === 'legal'
        ? 'SIGNATURA DEL REPRESENTANT:'
        : 'SIGNATURA DEL CLIENT:'
    doc.text(signatureLabel, margin, yPosition)
    yPosition += 10

    try {
      doc.addImage(signatureDataUrl, 'PNG', margin, yPosition, 80, 30)
      yPosition += 35
    } catch (error) {
      console.error('Error adding signature to PDF:', error)
      doc.setFont('helvetica', 'italic')
      doc.setFontSize(9)
      doc.text('(Signatura no disponible)', margin, yPosition)
      yPosition += 10
    }

    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    const nameField =
      formType === 'legal'
        ? formData.representativeFullName || 'Representant Legal'
        : formData.fullName || 'Client'
    doc.text(`Nom i Cognoms: ${nameField}`, margin, yPosition)
    yPosition += 5
    doc.text(
      `Data: ${new Date().toLocaleDateString('ca-ES')}`,
      margin,
      yPosition
    )
  }

  // Footer on all pages
  const pageCount = doc.internal.pages.length - 1
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'italic')
    doc.setTextColor(128, 128, 128)
    doc.text(
      `Pàgina ${i} de ${pageCount}`,
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'center' }
    )
    doc.text(
      'ANCEI Consultoria Estratègica Internacional SA',
      pageWidth / 2,
      doc.internal.pageSize.getHeight() - 5,
      { align: 'center' }
    )
  }

  // Save the PDF
  const clientIdentifier =
    formType === 'legal' ? formData.companyName : formData.fullName
  const fileName = `KYC_${clientIdentifier?.replace(/\s+/g, '_') || 'Client'}_${new Date().toISOString().split('T')[0]}.pdf`
  doc.save(fileName)
}

// Helper functions for formatting
const formatProfessionalActivity = (activity: string | undefined) => {
  const activities: Record<string, string> = {
    liberal_professional: 'Professional liberal',
    employee: 'Treballa per compte aliè',
    unemployed: 'No treballa',
    business_owner: 'Empresari/a',
    self_employed: 'Autònom/a',
    receives_income: 'Rep rendes públiques / privades',
    retired: 'Jubilat/da que rep una pensió'
  }
  return activities[activity || ''] || activity || 'N/A'
}

const formatMaritalRegime = (regime: string | undefined) => {
  const regimes: Record<string, string> = {
    separation_of_property: 'Separació de béns',
    community_property: 'Béns ganancials'
  }
  return regimes[regime || ''] || regime || 'N/A'
}

const formatRiskySector = (sector: string | undefined) => {
  const sectors: Record<string, string> = {
    ecommerce: 'Comerç electrònic / Informàtic',
    crypto: 'Monedes virtuals',
    gambling: "Casinos / Apostes / Jocs d'atzar",
    import_export: 'Comerç internacional',
    jewelry: 'Joieria / Metalls preciosos',
    art: 'Art / Antiquari',
    public_works: 'Obra pública',
    military: 'Indústria militar',
    construction: 'Construcció / Immobiliària',
    mining: 'Mineria',
    money_transfer: 'Enviament de diners',
    scrap: 'Ferralla'
  }
  return sectors[sector || ''] || sector || 'N/A'
}
