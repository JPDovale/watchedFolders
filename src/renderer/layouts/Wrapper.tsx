import { Folders, List, Map } from 'lucide-react';
import { Outlet, useNavigate } from 'react-router-dom';

export function Wrapper() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-screen bg-zinc-200 shadow-md">
      <header className="flex gap-1 p-1 leading-none">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="bg-purple-500 p-1.5 rounded-md shadow-md text-white hover:shadow-lg hover:shadow-black/70 ease-in-out duration-300"
        >
          <Folders size={14} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/artefact')}
          className="bg-purple-500 p-1.5 rounded-md shadow-md text-white hover:shadow-lg hover:shadow-black/70 ease-in-out duration-300"
        >
          <List size={14} />
        </button>

        <button
          type="button"
          onClick={() => navigate('/mappers')}
          className="bg-purple-500 p-1.5 rounded-md shadow-md text-white hover:shadow-lg hover:shadow-black/70 ease-in-out duration-300"
        >
          <Map size={14} />
        </button>
      </header>
      <Outlet />
    </div>
  );
}
