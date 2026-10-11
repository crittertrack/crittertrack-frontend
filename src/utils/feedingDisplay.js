export const getDietSupplyLabels = (dietSupplies) => {
    let supplies = dietSupplies;
    if (typeof supplies === 'string') {
        try {
            supplies = JSON.parse(supplies);
        } catch {
            return [];
        }
    }
    if (!Array.isArray(supplies)) return [];

    return supplies
        .map((supply) => {
            if (typeof supply === 'string') return supply.trim();
            if (!supply || typeof supply !== 'object') return '';
            const name = typeof supply.name === 'string' ? supply.name.trim() : '';
            if (!name) return '';
            return supply.quantity != null && supply.quantity !== ''
                ? `${name} (${supply.quantity})`
                : name;
        })
        .filter(Boolean);
};
