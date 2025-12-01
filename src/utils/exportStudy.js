/**
 * Utilidades para exportar estudios corporales como imagen o PDF
 */

import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

/**
 * Exporta un estudio como imagen PNG
 */
export const exportStudyAsImage = async (elementId, filename = 'estudio-corporal') => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Elemento no encontrado')
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    })

    const imgData = canvas.toDataURL('image/png')
    const link = document.createElement('a')
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.png`
    link.href = imgData
    link.click()
    
    return { success: true }
  } catch (error) {
    console.error('Error al exportar como imagen:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Exporta un estudio como PDF
 */
export const exportStudyAsPDF = async (elementId, filename = 'estudio-corporal', studyData = null) => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Elemento no encontrado')
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#ffffff',
      scale: 2,
      logging: false,
      useCORS: true
    })

    const imgData = canvas.toDataURL('image/png')
    const pdf = new jsPDF('p', 'mm', 'a4')
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 20

    // Agregar título si hay datos del estudio
    if (studyData) {
      pdf.setFontSize(16)
      pdf.text('Estudio de Composición Corporal', pdfWidth / 2, 15, { align: 'center' })
      
      if (studyData.fecha) {
        pdf.setFontSize(10)
        const fecha = new Date(studyData.fecha).toLocaleDateString('es-AR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
        pdf.text(`Fecha: ${fecha}`, pdfWidth / 2, 25, { align: 'center' })
      }
    }

    pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    pdf.save(`${filename}-${new Date().toISOString().slice(0, 10)}.pdf`)
    
    return { success: true }
  } catch (error) {
    console.error('Error al exportar como PDF:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Exporta datos del estudio como JSON
 */
export const exportStudyAsJSON = (studyData, filename = 'estudio-corporal') => {
  try {
    const dataStr = JSON.stringify(studyData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${filename}-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
    
    return { success: true }
  } catch (error) {
    console.error('Error al exportar como JSON:', error)
    return { success: false, error: error.message }
  }
}

