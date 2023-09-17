import Head from 'next/head'
import Footer from '@components/Footer'

export default function Style() {
  return (
    <div className="container">
      <Head>
        <title>Next.js Starter!</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className='d-flex justify-content-start align-items-start flex-column'>

        <div className='container-fluid my-5 pt-5'>
          <div className='row'>
            <h1>Style guide and<br />
              <span className='highlight'>components</span>
            </h1>
            <p className='xl mt-3'>The style guide contains important styles and components that are used throughout the template.</p>
          </div>
        </div>

        <div className='container-fluid my-5'>
          <div className='row'>
            <h4 className='mb-3'>Colors</h4>
            <p className='mb-3'>Color distinguishes our brand and helps us create consistent experiences across products.</p>
            <h5 className='my-3'>Neutral</h5>
            <p>Gray is a neutral color and is the foundation of the color system. Almost everything in UI design — text, form fields, backgrounds, dividers — are usually gray.</p>
          </div>
          <div className='row'>
            <div className='col-3'>
              <div className="card p-0">
                <div className="color-preview neutral-0"></div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className='mb-0 me-3 semibold'>0</p>
                    <p className='mb-0 highlight s'>rgba(255, 255, 255, 1)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-3'>
              <div className="card p-0">
                <div className="color-preview neutral-10"></div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className='mb-0 me-3 semibold'>10</p>
                    <p className='mb-0 highlight s'>rgba(249, 250, 251, 1)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-3'>
              <div className="card p-0">
                <div className="color-preview neutral-20"></div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className='mb-0 me-3 semibold'>20</p>
                    <p className='mb-0 highlight s'>rgba(229, 231, 235, 1)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-3'>
              <div className="card p-0">
                <div className="color-preview neutral-30"></div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className='mb-0 me-3 semibold'>30</p>
                    <p className='mb-0 highlight s'>rgba(209, 213, 219, 1)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='row mt-4'>
            <div className='col-3'>
              <div className="card p-0">
                <div className="color-preview neutral-40"></div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className='mb-0 me-3 semibold'>40</p>
                    <p className='mb-0 highlight s'>rgba(174, 178, 186, 1)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-3'>
              <div className="card p-0">
                <div className="color-preview neutral-50"></div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className='mb-0 me-3 semibold'>50</p>
                    <p className='mb-0 highlight s'>rgba(107, 114, 128, 1)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-3'>
              <div className="card p-0">
                <div className="color-preview neutral-60"></div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className='mb-0 me-3 semibold'>60</p>
                    <p className='mb-0 highlight s'>rgba(75, 85, 99, 1)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-3'>
              <div className="card p-0">
                <div className="color-preview neutral-70"></div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className='mb-0 me-3 semibold'>70</p>
                    <p className='mb-0 highlight s'>rgba(55, 65, 81, 1)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className='row mt-4'>
            <div className='col-3'>
              <div className="card p-0">
                <div className="color-preview neutral-80"></div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className='mb-0 me-3 semibold'>80</p>
                    <p className='mb-0 highlight s'>rgba(31, 41, 55, 1)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-3'>
              <div className="card p-0">
                <div className="color-preview neutral-90"></div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className='mb-0 me-3 semibold'>90</p>
                    <p className='mb-0 highlight s'>rgba(17, 24, 39, 1)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-3'>
              <div className="card p-0">
                <div className="color-preview neutral-100"></div>
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-center">
                    <p className='mb-0 me-3 semibold'>100</p>
                    <p className='mb-0 highlight s'>rgba(3, 7, 18, 1)</p>
                  </div>
                </div>
              </div>
            </div>
            <div className='col-3 hidden'>
            </div>
          </div>
        </div>

        <div className='container-fluid my-5'>
          <div className='row py-5'>
            <h4 className='mb-3'>Typography</h4>
            <p className='mb-3'>The main typeface is Inter Tight. Both using form Goole Font A tranquil and fresh geometric sans font family for clear text and headlines.</p>
          </div>
          <div className='row mt-3 '>
            <h5 className='mb-3'>Inter Tight</h5>
            <div className='d-flex flex-row'>
              <p className='bold xl me-3'>Bold</p>
              <p className='semibold xl me-3'>Semibold</p>
              <p className='medium xl me-3'>Medium</p>
              <p className='xl'>Regular</p>
            </div>
          </div>
          <div className='row my-5'>
            <h6 className='py-4 mb-3 border-bottom border-top'>Heading – Desktop</h6>
            <div className='d-flex align-items-center justify-content-between pb-3 border-bottom'>
              <div className=''><p className='bold m-0'>Heading 1</p></div>
              <div className=''><p className='s m-0'>Inter Tight/ Bold</p></div>
              <div className=''><p className='s m-0'>104px<span className='ms-2'>100%</span></p></div>
              <div className=' text-end col-6'><h1>Heading 1</h1></div>
            </div>
            <div className='d-flex align-items-center justify-content-between py-3 border-bottom'>
              <div className=''><p className='bold m-0'>Heading 2</p></div>
              <div className=''><p className='s m-0'>Inter Tight/ SemiBold</p></div>
              <div className=''><p className='s m-0'>72px<span className='ms-2'>100%</span></p></div>
              <div className='text-end col-6'><h2>Heading 2</h2></div>
            </div>
            <div className='d-flex align-items-center justify-content-between py-3 border-bottom'>
              <div className=''><p className='bold m-0'>Heading 3</p></div>
              <div className=''><p className='s m-0'>Inter Tight/ SemiBold</p></div>
              <div className=''><p className='s m-0'>64px<span className='ms-2'>100%</span></p></div>
              <div className='text-end col-6'><h3>Heading 3</h3></div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
