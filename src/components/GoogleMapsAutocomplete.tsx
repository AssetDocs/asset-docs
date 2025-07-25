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

  useEffect(() => {
    const initializeGoogleMaps = async () => {
      try {
        // Google Maps API key should be configured in environment variables
        // For security, this should not be hardcoded in the client-side code
        console.warn('Google Maps API key not configured. Please set up API key in environment variables.');
        
        // Temporarily disable Google Maps functionality until proper API key management is implemented
        // const loader = new Loader({
        //   apiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY,
        //   version: 'weekly',
        //   libraries: ['places']
        // });

        // await loader.load();
        // setIsLoaded(true);
      } catch (error) {
        console.error('Error loading Google Maps:', error);
      }
    };

    initializeGoogleMaps();
  }, []);

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
    </div>
  );
};

export default GoogleMapsAutocomplete;