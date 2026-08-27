import { Routes, Route, Outlet } from 'react-router'
import Home from './components/Home.jsx'


function App() {
  return (
    <Routes>
        <Route path="/" element={<Home />} />
    </Routes>
  )
}

export default App
