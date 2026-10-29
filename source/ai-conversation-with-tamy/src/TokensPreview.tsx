// Temporary page to inspect the design tokens defined in styles/tokens.css.
// It reads every custom property declared on :root, so new tokens show up here
// without editing this file.
import './TokensPreview.css'

type Token = { name: string; value: string }

function readRootTokens(): Token[] {
  const tokens: Token[] = []
  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSRuleList
    try {
      rules = sheet.cssRules
    } catch {
      continue // cross-origin sheet (fonts)
    }
    for (const rule of Array.from(rules)) {
      if (!(rule instanceof CSSStyleRule) || rule.selectorText !== ':root') continue
      for (const name of Array.from(rule.style)) {
        if (name.startsWith('--')) tokens.push({ name, value: rule.style.getPropertyValue(name).trim() })
      }
    }
  }
  return tokens
}

const sections = [
  { title: 'Colors', prefix: '--color-', kind: 'color' },
  { title: 'Font sizes', prefix: '--font-size-', kind: 'type' },
  { title: 'Spacing', prefix: '--space-', kind: 'space' },
  { title: 'Sizes', prefix: '--size-', kind: 'space' },
  { title: 'Radii', prefix: '--radius-', kind: 'radius' },
] as const

const fontWeights = [400, 500, 600, 700]

function TokensPreview() {
  const tokens = readRootTokens()
  const fontFamily = tokens.find((t) => t.name === '--font-family')?.value

  return (
    <main className="preview">
      <h1>Design tokens</h1>
      <p className="preview-note">Design tokens from src/styles/tokens.css.</p>

      {sections.map((section) => {
        const list = tokens.filter((t) => t.name.startsWith(section.prefix))
        return (
          <section key={section.prefix}>
            <h2>{section.title}</h2>
            <ul className="swatch-grid">
              {list.map((token) => (
                <li key={token.name} className="swatch">
                  {section.kind === 'color' && (
                    <div className="swatch-color" style={{ background: `var(${token.name})` }} />
                  )}
                  {section.kind === 'radius' && (
                    <div className="radius-sample" style={{ borderRadius: `var(${token.name})` }} />
                  )}
                  {section.kind === 'space' && (
                    <div className="space-sample" style={{ width: `var(${token.name})` }} />
                  )}
                  {section.kind === 'type' && (
                    <p className="type-size" style={{ fontSize: `var(${token.name})` }}>
                      I’m Tammy
                    </p>
                  )}
                  <code>{token.name}</code>
                  <span>{token.value}</span>
                </li>
              ))}
            </ul>
          </section>
        )
      })}

      <h2>Typography</h2>
      <p>
        <code>--font-family</code>: {fontFamily}
      </p>
      {fontWeights.map((weight) => (
        <p key={weight} className="type-sample" style={{ fontWeight: weight }}>
          {weight} — Hey Tammy, I need to update my processing units
        </p>
      ))}
    </main>
  )
}

export default TokensPreview
