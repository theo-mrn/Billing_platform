import createNextIntlPlugin from 'next-intl/plugin';
import type { NextConfig } from 'next';

const withNextIntl = createNextIntlPlugin();

const config: NextConfig = {
  output: "standalone",
  // Autres configurations si nécessaire
};

export default withNextIntl(config);
