const { fuzzyFilter, fuzzyMatch } = require('fuzzbunny');

const heroes = [
  {
    name: `Claire Bennet`,
    ability: `Rapid cellular regeneration`,
  },
  {
    name: `Micah Sanders`,
    ability: `Technopathy`,
  },
  {
    name: `Hiro Nakamura`,
    ability: `Space-time manipulation`,
  },
  {
    name: `Peter Petrelli`,
    ability: `Tactile power mimicry`,
  },
];
{/*object declared before fuzz matching.*/}
const results1 = fuzzyFilter(heroes, `stm`, { fields: [`name`, `ability`] });

const match2 = fuzzyMatch(heroes[0].name, `ben`);

console.log('result 1:', results1);
console.log('result 2:', match2);
