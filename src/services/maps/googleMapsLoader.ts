import { setOptions, importLibrary } from '@googlemaps/js-api-loader';

export type GoogleMapsStatus = 
  | 'UNCONFIGURED' 
  | 'LOADING' 
  | 'READY' 
  | 'ERROR';

export interface GoogleMapsLoadResult {
  status: GoogleMapsStatus;
  errorMessage?: string;
  google?: typeof google;
}

class GoogleMapsLoaderService {
  private loadPromise: Promise<typeof google> | null = null;
  private status: GoogleMapsStatus = 'UNCONFIGURED';
  private errorMessage?: string;
  private listeners: Set<(result: GoogleMapsLoadResult) => void> = new Set();

  constructor() {
    // Listen for Google Maps Authentication failure (e.g. invalid key or referrer restriction)
    if (typeof window !== 'undefined') {
      (window as any).gm_authFailure = () => {
        this.status = 'ERROR';
        this.errorMessage = 'Google Maps Platform authentication failed. Please verify that your API key is active, has the Maps JavaScript API and Places API enabled, and that HTTP referrer restrictions allow localhost:3000.';
        this.notifyListeners();
      };
    }
  }

  public subscribe(listener: (result: GoogleMapsLoadResult) => void) {
    this.listeners.add(listener);
    // Initial emit
    listener(this.getStatus());
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notifyListeners() {
    const current = this.getStatus();
    this.listeners.forEach(fn => fn(current));
  }

  public getApiKey(): string {
    const envKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    return (envKey && typeof envKey === 'string') ? envKey.trim() : '';
  }

  public hasApiKey(): boolean {
    return this.getApiKey().length > 0;
  }

  public getStatus(): GoogleMapsLoadResult {
    return {
      status: this.status,
      errorMessage: this.errorMessage,
      google: typeof google !== 'undefined' ? google : undefined
    };
  }

  public async load(): Promise<typeof google> {
    const key = this.getApiKey();

    if (!key) {
      this.status = 'UNCONFIGURED';
      this.errorMessage = 'Google Maps API key not found in .env.local';
      this.notifyListeners();
      throw new Error(this.errorMessage);
    }

    if (this.status === 'READY' && typeof google !== 'undefined') {
      return google;
    }

    if (this.loadPromise) {
      return this.loadPromise;
    }

    this.status = 'LOADING';
    this.errorMessage = undefined;
    this.notifyListeners();

    try {
      setOptions({
        key,
        v: 'weekly',
      });

      this.loadPromise = (async () => {
        await Promise.all([
          importLibrary('maps'),
          importLibrary('places'),
          importLibrary('geometry')
        ]);

        if (typeof google === 'undefined') {
          throw new Error('Google Maps object was not attached to window.');
        }

        this.status = 'READY';
        this.errorMessage = undefined;
        this.notifyListeners();
        return google;
      })();

      return await this.loadPromise;
    } catch (err: any) {
      this.status = 'ERROR';
      this.errorMessage = err?.message || 'Failed to load Google Maps JavaScript API.';
      this.loadPromise = null;
      this.notifyListeners();
      throw err;
    }
  }
}

export const googleMapsLoader = new GoogleMapsLoaderService();
