import React, { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { Input } from './ui/input';
import { Label } from './ui/label';

interface GoogleMapsAutocompleteProps {
  value: string;
  onChange: (address: string) => void;
  onPlaceSelected?: (place: google.maps.places.PlaceResult) => void;
  placeholder?: string;
  label?: string;
  required?: boolean;
}

const GoogleMapsAutocomplete: React.FC<GoogleMapsAutocompleteProps> = ({
  value,
  onChange,
  onPlaceSelected,
  placeholder = "Start typing an address...",
  label = "Address",
  required = false
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [apiKey, setApiKey] = useState('');

  useEffect(() => {
    // In a real implementation, this would come from Supabase Edge Function secrets
    // For now, we'll use a placeholder that prompts users to add their key
    const initializeGoogleMaps = async () => {
      try {
        // This is where you'd fetch the API key from your backend/secrets
        // For demo purposes, we'll use a placeholder
        const GOOGLE_MAPS_API_KEY = apiKey || 'YOUR_GOOGLE_MAPS_API_KEY';
        
        if (GOOGLE_MAPS_API_KEY === 'YOUR_GOOGLE_MAPS_API_KEY') {
          console.warn('Please add your Google Maps API key to use autocomplete');
          return;
        }

        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: 'weekly',
          libraries: ['places']
        });

        await loader.load();
        setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initializeGoogleMaps();
  }, [apiKey]);

  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      autocompleteRef.current = new google.maps.places.Autocomplete(inputRef.current, {
        types: ['address'],
        componentRestrictions: { country: 'us' }, // Restrict to US addresses
        fields: ['formatted_address', 'address_components', 'geometry', 'place_id']
      });

      autocompleteRef.current.addListener('place_changed', () => {
        const place = autocompleteRef.current?.getPlace();
        if (place && place.formatted_address) {
          onChange(place.formatted_address);
          onPlaceSelected?.(place);
        }
      });
    }
  }, [isLoaded, onChange, onPlaceSelected]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <div>
      {label && <Label htmlFor="address-autocomplete">{label}</Label>}
      <Input
        id="address-autocomplete"
        ref={inputRef}
        value={value}
        onChange={handleInputChange}
        placeholder={placeholder}
        required={required}
        className="w-full"
      />
      {!isLoaded && apiKey === '' && (
        <div className="mt-2">
          <Label htmlFor="google-api-key">Google Maps API Key (Required)</Label>
          <Input
            id="google-api-key"
            type="password"
            placeholder="Enter your Google Maps API key"
            onChange={(e) => setApiKey(e.target.value)}
            className="text-sm"
          />
          <p className="text-xs text-muted-foreground mt-1">
            Get your API key from <a href="https://console.cloud.google.com/google/maps-apis/credentials" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Google Cloud Console</a>
          </p>
        </div>
      )}
    </div>
  );
};

export default GoogleMapsAutocomplete;