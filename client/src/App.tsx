import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import Landing from './pages/Landing';
import Spaces from './pages/Spaces';
import Create from './pages/Create';
import Workspace from './pages/Workspace';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/spaces" element={<Spaces />} />
        <Route path="/create" element={<Create />} />
        <Route path="/workspace" element={<Workspace />} />
        <Route path="/workspace/:spaceId" element={<Workspace />} />
      </Routes>
    </BrowserRouter>
  );
}
