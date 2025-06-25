import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/home";
import About from "./pages/About";
import Contact from "./pages/Contact";
import CalendarioRutina from "./components/CalendarioRutina";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

function App() {
  return (
    <AuthProvider>
      <Router>
        <ProtectedRoute>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/rutina" element={<CalendarioRutina />} />
          </Routes>
          <Footer />
        </ProtectedRoute>
      </Router>
    </AuthProvider>
  );
}

export default App;