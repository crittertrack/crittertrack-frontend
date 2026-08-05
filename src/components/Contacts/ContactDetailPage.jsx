import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Edit } from 'lucide-react';

const ContactDetail = ({ API_BASE_URL, authToken }) => {
    const { contactId } = useParams();
    const [contactData, setContactData] = useState({
        details: null,
        ownedAnimals: [],
        bredAnimals: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchContactData = async () => {
            try {
                setLoading(true);
                const config = {
                    headers: { Authorization: `Bearer ${authToken}` }
                };
                const [detailsRes, ownedRes, bredRes] = await Promise.all([
                    axios.get(`${API_BASE_URL}/contacts/${contactId}`, config),
                    axios.get(`${API_BASE_URL}/contacts/${contactId}/own-animals`, config),
                    axios.get(`${API_BASE_URL}/contacts/${contactId}/bred-animals`, config)
                ]);

                setContactData({
                    details: detailsRes.data,
                    ownedAnimals: ownedRes.data,
                    bredAnimals: bredRes.data
                });
                setError(null);
            } catch (err) {
                setError(err);
                console.error("Error fetching contact data:", err);
            } finally {
                setLoading(false);
            }
        };

        if (contactId) {
            fetchContactData();
        }
    }, [contactId, API_BASE_URL, authToken]);

    if (loading) {
        return <div>Loading contact...</div>;
    }

    if (error) {
        return <div>Error loading contact: {error.message}</div>;
    }

    if (!contactData.details) {
        return <div>Contact not found.</div>;
    }

    const navLinkClasses = ({ isActive }) =>
        `px-4 py-2 text-sm font-medium rounded-t-md ${
            isActive
                ? 'bg-primary text-white border-b-2 border-primary'
                : 'text-gray-700 hover:bg-gray-200'
        }`;

    return (
        <div className="bg-white rounded-xl shadow-lg p-4 md:p-6">
            <header className="mb-6 flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold">{contactData.details.breederName || contactData.details.personalName}</h1>
                    <p className="text-gray-500">Contact Profile</p>
                </div>
                <button
                    onClick={() => navigate(`/contacts/${contactId}/edit`)}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-lg transition"
                >
                    <Edit size={16} />
                    Edit
                </button>
            </header>

            <nav className="flex space-x-2 border-b-2 border-gray-200 mb-4">
                <NavLink to="overview" end className={navLinkClasses}>Overview</NavLink>
                <NavLink to="owned" className={navLinkClasses}>Owned Animals ({contactData.ownedAnimals.length})</NavLink>
                <NavLink to="bred" className={navLinkClasses}>Bred Animals ({contactData.bredAnimals.length})</NavLink>
            </nav>

            <main>
                <Outlet context={{ contactData }} />
            </main>
        </div>
    );
};

export default ContactDetail;