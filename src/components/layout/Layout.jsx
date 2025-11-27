import React from 'react'
import PropTypes from 'prop-types'
import { motion } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import '../../styles/Layout.css'

/**
 * Componente de layout principal de la aplicación con animaciones de página
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a renderizar en el layout
 */
function Layout ({ children }) {
	const location = useLocation()

	// Variantes de animación para transiciones de página
	const pageVariants = {
		initial: {
			opacity: 0,
			x: 20
		},
		in: {
			opacity: 1,
			x: 0
		},
		out: {
			opacity: 0,
			x: -20
		}
	}

	const pageTransition = {
		type: "tween",
		ease: "anticipate",
		duration: 0.3
	}

	return (
		<div className="app-layout">
			<motion.main 
				className="main-content"
				key={location.pathname}
				initial="initial"
				animate="in"
				exit="out"
				variants={pageVariants}
				transition={pageTransition}
			>
				{children}
			</motion.main>
		</div>
	)
}

Layout.propTypes = {
	children: PropTypes.node.isRequired
}

export default Layout 