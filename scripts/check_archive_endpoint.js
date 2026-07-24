const axios = require('axios');

// --- Configuration ---
// Make sure this is your backend's URL
const API_BASE_URL = 'http://localhost:5000/api'; 
// --- End Configuration ---

async function checkArchiveEndpoint(authToken) {
    if (!authToken) {
        console.error('\\x1b[31m%s\\x1b[0m', 'Error: Auth token is required.');
        console.log('Usage: node scripts/check_archive_endpoint.js <your-auth-token>');
        console.log('You can get the token from your browser\'s local storage after logging in.');
        process.exit(1);
    }

    const url = `${API_BASE_URL}/animals/archived`;
    console.log(`\\n\\x1b[33mQuerying endpoint: ${url}\\x1b[0m\\n`);

    try {
        const response = await axios.get(url, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });

        const data = response.data;

        console.log('\\x1b[36m--- API Response ---');
        console.log(JSON.stringify(data, null, 2));
        console.log('\\x1b[36m--------------------\\x1b[0m\\n');

        const archivedCount = data?.archived?.length || 0;
        const transferredCount = data?.soldTransferred?.length || 0;

        console.log('\\x1b[32m--- Summary ---');
        console.log(`Manually Archived Animals Found: ${archivedCount}`);
        console.log(`Sold/Transferred Animals Found:  ${transferredCount}`);
        console.log('\\x1b[32m--------------- \\x1b[0m\\n');

        if (archivedCount === 0 && transferredCount === 0) {
            console.log('\\x1b[31mAnalysis: The API is returning empty lists. This strongly suggests a backend issue where the query is not finding any animals that match the archived or transferred criteria.\\x1b[0m');
        } else {
            console.log('\\x1b[32mAnalysis: The API is returning data. If these animals are not showing up, the issue might be in how the frontend is processing or displaying these lists.\\x1b[0m');
        }

    } catch (error) {
        if (error.response) {
            console.error(`\\n\\x1b[31mError fetching data: ${error.response.status} ${error.response.statusText}\\x1b[0m`);
            console.error('Response Body:', error.response.data);
        } else {
            console.error('\\n\\x1b[31mError connecting to the server. Is the API running at the configured URL?\\x1b[0m');
            console.error(error.message);
        }
        process.exit(1);
    }
}

const authToken = process.argv[2];
checkArchiveEndpoint(authToken);