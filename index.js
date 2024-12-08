import { writeFileSync } from 'fs';

async function main(a, b) {
  console.log('Starting to generate the code...');

  // Build `a` and `b` variables

  let var_a = []
  let var_b = []

  for (let i = 0; i < a.length; i++) {
    var_a.push(('a' + i).toString());
  }

  for (let i = 0; i < b.length; i++) {
    var_b.push(('b' + i).toString());
  }

  let function_signature = 'export default function main(';

  for (let i = 0; i < a.length; i++) {
    function_signature += var_a[i] + ': number, '
  }

  for (let i = 0; i < b.length; i++) {
    if (i == b.length - 1) {
      function_signature += var_b[i] + ': number '
    } else {
      function_signature += var_b[i] + ': number, '
    }
  }

  function_signature += '){'
  console.log('\n' + function_signature + '\n')

  const circuitcode =
    `
    const lenA = ${a.length}
    const lenB = ${b.length}

      ${function_signature}
      let count = 0 ;
      const arrA: number[] = [${var_a.join(',')}]
      const arrB: number[] = [${var_b.join(',')}]


      for(let i = 0; i < lenA; i++){
        for(let j = 0; j < lenB; j++){
          if(arrA[i] == arrB[j]){
              count = count + 1;
            }
          }
        }

        return count;
      }
  `;
  const generateProtocolCode = `
    import * as summon from 'summon-ts';
    import { Protocol } from 'mpc-framework';
    import { EmpWasmBackend } from 'emp-wasm-backend';


    export default async function generateProtocol() {
      await summon.init();

      const circuit = summon.compileBoolean('/circuit/main.ts', 16, {
        '/circuit/main.ts': \`${circuitcode}\`
      });

      const mpcSettings = [
        {
          name: 'alice',
          inputs: ['${var_a.join("','")}'],
          outputs: ['main'],
        },
        {
          name: 'bob',
          inputs: ['${var_b.join("','")}'],
          outputs: ['main'],
        },
      ];

      return new Protocol(circuit, mpcSettings, new EmpWasmBackend());
    }
  `;

  a.push(...b)
  let len_a = a.length
  let set_a = new Set(a)
  // Set to array
  a = Array.from(set_a)
  console.log(len_a - set_a.size)
  // Create this file with name generateProtocol.ts inside src folder
  writeFileSync('src/generateProtocol.ts', generateProtocolCode);
}


main([1, 2, 3], [2, 3, 4, 5]);