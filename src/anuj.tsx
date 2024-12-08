import { useState } from 'react';
import App from './App';
import MetaMask from './metamask';

export default function Anuj() {
  const [currentStep, setCurrentStep] = useState('step-1');
  const [hostCode, setHostCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [showJoinSpinner, setShowJoinSpinner] = useState(false);
  const [numarray, setNumarray] = useState<number[]>([]);
  const [result, setResult] = useState<number | null>(null);
  const [app] = useState(() => new App());

  async function handleHost() {
    const code = app.generateJoiningCode();
    setHostCode(code);
    setCurrentStep('step-2-host');
    await app.connect(code, 'alice');
    setCurrentStep('step-3');
  }

  async function handleJoin() {
    setCurrentStep('step-2-join');
  }

  async function handleJoinSubmit() {
    setShowJoinSpinner(true);
    await app.connect(joinCode, 'bob');
    setCurrentStep('step-3');
  }

  async function handleSubmitNumber() {

    setCurrentStep('step-4');
    console.log(numarray);
    const mpcResult = await app.mpcLargest(numarray);
    console.log(mpcResult);
    setResult(mpcResult);
    setCurrentStep('step-5');
  }

  const handleKeyDown = (handler: () => void) => (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handler();
    }
  };

  return (
    <div className="app">
      <div className="header">MPC Hello</div>

      <MetaMask />

      <div className="step-container">
        <div className={`step ${currentStep !== 'step-1' ? 'hidden' : ''}`}>
          <div style={{ textAlign: 'left' }}>
            Welcome to the hello-world of MPC
            (<a href="https://github.com/voltrevo/mpc-hello">view source</a>).
          </div>
          <div style={{ textAlign: 'left', marginTop: '1em' }}>
            To start, one party should click host. This will generate a code that
            the other party can use to join. It's an end-to-end encrypted P2P
            connection. There is no server.
          </div>
          <div style={{ textAlign: 'left', marginTop: '1em' }}>
            Once connected, both parties will enter a number and the
            larger number will be calculated. The smaller number is kept
            cryptographically secret.
          </div>
          <div style={{ textAlign: 'left', marginTop: '1em' }}>
            This is just a simple example, but mpc-framework makes it easy
            to do this with any function.
          </div>
          <div>
            <button onClick={handleHost}>Host</button>&nbsp;
            <button onClick={handleJoin}>Join</button>
          </div>
        </div>

        <div className={`step ${currentStep !== 'step-2-host' ? 'hidden' : ''}`}>
          <p>Joining code:</p>
          <div className="code-box">{hostCode}</div>
        </div>

        <div className={`step ${currentStep !== 'step-2-join' ? 'hidden' : ''}`}>
          <div>
            <label htmlFor="join-code-input">Enter host code:</label>
            <input
              type="text"
              id="join-code-input"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              onKeyDown={handleKeyDown(handleJoinSubmit)}
            />
          </div>
          {!showJoinSpinner ? (
            <div>
              <button onClick={handleJoinSubmit}>Join</button>
            </div>
          ) : (
            <div className="spinner-container">
              <div className="spinner"></div>
            </div>
          )}
        </div>

        <div className={`step ${currentStep !== 'step-3' ? 'hidden' : ''}`}>
          <div>
            <label htmlFor="number-input">Enter your number:</label>
            <input
              type="number"
              id="number-input"
              value={numarray[0]}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                if (!isNaN(newValue)) {
                  setNumarray([...numarray, newValue]);
                }
              }}
              onKeyDown={handleKeyDown(handleSubmitNumber)}
            />
          </div>

          <div>
            <label htmlFor="number-input">Enter your number:</label>
            <input
              type="number"
              id="number-input-1"
              value={numarray[1]}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                if (!isNaN(newValue)) {
                  setNumarray([...numarray, newValue]);
                }
              }}
              onKeyDown={handleKeyDown(handleSubmitNumber)}
            />
          </div>
          <div>
            <label htmlFor="number-input">Enter your number:</label>
            <input
              type="number"
              id="number-input-2"
              value={numarray[2]}
              onChange={(e) => {
                const newValue = parseInt(e.target.value);
                if (!isNaN(newValue)) {
                  setNumarray([...numarray, newValue]);
                }
              }}
              onKeyDown={handleKeyDown(handleSubmitNumber)}
            />
          </div>
          <div>
            <button onClick={handleSubmitNumber}>Submit</button>
          </div>
        </div>

        <div className={`step ${currentStep !== 'step-4' ? 'hidden' : ''}`}>
          <p>Calculating...</p>
          <div className="spinner-container">
            <div className="spinner"></div>
          </div>
        </div>

        <div className={`step ${currentStep !== 'step-5' ? 'hidden' : ''}`}>
          <h2><span>{result}</span></h2>
        </div>
      </div>
    </div >
  );
}
