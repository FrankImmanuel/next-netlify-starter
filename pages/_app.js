import '@styles/globals.scss'
import { Inter_Tight } from 'next/font/google'
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';



// If loading a variable font, you don't need to specify the font weight
const inter_tight = Inter_Tight({
  subsets: ['latin'],
  display: 'swap',
})

function Application({ Component, pageProps }) {
  return (
    <main className={GeistSans.className}>
      <Component {...pageProps} />
    </main>
  )
}

export default Application