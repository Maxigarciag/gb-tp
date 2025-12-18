import React from 'react';
import { Mail, MessageCircle, Phone, MapPin, Clock, ShieldCheck, Send } from 'lucide-react';
import '@/styles/pages/contact.css';

function Contact () {
  const channels = [
    {
      id: 'general',
      title: 'Consultas generales',
      description: 'Resolvemos dudas sobre planes, funciones y próximos lanzamientos.',
      icon: Mail,
      points: [
        'Elección de plan o rutina inicial.',
        'Estado de tu cuenta y acceso.',
        'Comentarios o ideas para mejorar la app.'
      ]
    },
    {
      id: 'soporte',
      title: 'Soporte técnico',
      description: 'Si algo no carga o ves un error, cuéntanos qué pasó y lo revisamos rápido.',
      icon: MessageCircle,
      points: [
        'Problemas de login o recuperación de contraseña.',
        'Fallos en rutinas o registro de progreso.',
        'Bugs en móvil o desktop.'
      ]
    },
    {
      id: 'alianzas',
      title: 'Alianzas y comunidad',
      description: 'Entrenadores, creadores o marcas que quieran colaborar con Get Big.',
      icon: Phone,
      points: [
        'Workshops o eventos conjuntos.',
        'Beneficios para equipos o grupos.',
        'Notas de prensa o demos.'
      ]
    }
  ];

  const faqs = [
    {
      id: 'tiempos',
      question: '¿En cuánto tiempo responden?',
      answer: 'Respondemos en 24-48 h hábiles. Los reportes críticos se priorizan y suelen tener respuesta el mismo día.'
    },
    {
      id: 'llamadas',
      question: '¿Puedo agendar una llamada?',
      answer: 'Sí. Indica tus horarios (GMT-3) y si prefieres videollamada o audio; te enviaremos un enlace de calendario.'
    },
    {
      id: 'detalles',
      question: '¿Qué información les ayuda?',
      answer: 'Incluye capturas, dispositivo, navegador y hora aproximada del problema. Si es sobre rutinas, añade el ejercicio afectado.'
    }
  ];

  return (
    <main className="contact-page">
      <section className="contact-hero">
        <p className="contact-eyebrow">Contacto</p>
        <h1>Hablemos sobre tu entrenamiento y la app</h1>
        <p>
          Si no tienes sesión iniciada, igual puedes escribirnos. Te ayudamos a escoger el plan adecuado, resolver incidencias o coordinar una demo.
        </p>

        <div className="contact-actions">
          <a
            className="contact-button primary"
            href="mailto:contacto@getbig.com?subject=Consulta%20Get%20Big"
            aria-label="Escribir un correo a contacto@getbig.com"
          >
            <Mail size={18} />
            Escribir por correo
          </a>

          <a
            className="contact-button secondary"
            href="https://wa.me/5491122334455?text=Hola%20Get%20Big"
            target="_blank"
            rel="noreferrer"
            aria-label="Abrir conversación de WhatsApp"
          >
            <MessageCircle size={18} />
            WhatsApp directo
          </a>
        </div>
      </section>

      <section className="contact-grid">
        {channels.map((channel) => {
          const Icon = channel.icon;

          return (
            <article key={channel.id} className="contact-card">
              <div className="contact-card-icon">
                <Icon size={20} />
              </div>
              <h3>{channel.title}</h3>
              <p>{channel.description}</p>
              <ul>
                {channel.points.map((point) => (
                  <li key={point}>{point}</li>
                ))}
              </ul>
            </article>
          );
        })}
      </section>

      <section className="contact-meta">
        <div className="meta-card">
          <div className="meta-title">
            <Clock size={18} />
            <span>Tiempos y horarios</span>
          </div>
          <ul>
            <li>Horario de atención: Lun a Vie, 9:00 a 18:00 (GMT-3).</li>
            <li>Primer respuesta estimada: 24-48 h hábiles.</li>
            <li>Urgencias: priorizamos bloqueos de acceso o fallos críticos.</li>
          </ul>
        </div>

        <div className="meta-card">
          <div className="meta-title">
            <ShieldCheck size={18} />
            <span>Qué ocurre luego</span>
          </div>
          <ul>
            <li>Confirmamos recepción y compartimos el número de ticket interno.</li>
            <li>Si necesitas una demo, enviamos agenda con tres opciones de horario.</li>
            <li>Para soporte técnico, pediremos pasos para reproducir y dispositivo.</li>
          </ul>
        </div>
      </section>

      <section className="contact-faq">
        <div className="faq-header">
          <Send size={18} />
          <div>
            <h3>Respuestas rápidas</h3>
            <p>Lo esencial para que tu mensaje llegue completo a la primera.</p>
          </div>
        </div>

        <div className="faq-list">
          {faqs.map((faq) => (
            <details key={faq.id}>
              <summary>{faq.question}</summary>
              <p>{faq.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="contact-location">
        <div className="meta-card">
          <div className="meta-title">
            <MapPin size={18} />
            <span>Operamos en remoto</span>
          </div>
          <p className="location-text">
            Atendemos de forma 100% remota desde Argentina. Si coordinamos una llamada, te enviaremos un enlace seguro por correo.
          </p>
        </div>
      </section>
    </main>
  );
}

export default Contact;
  