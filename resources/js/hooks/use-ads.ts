import { useCallback, useEffect, useRef, useState } from 'react';
import axios from 'axios';

interface UseAdsOptions {
   immediate?: boolean;
}

export function useAds(options: UseAdsOptions = {}) {
   const { immediate = true } = options;
   const [ads, setAds] = useState<Ad[]>([]);
   const [loading, setLoading] = useState(false);
   const [error, setError] = useState<string | null>(null);
   const controllerRef = useRef<AbortController | null>(null);

   const fetchAds = useCallback(async () => {
      controllerRef.current?.abort();
      controllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      try {
         const response = await axios.get(route('api.ads.index'), {
            signal: controllerRef.current.signal,
         });

         setAds(response.data?.data || response.data || []);
      } catch (err) {
         if (!axios.isCancel(err)) {
            setError('Unable to load ads right now.');
         }
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
      if (immediate) {
         fetchAds();
      }

      return () => {
         controllerRef.current?.abort();
      };
   }, [fetchAds, immediate]);

   return {
      ads,
      loading,
      error,
      refresh: fetchAds,
   };
}

