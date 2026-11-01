export const getOrderedLitterImages = (images) => {
    if (!Array.isArray(images)) return [];

    const normalized = images
        .map((image, index) => ({
            image: typeof image === 'string' ? { url: image } : image,
            index,
        }))
        .filter(({ image }) => typeof image?.url === 'string' && image.url);
    const coverIndex = normalized.find(({ image }) => image.isCover)?.index ?? normalized[0]?.index;

    return normalized
        .sort((a, b) => {
            const aIsCover = a.index === coverIndex;
            const bIsCover = b.index === coverIndex;
            return Number(bIsCover) - Number(aIsCover);
        })
        .map(({ image, index }) => ({
            image,
            index,
            isCover: image.isCover === true || index === coverIndex,
        }));
};
