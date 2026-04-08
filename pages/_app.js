import '@styles/globals.scss'
import { Geist } from 'next/font/google'



// If loading a variable font, you don't need to specify the font weight
const geist = Geist({
  subsets: ['latin'],
  display: 'swap',
})

function Application({ Component, pageProps }) {
  return (
    <main className={geist.className}>
      <Component {...pageProps} />
    </main>
  )
}

export default Application