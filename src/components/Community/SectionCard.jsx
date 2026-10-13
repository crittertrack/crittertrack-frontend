import React from 'react';

export const linkClass = 'text-sm text-primary-dark dark:text-primary hover:underline';

const SectionCard = ({ title, icon: Icon, iconClass, action, children }) => (
    <section className="bg-white dark:bg-dark-card-bg rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-dark-text flex items-center gap-2">
                <Icon size={20} className={iconClass} />
                {title}
            </h2>
            {action}
        </div>
        {children}
    </section>
);

export default SectionCard;
