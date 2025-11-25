import React, { useEffect, useRef } from 'react';

interface MapProps {
  latitude: number;
  longitude: number;
  label: string;
}

// Global definition for Leaflet attached to window via CDN
declare global {
  interface Window {
    L: any;
  }
}

const Map: React.FC<MapProps> = ({ latitude, longitude, label }) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);

  // Função para centralizar o mapa
  const handleRecenter = () => {
    if (mapInstanceRef.current) {
      // flyTo oferece uma animação suave
      mapInstanceRef.current.flyTo([latitude, longitude], 13, {
        animate: true,
        duration: 1.5
      });
      
      // Reabre o popup se estiver fechado
      if (markerRef.current) {
        setTimeout(() => {
          markerRef.current.openPopup();
        }, 1500); // Abre após a animação
      }
    }
  };

  useEffect(() => {
    if (!mapContainerRef.current || !window.L) return;

    // Initialize Map if not exists
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = window.L.map(mapContainerRef.current, {
        zoomControl: false, // Desabilitamos o padrão para posicionar onde quisermos, ou mantemos padrão
        scrollWheelZoom: true,
      }).setView([latitude, longitude], 13);

      // Adicionar controle de zoom na posição padrão (superior esquerda)
      window.L.control.zoom({
        position: 'topleft'
      }).addTo(mapInstanceRef.current);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19
      }).addTo(mapInstanceRef.current);

      markerRef.current = window.L.marker([latitude, longitude])
        .addTo(mapInstanceRef.current)
        .bindPopup(`<b>${label}</b>`)
        .openPopup();
    } else {
      // Update existing map
      // Usamos flyTo para transição suave se a cidade mudar
      mapInstanceRef.current.setView([latitude, longitude], 13);
      
      if (markerRef.current) {
        markerRef.current.setLatLng([latitude, longitude]);
        markerRef.current.setPopupContent(`<b>${label}</b>`);
        markerRef.current.openPopup();
      }
      
      // Força o recálculo do tamanho do mapa caso o container tenha mudado de tamanho
      mapInstanceRef.current.invalidateSize();
    }

    return () => {
      // Cleanup cleanup code if needed
    };
  }, [latitude, longitude, label]);

  return (
    <div className="relative w-full h-full group">
      {/* Container do Mapa com altura reduzida (compacta) */}
      <div 
        ref={mapContainerRef} 
        className="w-full h-56 md:h-64 lg:h-72 bg-slate-100 z-0"
      ></div>

      {/* Botão de Recentralizar (Custom Control) */}
      <button
        onClick={handleRecenter}
        className="absolute top-4 right-4 z-[400] bg-white p-2 rounded-lg shadow-md border border-slate-300 text-slate-600 hover:text-gov-600 hover:bg-slate-50 hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-gov-500"
        title="Centralizar no marcador"
        aria-label="Centralizar mapa na cidade selecionada"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
        </svg>
      </button>

      {/* Legenda de ajuda discreta */}
      <div className="absolute bottom-1 right-1 z-[400] bg-white/80 px-2 py-0.5 rounded text-[10px] text-slate-500 pointer-events-none backdrop-blur-sm">
        Use Ctrl + Scroll para zoom
      </div>
    </div>
  );
};

export default Map;