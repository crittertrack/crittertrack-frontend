const parseDietSupplies = (dietSupplies) => {
    let supplies = dietSupplies;
    if (typeof supplies === 'string') {
        try {
            supplies = JSON.parse(supplies);
        } catch {
            return null;
        }
    }
    return Array.isArray(supplies) ? supplies : null;
};

export const getAssignedDietSupply = (dietSupplies, inventorySupply) => {
    const supplies = parseDietSupplies(dietSupplies);
    if (!supplies || !inventorySupply) return undefined;
    return supplies.find((supply) => {
        if (!supply || typeof supply !== 'object') return false;
        const supplyId = supply.id || supply.supplyId;
        if (supplyId && inventorySupply._id && String(supplyId) === String(inventorySupply._id)) return true;
        return typeof supply.name === 'string' &&
            typeof inventorySupply.name === 'string' &&
            supply.name.toLowerCase() === inventorySupply.name.toLowerCase();
    });
};

export const getAssignedDietSupplyQuantity = (dietSupplies, inventorySupply) => {
    return getAssignedDietSupply(dietSupplies, inventorySupply)?.quantity;
};

export const getDietSupplyLabels = (dietSupplies) => {
    const supplies = parseDietSupplies(dietSupplies);
    if (!supplies) return [];

    return supplies
        .map((supply) => {
            if (typeof supply === 'string') return supply.trim();
            if (!supply || typeof supply !== 'object') return '';
            const name = typeof supply.name === 'string' ? supply.name.trim() : '';
            if (!name) return '';
            const amount = supply.quantity != null && supply.quantity !== ''
                ? `${supply.quantity}${supply.unit ? ` ${supply.unit}` : ''}`
                : '';
            return amount ? `${name} (${amount})` : name;
        })
        .filter(Boolean);
};
