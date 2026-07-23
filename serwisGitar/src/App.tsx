import "./App.css";
import MainPage from "./components/MainPage";
import GaleriaPage from "./components/GaleriaPage";
import WypozyczeniaPage from "./components/WypozyczeniaPage";
import { Routes, Route } from "react-router-dom";
function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<MainPage />} />
        <Route path="/galeria" element={<GaleriaPage />} />
        <Route path="/wypozyczenia" element={<WypozyczeniaPage />} />
      </Routes>
    </>
  );
}

export default App;
