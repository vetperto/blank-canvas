import { useState, useCallback } from 'react';
import { toast } from 'sonner';

interface ViaCepResponse {
  cep: string;
  logradouro: string;
  complemento: string;
  bairro: string;
  localidade: string;
  uf: string;
  erro?: boolean;
}

interface AddressData {
  street: string;
  neighborhood: string;
  city: string;
  state: string;
}

interface UseCepLookupReturn {
  isLoading: boolean;
  addressFound: boolean;
  error: string | null;
  fetchAddressByCep: (cep: string) => Promise<AddressData | null>;
  resetCepState: () => void;
}

export function useCepLookup(): UseCepLookupReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [addressFound, setAddressFound] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const resetCepState = useCallback(() => {
    setAddressFound(false);
    setError(null);
  }, []);

  const fetchAddressByCep = useCallback(async (cep: string): Promise<AddressData | null> => {
    // Clean CEP - remove non-numeric characters
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) {
      return null;
    }

    setIsLoading(true);
    setError(null);
    setAddressFound(false);

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      
      if (!response.ok) {
        throw new Error('Erro ao buscar CEP');
      }

      const data: ViaCepResponse = await response.json();

      if (data.erro) {
        setError('CEP não encontrado. Preencha o endereço manualmente.');
        toast.error('CEP não encontrado');
        return null;
      }

      const addressData: AddressData = {
        street: data.logradouro || '',
        neighborhood: data.bairro || '',
        city: data.localidade || '',
        state: data.uf || '',
      };

      setAddressFound(true);
      
      // Only show success toast if we found address data
      if (data.logradouro || data.localidade) {
        toast.success('Endereço encontrado!');
      }

      return addressData;
    } catch (err) {
      const errorMessage = 'Erro ao buscar CEP. Preencha o endereço manualmente.';
      setError(errorMessage);
      toast.error(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    addressFound,
    error,
    fetchAddressByCep,
    resetCepState,
  };
}
