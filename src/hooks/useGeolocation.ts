import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface Coordinates {
  lat: number;
  lng: number;
}

interface AddressInfo {
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
  formattedAddress: string;
}

interface GeolocationState {
  coordinates: Coordinates | null;
  address: AddressInfo | null;
  isLoading: boolean;
  error: string | null;
}

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    address: null,
    isLoading: false,
    error: null,
  });

  // Get current location from browser
  const getCurrentLocation = useCallback((): Promise<Coordinates | null> => {
    return new Promise((resolve) => {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      if (!navigator.geolocation) {
        setState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: 'Geolocalização não suportada pelo navegador' 
        }));
        toast.error('Geolocalização não suportada pelo navegador');
        resolve(null);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };

          // Reverse geocode to get address
          try {
            const address = await reverseGeocode(coords.lat, coords.lng);
            setState({
              coordinates: coords,
              address,
              isLoading: false,
              error: null,
            });
            toast.success('Localização obtida com sucesso!');
            resolve(coords);
          } catch {
            setState({
              coordinates: coords,
              address: { formattedAddress: 'Minha localização atual' },
              isLoading: false,
              error: null,
            });
            resolve(coords);
          }
        },
        (error) => {
          let errorMessage = 'Não foi possível obter sua localização';
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'Permissão de localização negada';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'Localização indisponível';
              break;
            case error.TIMEOUT:
              errorMessage = 'Tempo esgotado ao obter localização';
              break;
          }

          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: errorMessage 
          }));
          toast.error(errorMessage);
          resolve(null);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  }, []);

  // Reverse geocode coordinates to address using Nominatim
  const reverseGeocode = async (lat: number, lng: number): Promise<AddressInfo> => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&accept-language=pt-BR`
    );
    const data = await response.json();

    if (data.address) {
      const city = data.address.city || data.address.town || data.address.village || '';
      const state = data.address.state || '';
      const neighborhood = data.address.suburb || data.address.neighbourhood || '';
      const street = data.address.road || '';

      const parts = [neighborhood, city, state].filter(Boolean);
      
      return {
        street,
        neighborhood,
        city,
        state,
        formattedAddress: parts.length > 0 ? parts.join(', ') : 'Localização encontrada',
      };
    }

    return { formattedAddress: 'Localização encontrada' };
  };

  // Geocode address/CEP to coordinates
  const geocodeAddress = useCallback(async (address: string): Promise<Coordinates | null> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      // Check if it's a CEP (8 digits)
      const cleanCep = address.replace(/\D/g, '');
      
      if (cleanCep.length === 8) {
        // First get address from ViaCEP
        const viaCepResponse = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const viaCepData = await viaCepResponse.json();

        if (!viaCepData.erro) {
          // Then geocode the address
          const searchAddress = `${viaCepData.logradouro}, ${viaCepData.bairro}, ${viaCepData.localidade}, ${viaCepData.uf}, Brasil`;
          const coords = await geocodeString(searchAddress);
          
          if (coords) {
            setState({
              coordinates: coords,
              address: {
                street: viaCepData.logradouro,
                neighborhood: viaCepData.bairro,
                city: viaCepData.localidade,
                state: viaCepData.uf,
                formattedAddress: `${viaCepData.bairro}, ${viaCepData.localidade} - ${viaCepData.uf}`,
              },
              isLoading: false,
              error: null,
            });
            return coords;
          }
        }
      }

      // Regular address geocoding
      const coords = await geocodeString(address + ', Brasil');
      
      if (coords) {
        const addressInfo = await reverseGeocode(coords.lat, coords.lng);
        setState({
          coordinates: coords,
          address: addressInfo,
          isLoading: false,
          error: null,
        });
        return coords;
      }

      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Endereço não encontrado' 
      }));
      return null;
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: 'Erro ao buscar endereço' 
      }));
      return null;
    }
  }, []);

  // Helper to geocode a string address using Nominatim
  const geocodeString = async (address: string): Promise<Coordinates | null> => {
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`
    );
    const data = await response.json();

    if (data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
      };
    }

    return null;
  };

  // Calculate distance between two points (Haversine formula)
  const calculateDistance = useCallback((
    lat1: number,
    lng1: number,
    lat2: number,
    lng2: number
  ): number => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLng / 2) *
        Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      coordinates: null,
      address: null,
      isLoading: false,
      error: null,
    });
  }, []);

  return {
    ...state,
    getCurrentLocation,
    geocodeAddress,
    calculateDistance,
    reset,
  };
}
