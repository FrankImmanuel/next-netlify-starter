import Head from 'next/head'
import Footer from '@components/Footer'

export default function Home() {
  return (
    <div className="container">
      <Head>
        <title>Next.js Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='d-flex justify-content-start align-items-start flex-column'>

        <div className='container-fluid my-5 pt-5'>
          <div className='row'>
            <h3>Hi.</h3>
            <p className='xxl light'>I work with UX & Graphic design <a href='http://djakne.com'>here</a>. In my spare time I like to play atound with various creative projects. At the moment I am learning to how to photograph.</p>
            <div className='d-flex justify-content-between align-items-center my-5'>
              <div>
              <a className='btn btn-primary me-2 btn-lg' href="mailto:s.sjoblom@gmail.com">Contact</a>
              <a className='btn btn-primary me-2 btn-lg' href="https://www.instagram.com/snabb.studio/">Instagram</a>
              </div>
              <p className='xl mt-3 col-6'></p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
