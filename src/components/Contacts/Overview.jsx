import React from 'react';
import { useOutletContext } from 'react-router-dom';
import { User, Users, Hash, MapPin, FileText } from 'lucide-react';

const DetailField = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <div className="flex items-start gap-3">
            <div className="text-gray-500 mt-1">{icon}</div>
            <div>
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-gray-800">{value}</p>
            </div>
        </div>
    );
};

const Overview = () => {
    const { contactData } = useOutletContext();
    const contact = contactData.details;

    const getDisplayName = (contact) => {
        const personalName = contact.personalName;

        const breederInfoParts = [];
        if (contact.prefix) breederInfoParts.push(contact.prefix);
        if (contact.breederName) breederInfoParts.push(contact.breederName);
        if (contact.suffix) breederInfoParts.push(contact.suffix);
        const breederInfoString = breederInfoParts.join(' • ');

        if (personalName) {
            if (contact.breederName) { // Only use parens if there is a breeder name
                return `${personalName} (${breederInfoString})`;
            }
            // No breeder name, so format is "Prefix Personal Suffix"
            const nameParts = [];
            if (contact.prefix) nameParts.push(contact.prefix);
            nameParts.push(personalName);
            if (contact.suffix) nameParts.push(contact.suffix);
            return nameParts.join(' ');
        }

        if (breederInfoString) {
            return breederInfoString;
        }

        return 'Unnamed Contact';
    };

    const fullAddress = [
        contact.address?.street,
        contact.address?.city,
        contact.address?.state,
        contact.address?.postalCode,
        contact.address?.country,
    ].filter(Boolean).join(', ');

    return (
        <div>
            <h2 className="text-lg font-semibold mb-6 border-b pb-3">Contact Details</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Column */}
                <div className="space-y-4">
                    <DetailField icon={<User size={18} />} label="Full Name" value={getDisplayName(contact)} />
                    <DetailField icon={<Hash size={18} />} label="Linked CritterTrack ID" value={contact.linkedCTUID} />
                    
                    <div className="flex items-start gap-3">
                        <div className="text-gray-500 mt-1"><Users size={18} /></div>
                        <div>
                            <p className="text-sm font-medium text-gray-500">Contact Type</p>
                            <div className="flex gap-2 mt-1">
                                {contact.isKeeper && (
                                    <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                                        Keeper
                                    </span>
                                )}
                                {contact.isBreeder && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                                        Breeder
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="space-y-4">
                    <DetailField icon={<MapPin size={18} />} label="Address" value={fullAddress} />
                    <DetailField icon={<FileText size={18} />} label="Notes" value={contact.notes} />
                </div>
            </div>
        </div>
    );
};

export default Overview;