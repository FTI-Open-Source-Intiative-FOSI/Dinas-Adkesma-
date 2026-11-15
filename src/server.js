'use strict';

require('dotenv').config({ override: true });

const app  = require('./app');
const PORT = parseInt(process.env.PORT || '3000', 10);

app.listen(PORT, () => {
  console.log(`[Lapor Mahasiswa] Server berjalan di http://localhost:${PORT}`);
});
