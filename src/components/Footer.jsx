import React from "react";
import "../styles/Footer.css";
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content container">
        <div className="footer-brand">
          <h2 className="brand-name">
            <span className="brand-icon">👋</span> Get Big
          </h2>
          <p className="brand-tagline">Tu guía personalizada para el gimnasio</p>
        </div>
        
        <div className="footer-links">
          <div className="footer-column">
            <h3>Enlaces</h3>
            <ul>
              <li><a href="#">Inicio</a></li>
              <li><a href="#">Mi Rutina</a></li>
              <li><a href="#">Nutrición</a></li>
              <li><a href="#">Progreso</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Recursos</h3>
            <ul>
              <li><a href="#">Blog</a></li>
              <li><a href="#">Ejercicios</a></li>
              <li><a href="#">Recetas</a></li>
              <li><a href="#">Calculadoras</a></li>
            </ul>
          </div>
          
          <div className="footer-column">
            <h3>Contacto</h3>
            <ul>
              <li><a href="#">Soporte</a></li>
              <li><a href="#">Preguntas frecuentes</a></li>
              <li><a href="#">Política de privacidad</a></li>
              <li><a href="#">Términos de uso</a></li>
            </ul>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <div className="container footer-bottom-content">
          <p className="copyright">© 2023 Get Big. Todos los derechos reservados.</p>
          <div className="social-icons">
            <a href="#" aria-label="Facebook"><Facebook size={18} /></a>
            <a href="#" aria-label="Instagram"><Instagram size={18} /></a>
            <a href="#" aria-label="Twitter"><Twitter size={18} /></a>
            <a href="#" aria-label="YouTube"><Youtube size={18} /></a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
