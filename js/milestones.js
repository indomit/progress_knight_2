/** 
 * Structure of a Milestone entity 
 * @typedef {Object} MilestoneBaseData
 * @property {string} name
 * @property {number} expense
 * @property {number} tier
 * @property {string} description
 * @property {number} [effect]
 */

/** 
 * This object maps string keys to Milestone objects
 * @type {Record<string, Milestone>} 
 */
var milestoneData = {}

/** 
 * @type {Record<string, MilestoneBaseData>} 
 */
const milestoneBaseData = {
    "Magic Eye": { name: "Magic Eye", expense: 5000, tier: 1, description: "Auto max levels at age 65" },
    "Time Does Not Fly": { name: "Time Does Not Fly", expense: 10000, tier: 2, description: "Unlocks Challenge 3" },
    "Almighty Eye": { name: "Almighty Eye", expense: 15000, tier: 3, description: "Auto max levels" },
    "Deal with the Devil": { name: "Deal with the Devil", expense: 30000, tier: 4, description: "Generates Evil slowly over time" },
    "Transcendent Master": { name: "Transcendent Master", expense: 50000, tier: 5, description: "Essence gain" },
    "Eternal Time": { name: "Eternal Time", expense: 75000, tier: 6, description: "x2 Time Warping, keep 4 Evil Perk ranks on reset" },
    "Hell Portal": { name: "Hell Portal", expense: 120000, tier: 7, description: "Generates Evil rapidly right away" },
    "Inferno": { name: "Inferno", expense: 170000, tier: 8, description: "x5 Evil gain, +5000 Essence Bonus on Transcend" },
    "God's Blessings": { name: "God's Blessings", expense: 250000, tier: 9, description: "x10M Happiness, keep all Evil Perk ranks on reset" },
    "Faint Hope": { name: "Faint Hope", expense: 400000, tier: 10, description: "Essence gain (increases over time)" },
    "Dance With The Devil": { name: "Dance With The Devil", expense: 1000000, tier: 11, description: "Unlocks Challenge 4" },

    "New Beginning": { name: "New Beginning", expense: 5000000, tier: 12, description: "Great heroes, skills and items" },
    "Rise of Great Heroes": { name: "Rise of Great Heroes", expense: 10000000, tier: 13, description: "Essence gain and x10000 Great Hero & Skill XP", effect: 10000 },
    "Lazy Heroes": { name: "Lazy Heroes", expense: 20000000, tier: 14, description: "Great Hero & Skill XP", effect: 1e12 },
    "Legends Never Die": { name: "Legends Never Die", expense: 30000000, tier: 15, description: "Unlocks Challenge 5" },
    "Angry Heroes": { name: "Angry Heroes", expense: 50000000, tier: 16, description: "Great Hero & Skill XP", effect: 1e15 },
    "Scared Heroes": { name: "Scared Heroes", expense: 150000000, tier: 17, description: "Unlocks New Evil Perk" },

    "Funny Heroes": { name: "Funny Heroes", expense: 300000000, tier: 20, description: "Great Hero & Skill XP", effect: 1e50 },
    "Beautiful Heroes": { name: "Beautiful Heroes", expense: 600000000, tier: 21, description: "Great Hero & Skill XP", effect: 1e100 },
    "Superb Heroes": { name: "Superb Heroes", expense: 10000000000, tier: 22, description: "Great Hero & Skill XP", effect: 100000 },

    "A new beginning": { name: "A new beginning", expense: 5e10, tier: 23, description: "Unlocks Dark Matter" },
    "Great Almightiness": { name: "Great Almightiness", expense: 1e12, tier: 24, description: "Unlocks Great Almightiness Skills" },
    "Mind Control": { name: "Mind Control", expense: 1e14, tier: 25, description: "Makes Hell Portal even stronger" },
    "Galactic Emperor": { name: "Galactic Emperor", expense: 1e15, tier: 26, description: "Passively generate Essence" },
    "Dark Matter Harvester": { name: "Dark Matter Harvester", expense: 1e16, tier: 27, description: "x10 Dark Matter" },
    "Great Darkness": { name: "Great Darkness", expense: 1e18, tier: 28, description: "Unlocks Great Darkness Skills" },

    "A Dark Era": { name: "A Dark Era", expense: 1e20, tier: 29, description: "Unlocks Dark Matter Abilities" },
    "Dark Orbiter": { name: "Dark Orbiter", expense: 1e22, tier: 30, description: "1e10x Dark Orbs, permanently keeps Evil Perks" },
    "Dark Matter Mining": { name: "Dark Matter Mining", expense: 1e25, tier: 31, description: "x3 Dark Matter " },
    "The Devil inside you": { name: "The Devil inside you", expense: 1e35, tier: 32, description: "x1e15 Evil" },

    "Strange Magic": { name: "Strange Magic", expense: 1e42, tier: 34, description: "x1e50 Darkness XP" },
    "Speed speed speed": { name: "Speed speed speed", expense: 1e45, tier: 35, description: "x1000 Time Warping and Lifespan. Heavily boosts Essence gain" },
    "The Darkest Time": { name: "The Darkest Time", expense: 1e47, tier: 36, description: "Unlocks Challenge 6" },
    "Life is valueable": { name: "Life is valueable", expense: 1e50, tier: 37, description: "Dark Matter boosts Essence gain. Multiply your lifespan by 1e5x." },

    "Dark Matter Millionaire": { name: "Dark Matter Millionaire", expense: 1e58, tier: 38, description: "Multiply Dark Matter gain by 500x" },
    "The new Dark Matter": { name: "The new Dark Matter", expense: 1e67, tier: 39, description: "Unlocks Metaverse" },

    "Ruler of the Metaverse": { name: "Ruler of the Metaverse", expense: 1e90, tier: 41, description: "Unlocks Metaverse Perks, Metaverse Guards Job Category" },
    "A New Hope": { name: "A New Hope", expense: 1e95, tier: 42, description: "Faint Hope always at maximum" },
    "Time is a flat circle": { name: "Time is a flat circle", expense: 1e100, tier: 45, description: "x1000 Time Warping, x1e50 XP" },
    "The End is near": { name: "The End is near", expense: 1e200, tier: 50, description: "Unspent Multiverse Perk Points buffs Dark Matter, x4 MPP gain" },
    "The End": { name: "The End", expense: 1e308, tier: 99, description: "Congratulations! You have beaten the game!" },
}
/** @type {Record<string, string[]>} */
const milestoneCategories = {
    "Essence Milestones": ["Magic Eye", "Time Does Not Fly", "Almighty Eye", "Deal with the Devil", "Transcendent Master",
        "Eternal Time", "Hell Portal", "Inferno", "God's Blessings", "Faint Hope", "Dance With The Devil"],
    "Heroic Milestones": ["New Beginning", "Rise of Great Heroes", "Lazy Heroes", "Legends Never Die", "Angry Heroes",
        "Scared Heroes", "Funny Heroes", "Beautiful Heroes", "Superb Heroes", "A new beginning"],
    "Dark Milestones": ["Great Almightiness", "Mind Control", "Galactic Emperor", "Dark Matter Harvester", "Great Darkness",
        "A Dark Era", "Dark Orbiter", "Dark Matter Mining", "The Devil inside you", "Strange Magic",
        "Speed speed speed", "The Darkest Time", "Life is valueable", "Dark Matter Millionaire", "The new Dark Matter"],
    "Metaverse Milestones": ["Ruler of the Metaverse", "A New Hope", "Time is a flat circle", "The End is near", "The End"],
}

