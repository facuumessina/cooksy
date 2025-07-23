// backend/api/emailTemplates/RecoveryEmail.tsx
import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from '@react-email/components';

interface RecoveryEmailProps {
  verificationCode: string;
}

export function RecoveryEmail({ verificationCode }: RecoveryEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ backgroundColor: '#fff', color: '#212121' }}>
        <Preview>Código de recuperación de contraseña</Preview>

        <Container style={{ padding: '20px', margin: '0 auto', backgroundColor: '#eee' }}>
          <Section style={{ backgroundColor: '#fff' }}>
            {/* Logo centrado y más grande */}
            <Section
              style={{
                backgroundColor: '#f4f4f4',
                padding: '24px 0',
              }}
            >
              <Img
                src="cid:cooksy-logo"
                width="100"
                alt="Cooksy Logo"
                style={{
                  display: 'block',
                  marginLeft: 'auto',
                  marginRight: 'auto',
                  objectFit: 'contain',
                }}
              />
            </Section>

            {/* Código y mensaje centrados */}
            <Section style={{ padding: '25px 35px', textAlign: 'center' }}>
              <Heading style={{ color: '#2c2c2c', fontSize: '20px' }}>
                Código de recuperación
              </Heading>
              <Text style={{ color: '#333' }}>
                Usá este código para recuperar tu contraseña:
              </Text>
              <Text style={{ fontSize: '36px', fontWeight: 'bold', textAlign: 'center' }}>
                {verificationCode}
              </Text>
              <Text style={{ textAlign: 'center', color: '#4b0055' }}>
                (Este código es válido por 10 minutos)
              </Text>
            </Section>

            <Hr />

            {/* Pie fijo y sin recorte */}
            <Section style={{ padding: '25px 35px', textAlign: 'center' }}>
              <Text style={{ fontSize: '12px', color: '#2c2c2c', margin: 0 }}>
                Nuestro equipo jamás te pedirá tu contraseña por correo.
              </Text>
              <Text style={{ fontSize: '13px', marginTop: '12px', color: '#2c2c2c' }}>
                El equipo de Cooksy 👨‍🍳 📖
              </Text>
            </Section>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
