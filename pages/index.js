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
            <p className='xxl medium mt-3'>Hello, I'm Samuel.</p>
            <h1>I create <span className='highlight'>art</span> and design digital products with focus on <span className='highlight'>visual design.</span>
            </h1>
            <div className='d-flex justify-content-between align-items-center my-5'>
            <a className='btn btn-primary me-2 btn-lg' href="mailto:s.sjoblom@gmail.com">Let’s Talk</a>
            <p className='xl mt-3 col-6'>I'm a multidisciplinary designer comfortable both front of the frontline in the code and as an illustrator.</p>
            </div>
          </div>
        </div>
        <div className='container-fluid my-5 pt-5'>
          <div className='row'>
            <h5>Selected works
            </h5>
            <div className='d-flex justify-content-between align-items-center my-5 border-bottom'>
              <img src="./sauna-02.png" class="img-fluid" alt="..."/>
            </div>
            <h6 className='xl medium'>"Sauna"</h6>
            <p>A personal project with the ain to create fresh sauna material.</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
