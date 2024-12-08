
    import * as summon from 'summon-ts';
    import { Protocol } from 'mpc-framework';
    import { EmpWasmBackend } from 'emp-wasm-backend';


    export default async function generateProtocol() {
      await summon.init();

      const circuit = summon.compileBoolean('/circuit/main.ts', 16, {
        '/circuit/main.ts': `
    const lenA = 3
    const lenB = 3

      export default function main(a0: number, a1: number, a2: number, b0: number, b1: number, b2: number ){
      let count = 0 ;
      const arrA: number[] = [a0,a1,a2]
      const arrB: number[] = [b0,b1,b2]


      for(let i = 0; i < lenA; i++){
        for(let j = 0; j < lenB; j++){
          if(arrA[i] == arrB[j]){
              count = count + 1;
            }
          }
        }

        return count;
      }
  `
      });

      const mpcSettings = [
        {
          name: 'alice',
          inputs: ['a0','a1','a2'],
          outputs: ['main'],
        },
        {
          name: 'bob',
          inputs: ['b0','b1','b2'],
          outputs: ['main'],
        },
      ];

      return new Protocol(circuit, mpcSettings, new EmpWasmBackend());
    }
  