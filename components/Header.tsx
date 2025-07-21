import React from 'react';
import { BarChart, CloudRain } from './Icons';

const Header: React.FC = () => {
    return (
        <header className="bg-gradient-to-r from-slate-800 via-slate-900 to-blue-900 shadow-2xl border-b border-slate-600/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
                {/* Barra superior con información institucional */}
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-600/30">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-xl shadow-lg">
                            <CloudRain className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl sm:text-3xl font-bold text-white bg-gradient-to-r from-white to-blue-200 bg-clip-text text-transparent">
                                Sistema Hídrico Papallacta
                            </h1>
                            <p className="text-sm sm:text-base text-slate-300 font-medium">
                                Centro de Monitoreo y Control Hidrológico | Ecuador 🇪🇨
                            </p>
                        </div>
                    </div>
                    
                    <div className="hidden lg:flex items-center gap-6">
                        <div className="bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-600/50">
                            <div className="flex items-center gap-2 text-sm">
                                <BarChart className="w-4 h-4 text-green-400" />
                                <span className="text-slate-300">Estado:</span>
                                <span className="text-green-400 font-bold">● Operativo</span>
                            </div>
                        </div>
                        <div className="bg-slate-800/60 backdrop-blur-sm px-4 py-2 rounded-lg border border-slate-600/50">
                            <div className="text-sm text-center">
                                <div className="text-slate-400">Última actualización</div>
                                <div className="text-white font-mono text-xs">{new Date().toLocaleTimeString()}</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Indicadores principales */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div className="bg-blue-500/20 backdrop-blur-sm border border-blue-500/30 rounded-lg p-3 text-center">
                        <div className="text-blue-300 text-xs uppercase tracking-wide">Caudal Principal</div>
                        <div className="text-white text-lg font-bold">18.2 m³/s</div>
                    </div>
                    <div className="bg-green-500/20 backdrop-blur-sm border border-green-500/30 rounded-lg p-3 text-center">
                        <div className="text-green-300 text-xs uppercase tracking-wide">Presión Sistema</div>
                        <div className="text-white text-lg font-bold">125 bar</div>
                    </div>
                    <div className="bg-purple-500/20 backdrop-blur-sm border border-purple-500/30 rounded-lg p-3 text-center">
                        <div className="text-purple-300 text-xs uppercase tracking-wide">Población</div>
                        <div className="text-white text-lg font-bold">2.8M hab</div>
                    </div>
                    <div className="bg-cyan-500/20 backdrop-blur-sm border border-cyan-500/30 rounded-lg p-3 text-center">
                        <div className="text-cyan-300 text-xs uppercase tracking-wide">Calidad</div>
                        <div className="text-white text-lg font-bold">A+ Excelente</div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;