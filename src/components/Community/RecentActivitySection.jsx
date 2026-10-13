import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, User } from 'lucide-react';
import SectionCard from './SectionCard';

const RecentActivitySection = ({ users }) => {
    const navigate = useNavigate();
    if (!users || users.length === 0) return null;
    return (
        <SectionCard title="Recent Activity" icon={Users} iconClass="text-primary-dark">
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                {users.map(user => {
                    const displayName = (user.showBreederName && user.breederName)
                        ? user.breederName
                        : ((user.showPersonalName ?? false) ? user.personalName : 'Anonymous');
                    return (
                        <div
                            key={user.id_public}
                            className="relative bg-gray-50 dark:bg-dark-surface rounded-lg p-3 hover:bg-gray-100 dark:hover:bg-dark-surface-hover transition cursor-pointer text-center"
                            onClick={() => navigate(`/user/${user.id_public}`)}
                        >
                            {user.isActive && (
                                <span className="absolute top-2 right-2 w-3 h-3 bg-green-400 border-2 border-white dark:border-dark-card-bg rounded-full" title="Active now" />
                            )}
                            <div className="w-14 h-14 bg-gray-200 dark:bg-dark-card-bg rounded-full overflow-hidden mx-auto mb-2">
                                {user.profileImage ? (
                                    <img src={user.profileImage} alt={displayName} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-dark-text-muted">
                                        <User size={28} />
                                    </div>
                                )}
                            </div>
                            <p className="font-semibold text-sm text-gray-800 dark:text-dark-text break-words line-clamp-2 leading-tight">{displayName}</p>
                            <p className="text-xs text-gray-500 dark:text-dark-text-muted truncate">{user.id_public}</p>
                            {user.isNew && !user.isActive && (
                                <span className="inline-block mt-1 text-xs bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded">NEW</span>
                            )}
                        </div>
                    );
                })}
            </div>
        </SectionCard>
    );
};

export default RecentActivitySection;
