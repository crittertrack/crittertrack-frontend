import React from 'react';
import BreederDirectory from '../PublicProfile/BreederDirectory';

const CommunityBreedersPage = ({ authToken, API_BASE_URL }) => (
    <div className="w-full p-4">
        <div className="bg-white dark:bg-dark-card-bg rounded-lg shadow-md overflow-hidden">
            <BreederDirectory authToken={authToken} API_BASE_URL={API_BASE_URL} embedded />
        </div>
    </div>
);

export default CommunityBreedersPage;


