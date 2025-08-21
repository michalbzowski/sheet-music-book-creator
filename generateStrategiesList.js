const fs = require('fs');
const path = require('path');

function generateStrategiesList() {
  const dirPath = path.join(__dirname, 'strategies');
  const outputPath = path.join(__dirname, 'public', 'strategies.json');

  const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.js')).map(f => "./strategies/" + f);
  fs.writeFileSync(outputPath, JSON.stringify(files, null, 2));
  console.log(`Generated ${outputPath} with ${files.length} entries.`);
}

generateStrategiesList();
