/// <reference types="vite/client" />
// Ensure google.maps global namespace types are available project-wide
// @types/google.maps uses ambient declare namespace, which needs explicit inclusion
import '@types/google.maps';
