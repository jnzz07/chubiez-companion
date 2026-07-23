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
        {/* Declares that this email provides its own authored light AND
            dark variant (see the prefers-color-scheme block below) — this
            tells clients to trust our design rather than substituting
            their own automatic recoloring. */}
        <meta name="color-scheme" content="light dark" />
        <meta name="supported-color-schemes" content="light dark" />
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
        <style>{`
          @media only screen and (max-width: 480px) {
            .bmo-container { padding: 28px 16px !important; }
            .bmo-h1 { font-size: 22px !important; }
            .bmo-code { font-size: 30px !important; letter-spacing: 4px !important; }
            .bmo-code-section { padding: 22px 12px !important; }
            .bmo-logo { width: 180px !important; }
            .bmo-quote { font-size: 15px !important; }
            .bmo-peek { display: block !important; }
          }
          /* No page background at all anymore — the page just uses
             whatever native canvas the mail client shows (white in light
             mode, its own dark surface in dark mode), so there's nothing
             for any dark-mode engine to fight over. Only two elements
             keep their own explicit color, because they need contrast
             to read as a distinct design element regardless of what's
             behind them: the code card and the CTA button. Text color
             still needs to flip for legibility against whichever native
             canvas is showing. */
          @media (prefers-color-scheme: dark) {
            .bmo-charcoal-text { color: #fffcf4 !important; }
            .bmo-dark-card { background-color: #fffcf4 !important; }
            .bmo-cream-text { color: #303030 !important; }
            .bmo-sky-text { color: #0d7f6e !important; }
          }
          [data-ogsc] .bmo-charcoal-text { color: #fffcf4 !important; }
          [data-ogsc] .bmo-dark-card, [data-ogsb] .bmo-dark-card { background-color: #fffcf4 !important; }
          [data-ogsc] .bmo-cream-text { color: #303030 !important; }
          [data-ogsc] .bmo-sky-text { color: #0d7f6e !important; }
        `}</style>
      </Head>
      <Preview>{heading}</Preview>
      <Body style={main}>
        {/* No background here at all — the page renders on whatever
            native canvas the mail client provides. */}
        <table role="presentation" width="100%" style={outerTable}>
          <tbody>
            <tr>
              <td align="center">
                <Container style={container} className="bmo-container">

                  {/* Header — real Sky Blue wordmark on Soft Cream, per wordmark rule */}
                  <Section style={header}>
                    <Img src={logoUrl} width="220" alt="bemellou" style={logo} className="bmo-logo" />
                  </Section>

          {/* Hero */}
          <Section style={heroSection}>
            <Heading style={h1} className="bmo-h1 bmo-charcoal-text">{heading}</Heading>
            <Text style={subtitle} className="bmo-charcoal-text">{intro}</Text>
          </Section>

          {/* Benny & Vita — mobile only. display:none by default (inline
              CSS, honored far more consistently across mail clients than
              the HTML `hidden` attribute); the max-width:480px query
              above flips it back to block on phone mail apps that
              support media queries (Gmail app, Apple Mail). Desktop
              clients without media-query support (older Outlook) simply
              never show it, which is the safe fallback for "computer". */}
          <Section style={peekWrap}>
            <Img src={peekUrl} width="185" alt="" style={peekImg} className="bmo-peek" />
          </Section>

          {/* Code block — charcoal surface (cream in dark mode) */}
          <table
            role="presentation"
            width="100%"
            bgcolor="#303030"
            style={codeSection}
            className="bmo-dark-card"
          >
            <tbody>
              <tr>
                <td style={codeSectionInner} className="bmo-code-section">
                  <Text style={codeLabel} className="bmo-sky-text">Your access code</Text>
                  <Text style={codeBlock} className="bmo-code bmo-cream-text">{code}</Text>
                  <Text style={codeHint} className="bmo-cream-text">One-time use · never expires</Text>
                </td>
              </tr>
            </tbody>
          </table>

          {/* CTA */}
          <Section style={ctaSection}>
            <Text style={ctaOr} className="bmo-charcoal-text">Type this code into the bemellou app to unlock it</Text>
          </Section>

          {/* App Store link — no official badge asset embedded (Apple requires
              their unmodified artwork, not a recreation), so a plain styled
              link instead. Android is on the way, add its link here later. */}
          <Section style={storeSection}>
            <Link href={APP_STORE_URL} style={storeLink}>
              Find the bemellou app on the App Store →
            </Link>
          </Section>

          {/* Brand promise, italic accent */}
          <Section style={quoteSection}>
            <Text style={quote} className="bmo-quote bmo-charcoal-text">“We don’t fix you. We’re just here for you.”</Text>
          </Section>

          {/* Footer — deliberately the SAME size/weight as the rest of the
              body (no smaller muted text block). A visually distinct
              small-print block right after the main content is the
              other classic "signature/quoted content" pattern mail
              clients key off, on top of the divider line already
              removed. */}
          <Section style={footerSection}>
            {footer.split('\n').map((line, i) => (
              <Text key={i} style={footerStyle} className="bmo-charcoal-text">{line}</Text>
            ))}
            <Text style={footerStyle} className="bmo-charcoal-text">
              bemellou · This code is for you only · Please don&apos;t share it
            </Text>
          </Section>

                </Container>
              </td>
            </tr>
          </tbody>
        </table>
      </Body>
    </Html>
  )
}

// ── Styles — Bemellou Brand Book palette ────────────────────────────────────
// Soft Cream #fffcf4 (background, never pure white) · Charcoal #303030 (text,
// never pure black) · Sky Blue #8ed1fc (primary/highlights) · Rich Teal
// #0d7f6e (CTA only). Quicksand throughout — the only font used in this email.

const main = {
  fontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
}

const outerTable = {
  margin: 0,
  padding: 0,
  borderCollapse: 'collapse' as const,
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
  fontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
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
  display: 'none' as const,
}

const codeSection = {
  backgroundColor: '#303030',
  borderRadius: '16px',
  marginBottom: '32px',
}

const codeSectionInner = {
  textAlign: 'center' as const,
  padding: '32px 16px',
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
  fontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
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
  backgroundColor: '#0d7f6e',
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
  fontFamily: "'Quicksand', 'Trebuchet MS', sans-serif",
  fontStyle: 'italic' as const,
  fontSize: '17px',
  color: '#303030',
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

