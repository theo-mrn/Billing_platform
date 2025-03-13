import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Text,
  Section,
} from '@react-email/components';
import * as React from 'react';

interface NotionMagicLinkEmailProps {
  name?: string;
  subject?: string;
  message?: string;
}

const baseUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : '';

export const NotionMagicLinkEmail = ({
  name,
  subject,
  message,
}: NotionMagicLinkEmailProps) => (
  <Html>
    <Head />
    <Preview>Nouveau message de contact: {subject || 'Aucun sujet'}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Nouveau message de contact</Heading>
        
        <Section style={section}>
          <Text style={label}>De:</Text>
          <Text style={text}>{name}</Text>
          
          <Text style={label}>Sujet:</Text>
          <Text style={text}>{subject}</Text>
          
          <Text style={label}>Message:</Text>
          <Text style={text}>{message}</Text>
        </Section>
      </Container>
    </Body>
  </Html>
);

NotionMagicLinkEmail.PreviewProps = {
  name: 'John Doe',
  subject: 'Demande de contact',
  message: 'Bonjour, je souhaiterais discuter d\'un projet...',
} as NotionMagicLinkEmailProps;

export default NotionMagicLinkEmail;

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", "Oxygen", "Ubuntu", "Cantarell", "Fira Sans", "Droid Sans", "Helvetica Neue", sans-serif',
};

const container = {
  margin: '0 auto',
  padding: '20px 0 48px',
  width: '100%',
  maxWidth: '600px',
};

const h1 = {
  color: '#1a1a1a',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '40px',
  margin: '0 0 20px',
};

const section = {
  padding: '24px',
  border: '1px solid #eaeaea',
  borderRadius: '5px',
  margin: '28px 0',
};

const label = {
  color: '#666666',
  fontSize: '12px',
  fontWeight: '500',
  margin: '0 0 4px',
};

const text = {
  color: '#1a1a1a',
  fontSize: '14px',
  lineHeight: '24px',
  margin: '0 0 20px',
};
