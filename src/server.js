const app = require('./app');
const dotenv = require('dotenv');
const { initDb } = require('./init/db');

dotenv.config();

Promise.all([initDb()]).then(() => {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
});
