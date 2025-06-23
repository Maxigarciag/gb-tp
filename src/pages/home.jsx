import React from "react";
import Formulario from "../components/Formulario"; // ✅ Agregado

function Home() {
  return (
    <div className="home-container">
      <Formulario /> {/* ✅ Renderiza el formulario en Home */}
    </div>
  );
}

export default Home;
