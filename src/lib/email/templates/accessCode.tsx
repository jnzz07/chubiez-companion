import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface AccessCodeEmailProps {
  code: string
  expiryStr: string
  /* Team-editable copy — placeholders already filled by sendAccessCodeEmail */
  heading: string
  intro: string
  footer: string
}

export function AccessCodeEmail({
  code,
  expiryStr,
  heading,
  intro,
  footer,
}: AccessCodeEmailProps) {
  return (
    <Html>
      <Head>
        <Font
          fontFamily="Baloo 2"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/baloo2/v20/wXKvE3UZus5Cb9Ee-EnPqfN0bQ.woff2',
            format: 'woff2',
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        <Font
          fontFamily="Quicksand"
          fallbackFontFamily="Verdana"
          webFont={{
            url: 'https://fonts.gstatic.com/s/quicksand/v31/6xK-dSZaM9iE8KbpRA_hK1QNYuDyPw.woff2',
            format: 'woff2',
          }}
          fontWeight={500}
          fontStyle="normal"
        />
        <Font
          fontFamily="Gloria Hallelujah"
          fallbackFontFamily="cursive"
          webFont={{
            url: 'https://fonts.gstatic.com/s/gloriahallelujah/v22/LYjYdHv5lFcTPTBCFhCbCEnAxg3nSpMDrBw.woff2',
            format: 'woff2',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
      </Head>
      <Preview>{heading}</Preview>
      <Body style={main}>
        <Container style={container}>

          {/* Header — icon + wordmark lockup, sky blue on soft cream */}
          <Section style={header}>
            <Text style={logo}>bemellou.</Text>
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={h1}>{heading}</Heading>
            <Text style={subtitle}>{intro}</Text>
          </Section>

          {/* Code block — charcoal surface, sky blue label, cream code */}
          <Section style={codeSection}>
            <Text style={codeLabel}>your access code</Text>
            <Text style={codeBlock}>{code}</Text>
            <Text style={codeHint}>one-time use · expires {expiryStr}</Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaOr}>type this code into the bemellou app to unlock it</Text>
          </Section>

          {/* Brand promise, Gloria Hallelujah accent per typography rules */}
          <Section style={quoteSection}>
            <Text style={quote}>&ldquo;we don&apos;t fix you. we&apos;re just here for you.&rdquo;</Text>
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

// ── Styles — Bemellou Brand Book palette ────────────────────────────────────
// Soft Cream #fffcf4 (background, never pure white) · Charcoal #303030 (text,
// never pure black) · Sky Blue #8ed1fc (primary/highlights) · Rich Teal
// #0d7f6e (CTA only). Baloo 2 for headlines, Quicksand for body,
// Gloria Hallelujah for the one brand-promise accent line — max 2 lines.

const main = {
  backgroundColor: '#fffcf4',
  fontFamily: "'Quicksand', Verdana, sans-serif",
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
  fontFamily: "'Baloo 2', Verdana, sans-serif",
  fontSize: '28px',
  fontWeight: '700',
  color: '#8ed1fc',
  letterSpacing: '-0.5px',
  margin: '0',
}

const heroSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const h1 = {
  fontFamily: "'Baloo 2', Verdana, sans-serif",
  fontSize: '28px',
  fontWeight: '700',
  color: '#303030',
  margin: '0 0 12px',
  letterSpacing: '-0.5px',
  lineHeight: '1.2',
}

const subtitle = {
  fontSize: '16px',
  color: '#303030',
  opacity: 0.75,
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
  fontFamily: "'Quicksand', Verdana, sans-serif",
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
  color: '#fffcf4',
  opacity: 0.6,
  margin: '0',
}

const ctaSection = {
  textAlign: 'center' as const,
  marginBottom: '24px',
}

const ctaOr = {
  fontSize: '14px',
  color: '#303030',
  opacity: 0.75,
  margin: '0',
}

const quoteSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
  padding: '0 24px',
}

const quote = {
  fontFamily: "'Gloria Hallelujah', cursive",
  fontSize: '18px',
  color: '#0d7f6e',
  lineHeight: '1.5',
  margin: '0',
}

const divider = {
  borderColor: '#303030',
  opacity: 0.12,
  margin: '0 0 24px',
}

const footerStyle = {
  fontSize: '14px',
  color: '#303030',
  opacity: 0.75,
  lineHeight: '1.6',
  textAlign: 'center' as const,
  margin: '0 0 12px',
}

const footerSmall = {
  fontSize: '12px',
  color: '#303030',
  opacity: 0.5,
  textAlign: 'center' as const,
  margin: '0',
}
