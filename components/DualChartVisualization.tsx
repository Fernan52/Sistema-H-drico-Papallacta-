import React, { useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import type { WeatherDataPoint, ForecastPeriod, Alert } from '../types';
import { generateProfessionalAnalysis, type ProfessionalAnalysis } from '../services/geminiService';
import { BarChart3, TrendingUp, AlertTriangle, FileText, ChevronDown, ChevronUp } from './Icons';
import DetailedAlerts from './DetailedAlerts';

interface DualChartVisualizationProps {
    historicalData: WeatherDataPoint[];
    forecastData: WeatherDataPoint[];
    period: ForecastPeriod;
    alerts: Alert[];
}

const DualChartVisualization: React.FC<DualChartVisualizationProps> = ({ 
    historicalData, 
    forecastData, 
    period, 
    alerts 
}) => {
    const [analysis, setAnalysis] = useState<ProfessionalAnalysis | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [showAnalysis, setShowAnalysis] = useState(false);
    const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
        summary: true,
        historical: false,
        forecast: false,
        recommendations: false,
        risks: false,
        actions: false
    });

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const today = new Date();
        
        if (period === 'Diario') {
            const dayName = date.toLocaleDateString('es-ES', { weekday: 'short' });
            const dayNum = date.getDate();
            const month = date.toLocaleDateString('es-ES', { month: 'short' });
            const year = date.getFullYear();
            const currentYear = today.getFullYear();
            
            // Si es del año anterior, mostrar el año
            if (year < currentYear) {
                return `${dayName} ${dayNum} ${month} ${year}`;
            }
            
            // Mostrar "Hoy", "Mañana" o día de la semana para fechas actuales/futuras
            const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            if (diffDays === 0) return 'Hoy';
            if (diffDays === 1) return 'Mañana';
            
            return `${dayName} ${dayNum} ${month}`;
        } else if (period === 'Mensual') {
            return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
        } else {
            return date.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' });
        }
    };

    const formatTooltipValue = (value: number, name: string) => {
        const unit = period === 'Diario' ? 'mm/día' : period === 'Mensual' ? 'mm/día' : 'mm/mes';
        const severity = value >= 36 ? 'Crítico' : value >= 20 ? 'Advertencia' : 'Normal';
        const color = value >= 36 ? '🔴' : value >= 20 ? '🟡' : '🟢';
        
        return [`${value} ${unit} ${color} ${severity}`, name === 'precipitation' ? 'Precipitación' : name];
    };

    const formatTooltipLabel = (label: string) => {
        const date = new Date(label);
        const today = new Date();
        
        if (period === 'Diario') {
            const diffDays = Math.floor((date.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
            const dayName = date.toLocaleDateString('es-ES', { weekday: 'long' });
            const fullDate = date.toLocaleDateString('es-ES', { 
                day: 'numeric', 
                month: 'long',
                year: 'numeric'
            });
            
            if (diffDays === 0) return `Hoy - ${fullDate}`;
            if (diffDays === 1) return `Mañana - ${fullDate}`;
            if (diffDays === -1) return `Ayer - ${fullDate}`;
            
            return `${dayName} - ${fullDate}`;
        } else if (period === 'Mensual') {
            return date.toLocaleDateString('es-ES', { 
                day: 'numeric',
                month: 'long', 
                year: 'numeric',
                weekday: 'long'
            });
        } else {
            return date.toLocaleDateString('es-ES', { 
                month: 'long', 
                year: 'numeric' 
            });
        }
    };

    const handleGenerateAnalysis = async () => {
        setIsAnalyzing(true);
        try {
            const result = await generateProfessionalAnalysis(historicalData, forecastData, alerts, period);
            setAnalysis(result);
            setShowAnalysis(true);
        } catch (error) {
            console.error('Error generando análisis:', error);
        } finally {
            setIsAnalyzing(false);
        }
    };

    const toggleSection = (section: string) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    // Usar datos reales de predicción tal como los genera el sistema
    const prepareCoherentData = () => {
        if (period === 'Diario') {
            // Usar los datos reales de predicción sin modificar las fechas
            // Solo tomar los primeros 7 días de predicción si hay más
            const actualForecastData = forecastData.slice(0, 7);
            
            // Para datos históricos, usar los últimos 7 días disponibles
            const actualHistoricalData = historicalData.slice(-7);
            
            return {
                historical: actualHistoricalData,
                forecast: actualForecastData
            };
        } else {
            // Para otros períodos, usar datos como están
            return {
                historical: historicalData.slice(-30),
                forecast: forecastData
            };
        }
    };

    const { historical: recentHistoricalData, forecast: displayForecastData } = prepareCoherentData();

    // Encontrar el valor máximo para ajustar la escala
    const maxHistorical = Math.max(...recentHistoricalData.map(d => d.precipitation));
    const maxForecast = Math.max(...displayForecastData.map(d => d.precipitation));
    const maxValue = Math.max(maxHistorical, maxForecast);
    const yAxisMax = Math.ceil(maxValue * 1.2 / 10) * 10; // Redondear hacia arriba

    return (
        <div className="w-full space-y-6">
            {/* Encabezado */}
            <div className="bg-gradient-to-r from-slate-700/50 to-blue-900/30 p-4 rounded-lg border border-slate-600">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <BarChart3 className="w-6 h-6 text-blue-400" />
                        <div>
                            <h3 className="text-lg font-bold text-white">Análisis Comparativo - {period}</h3>
                            <p className="text-slate-300 text-sm">Datos Históricos vs Predicción Meteorológica</p>
                        </div>
                    </div>
                    <button
                        onClick={handleGenerateAnalysis}
                        disabled={isAnalyzing}
                        className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 
                                 disabled:from-slate-600 disabled:to-slate-600 disabled:cursor-not-allowed
                                 px-4 py-2 rounded-lg font-semibold text-white transition-all duration-200 
                                 flex items-center gap-2 shadow-lg"
                    >
                        {isAnalyzing ? (
                            <>
                                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                Analizando...
                            </>
                        ) : (
                            <>
                                <FileText className="w-4 h-4" />
                                Generar Análisis Profesional
                            </>
                        )}
                    </button>
                </div>
            </div>

            {/* Gráficos duales */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Gráfico de Datos Históricos */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <h4 className="text-lg font-semibold text-white">Datos Históricos (2024)</h4>
                        <span className="text-slate-400 text-sm">({recentHistoricalData.length} días del año anterior)</span>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={recentHistoricalData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={formatDate}
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    angle={period === 'Diario' ? 0 : -35}
                                    textAnchor={period === 'Diario' ? 'middle' : 'end'}
                                    height={period === 'Diario' ? 50 : 70}
                                />
                                <YAxis 
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    domain={[0, yAxisMax]}
                                />
                                <Tooltip 
                                    formatter={formatTooltipValue}
                                    labelFormatter={formatTooltipLabel}
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="precipitation" 
                                    stroke="#10b981" 
                                    strokeWidth={3}
                                    dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
                                />
                                <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="5 5" label="Alerta" />
                                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" label="Crítico" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-slate-400">Promedio: {(recentHistoricalData.reduce((sum, d) => sum + d.precipitation, 0) / recentHistoricalData.length).toFixed(1)} mm</span>
                        <span className="text-slate-400">Máximo: {maxHistorical.toFixed(1)} mm</span>
                    </div>
                </div>

                {/* Gráfico de Predicción */}
                <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <h4 className="text-lg font-semibold text-white">Predicción {period} (2025)</h4>
                        <TrendingUp className="w-4 h-4 text-blue-400" />
                        <span className="text-slate-400 text-sm">({displayForecastData.length} días desde mañana)</span>
                    </div>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={displayForecastData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                <XAxis 
                                    dataKey="date" 
                                    tickFormatter={formatDate}
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    angle={period === 'Diario' ? 0 : -35}
                                    textAnchor={period === 'Diario' ? 'middle' : 'end'}
                                    height={period === 'Diario' ? 50 : 70}
                                />
                                <YAxis 
                                    stroke="#9ca3af"
                                    fontSize={12}
                                    domain={[0, yAxisMax]}
                                />
                                <Tooltip 
                                    formatter={formatTooltipValue}
                                    labelFormatter={formatTooltipLabel}
                                    contentStyle={{
                                        backgroundColor: '#1f2937',
                                        border: '1px solid #374151',
                                        borderRadius: '8px',
                                        color: '#fff'
                                    }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="precipitation" 
                                    stroke="#3b82f6" 
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                                />
                                {/* Líneas de alerta para días específicos */}
                                {alerts.map((alert, index) => (
                                    <ReferenceLine 
                                        key={index}
                                        x={alert.date} 
                                        stroke={alert.severity === 'critical' ? '#ef4444' : '#f59e0b'} 
                                        strokeDasharray="3 3"
                                    />
                                ))}
                                <ReferenceLine y={25} stroke="#f59e0b" strokeDasharray="5 5" label="Alerta" />
                                <ReferenceLine y={40} stroke="#ef4444" strokeDasharray="5 5" label="Crítico" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-slate-400">Promedio: {(displayForecastData.reduce((sum, d) => sum + d.precipitation, 0) / displayForecastData.length).toFixed(1)} mm</span>
                        <span className="text-slate-400">Máximo: {maxForecast.toFixed(1)} mm</span>
                        {alerts.length > 0 && (
                            <div className="flex items-center gap-1 text-amber-400">
                                <AlertTriangle className="w-4 h-4" />
                                <span>{alerts.length} alertas</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Panel de Análisis Profesional */}
            {showAnalysis && analysis && (
                <div className="bg-gradient-to-br from-slate-800/70 to-blue-900/30 p-6 rounded-xl border border-slate-600 shadow-2xl">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                            <FileText className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Análisis Profesional del Sistema Hídrico</h3>
                            <p className="text-slate-300 text-sm">Evaluación técnica y recomendaciones operativas</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        {/* Resumen Ejecutivo */}
                        <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                            <button
                                onClick={() => toggleSection('summary')}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    Resumen Ejecutivo
                                </h4>
                                {expandedSections.summary ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>
                            {expandedSections.summary && (
                                <p className="mt-3 text-slate-200 leading-relaxed">{analysis.summary}</p>
                            )}
                        </div>

                        {/* Tendencias Históricas */}
                        <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                            <button
                                onClick={() => toggleSection('historical')}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                                    Análisis de Tendencias Históricas
                                </h4>
                                {expandedSections.historical ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>
                            {expandedSections.historical && (
                                <p className="mt-3 text-slate-200 leading-relaxed whitespace-pre-line">{analysis.historicalTrends}</p>
                            )}
                        </div>

                        {/* Insights del Pronóstico */}
                        <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                            <button
                                onClick={() => toggleSection('forecast')}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                                    Análisis del Pronóstico
                                </h4>
                                {expandedSections.forecast ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>
                            {expandedSections.forecast && (
                                <p className="mt-3 text-slate-200 leading-relaxed whitespace-pre-line">{analysis.forecastInsights}</p>
                            )}
                        </div>

                        {/* Recomendaciones */}
                        <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                            <button
                                onClick={() => toggleSection('recommendations')}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <span className="w-2 h-2 bg-cyan-400 rounded-full"></span>
                                    Recomendaciones Profesionales
                                </h4>
                                {expandedSections.recommendations ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>
                            {expandedSections.recommendations && (
                                <ul className="mt-3 space-y-2">
                                    {analysis.recommendations.map((rec, index) => (
                                        <li key={index} className="flex items-start gap-3 text-slate-200">
                                            <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full mt-2 flex-shrink-0"></span>
                                            <span className="leading-relaxed">{rec}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>

                        {/* Evaluación de Riesgos */}
                        <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                            <button
                                onClick={() => toggleSection('risks')}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                                    Evaluación de Riesgos
                                </h4>
                                {expandedSections.risks ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>
                            {expandedSections.risks && (
                                <p className="mt-3 text-slate-200 leading-relaxed whitespace-pre-line">{analysis.riskAssessment}</p>
                            )}
                        </div>

                        {/* Acciones Operativas */}
                        <div className="bg-slate-700/30 p-4 rounded-lg border border-slate-600">
                            <button
                                onClick={() => toggleSection('actions')}
                                className="w-full flex items-center justify-between text-left"
                            >
                                <h4 className="text-lg font-semibold text-white flex items-center gap-2">
                                    <TrendingUp className="w-4 h-4 text-green-400" />
                                    Acciones Operativas Inmediatas
                                </h4>
                                {expandedSections.actions ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                            </button>
                            {expandedSections.actions && (
                                <ul className="mt-3 space-y-2">
                                    {analysis.operationalActions.map((action, index) => (
                                        <li key={index} className="flex items-start gap-3 text-slate-200">
                                            <span className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></span>
                                            <span className="leading-relaxed">{action}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Alertas Detalladas por Período */}
            <DetailedAlerts alerts={alerts} period={period} />
        </div>
    );
};

export default DualChartVisualization;
