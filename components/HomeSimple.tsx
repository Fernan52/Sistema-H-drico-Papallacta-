import React from 'react';
import Header from './Header';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-slate-900 text-white">
      <Header />
      
      <main className="p-4 sm:p-6 lg:p-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">
            Sistema de Monitoreo Meteorológico de Papallacta
          </h2>
          
          <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
            <h3 className="text-xl font-bold text-white mb-4">
              Mapa del Sistema Hídrico
            </h3>
            <div className="h-96 rounded-lg overflow-hidden bg-slate-700 flex items-center justify-center">
              <p className="text-white">El mapa se cargará aquí...</p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="text-center p-4 text-xs text-slate-500 border-t border-slate-700">
        <p>&copy; 2024 Sistema de Monitoreo de Papallacta</p>
      </footer>
    </div>
  );
};

export default Home;
