import { useEffect, useRef, forwardRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Star, MapPin, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
// Fix for default marker icons
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icons
const createCustomIcon = (color: string, verified?: boolean) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background: ${color};
        width: 36px;
        height: 36px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <div style="
          transform: rotate(45deg);
          font-size: 16px;
        ">
          ${verified ? '✓' : '🐾'}
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
  });
};

const userIcon = L.divIcon({
  className: 'user-marker',
  html: `
    <div style="
      background: linear-gradient(135deg, #3b82f6, #1d4ed8);
      width: 24px;
      height: 24px;
      border-radius: 50%;
      border: 3px solid white;
      box-shadow: 0 2px 8px rgba(59,130,246,0.5);
      animation: pulse 2s infinite;
    "></div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

interface Professional {
  id: string;
  name: string;
  specialty: string;
  photo: string | null;
  rating: number;
  reviewCount: number;
  location: string;
  distance?: string;
  distanceKm?: number;
  isVerified?: boolean;
  latitude?: number;
  longitude?: number;
  priceRange?: string;
  services?: string[];
}

interface ProfessionalMapProps {
  professionals: Professional[];
  userLocation?: { lat: number; lng: number } | null;
  searchRadius?: number;
  onProfessionalClick?: (professional: Professional) => void;
  selectedProfessionalId?: string | null;
  className?: string;
}

// Popup content component
function PopupContent({ professional }: { professional: Professional }) {
  return (
    <div className="p-1">
      <div className="flex gap-3">
        {professional.photo && (
          <img
            src={professional.photo}
            alt={professional.name}
            className="w-16 h-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h4 className="font-semibold text-sm truncate">{professional.name}</h4>
            {professional.isVerified && (
              <Badge variant="secondary" className="text-xs shrink-0">
                Verificado
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground">{professional.specialty}</p>
          
          <div className="flex items-center gap-2 mt-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3 h-3 ${
                    i < Math.floor(professional.rating)
                      ? "fill-amber-400 text-amber-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              ({professional.reviewCount})
            </span>
          </div>
        </div>
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          <MapPin className="w-3 h-3" />
          {professional.distanceKm 
            ? `${professional.distanceKm.toFixed(1)} km` 
            : professional.distance || 'Distância não disponível'}
        </div>
        
        <a href={`/profissional/${professional.id}`}>
          <Button size="sm" className="h-7 text-xs">
            Ver perfil
            <ExternalLink className="w-3 h-3 ml-1" />
          </Button>
        </a>
      </div>
      
      {professional.priceRange && (
        <p className="mt-2 text-xs font-medium text-primary">
          {professional.priceRange}
        </p>
      )}
    </div>
  );
}

const ProfessionalMap = forwardRef<HTMLDivElement, ProfessionalMapProps>(function ProfessionalMap({
  professionals,
  userLocation,
  searchRadius = 10,
  onProfessionalClick,
  selectedProfessionalId,
  className = '',
}, ref) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const circleRef = useRef<L.Circle | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);

  // Default center (São Paulo if no location)
  const defaultCenter: [number, number] = userLocation 
    ? [userLocation.lat, userLocation.lng]
    : [-23.5505, -46.6333];

  // Filter professionals with valid coordinates
  const professionalsWithLocation = professionals.filter(
    p => p.latitude && p.longitude
  );

  // Initialize map
  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(defaultCenter, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update map view when user location changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedProfessionalId) {
      const selected = professionalsWithLocation.find(p => p.id === selectedProfessionalId);
      if (selected?.latitude && selected?.longitude) {
        map.flyTo([selected.latitude, selected.longitude], 15, { duration: 0.5 });
        return;
      }
    }

    if (userLocation) {
      map.flyTo([userLocation.lat, userLocation.lng], 13, { duration: 0.5 });
    } else if (professionalsWithLocation.length > 0) {
      const bounds = L.latLngBounds(
        professionalsWithLocation.map(p => [p.latitude!, p.longitude!] as [number, number])
      );
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [userLocation, selectedProfessionalId, professionalsWithLocation]);

  // Update user marker and search radius circle
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old user marker and circle
    if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }
    if (circleRef.current) {
      circleRef.current.remove();
      circleRef.current = null;
    }

    if (userLocation) {
      // Add user marker
      const marker = L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup('<div class="text-center p-2"><p class="font-medium">Sua localização</p></div>');
      userMarkerRef.current = marker;

      // Add search radius circle
      const circle = L.circle([userLocation.lat, userLocation.lng], {
        radius: searchRadius * 1000,
        color: '#10b981',
        fillColor: '#10b981',
        fillOpacity: 0.1,
        weight: 2,
        dashArray: '5, 5',
      }).addTo(map);
      circleRef.current = circle;
    }
  }, [userLocation, searchRadius]);

  // Update professional markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Remove old markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    professionalsWithLocation.forEach((professional) => {
      const marker = L.marker(
        [professional.latitude!, professional.longitude!],
        { 
          icon: createCustomIcon(
            professional.isVerified ? '#10b981' : '#6366f1',
            professional.isVerified
          ) 
        }
      ).addTo(map);

      // Create popup with React content
      const popupContainer = document.createElement('div');
      popupContainer.style.minWidth = '280px';
      popupContainer.style.maxWidth = '320px';
      
      const root = createRoot(popupContainer);
      root.render(<PopupContent professional={professional} />);
      
      marker.bindPopup(popupContainer);

      marker.on('click', () => {
        onProfessionalClick?.(professional);
      });

      markersRef.current.push(marker);
    });
  }, [professionalsWithLocation, onProfessionalClick]);

  return (
    <div ref={ref} className={`relative rounded-xl overflow-hidden border border-border ${className}`}>
      {/* Map Legend */}
      <div className="absolute top-3 right-3 z-[1000] bg-card/95 backdrop-blur-sm rounded-lg p-3 shadow-lg border border-border">
        <div className="flex flex-col gap-2 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow-sm animate-pulse" />
            <span className="text-muted-foreground">Sua localização</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary border-2 border-white shadow-sm" />
            <span className="text-muted-foreground">Profissionais</span>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div 
        ref={mapRef} 
        className="w-full h-full" 
        style={{ minHeight: '400px' }}
      />

      {/* No professionals with location message */}
      {professionalsWithLocation.length === 0 && professionals.length > 0 && (
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-[500]">
          <div className="text-center p-6">
            <MapPin className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
            <p className="font-medium mb-1">Nenhum profissional com localização</p>
            <p className="text-sm text-muted-foreground">
              Os profissionais encontrados ainda não configuraram suas coordenadas
            </p>
          </div>
        </div>
      )}

      {/* Add CSS for marker animations */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        .custom-marker, .user-marker {
          background: transparent !important;
          border: none !important;
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15);
        }
        .leaflet-popup-content {
          margin: 8px;
        }
      `}</style>
    </div>
  );
});

export default ProfessionalMap;
