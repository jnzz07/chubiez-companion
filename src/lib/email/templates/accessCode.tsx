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
  appUrl: string
  expiryStr: string
  /* Team-editable copy — placeholders already filled by sendAccessCodeEmail */
  heading: string
  intro: string
  footer: string
}

export function AccessCodeEmail({
  email,
  code,
  appUrl,
  expiryStr,
  heading,
  intro,
  footer,
}: AccessCodeEmailProps) {
  const loginUrl = `${appUrl}/enter?email=${encodeURIComponent(email)}&code=${code}`

  return (
    <Html>
      <Head />
      <Preview>{heading}</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header */}
          <Section style={header}>
            <Text style={logo}>bemellou.</Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={h1}>{heading}</Heading>
            <Text style={subtitle}>{intro}</Text>
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
            <Text style={ctaOr}>or go to bemellou.com/enter and type it in</Text>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section>
            {footer.split('\n').map((line, i) => (
              <Text key={i} style={footerStyle}>{line}</Text>
            ))}
            <Text style={footerSmall}>
              bemellou · this code is for you only · please don&apos;t share it
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

// ── Styles ──────────────────────────────────────────────────────────────────

const main = {
  backgroundColor: '#fffcf4',
  fontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
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
  fontFamily: "'Baloo 2', 'Quicksand', sans-serif",
  fontSize: '28px',
  fontWeight: '700',
  color: '#303030',
  letterSpacing: '-0.5px',
  margin: '0',
}

const heroSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const h1 = {
  fontFamily: "'Baloo 2', 'Quicksand', sans-serif",
  fontSize: '28px',
  fontWeight: '700',
  color: '#303030',
  margin: '0 0 12px',
  letterSpacing: '-0.5px',
  lineHeight: '1.2',
}

const subtitle = {
  fontSize: '16px',
  color: '#565656',
  lineHeight: '1.6',
  margin: '0',
}

const codeSection = {
  backgroundColor: '#303030',
  borderRadius: '16px',
  padding: '32px',
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const codeLabel = {
  fontSize: '12px',
  fontWeight: '600',
  color: '#8ed1fc',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  margin: '0 0 12px',
}

const codeBlock = {
  fontSize: '42px',
  fontWeight: '700',
  color: '#fffcf4',
  letterSpacing: '8px',
  fontFamily: "'Courier New', monospace",
  margin: '0 0 12px',
}

const codeHint = {
  fontSize: '13px',
  color: '#7a7a7a',
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const button = {
  backgroundColor: '#0d7f6e',
  color: '#ffffff',
  fontSize: '16px',
  fontWeight: '600',
  padding: '14px 32px',
  borderRadius: '8px',
  textDecoration: 'none',
  display: 'inline-block',
  marginBottom: '16px',
}

const ctaOr = {
  fontSize: '13px',
  color: '#7a7a7a',
  margin: '0',
}

const divider = {
  borderColor: '#E8E0D5',
  margin: '0 0 24px',
}

const footerStyle = {
  fontSize: '14px',
  color: '#565656',
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 12px',
}

const footerSmall = {
  fontSize: '12px',
  color: '#7a7a7a',
  textAlign: 'center' as const,
  margin: '0',
}
