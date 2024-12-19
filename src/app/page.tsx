import makeBlockie from 'ethereum-blockies-base64'
import styles from './page.module.css'

export default function Home() {
  return (
    <>
      <header>
        <h2>{'Safe{DEMO}'}</h2>
        {true ? (
          <button className={styles.connectButton}>Connect Wallet</button>
        ) : (
          <button className={styles.connectButton}>Disconnect</button>
        )}
      </header>
      <main>
        <h1>Application Title</h1>
        <a
          href="https://github.com/5afe/safe-tutorial-template"
          target="_blank"
        >
          GitHub Repository
        </a>
        <a href="https://docs.safe.global" target="_blank">
          Safe Developer Documentation
        </a>
        <p>
          Applications can include components such as <a href="#cards">Cards</a>
          , <a href="#grids">Grids</a>, <a href="#sections">Sections</a>,{' '}
          <a href="#paragraphs">Paragraphs</a>, Titles, Links,{' '}
          <a href="#addresses">Addresses</a>, <a href="#forms">Forms</a>,{' '}
          <a href="#buttons">Buttons</a>, <a href="#callouts">Callouts</a>, and{' '}
          <a href="#boxes">Boxes</a>. All components are responsive, and fully
          support both light and dark themes.
        </p>

        <div className="card" id="cards">
          <h2>Cards</h2>
          <p>Simple Card.</p>
        </div>

        <div className="grid" id="grids">
          <div className="card">
            <h2>Card 1 in Grid</h2>
            <p>Simple card inside a Grid.</p>
          </div>
          <div className="card">
            <h2>Card 2 in Grid</h2>
            <p>Simple card inside a Grid.</p>
          </div>
        </div>

        <div className="card" id="sections">
          <div className="section">
            <h2>Card Section 1</h2>
            <div>
              <p>Cards can include multiple sections.</p>
              <p>Sections can have multiple components inside.</p>
              <p className="loading">
                Loading text before a result is revealed...
              </p>
            </div>
          </div>
          <div className="section">
            <h2>Card Section 2</h2>
            <div>
              <p>Sections can be split with a separator line.</p>
              <div className="separator" />
              <p>Sections can be split with a separator line.</p>
              <div className="separator" />
              <p>Sections can be split with a separator line.</p>
            </div>
          </div>
        </div>

        <div className="card" id="addresses">
          <div className="section">
            <h2>Addresses</h2>
            <div>
              <p>Applications can use Ethereum addresses with identicons.</p>
              <div className="address">
                <img
                  className="blockie"
                  src={makeBlockie(
                    '0x1111111111111111111111111111111111111111'
                  )}
                />
                <pre>0x1111111111111111111111111111111111111111</pre>
              </div>
            </div>
          </div>
        </div>

        <div className="card" id="forms">
          <div className="section">
            <h2>Forms</h2>
            <div>
              <p>
                Applications can have different input fields to create forms
                like the one below. There are two types of fields: text, and
                number.
              </p>
              <p className="title">Number field name</p>
              <input type="number" placeholder="Placeholder" />
              <p className="title">Text field name</p>
              <input type="text" placeholder="Placeholder" />
            </div>
          </div>
        </div>

        <div className="card" id="buttons">
          <div className="section">
            <h2>Buttons</h2>
            <div>
              <p>
                Applications can have buttons of two types: primary and
                secondary buttons.
              </p>
              <div className="actions">
                <a href="">
                  <button className="primary-button">Primary Button</button>
                </a>
                <a href="">
                  <button className="secondary-button">Secondary Button</button>
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="card" id="callouts">
          <div className="section">
            <h2>Callouts</h2>
            <div>
              <p>
                Applications can use callouts like the ones listed below. There
                are four types: SUCCESS, INFO, WARNING, and ERROR. Within each
                callout, you can add a title, paragraphs, links, addresses, and
                buttons. All of these elements are optional and can be combined
                in many ways to suit your needs.
              </p>
              <div className="callout-success">
                <p>
                  This is a SUCCESS callout. <a href="">This is a link.</a>
                </p>
                <div className="address">
                  <img
                    className="blockie"
                    src={makeBlockie(
                      '0x2222222222222222222222222222222222222222'
                    )}
                  />
                  <pre>0x2222222222222222222222222222222222222222</pre>
                </div>
              </div>
              <div className="callout-info">
                <p>This is an INFO callout.</p>
                <a href="">This is a link.</a>
                <div className="actions">
                  <a href="">
                    <button className="secondary-button">Call to action</button>
                  </a>
                </div>
              </div>
              <div className="callout-warning">
                <p>This is a WARNING callout.</p>
              </div>
              <div className="callout-error">
                <p className="title">Callout Title</p>
                <p>This is an ERROR callout.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card" id="boxes">
          <div className="section">
            <h2>Boxes</h2>
            <div>
              <p>
                Applications can have boxes like the ones listed below. Within
                each box, you can add a title, paragraphs, links, callouts,
                forms, and buttons. All of these elements are optional and can
                be combined in many ways to suit your needs.
              </p>
              <div className="box">
                <p>
                  This is a box. <a href="">This is a link.</a>
                </p>
              </div>
              <div className="box">
                <p className="title">Address</p>
                <input type="text" placeholder="Address" />
              </div>
              <div className="box">
                <p>This is a box.</p>
                <div className="address">
                  <img
                    className="blockie"
                    src={makeBlockie(
                      '0x3333333333333333333333333333333333333333'
                    )}
                  />
                  <pre>0x3333333333333333333333333333333333333333</pre>
                </div>
              </div>
              <div className="box">
                <p className="title">Box Title</p>
                <p>This is a box.</p>
                <div className="callout-warning">
                  <p>
                    This is a WARNING callout. <a href="">This is a link.</a>
                  </p>
                  <div className="actions">
                    <a href="">
                      <button className="secondary-button">
                        Call to action
                      </button>
                    </a>
                  </div>
                </div>
                <div className="actions">
                  <a href="">
                    <button className="primary-button">Call to action</button>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
