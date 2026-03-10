// Global ambient type declarations for Google Maps API
// This file must NOT contain any import/export statements
// so it remains a pure ambient declaration file (not a module).
// 
// @types/google.maps declares: declare namespace google.maps { ... }
// We reference it via typeRoots + types in tsconfig.app.json.
// This file exists as a fallback to ensure the google namespace
// is explicitly available when moduleResolution = "bundler".

declare const __googleMapsLoaded: boolean;
