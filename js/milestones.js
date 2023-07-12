var milestoneData = {}

const milestoneBaseData = {
    "Magic Eye": { name: "Magic Eye", expense: 5000, tier: 1, description: "Automatically gain max levels at age 65" },
    "Almighty Eye": { name: "Almighty Eye", expense: 15000, tier: 2, description: "Automatically gain max levels" },
    "Deal with the Devil": { name: "Deal with the Devil", expense: 30000, tier: 3, description: "Passively gain a small amount of Evil" },
    "Transcendent Master": { name: "Transcendent Master", expense: 50000, tier: 4, description: "Essence gain" },
    "Eternal Time": { name: "Eternal Time", expense: 75000, tier: 5, description: "x2 Time Warping" },
    "Hell Portal": { name: "Hell Portal", expense: 120000, tier: 6, description: "Passively gain a huge amount of Evil" },
    "Inferno": { name: "Inferno", expense: 170000, tier: 7, description: "x5 Evil gain" },
    "God's Blessings": { name: "God's Blessings", expense: 250000, tier: 8, description: "x10M Felicidade" },
    "Faint Hope": { name: "Faint Hope", expense: 400000, tier: 9, description: "Essence gain (increases over time, influenced by time warping)" },
    "New Beginning": { name: "New Beginning", expense: 5000000, tier: 10, description: "Heroic jobs, skills and items are unlocked" },

    "Rise of Great Heroes": { name: "Rise of Great Heroes", expense: 10000000, tier: 11, description: "Essence gain + x10000 Hero XP" },
    "Lazy Heroes": { name: "Lazy Heroes", expense: 20000000, tier: 12, description: "Hero XP", effect: 1e12 },
    "Dirty Heroes": { name: "Dirty Heroes", expense: 30000000, tier: 13, description: "Hero XP", effect: 1e15 },
    "Angry Heroes": { name: "Angry Heroes", expense: 50000000, tier: 14, description: "Hero XP", effect: 1e15 },
    "Tired Heroes": { name: "Tired Heroes", expense: 100000000, tier: 15, description: "Hero XP", effect: 1e15 },
    "Scared Heroes": { name: "Scared Heroes", expense: 150000000, tier: 16, description: "Hero XP", effect: 1e15 },
    "Good Heroes": { name: "Good Heroes", expense: 200000000, tier: 17, description: "Hero XP", effect: 1e15 },
    "Funny Heroes": { name: "Funny Heroes", expense: 300000000, tier: 18, description: "Hero XP", effect: 1e25 },
    "Beautiful Heroes": { name: "Beautiful Heroes", expense: 400000000, tier: 19, description: "Hero XP", effect: 1e50 },
    "Awesome Heroes": { name: "Awesome Heroes", expense: 500000000, tier: 20, description: "Hero XP", effect: 1e10 },
    "Furious Heroes": { name: "Furious Heroes", expense: 750000000, tier: 21, description: "Hero XP", effect: 1e18 },
    "Superb Heroes": { name: "Superb Heroes", expense: 10000000000, tier: 22, description: "Hero XP", effect: 1e3 },
    "A new beginning": { name: "A new beginning", expense: 5e10, tier: 23, description: "Unlocks Dark Matter" },

    "Mind Control": { name: "Mind Control", expense: 1e13, tier: 24, description: "Makes Hell Portal even stronger" },
    "Galactic Emperor": { name: "Galactic Emperor", expense: 1e15, tier: 25, description: "Passively gain a small amount of Essence" },
    "Dark Matter Harvester": { name: "Dark Matter Harvester", expense: 1e17, tier: 26, description: "Multiply Dark Matter gain by 10x" },
    "A Dark Era": { name: "A Dark Era", expense: 1e20, tier: 27, description: "Unlocks Dark Matter Skills" },
    "Dark Orbiter": { name: "Dark Orbiter", expense: 1e22, tier: 28, description: "Multiply Dark Orb gain by 1e10x" },
    "Dark Matter Mining": { name: "Dark Matter Mining", expense: 1e25, tier: 29, description: "Multiply Dark Matter gain by 3x" },
    "The new gold": { name: "The new gold", expense: 1e30, tier: 30, description: "Multiply Essence gain by 1000x" },
    "The Devil inside you": { name: "The Devil inside you", expense: 1e35, tier: 31, description: "Multiply Evil gain by 1e15x" },
    "Strange Magic": { name: "Strange Magic", expense: 1e38, tier: 32, description: "Multiply Darkness xp gain by 1e50x" },
    "Speed speed speed": { name: "Speed speed speed", expense: 1e40, tier: 33, description: "Multiply Time Warping and Lifespan by 1000x. Heavily boosts Faint Hope" },
    "Life is valueable": { name: "Life is valueable", expense: 1e47, tier: 34, description: "Multiply your lifespan by 1e5x. New challenge unlocked. Dark Matter boosts essence gain." },
    "Dark Matter Millionaire": { name: "Dark Matter Millionaire", expense: 1e55, tier: 35, description: "Multiply Dark Matter gain by 500x" },
    "The new Dark Matter": { name: "The new Dark Matter", expense: 1e60, tier: 36, description: "Unlocks Metaverse" },

    "Strong Hope": { name: "Strong Hope", expense: 1e70, tier: 37, description: "Faint Hope does not reset on transcend or collapse" },

    "Ruler of the Metaverse": { name: "Ruler of the Metaverse", expense: 1e90, tier: 38, description: "Unlocks Metaverse Perks, Metaverse Guards Job Category" },
    "A New Hope": { name: "A New Hope", expense: 1e95, tier: 39, description: "Faint Hope always at maximum" },
    "Time is a flat circle": { name: "Time is a flat circle", expense: 1e100, tier: 40, description: "Multiply Time Warping by 1000x, Multiply all xp gain by 1e50x" },
    "The End is near": { name: "The End is near", expense: 1e200, tier: 50, description: "Unspent Multiverse Perk Points buffs Dark Matter" },
    "The End": { name: "The End", expense: 1e300, tier: 99, description: "Congratulations! You have beaten the game!" },
}

const milestoneCategories = {
    "Essence Milestones": ["Magic Eye", "Almighty Eye", "Deal with the Devil", "Transcendent Master", "Eternal Time", "Hell Portal", "Inferno", "God's Blessings", "Faint Hope"],
    "Heroic Milestones": ["New Beginning", "Rise of Great Heroes", "Lazy Heroes", "Dirty Heroes", "Angry Heroes", "Tired Heroes", "Scared Heroes", "Good Heroes", "Funny Heroes", "Beautiful Heroes", "Awesome Heroes", "Furious Heroes", "Superb Heroes", "A new beginning"],
    "Dark Milestones": ["Mind Control", "Galactic Emperor", "Dark Matter Harvester", "A Dark Era", "Dark Orbiter", "Dark Matter Mining", "The new gold", "The Devil inside you", "Strange Magic", "Speed speed speed", "Life is valueable", "Dark Matter Millionaire", "The new Dark Matter"],
    "Metaverse Milestones": ["Strong Hope", "Ruler of the Metaverse", "A New Hope", "Time is a flat circle", "The End is near", "The End"],
}


function createMilestoneRequirements() {
    for (const key in milestoneBaseData) {
        const milestone = milestoneData[key]
        gameData.requirements[milestone.name] = new EssenceRequirement([getQuerySelector(milestone.name)],
            [{ requirement: milestone.expense }])
    }
}

function isNextMilestoneInReach() {
    const totalEssence = gameData.essence + getEssenceGain()

    for (const key in milestoneData) {
        const requirementObject = gameData.requirements[key]

        if (requirementObject instanceof EssenceRequirement) {
            if (!requirementObject.isCompleted()) {
                if (totalEssence >= requirementObject.requirements[0].requirement)
                    return true
            }
        }
    }
    return false
}
