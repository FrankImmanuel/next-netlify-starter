import '@styles/globals.scss'
import { Inter_Tight } from 'next/font/google'

// If loading a variable font, you don't need to specify the font weight
const inter_tight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
})

function Application({ Component, pageProps }) {
  return (
    <main className={inter_tight.className}>
      <Component {...pageProps} />
    </main>
  )
}

export default Application