import React from 'react'
import PropTypes from 'prop-types'
import '../styles/Layout.css'

/**
 * Componente de layout principal de la aplicación
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar en el layout
 */
function Layout ({ children }) {
	return (
		<div className="app-layout">
			<main className="main-content">
				{children}
			</main>
		</div>
	)
}

Layout.propTypes = {
	children: PropTypes.node.isRequired
}

export default Layout 