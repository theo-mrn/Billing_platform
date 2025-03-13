import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

/** @type {import('next').NextConfig} */
const config = {
  // Autres configurations si nécessaire
};

export default withNextIntl(config);
