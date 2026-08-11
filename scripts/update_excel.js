const xlsx = require('xlsx');
const path = require('path');

const kaynakPath = path.resolve('C:/fodos/kaynak.xlsx');
const hedefPath = path.resolve('C:/fodos/hedef.xlsx');

console.log('Kaynak dosya okunuyor...');
const kaynakWorkbook = xlsx.readFile(kaynakPath);
const kaynakSheet = kaynakWorkbook.Sheets[kaynakWorkbook.SheetNames[0]];
const kaynakData = xlsx.utils.sheet_to_json(kaynakSheet, { header: 1 });

console.log('Hedef dosya okunuyor...');
const hedefWorkbook = xlsx.readFile(hedefPath);
const hedefSheetName = hedefWorkbook.SheetNames[0];
const hedefSheet = hedefWorkbook.Sheets[hedefSheetName];

// Extract data as AoA (Array of Arrays) to manipulate specific columns easily
const kaynakAoA = xlsx.utils.sheet_to_json(kaynakSheet, { header: 1 });
const hedefAoA = xlsx.utils.sheet_to_json(hedefSheet, { header: 1 });

console.log(`Kaynak satır sayısı: ${kaynakAoA.length}`);
console.log(`Hedef satır sayısı: ${hedefAoA.length}`);

// Map of B column (index 1) to J, L, M (index 9, 11, 12) from kaynak
// Assuming row 0 is header.
const kaynakMap = new Map();
for (let i = 1; i < kaynakAoA.length; i++) {
  const row = kaynakAoA[i];
  if (!row) continue;
  const bVal = String(row[1] || '').trim();
  if (bVal) {
    kaynakMap.set(bVal, {
      j: row[9],
      l: row[11],
      m: row[12]
    });
  }
}

let updatedCount = 0;

for (let i = 1; i < hedefAoA.length; i++) {
  const row = hedefAoA[i];
  if (!row) continue;
  const bVal = String(row[1] || '').trim();
  if (bVal && kaynakMap.has(bVal)) {
    const sourceData = kaynakMap.get(bVal);
    // Expand row length if needed
    while (row.length < 13) {
      row.push(undefined);
    }
    row[9] = sourceData.j !== undefined ? sourceData.j : row[9];
    row[11] = sourceData.l !== undefined ? sourceData.l : row[11];
    row[12] = sourceData.m !== undefined ? sourceData.m : row[12];
    updatedCount++;
  }
}

console.log(`${updatedCount} satır güncellendi. Dosya kaydediliyor...`);

const newSheet = xlsx.utils.aoa_to_sheet(hedefAoA);
hedefWorkbook.Sheets[hedefSheetName] = newSheet;

xlsx.writeFile(hedefWorkbook, hedefPath);

console.log('İşlem tamamlandı!');
