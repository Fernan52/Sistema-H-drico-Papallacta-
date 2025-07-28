# 🏔️ Sistema de Monitoreo Hidrológico Papallacta 💧

Sistema integrado de monitoreo y gestión de recursos hídricos para el abastecimiento metropolitano de agua potable desde las fuentes naturales de Papallacta hacia Quito.

## 🌟 Características Principales

### 📊 **Centro de Control Operativo**
- **Datos en tiempo real** de fuentes externas oficiales
- **Monitoreo integral** de parámetros críticos del sistema hídrico
- **Alertas inteligentes** basadas en múltiples fuentes de datos
- **Análisis predictivo** con IA (Google Gemini)

### 🔗 **Fuentes de Datos Integradas**

#### 🌤️ **APIs Meteorológicas**
- **INAMHI** (Instituto Nacional de Meteorología e Hidrología de Ecuador)
- **OpenWeatherMap** (Respaldo internacional)
- Datos: Temperatura, humedad, precipitación, viento, presión

#### 💧 **Sistema EPMAPS**
- **SCADA EPMAPS** (Empresa Pública Metropolitana de Agua Potable)
- **APIs Operacionales** del sistema Papallacta-Quito
- Datos: Caudales, presión, calidad del agua, eficiencia

#### 🏛️ **Instituciones Gubernamentales**
- **SENAGUA** (Secretaría del Agua)
- **MAE** (Ministerio del Ambiente y Agua)
- **SNGRE** (Gestión de Riesgos y Emergencias)
- **INEN** (Normas técnicas de calidad)

### 🎯 **Funcionalidades**

- ✅ **Pronóstico meteorológico** (diario, mensual, anual)
- ✅ **Análisis comparativo** de datos históricos vs predicciones
- ✅ **Sistema de alertas** multinivel con acciones operativas
- ✅ **Mapa interactivo** del sistema de conducción
- ✅ **Análisis profesional** generado por IA
- ✅ **Dashboard en tiempo real** con datos de múltiples fuentes

## 🚀 Instalación y Configuración

### 1. **Clonar el Repositorio**
```bash
git clone https://github.com/Fernan52/Sistema-H-drico-Papallacta-.git
cd Sistema-H-drico-Papallacta-
```

### 2. **Instalar Dependencias**
```bash
npm install
```

### 3. **Configurar Variables de Entorno**

#### 3.1 Copiar archivo de ejemplo
```bash
cp .env.example .env
```

#### 3.2 Obtener claves API necesarias

##### 🌤️ **APIs Meteorológicas (REQUERIDAS)**

**INAMHI (Oficial Ecuador):**
```bash
# Contactar: info@inamhi.gob.ec
# Web: https://www.inamhi.gob.ec
# Solicitar: Acceso a API meteorológica
# Especificar: Sistema de Monitoreo Papallacta
INAMHI_API_KEY=tu_clave_aqui
```

**OpenWeatherMap (Respaldo - GRATUITA):**
```bash
# Web: https://openweathermap.org/api
# Plan gratuito: 1000 llamadas/día
# Registro inmediato
OPENWEATHER_API_KEY=tu_clave_aqui
```

##### 💧 **EPMAPS (Opcional pero recomendado)**
```bash
# Contactar: sistemas@epmaps.gob.ec
# Solicitar: Acceso a sistema SCADA
# Justificar: Monitoreo académico/investigación
EPMAPS_API_KEY=tu_clave_aqui
```

##### 🏛️ **APIs Gubernamentales (Opcionales)**
```bash
# SENAGUA - Recursos Hídricos
SENAGUA_API_KEY=tu_clave_aqui

# MAE - Datos Ambientales  
MAE_API_KEY=tu_clave_aqui

# SNGRE - Gestión de Riesgos
SNGRE_API_KEY=tu_clave_aqui
```

##### 🤖 **Google Gemini AI (REQUERIDA)**
```bash
# Web: https://aistudio.google.com/app/apikey
# Crear proyecto y obtener clave
API_KEY=tu_clave_gemini_aqui
```

### 4. **Ejecutar la Aplicación**

#### Modo Desarrollo
```bash
npm run dev
```

#### Modo Producción
```bash
npm run build
npm run preview
```

## 📋 **Estado de APIs y Fallbacks**

### ✅ **Funcionamiento Garantizado**
El sistema está diseñado para funcionar **SIEMPRE**, incluso sin acceso a APIs externas:

- **Sin APIs**: Usa datos simulados realistas basados en información histórica real
- **APIs parciales**: Combina datos reales disponibles con simulados
- **Todas las APIs**: Funcionamiento completo con datos en tiempo real

### 🔄 **Sistema de Fallbacks Inteligente**
1. **Prioridad 1**: APIs oficiales ecuatorianas (INAMHI, EPMAPS, SENAGUA)
2. **Prioridad 2**: APIs internacionales (OpenWeatherMap)
3. **Prioridad 3**: Datos simulados realistas

### 📊 **Indicadores de Estado**
El dashboard muestra claramente:
- ✅ **Verde**: API online y funcionando
- ❌ **Rojo**: API offline, usando fallback
- **Score del sistema**: 0-100 basado en disponibilidad de datos

## 🏗️ **Arquitectura Técnica**

### 📁 **Estructura de Servicios**
```
services/
├── weatherApiService.ts      # INAMHI + OpenWeatherMap
├── epmapsService.ts         # Sistema SCADA EPMAPS
├── governmentDataService.ts # APIs gubernamentales
├── integratedDataService.ts # Orquestador principal
└── geminiService.ts        # IA y análisis predictivo
```

### 🔧 **Tecnologías**
- **Frontend**: React 19 + TypeScript + Vite
- **Mapas**: Leaflet
- **Gráficos**: Recharts
- **Estilos**: Tailwind CSS
- **IA**: Google Gemini
- **APIs**: REST + Fetch nativo

## 📈 **Datos Disponibles en Tiempo Real**

### 🌤️ **Meteorológicos**
- Temperatura, humedad, precipitación
- Velocidad y dirección del viento
- Presión atmosférica
- Pronósticos extendidos

### 💧 **Operacionales del Sistema**
- Caudal de captación Papallacta
- Caudal tratado en El Placer
- Caudal distribuido al área metropolitana
- Presión en diferentes puntos
- Eficiencia del sistema
- Calidad del agua (pH, turbidez, cloro, bacterias)

### 🏛️ **Institucionales/Gubernamentales**
- Disponibilidad de recursos hídricos
- Nivel de reservas
- Calidad del aire
- Índice UV
- Estado de áreas protegidas
- Nivel de emergencia nacional
- Normativas técnicas vigentes

## ⚠️ **Gestión de Alertas**

### 🚨 **Tipos de Alerta**
- **Críticas**: Requieren acción inmediata
- **Advertencias**: Monitoreo estrecho
- **Informativas**: Estado normal del sistema

### 📍 **Fuentes de Alertas**
- **Meteorológicas**: Precipitación extrema, temperatura anómala
- **Operacionales**: Caudal bajo, eficiencia reducida, presión anormal
- **Gubernamentales**: Alertas de emergencia, cambios normativos
- **Sistema**: Estado de APIs, errores de conectividad

## 🎯 **Objetivos del Proyecto**

1. **Monitoreo Integral**: Visión completa del sistema hídrico Papallacta-Quito
2. **Toma de Decisiones**: Información en tiempo real para operadores
3. **Gestión Proactiva**: Anticipar problemas mediante IA predictiva
4. **Transparencia**: Acceso a datos oficiales gubernamentales
5. **Confiabilidad**: Funcionamiento garantizado 24/7

## 🤝 **Colaboración**

### 📧 **Contacto Institucional**
- **EPMAPS**: sistemas@epmaps.gob.ec
- **INAMHI**: info@inamhi.gob.ec
- **SENAGUA**: consultas@senagua.gob.ec

### 🔗 **Enlaces Útiles**
- [INAMHI Official](https://www.inamhi.gob.ec)
- [EPMAPS](https://www.epmaps.gob.ec)
- [SENAGUA](https://www.senagua.gob.ec)
- [Ministerio del Ambiente](https://www.ambiente.gob.ec)

## 📄 **Licencia**

Este proyecto está desarrollado para propósitos académicos y de investigación en gestión de recursos hídricos.

---

**Desarrollado para el monitoreo del sistema hídrico más importante del Ecuador** 🇪🇨  
*Papallacta → Quito: Abasteciendo 2.8 millones de habitantes*
