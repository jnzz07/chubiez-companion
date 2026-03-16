import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface AccessCodeEmailProps {
  email: string
  code: string
  plushName: string
  appUrl: string
  expiresAt: Date
}

export function AccessCodeEmail({
  email,
  code,
  plushName,
  appUrl,
  expiresAt,
}: AccessCodeEmailProps) {
  const loginUrl = `${appUrl}/enter?email=${encodeURIComponent(email)}&code=${code}`
  const expiryStr = expiresAt.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <Html>
      <Head />
      <Preview>your {plushName} is waiting for you 🤍</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={logo}>chubiez.</Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={h1}>
              your {plushName} is ready.
            </Heading>
            <Text style={subtitle}>
              use this code to enter the companion app — your little corner
              of the internet where you and your chubi can exist unbothered.
            </Text>
          </Section>

          {/* Code block */}
          <Section style={codeSection}>
            <Text style={codeLabel}>your access code</Text>
            <Text style={codeBlock}>{code}</Text>
            <Text style={codeHint}>one-time use · expires {expiryStr}</Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Button style={button} href={loginUrl}>
              enter the app →
            </Button>
            <Text style={ctaOr}>or go to chubiez.com/enter and type it in</Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section>
            <Text style={footer}>
              you bought a {plushName}. we think that was a good call.
              <br />
              questions? reply to this email or hit us at hello@chubiez.com
            </Text>
            <Text style={footerSmall}>
              chubiez · this code is for you only · please don&apos;t share it
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: '#FFF8F0',
  fontFamily: "'Syne', 'Inter', sans-serif",
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '520px',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const logo = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1E1B2E',
  letterSpacing: '-0.5px',
  margin: '0',
}

const heroSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const h1 = {
  fontSize: '28px',
  fontWeight: '700',
  color: '#1E1B2E',
  margin: '0 0 12px',
  letterSpacing: '-0.5px',
  lineHeight: '1.2',
}

const subtitle = {
  fontSize: '16px',
  color: '#4B4866',
  lineHeight: '1.6',
  margin: '0',
}

const codeSection = {
  backgroundColor: '#1E1B2E',
  borderRadius: '16px',
  padding: '32px',
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const codeLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#C4B5FD',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  margin: '0 0 12px',
}

const codeBlock = {
  fontSize: '42px',
  fontWeight: '700',
  color: '#FFF8F0',
  letterSpacing: '8px',
  fontFamily: "'Courier New', monospace",
  margin: '0 0 12px',
}

const codeHint = {
  fontSize: '13px',
  color: '#8B84A8',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#FB7185',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  borderRadius: '999px',
  textDecoration: 'none',
  display: 'inline-block',
  marginBottom: '16px',
}

const ctaOr = {
  fontSize: '13px',
  color: '#8B84A8',
  margin: '0',
}

const divider = {
  borderColor: '#E8E0D5',
  margin: '0 0 24px',
}

const footer = {
  fontSize: '14px',
  color: '#4B4866',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 12px',
}

const footerSmall = {
  fontSize: '12px',
  color: '#8B84A8',
  textAlign: 'center' as const,
  margin: '0',
}
