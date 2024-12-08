import { RtcPairSocket } from 'rtc-pair-socket';
import AsyncQueue from './AsyncQueue';
import assert from './assert';
import generateProtocol from './generateProtocol';

export default class App {
  socket?: RtcPairSocket;
  party?: 'alice' | 'bob';
  msgQueue = new AsyncQueue<unknown>();

  generateJoiningCode() {
    // 128 bits of entropy
    return [
      Math.random().toString(36).substring(2, 12),
      Math.random().toString(36).substring(2, 12),
      Math.random().toString(36).substring(2, 7),
    ].join('');
  }

  async connect(code: string, party: 'alice' | 'bob') {
    this.party = party;
    const socket = new RtcPairSocket(code, party);
    this.socket = socket;

    socket.on('message', (msg: unknown) => {
      // Using a message queue instead of passing messages directly to the MPC
      // protocol ensures that we don't miss anything sent before we begin.
      this.msgQueue.push(msg);
    });

    await new Promise<void>((resolve, reject) => {
      socket.on('open', resolve);
      socket.on('error', reject);
    });
  }

  async mpcLargest(value: number[]): Promise<number> {
    const { party, socket } = this;

    assert(party !== undefined, 'Party must be set');
    assert(socket !== undefined, 'Socket must be set');
    console.log(value);
    const input = party === 'alice' ? {
      a0: value[0],
      a1: value[1],
      a2: value[2],
    } : {
      b0: value[0],
      b1: value[1],
      b2: value[2],
    };
    const otherParty = party === 'alice' ? 'bob' : 'alice';

    console.log('Generating protocol');
    const protocol = await generateProtocol();
    console.log('Generated the protocol');
    const session = protocol.join(
      party,
      input,
      (to, msg) => {
        assert(to === otherParty, 'Unexpected party');
        socket.send(msg);
      },
    );
    console.log('Joined the protocol');
    this.msgQueue.stream((msg: unknown) => {
      if (!(msg instanceof Uint8Array)) {
        throw new Error('Unexpected message type');
      }

      console.log('Handling message');

      session.handleMessage(otherParty, msg);
      console.log('Handled message');
    });

    const output = await session.output();

    if (
      output === null
      || typeof output !== 'object'
      || typeof output.main !== 'number'
    ) {
      throw new Error('Unexpected output');
    }

    return output.main;
  }
}
