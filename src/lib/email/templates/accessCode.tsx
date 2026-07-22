import {
  Body,
  Container,
  Font,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'

const APP_STORE_URL = 'https://apps.apple.com/us/app/bemellou/id6776437223'

interface AccessCodeEmailProps {
  code: string
  logoUrl: string
  peekUrl: string
  /* Team-editable copy — placeholders already filled by sendAccessCodeEmail */
  heading: string
  intro: string
  footer: string
}

export function AccessCodeEmail({
  code,
  logoUrl,
  peekUrl,
  heading,
  intro,
  footer,
}: AccessCodeEmailProps) {
  return (
    <Html>
      <Head>
        {/*
          Most phone mail apps (Gmail app on iOS/Android especially) strip
          @font-face entirely and always render the fallback — they never
          download webFont. So the fallback below is what most recipients
          actually see; it has to look intentional on its own, not just be
          a generic placeholder. Trebuchet MS is a rounded humanist sans
          available on both Windows and Apple mail clients and is the
          closest system-safe match to Quicksand's geometry.
        */}
        <Font
          fontFamily="Baloo 2"
          fallbackFontFamily="Trebuchet MS"
          webFont={{
            url: 'https://fonts.gstatic.com/s/baloo2/v23/wXK0E3kTposypRydzVT08TS3JnAmtdj9yqpv.ttf',
            format: 'truetype',
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        <Font
          fontFamily="Quicksand"
          fallbackFontFamily="Trebuchet MS"
          webFont={{
            url: 'https://fonts.gstatic.com/s/quicksand/v37/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkM0o18E.ttf',
            format: 'truetype',
          }}
          fontWeight={500}
          fontStyle="normal"
        />
        <Font
          fontFamily="Quicksand"
          fallbackFontFamily="Trebuchet MS"
          webFont={{
            url: 'https://fonts.gstatic.com/s/quicksand/v37/6xK-dSZaM9iE8KbpRA_LJ3z8mH9BOJvgkBgv18E.ttf',
            format: 'truetype',
          }}
          fontWeight={700}
          fontStyle="normal"
        />
        {/* Gloria Hallelujah almost never loads on mobile mail apps — its
            fallback below is styled to still look like an intentional
            accent (italic serif) rather than a broken generic cursive. */}
        <Font
          fontFamily="Gloria Hallelujah"
          fallbackFontFamily="Georgia"
          webFont={{
            url: 'https://fonts.gstatic.com/s/gloriahallelujah/v24/LYjYdHv3kUk9BMV96EIswT9DIbW-MLSy.ttf',
            format: 'truetype',
          }}
          fontWeight={400}
          fontStyle="normal"
        />
        <style>{`
          @media only screen and (max-width: 480px) {
            .bmo-container { padding: 28px 16px !important; }
            .bmo-h1 { font-size: 22px !important; }
            .bmo-code { font-size: 30px !important; letter-spacing: 4px !important; }
            .bmo-code-section { padding: 22px 12px !important; }
            .bmo-logo { width: 130px !important; }
            .bmo-quote { font-size: 15px !important; }
            .bmo-peek { width: 140px !important; }
          }
        `}</style>
      </Head>
      <Preview>{heading}</Preview>
      <Body style={main}>
        <Container style={container} className="bmo-container">

          {/* Header — real Sky Blue wordmark on Soft Cream, per wordmark rule */}
          <Section style={header}>
            <Img src={logoUrl} width="160" alt="bemellou" style={logo} className="bmo-logo" />
          </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={h1} className="bmo-h1">{heading}</Heading>
            <Text style={subtitle}>{intro}</Text>
          </Section>

          {/* Benny & Vita peeking over the code card — real product photo,
              background removed. The card behind (opaque, painted after in
              flow) covers their lower half, so a negative margin here is
              enough to fake the overlap without any positioning tricks. */}
          <Section style={peekWrap}>
            <Img src={peekUrl} width="185" alt="" style={peekImg} className="bmo-peek" />
          </Section>

          {/* Code block — charcoal surface, sky blue label, cream code */}
          <Section style={codeSection} className="bmo-code-section">
            <Text style={codeLabel}>your access code</Text>
            <Text style={codeBlock} className="bmo-code">{code}</Text>
            <Text style={codeHint}>one-time use · never expires</Text>
          </Section>

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaOr}>type this code into the bemellou app to unlock it</Text>
          </Section>

          {/* App Store link — no official badge asset embedded (Apple requires
              their unmodified artwork, not a recreation), so a plain styled
              link instead. Android is on the way, add its link here later. */}
          <Section style={storeSection}>
            <Link href={APP_STORE_URL} style={storeLink}>
              find the bemellou app on the App Store →
            </Link>
          </Section>

          {/* Brand promise, Gloria Hallelujah accent per typography rules */}
          <Section style={quoteSection}>
            <Text style={quote} className="bmo-quote">“we don’t fix you. we’re just here for you.”</Text>
          </Section>

          {/* No visual divider line here on purpose. A thin horizontal bar
              directly followed by smaller, muted text is the classic
              email-signature pattern — the exact thing Gmail's "quoted
              content" heuristic looks for, regardless of which HTML tag
              draws the line. Removing the line (not just changing its
              tag) is the actual fix; spacing alone separates the sections. */}

          {/* Footer */}
          <Section style={footerSection}>
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
  fontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
}

const container = {
  margin: '0 auto',
  padding: '40px 20px',
  maxWidth: '520px',
  width: '100%',
}

const header = {
  textAlign: 'center' as const,
  marginBottom: '28px',
}

const logo = {
  margin: '0 auto',
  height: 'auto',
  maxWidth: '100%',
}

const heroSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const h1 = {
  fontFamily: "'Baloo 2', 'Trebuchet MS', sans-serif",
  fontSize: '28px',
  fontWeight: '700',
  color: '#303030',
  margin: '0 0 12px',
  letterSpacing: '-0.5px',
  lineHeight: '1.25',
}

const subtitle = {
  fontSize: '16px',
  color: '#303030',
  opacity: 0.75,
  lineHeight: '1.6',
  margin: '0',
}

const peekWrap = {
  textAlign: 'center' as const,
  marginBottom: '-18px',
}

const peekImg = {
  margin: '0 auto',
  height: 'auto',
  maxWidth: '100%',
}

const codeSection = {
  backgroundColor: '#303030',
  borderRadius: '16px',
  padding: '32px 16px',
  textAlign: 'center' as const,
  marginBottom: '32px',
}

const codeLabel = {
  fontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
  fontSize: '12px',
  fontWeight: '600',
  color: '#8ed1fc',
  letterSpacing: '2px',
  textTransform: 'uppercase' as const,
  margin: '0 0 12px',
}

const codeBlock = {
  fontSize: '38px',
  fontWeight: '700',
  color: '#fffcf4',
  letterSpacing: '6px',
  whiteSpace: 'nowrap' as const,
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

const storeSection = {
  textAlign: 'center' as const,
  marginBottom: '28px',
}

const storeLink = {
  display: 'inline-block',
  fontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
  fontSize: '14px',
  fontWeight: '700',
  color: '#fffcf4',
  backgroundColor: '#303030',
  borderRadius: '8px',
  padding: '10px 20px',
  textDecoration: 'none',
}

const quoteSection = {
  textAlign: 'center' as const,
  marginBottom: '32px',
  padding: '0 16px',
}

const quote = {
  fontFamily: "'Gloria Hallelujah', Georgia, serif",
  fontStyle: 'italic' as const,
  fontSize: '17px',
  color: '#0d7f6e',
  lineHeight: '1.6',
  margin: '0',
  wordWrap: 'break-word' as const,
}

const footerSection = {
  marginTop: '24px',
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
