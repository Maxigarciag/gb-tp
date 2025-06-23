import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Formulario from "./components/Formulario";
import CalendarioRutina from "./components/CalendarioRutina";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PlanEntrenamiento from "./components/PlanEntrenamiento";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <Router>
  <Navbar />
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/about" element={<About />} />
    <Route path="/contact" element={<Contact />} />
    <Route path="/plan-entrenamiento" element={<PlanEntrenamiento />} />
    <Route path="/rutina" element={<CalendarioRutina />} /> {/* ✅ Ahora la URL es `/rutina` */}
  </Routes>
  <Footer />
</Router>
  );
}

export default App;
