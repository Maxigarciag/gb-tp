import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import { FaDownload, FaFilePdf, FaFileImage, FaFileCode, FaSpinner } from 'react-icons/fa'
import { exportStudyAsImage, exportStudyAsPDF, exportStudyAsJSON } from '../../utils/exportStudy'
import '../../styles/components/progreso/StudyExportButton.css'

const StudyExportButton = ({ studyData, elementId, className = '' }) => {
  const [exporting, setExporting] = useState(false)
  const [exportType, setExportType] = useState(null)
  const menuRef = useRef(null)

  const handleExport = async (type) => {
    if (!elementId) {
      alert('Error: No se puede exportar sin un elemento de referencia')
      return
    }

    setExporting(true)
    setExportType(type)

    try {
      let result
      const filename = `estudio-${studyData?.fecha || 'corporal'}`

      switch (type) {
        case 'image':
          result = await exportStudyAsImage(elementId, filename)
          break
        case 'pdf':
          result = await exportStudyAsPDF(elementId, filename, studyData)
          break
        case 'json':
          result = exportStudyAsJSON(studyData, filename)
          break
        default:
          result = { success: false, error: 'Tipo de exportación no válido' }
      }

      if (!result.success) {
        alert(`Error al exportar: ${result.error}`)
      }
    } catch (error) {
      console.error('Error en exportación:', error)
      alert('Error al exportar el estudio')
    } finally {
      setExporting(false)
      setExportType(null)
      // Cerrar menú si está abierto
      if (menuRef.current) {
        menuRef.current.classList.remove('open')
      }
    }
  }

  const toggleMenu = () => {
    if (menuRef.current) {
      menuRef.current.classList.toggle('open')
    }
  }

  return (
    <div className={`study-export-container ${className}`}>
      <button
        className="study-export-btn"
        onClick={toggleMenu}
        disabled={exporting}
        aria-label="Exportar estudio"
      >
        {exporting ? (
          <>
            <FaSpinner className="spinning" />
            <span>Exportando...</span>
          </>
        ) : (
          <>
            <FaDownload />
            <span>Exportar</span>
          </>
        )}
      </button>

      <div ref={menuRef} className="study-export-menu">
        <button
          className="export-menu-item"
          onClick={() => handleExport('image')}
          disabled={exporting || exportType === 'image'}
        >
          <FaFileImage />
          <span>Imagen (PNG)</span>
        </button>
        <button
          className="export-menu-item"
          onClick={() => handleExport('pdf')}
          disabled={exporting || exportType === 'pdf'}
        >
          <FaFilePdf />
          <span>PDF</span>
        </button>
        <button
          className="export-menu-item"
          onClick={() => handleExport('json')}
          disabled={exporting || exportType === 'json'}
        >
          <FaFileCode />
          <span>JSON</span>
        </button>
      </div>
    </div>
  )
}

StudyExportButton.propTypes = {
  studyData: PropTypes.object,
  elementId: PropTypes.string.isRequired,
  className: PropTypes.string
}

export default StudyExportButton

