import 'tailwindcss/tailwind.css';
import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { HomePage } from './pages/home';
import { Wrapper } from './layouts/Wrapper';
import { ArtefactPage } from './pages/artefact';
import { useArtefacts } from './store/artefacts';
import { AutoMappersPage } from './pages/autoMappers';

export default function App() {
  const { loading, setup } = useArtefacts((state) => ({
    loading: state.loading,
    setup: state.setup,
  }));

  useEffect(() => {
    setup();
  }, [setup]);

  if (loading) {
    return (
      <div className="w-screen h-screen flex justify-center items-center bg-purple-500 ">
        <span className="text-white font-extrabold text-sm">CARREGANDO...</span>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Wrapper />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/artefact" element={<ArtefactPage />} />
          <Route path="/mappers" element={<AutoMappersPage />} />
        </Route>
      </Routes>
    </Router>
  );
}
