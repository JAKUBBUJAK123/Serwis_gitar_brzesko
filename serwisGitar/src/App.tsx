import './App.css'
import MainPage from './components/MainPage'
import GaleriaPage from './components/GaleriaPage'
import {Routes, Route} from 'react-router-dom'
function App() {

  return (
    <>
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/galeria" element={<GaleriaPage />} />
    </Routes>
    </> 
  )
}

export default App
