const xlsx = require('xlsx');
const path = require('path');

const kaynakPath = path.resolve('C:/fodos/kaynak.xlsx');
const hedefPath = path.resolve('C:/fodos/hedef.xlsx');

const kaynakWorkbook = xlsx.readFile(kaynakPath);
const kaynakSheet = kaynakWorkbook.Sheets[kaynakWorkbook.SheetNames[0]];
const kaynakAoA = xlsx.utils.sheet_to_json(kaynakSheet, { header: 1 });

console.log("KAYNAK İLK 5 SATIR (Sadece B, J, L, M):");
for (let i = 0; i < 5; i++) {
  const r = kaynakAoA[i];
  if(r) console.log(`Satır ${i} -> B(1): ${r[1]}, J(9): ${r[9]}, L(11): ${r[11]}, M(12): ${r[12]}`);
}

const hedefWorkbook = xlsx.readFile(hedefPath);
const hedefSheet = hedefWorkbook.Sheets[hedefWorkbook.SheetNames[0]];
const hedefAoA = xlsx.utils.sheet_to_json(hedefSheet, { header: 1 });

console.log("\nHEDEF İLK 5 SATIR (Sadece B, J, L, M):");
for (let i = 0; i < 5; i++) {
  const r = hedefAoA[i];
  if(r) console.log(`Satır ${i} -> B(1): ${r[1]}, J(9): ${r[9]}, L(11): ${r[11]}, M(12): ${r[12]}`);
}
