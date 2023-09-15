import Head from 'next/head'
import Header from '@components/Header'
import Footer from '@components/Footer'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Next.js Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Header title="Welcome to samuelsjoblom.com" />
        <p className="description">
          I'm working on a new look and feel of my homepage so there will not be that much to see for a while.
        </p>
      </main>

      <Footer />
    </div>
  )
}
