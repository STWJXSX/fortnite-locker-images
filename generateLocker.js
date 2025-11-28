import Jimp from "jimp";
import fs from "fs";
import axios from "axios";

const TYPE_MAPPING = {
    outfit: { prefix: 'AthenaCharacter:', backendValue: 'AthenaCharacter' },
    backpack: { prefix: 'AthenaBackpack:', backendValue: 'AthenaBackpack' },
    pickaxe: { prefix: 'AthenaPickaxe:', backendValue: 'AthenaPickaxe' },
    glider: { prefix: 'AthenaGlider:', backendValue: 'AthenaGlider' },
    emote: { prefix: 'AthenaDance:', backendValue: 'AthenaDance' },
    spray: { prefix: 'AthenaDance:', backendValue: 'AthenaSpray' },
    emoticon: { prefix: 'AthenaDance:', backendValue: 'AthenaEmoji' },
    toy: { prefix: 'AthenaDance:', backendValue: 'AthenaToy' },
    wrap: { prefix: 'AthenaItemWrap:', backendValue: 'AthenaItemWrap' },
    music: { prefix: 'AthenaMusicPack:', backendValue: 'AthenaMusicPack' },
    loadingscreen: { prefix: 'AthenaLoadingScreen:', backendValue: 'AthenaLoadingScreen' },
    contrail: { prefix: 'AthenaSkyDiveContrail:', backendValue: 'AthenaSkyDiveContrail' }
};

const TYPE_ORDER = ['outfit', 'backpack', 'pickaxe', 'glider', 'emote', 'spray', 'emoticon', 'toy', 'wrap', 'music', 'loadingscreen', 'contrail'];
const EID_TYPES = ['emote', 'spray', 'emoticon', 'toy'];


async function composeMCP({ operation, profile, accountId, accessToken, body = {}, route = 'client' }) {
    try {
        const url = `https://fngw-mcp-gc-livefn.ol.epicgames.com/fortnite/api/game/v2/profile/${accountId}/${route}/${operation}?profileId=${profile}&rvn=-1`;
        const response = await axios.post(url, body, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json"
            }
        });
        return response.data;
    } catch (error) {
        throw error;
    }
}


async function getUserCosmetics(accountId, accessToken, cosmeticType) {
    try {
        const profileData = await composeMCP({
            profile: "athena",
            operation: "QueryProfile",
            body: {},
            accountId,
            accessToken,
            route: 'client'
        });

        if (!profileData || !profileData.profileChanges || !profileData.profileChanges[0] ||
            !profileData.profileChanges[0].profile || !profileData.profileChanges[0].profile.items) {
            return [];
        }

        const items = profileData.profileChanges[0].profile.items;

        const cosmetics = [];
        const itemEntries = Object.entries(items);
        const batchSize = 1000;

        for (let i = 0; i < itemEntries.length; i += batchSize) {
            const batch = itemEntries.slice(i, i + batchSize);

            if (cosmeticType === 'all') {
                for (const [itemKey, itemData] of batch) {
                    if (itemData.templateId) {
                        for (const [type, mapping] of Object.entries(TYPE_MAPPING)) {
                            if (itemData.templateId.startsWith(mapping.prefix)) {
                                const cosmeticId = itemData.templateId.replace(mapping.prefix, '');
                                const finalType = EID_TYPES.includes(type) ? 'eid_generic' : type;
                                cosmetics.push({
                                    id: cosmeticId,
                                    templateId: itemData.templateId,
                                    type: finalType,
                                    originalType: type,
                                    backendValue: mapping.backendValue
                                });
                                break;
                            }
                        }
                    }
                }
            } else {
                const mapping = TYPE_MAPPING[cosmeticType];
                if (mapping) {
                    // Para EID types no agregar aquí filtro abao
                    if (EID_TYPES.includes(cosmeticType)) {
                        for (const [itemKey, itemData] of batch) {
                            if (itemData.templateId && itemData.templateId.startsWith('AthenaDance:')) {
                                const cosmeticId = itemData.templateId.replace('AthenaDance:', '');
                                cosmetics.push({
                                    id: cosmeticId,
                                    templateId: itemData.templateId,
                                    type: cosmeticType,
                                    backendValue: mapping.backendValue,
                                    needsValidation: true 
                                });
                            }
                        }
                    } else {
                        for (const [itemKey, itemData] of batch) {
                            if (itemData.templateId && itemData.templateId.startsWith(mapping.prefix)) {
                                const cosmeticId = itemData.templateId.replace(mapping.prefix, '');
                                cosmetics.push({
                                    id: cosmeticId,
                                    templateId: itemData.templateId,
                                    type: cosmeticType,
                                    backendValue: mapping.backendValue
                                });
                            }
                        }
                    }
                }
            }
        }

        return cosmetics;
    } catch (error) {
        throw error;
    }
}


function findCosmeticInAPI(cosmeticId, apiCosmetics, cosmeticType, backendValue) {
    if (!Array.isArray(apiCosmetics)) return null;

    const normalizedId = cosmeticId.toLowerCase();

    if (EID_TYPES.includes(cosmeticType) || cosmeticType === 'eid_generic') {
        for (const cosmetic of apiCosmetics) {
            if (!cosmetic || !cosmetic.id || !cosmetic.type) continue;
            if (cosmetic.id.toLowerCase() === normalizedId) {
                const apiBackendValue = cosmetic.type.backendValue;
                if (cosmeticType === 'eid_generic') {
                    const validEidValues = ['AthenaDance', 'AthenaSpray', 'AthenaEmoji', 'AthenaToy'];
                    if (validEidValues.includes(apiBackendValue)) {
                        return cosmetic;
                    }
                } else if (apiBackendValue === backendValue) {
                    return cosmetic;
                }
            }
        }
    } else {
        for (const cosmetic of apiCosmetics) {
            if (!cosmetic || !cosmetic.id) continue;
            if (cosmetic.id.toLowerCase() === normalizedId) {
                return cosmetic;
            }
        }
    }

    return null;
}


function calculateOptimalDimensions(itemCount) {
    const CARD_WIDTH = 256;
    const CARD_HEIGHT = 256;
    const CARD_SPACING = 15;
    
    const sqrt = Math.sqrt(itemCount);
    let collumsCount = Math.floor(sqrt);
    let rows = Math.ceil(itemCount / collumsCount);
    
    let bestCols = collumsCount;
    let bestRows = rows;
    let bestDiff = Math.abs(rows - collumsCount);
    
    for (let cols = Math.max(1, Math.floor(sqrt) - 2); cols <= Math.ceil(sqrt) + 2; cols++) {
        const r = Math.ceil(itemCount / cols);
        const diff = Math.abs(r - cols);
        
        if (diff < bestDiff || (diff === bestDiff && r > cols)) {
            bestDiff = diff;
            bestCols = cols;
            bestRows = r;
        }
    }
    
    collumsCount = bestCols;
    
    return { CARD_WIDTH, CARD_HEIGHT, CARD_SPACING, collumsCount };
}


function getRarityWeight(rarity) {
    const rarityLower = rarity?.toLowerCase() || 'common';
    
    const rarityWeights = {
        'legendary': 100,
        'epic': 90,
        'rare': 80,
        'uncommon': 70,
        'common': 60,
        'gaminglegends': 200,
        'marvel': 190,
        'starwars': 180,
        'dc': 170,
        'icon': 160,
        'dark': 150,
        'shadow': 140,
        'slurp': 130,
        'frozen': 120,
        'lava': 110,
        'default': 50
    };
    
    return rarityWeights[rarityLower] || rarityWeights['default'];
}


function parseAddedDate(addedString) {
    if (!addedString) return new Date(0);
    
    try {
        const date = new Date(addedString);
        if (isNaN(date.getTime())) {
            return new Date(0);
        }
        return date;
    } catch (error) {
        return new Date(0);
    }
}


function sortCosmeticsByRarity(cosmetics) {
    return cosmetics.sort((a, b) => {
        const weightA = getRarityWeight(a.rarity);
        const weightB = getRarityWeight(b.rarity);
        
        if (weightA !== weightB) {
            return weightB - weightA;
        }
        
        const dateA = parseAddedDate(a.added);
        const dateB = parseAddedDate(b.added);
        
        if (dateA.getTime() !== dateB.getTime()) {
            return dateB.getTime() - dateA.getTime();
        }
        
        const nameA = a.name || a.id || '';
        const nameB = b.name || b.id || '';
        return nameA.localeCompare(nameB);
    });
}


function sortCosmeticsForAll(cosmetics) {
    return cosmetics.sort((a, b) => {
        const typeWeightA = TYPE_ORDER.indexOf(a.type);
        const typeWeightB = TYPE_ORDER.indexOf(b.type);
        
        if (typeWeightA !== typeWeightB) {
            return typeWeightA - typeWeightB;
        }
        
        const rarityWeightA = getRarityWeight(a.rarity);
        const rarityWeightB = getRarityWeight(b.rarity);
        
        if (rarityWeightA !== rarityWeightB) {
            return rarityWeightB - rarityWeightA;
        }
        
        const dateA = parseAddedDate(a.added);
        const dateB = parseAddedDate(b.added);
        
        if (dateA.getTime() !== dateB.getTime()) {
            return dateB.getTime() - dateA.getTime();
        }
        
        const nameA = a.name || a.id || '';
        const nameB = b.name || b.id || '';
        return nameA.localeCompare(nameB);
    });
}


export async function generateLockerImage({ accessToken, accountId, type = 'all', savePath = './ImagensGeradas/' }) {
    const startTime = Date.now();
    try {
        if (!accessToken || !accountId) {
            throw new Error("Faltan accessToken o accountId");
        }

        const userCosmetics = await getUserCosmetics(accountId, accessToken, type);
        if (userCosmetics.length === 0) {
            throw new Error("No se encontraron cosméticos");
        }

        const apiRes = await axios.get("https://fortnite-api.com/v2/cosmetics/br?language=es");
        const apiCosmetics = apiRes.data?.data || [];
        const missingItemImage = await Jimp.read("./UI/images/QuestionMark.png");
        const largeItemOverlay = await Jimp.read("./UI/images/LargeOverlay.png");
        const smallItemOverlay = await Jimp.read("./UI/images/SmallOverlay.png");
        const burbankFont20 = await Jimp.loadFont("./UI/fonts/burbark/burbark_20.fnt");
        const burbankFont64 = await Jimp.loadFont("./UI/fonts/burbark/burbark_64.fnt");

        const processedCosmetics = [];
        
        for (const userCosmetic of userCosmetics) {
            const apiCosmetic = findCosmeticInAPI(
                userCosmetic.id,
                apiCosmetics,
                userCosmetic.type,
                userCosmetic.backendValue
            );

            
            if (userCosmetic.needsValidation && apiCosmetic) {
                const apiBackendValue = apiCosmetic.type?.backendValue;
                if (apiBackendValue !== userCosmetic.backendValue) {
                    
                    continue;
                }
            }

            
            if (userCosmetic.needsValidation && !apiCosmetic) {
                continue;
            }

            const itemName = apiCosmetic?.name || userCosmetic.id || "?????";
            let itemRarity = apiCosmetic?.rarity?.value?.toLowerCase() || "common";
            const itemSeries = apiCosmetic?.series?.backendValue;
            const itemImageUrl = apiCosmetic?.images?.icon || apiCosmetic?.images?.featured || apiCosmetic?.images?.smallIcon;
            const itemAdded = apiCosmetic?.added;

            
            let seriesValue = apiCosmetic?.series?.value;
            if (seriesValue) {
                const seriesValueLower = seriesValue.trim().toLowerCase();
                if (seriesValueLower.includes("idol") || seriesValueLower.includes("idolo") || seriesValueLower.includes("ídolo")) {
                    itemRarity = "icon";
                } else if (seriesValueLower.includes("oscura")) {
                    itemRarity = "dark";
                } else if (seriesValueLower.includes("combra") || seriesValueLower.includes("shadow")) {
                    itemRarity = "shadow";
                } else if (seriesValueLower.includes("slurp") || seriesValueLower.includes("sorbete")) {
                    itemRarity = "slurp";
                } else if (seriesValueLower.includes("marvel")) {
                    itemRarity = "marvel";
                } else if (seriesValueLower.includes("star wars")) {
                    itemRarity = "starwars";
                } else if (seriesValueLower.includes("dc")) {
                    itemRarity = "dc";
                } else if (seriesValueLower.includes("gaming") || seriesValueLower.includes("leyendas")) {
                    itemRarity = "gaminglegends";
                } else if (seriesValueLower.includes("frozen") || seriesValueLower.includes("congelada")) {
                    itemRarity = "frozen";
                } else if (seriesValueLower.includes("lava")) {
                    itemRarity = "lava";
                }
            }

            processedCosmetics.push({
                name: itemName,
                rarity: itemRarity,
                series: itemSeries,
                imageUrl: itemImageUrl,
                added: itemAdded,
                type: userCosmetic.originalType || userCosmetic.type
            });
        }

        const sortedCosmetics = type === 'all' 
            ? sortCosmeticsForAll(processedCosmetics)
            : sortCosmeticsByRarity(processedCosmetics);

        
        const { CARD_WIDTH, CARD_HEIGHT, CARD_SPACING, collumsCount } = calculateOptimalDimensions(sortedCosmetics.length);
        const rows = Math.ceil(sortedCosmetics.length / collumsCount);
        const CANVAS_PADDING = 50;
        const canvasWidth = collumsCount * CARD_WIDTH + (collumsCount + 1) * CARD_SPACING + CANVAS_PADDING * 2;
        const canvasHeight = rows * CARD_HEIGHT + (rows + 1) * CARD_SPACING + CANVAS_PADDING * 2;

        const shopBackground = new Jimp(canvasWidth, canvasHeight, 0x0a0e27ff);
        const concurrencyLimit = 100;
        const smallOverlayResized = smallItemOverlay.clone().resize(CARD_WIDTH, CARD_HEIGHT);
        const largeOverlayResized = largeItemOverlay.clone().resize(CARD_WIDTH, CARD_HEIGHT);
        const backgroundCache = {};
        
        for (let i = 0; i < sortedCosmetics.length; i += concurrencyLimit) {
            const batchPromises = sortedCosmetics.slice(i, i + concurrencyLimit).map(async (cosmetic, batchIndex) => {
                const globalIndex = i + batchIndex;
                const x = CANVAS_PADDING + (globalIndex % collumsCount) * (CARD_WIDTH + CARD_SPACING);
                const y = CANVAS_PADDING + Math.floor(globalIndex / collumsCount) * (CARD_HEIGHT + CARD_SPACING);

                let itemImage;
                try {
                    itemImage = cosmetic.imageUrl 
                        ? await Promise.race([Jimp.read(cosmetic.imageUrl), new Promise((_, reject) => setTimeout(() => reject(), 2000))])
                        : missingItemImage.clone();
                } catch {
                    itemImage = missingItemImage.clone();
                }

                const bgKey = cosmetic.series || cosmetic.rarity;
                if (!backgroundCache[bgKey]) {
                    try {
                        backgroundCache[bgKey] = cosmetic.series
                            ? await Jimp.read(`./UI/images/series/${cosmetic.series}.png`)
                            : await Jimp.read(`./UI/images/rarities/${cosmetic.rarity.charAt(0).toUpperCase() + cosmetic.rarity.slice(1)}.png`);
                    } catch {
                        backgroundCache[bgKey] = await Jimp.read(`./UI/images/rarities/Common.png`);
                    }
                }
                const itemBackground = backgroundCache[bgKey].clone().resize(CARD_WIDTH, CARD_HEIGHT);
                itemImage.resize(CARD_WIDTH, CARD_HEIGHT);
                itemBackground.blit(itemImage, 0, 0);

                
                const textHeight = Jimp.measureTextHeight(burbankFont20, cosmetic.name, CARD_WIDTH - 16);
                const priceTextPos = textHeight <= 22 ? Math.round(CARD_HEIGHT * 0.80) : Math.round(CARD_HEIGHT * 0.72);
                const overlayToUse = textHeight <= 22 ? smallOverlayResized : largeOverlayResized;

                itemBackground.blit(overlayToUse, 0, 0);
                itemBackground.print(
                    burbankFont20,
                    8,
                    priceTextPos,
                    {
                        text: cosmetic.name,
                        alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
                    },
                    CARD_WIDTH - 16
                );

                shopBackground.blit(itemBackground, x, y);
            });

            await Promise.all(batchPromises);
        }

        if (!fs.existsSync(savePath)) {
            fs.mkdirSync(savePath, { recursive: true });
        }

        const currentDate = new Date();
        const dateStr = `${String(currentDate.getDate()).padStart(2, '0')}-${String(currentDate.getMonth() + 1).padStart(2, '0')}-${currentDate.getFullYear()}`;

        let version = 1;
        let fileName = `locker_${dateStr}_v${version}.png`;
        while (fs.existsSync(savePath + fileName)) {
            version++;
            fileName = `locker_${dateStr}_v${version}.png`;
        }

        await shopBackground.writeAsync(savePath + fileName);

        const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
        return {
            success: true,
            fileName: fileName,
            path: savePath + fileName,
            count: sortedCosmetics.length,
            time: totalTime
        };

    } catch (error) {
        return { success: false, error: error.message };
    }
}
