import { IconsIcon } from '../src/sprite'

export default function Page() {
  return (
    <main>
      <h1>Next.js Pages Router + Turbopack</h1>
      <IconsIcon
        data-testid="icon"
        data-app="next-pages-turbopack"
        icon="check"
        aria-label="Check icon"
        width={64}
        height={64}
        style={{ '--icon-color-1': '#16a34a' }}
      />
    </main>
  )
}
