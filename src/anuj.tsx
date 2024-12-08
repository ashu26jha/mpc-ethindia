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
  const [numFields, setNumFields] = useState<number>(0);
  const [showInputFields, setShowInputFields] = useState(false);

  async function handleHost() {
    if (numFields <= 0) {
      alert('Please enter the number of fields first');
      return;
    }
    const code = app.generateJoiningCode();
    setHostCode(code);
    setCurrentStep('step-2-host');
    await app.connect(code, 'alice');
    setShowInputFields(true);
    setCurrentStep('step-3');
  }

  async function handleJoin() {
    if (numFields <= 0) {
      alert('Please enter the number of fields first');
      return;
    }
    setCurrentStep('step-2-join');
  }

  async function handleJoinSubmit() {
    setShowJoinSpinner(true);
    await app.connect(joinCode, 'bob');
    setShowInputFields(true);
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

  const handleNumFieldsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseInt(e.target.value);
    if (!isNaN(value) && value >= 0) {
      setNumFields(value);
      setNumarray(new Array(value).fill(0));
    }
  };

  const handleNumberChange = (index: number, value: string) => {
    const newValue = parseInt(value);
    if (!isNaN(newValue)) {
      const newArray = [...numarray];
      newArray[index] = newValue;
      setNumarray(newArray);
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
            Once connected, both parties will enter numbers and the
            larger number will be calculated. The smaller number is kept
            cryptographically secret.
          </div>
          <div style={{ textAlign: 'left', marginTop: '1em' }}>
            This is just a simple example, but mpc-framework makes it easy
            to do this with any function.
          </div>
          <div>
            <label htmlFor="num-fields">How many numbers do you want to enter?</label>
            <input
              type="number"
              id="num-fields"
              min="1"
              value={numFields}
              onChange={handleNumFieldsChange}
            />
          </div>
          <div style={{ marginTop: '1em' }}>
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
          {showInputFields && [...Array(numFields)].map((_, index) => (
            <div key={index}>
              <label htmlFor={`number-input-${index}`}>Enter number {index + 1}:</label>
              <input
                type="number"
                id={`number-input-${index}`}
                value={numarray[index] || ''}
                onChange={(e) => handleNumberChange(index, e.target.value)}
                onKeyDown={handleKeyDown(handleSubmitNumber)}
              />
            </div>
          ))}

          {showInputFields && (
            <div>
              <button onClick={handleSubmitNumber}>Submit</button>
            </div>
          )}
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
    </div>
  );
}
