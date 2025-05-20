import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';
import path from 'path';

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  output: "standalone",
  images: {
    domains: ["lh3.googleusercontent.com"],
  },
  webpack: (config, { isServer }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      "@": path.resolve(__dirname, 'src'),
      "@messages": "./messages",
    };
    
    // Exclure excalidraw du bundle serveur
    if (isServer) {
      const originalEntry = config.entry;
      config.entry = async () => {
        const entries = await originalEntry();
        
        // Traiter les modules spécifiques comme externes
        // Cela empêche l'inclusion du code client dans le bundle serveur
        if (config.externals) {
          const externals = Array.isArray(config.externals) 
            ? config.externals 
            : [config.externals];
          
          config.externals = [
            ...externals,
            {
              '@excalidraw/excalidraw': 'commonjs @excalidraw/excalidraw',
            },
          ];
        }
        
        return entries;
      };
    }
    
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }
    return config;
  },
};

export default withNextIntl(config);
