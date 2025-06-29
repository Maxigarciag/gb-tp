import React from "react";
import "../styles/about.css"; // ✅ Si tienes un archivo de estilos

function About() {
  return (
    <div className="about-container">
      <h1>Sobre Nosotros</h1>
      <p>
        Bienvenido a <strong>Get Big</strong>, una plataforma diseñada para ayudar a quienes quieren comenzar en el mundo del fitness pero no saben por dónde empezar. 🎯
      </p>
      <p>
        Nuestra misión es eliminar la confusión que existe en el entrenamiento, proporcionando rutinas personalizadas basadas en tu nivel, objetivos y disponibilidad de tiempo. 💪
      </p>
      <h2>💡 ¿Qué ofrecemos?</h2>
      <ul>
        <li>🏋️ Rutinas adaptadas a tu experiencia y metas.</li>
        <li>📅 Un plan estructurado para que entrenes de manera eficiente.</li>
        <li>🧠 Consejos básicos para mejorar tu técnica y evitar lesiones.</li>
      </ul>
      <h2>🚀 ¿Hacia dónde vamos?</h2>
      <p>
        En el futuro, queremos llevar esta experiencia a la palma de tu mano con una app móvil, haciendo que el acceso a tus entrenamientos sea aún más fácil y dinámico. 🌍📱
      </p>
      <p>
        Nos apasiona el fitness y creemos que todos pueden mejorar su salud con un poco de guía y motivación. ¡Nos alegra que formes parte de nuestra comunidad! 💙
      </p>
    </div>
  );
}

export default About;

  