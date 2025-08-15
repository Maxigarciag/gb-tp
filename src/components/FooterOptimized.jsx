import React, { useMemo, useCallback } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";
import { useUIStore } from "../stores";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart,
  Dumbbell,
  TrendingUp,
  Users,
  BookOpen
} from 'lucide-react';
import "../styles/Footer.css";

const FooterOptimized = () => {
  const location = useLocation();
  const { theme, scrollToTop } = useUIStore();
  const shouldReduceMotion = useReducedMotion();

  // Memoizar el año actual
  const currentYear = useMemo(() => new Date().getFullYear(), []);

  // Memoizar los enlaces del footer
  const footerLinks = useMemo(() => ({
    enlaces: [
      { name: "Inicio", path: "/", icon: <Dumbbell size={16} /> },
      { name: "Mi Rutina", path: "/rutina", icon: <TrendingUp size={16} /> },
      { name: "Perfil", path: "/profile", icon: <Users size={16} /> },
      { name: "Blog", path: "/blog", icon: <BookOpen size={16} /> }
    ],
    recursos: [
      { name: "Ejercicios", path: "/ejercicios", icon: <Dumbbell size={16} /> },
      { name: "Nutrición", path: "/nutricion", icon: <Heart size={16} /> },
      { name: "Calculadoras", path: "/calculadoras", icon: <TrendingUp size={16} /> },
      { name: "Guías", path: "/guias", icon: <BookOpen size={16} /> }
    ],
    contacto: [
      { name: "Soporte", path: "/soporte", icon: <Mail size={16} /> },
      { name: "FAQ", path: "/faq", icon: <BookOpen size={16} /> },
      { name: "Privacidad", path: "/privacidad", icon: <Users size={16} /> },
      { name: "Términos", path: "/terminos", icon: <BookOpen size={16} /> }
    ]
  }), []);

  // Memoizar las redes sociales
  const socialLinks = useMemo(() => [
    { 
      name: "Facebook", 
      icon: <Facebook size={18} />, 
      url: "https://facebook.com/getbig",
      color: "#1877f2"
    },
    { 
      name: "Instagram", 
      icon: <Instagram size={18} />, 
      url: "https://instagram.com/getbig",
      color: "#e4405f"
    },
    { 
      name: "Twitter", 
      icon: <Twitter size={18} />, 
      url: "https://twitter.com/getbig",
      color: "#1da1f2"
    },
    { 
      name: "YouTube", 
      icon: <Youtube size={18} />, 
      url: "https://youtube.com/getbig",
      color: "#ff0000"
    }
  ], []);

  // Manejar clic en enlaces con callback optimizado
  const handleLinkClick = useCallback(() => {
    scrollToTop();
  }, [scrollToTop]);

  // Animaciones optimizadas
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { 
        duration: 0.6,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4 }
    }
  };

  const socialVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3 }
    },
    hover: { 
      scale: 1.1,
      transition: { duration: 0.2 }
    }
  };

  // Renderizar columna de enlaces
  const renderLinkColumn = (title, links, index) => (
    <motion.div 
      className="footer-column"
      variants={itemVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-50px" }}
    >
      <motion.h3 
        className="column-title"
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.1 }}
      >
        {title}
      </motion.h3>
      <ul className="column-links">
        {links.map((link, linkIndex) => (
          <motion.li 
            key={link.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ delay: (index * 0.1) + (linkIndex * 0.05) }}
          >
            <Link 
              to={link.path} 
              onClick={handleLinkClick}
              className={location.pathname === link.path ? 'active' : ''}
              aria-current={location.pathname === link.path ? 'page' : undefined}
            >
              <span className="link-icon" aria-hidden="true">{link.icon}</span>
              {link.name}
            </Link>
          </motion.li>
        ))}
      </ul>
    </motion.div>
  );

  return (
    <motion.footer 
      className="footer"
      role="contentinfo"
      aria-labelledby="footer-brand-title"
      variants={containerVariants}
      initial={shouldReduceMotion ? false : "hidden"}
      whileInView={shouldReduceMotion ? undefined : "visible"}
      viewport={{ once: true, margin: "-100px" }}
    >
      <div className="footer-content container">
        {/* Sección de marca */}
        <motion.div 
          className="footer-brand"
          variants={itemVariants}
        >
          <motion.h2 
            className="brand-name"
            id="footer-brand-title"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <motion.span 
              className="brand-icon"
              animate={{ 
                rotate: [0, 10, -10, 0],
                scale: [1, 1.1, 1]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                repeatDelay: 3
              }}
            >
              💪
            </motion.span>
            Get Big
          </motion.h2>
          <motion.p 
            className="brand-tagline"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Tu guía personalizada para alcanzar tus objetivos fitness
          </motion.p>
          
          {/* Información de contacto */}
          <motion.div 
            className="contact-info"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className="contact-item">
              <Mail size={16} />
              <span>contacto@getbig.com</span>
            </div>
            <div className="contact-item">
              <Phone size={16} />
              <span>+1 (555) 123-4567</span>
            </div>
            <div className="contact-item">
              <MapPin size={16} />
              <span>Fitness Street, 123</span>
            </div>
          </motion.div>
        </motion.div>
        
        {/* Enlaces del footer */}
        <motion.div 
          className="footer-links"
          variants={itemVariants}
        >
          {renderLinkColumn("Enlaces", footerLinks.enlaces, 0)}
          {renderLinkColumn("Recursos", footerLinks.recursos, 1)}
          {renderLinkColumn("Contacto", footerLinks.contacto, 2)}
        </motion.div>
      </div>
      
      {/* Sección inferior */}
      <motion.div 
        className="footer-bottom"
        variants={itemVariants}
      >
        <div className="container footer-bottom-content">
          <motion.p 
            className="copyright"
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            © {currentYear} Get Big. Hecho con 
            <motion.span 
              className="heart-icon"
              animate={{ 
                scale: [1, 1.2, 1],
                color: ["#ff6b6b", "#ff4757", "#ff6b6b"]
              }}
              transition={{ 
                duration: 1,
                repeat: Infinity,
                repeatDelay: 2
              }}
            >
              ❤️
            </motion.span>
            para la comunidad fitness.
          </motion.p>
          
          <motion.div 
            className="social-icons"
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            {socialLinks.map((social, index) => (
              <motion.a
                key={social.name}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                variants={socialVariants}
                initial="hidden"
                whileInView="visible"
                whileHover="hover"
                transition={{ delay: index * 0.1 }}
                style={{ '--social-color': social.color }}
              >
                {social.icon}
              </motion.a>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </motion.footer>
  );
};

export default FooterOptimized; 