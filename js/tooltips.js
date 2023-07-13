const tooltips = {
    // Trabalho comum
    "Mendigo": "Lute dia e noite por algumas moedas de cobre.  Parece que você está à beira da morte a cada dia.",
    "Agricultor": "Are os campos e cultive as colheitas.  Não é muito, mas é um trabalho honesto.",
    "Pescador": "Enrole vários peixes e venda-os por um punhado de moedas.  Um trabalho relaxante, mas ainda mal remunerado.",
    "Minerador": "Mergulhe em cavernas perigosas e extraia minérios valiosos.  O salário é bastante escasso em comparação com o risco envolvido.",
    "Ferreiro": "Funda minérios e forje armas cuidadosamente para os militares.  Um trabalho comum respeitável e bem pago.",
    "Comerciante": "Viaje de cidade em cidade, negociando boas mercadorias.  O trabalho paga decentemente bem e é muito menos intensivo manualmente.",

    // Militar
    "Escudeiro": "Carregue o escudo e a espada do seu cavaleiro pelo campo de batalha.  Salário muito escasso, mas a experiência de trabalho é bastante valiosa.",
    "Lacaio": "Arrisque sua vida para lutar contra os soldados inimigos.  Um trabalho corajoso e respeitável, mas você ainda é inútil no grande esquema das coisas.",
    "Lacaio veterano": "Mais experiente e útil do que o lacaio médio, elimine as forças inimigas na batalha com sua força.  O salário não é tão ruim.",
    "Centurião": "Ao provar suas habilidades com um arco, você foi designado para liderar um pequeno grupo de arqueiros para emboscar seus inimigos à distância.",
    "Knight": "Slash and pierce through enemy soldiers with ease, while covered in steel from head to toe. A decently paying and very respectable job.",
    "Veteran Knight": "Utilising your unmatched combat ability, slaugher enemies effortlessly. Most footmen in the military would never be able to acquire such a well paying job like this.",
    "Holy Knight": "Obliterate squadrons of enemy soldiers in one go with extraordinary proficiency, while wielding a magically imbued blade. Such a feared unit on the battlefield is paid extremely well.",
    "Lieutenant General": "Feared by nations, obliterate entire armies in a blink of an eye. Roughly every century, only one holy knight is worthy of receiving such an esteemed title.",

    // The Arcane Association
    "Student": "Study the theory of mana and practice basic spells. There is minor pay to cover living costs; however, this is a necessary stage in becoming a mage.",
    "Apprentice Mage": "Under the supervision of a skilled mage, perform basic spells against enemies in battle. Generous pay will be provided to cover living costs.",
    "Adept Mage": "Turn the tides of battle through casting intermediate spells and mentor other apprentices. The pay for this particular job is extremely high.",
    "Master Wizard": "Utilise advanced spells to ravage and destroy entire legions of enemy soldiers. Only a small percentage of mages deserve to attain this role and are rewarded with an insanely high pay.",
    "Archmage": "Blessed with unparalleled talent, perform unbelievable feats with magic at will. It is said that an archmage has enough destructive power to wipe an empire off the map.",
    "Chronomancer": "Specialize in harnessing temporal energies that alter the flow of time with supernatural divinations and otherwordly expertise.",
    "Chairman": "Spend your days administrating The Arcane Association and investigate the concepts of true immortality. The chairman receives ludicrous amounts of pay daily.",
    "Imperator": "You wield an unlimited power, making you unstoppable. By ruling with an iron fist, everyone in the Arcane Association has to obey your commands.",

    // The Void
    "Corrupted": "Corrupted by Void, you are slowly turning into a slave with no free will, just to serve the Void for the rest of eternity... Can you resist it, or will it consume you forever?",
    "Void Slave": "Each day, you are succumbing to the Void more and more. Can you hold onto your humanity for a bit longer, or will you let the Void devour you?",
    "Void Fiend": "You become an inquisitive yet putrid creature that siphons life from everything around you.",
    "Abyss Anomaly": "Screaming into existence, you become a manifestation of the unknowable nothingness that lies beyond.",
    "Void Wraith": "Damned soul... a shadow of your former self, lingering between realms and consumed by void... Can you ever find peace?",
    "Void Reaver": "There are few who may tread the paths between worlds, these powers grant you an ability to generate fields of void energy that devour all living things.",
    "Void Lord": "You gazed into the dark heart of the Void long enough to become one of the most powerful and feared beings. All lesser void creatures are at your command.",
    "Abyss God": "Creator of the Void, a vast canvas of blackness and nothingness, in which the concept of its existence defies all logic. Nothing will escape you.",

    // Galactic Council
    "Eternal Wanderer": "With the powers bestowed upon you by an unknown entity, you wander around, visiting places revered and feared in search of answers.",
    "Nova": "Extremely powerful being with tremedous telekinetic powers and the ability to rearrange the molecular structure of matter and energy, even up to cosmic scale.",
    "Sigma Proioxis": "A nigh-omnipotent cosmological entity, with vast matter and energy manipulation abilities that help you push the boundaries of the Universe itself.",
    "Acallaris": "Primordial being that predate the universe, involved with the creation of life and powerful beyond mortal comprehension, existing as myths to the oldest species in the universe.",
    "One Above All": "Creator of everything.",

    // Metaverse Guards
    "Snow Crash": "Snow Crash, 1992",
    "Player One": "Ready Player One, 2011",
    "Lost in the dark": "They both knew they would only go forward when next to each other. They vowed that they would always be together, earn a lot of money and move to a better place where they would be very happy.",
    "Omega": "ω",

    // Fundamentals
    "Concentração": "Melhore sua velocidade de aprendizado praticando atividades intensas de concentração.",
    "Produtividade": "Aprenda a procrastinar menos no trabalho e receba mais experiência profissional por dia.",
    "Barganha": "Estude os truques da negociação e as habilidades persuasivas para diminuir qualquer tipo de gasto.",
    "Meditação": "Preencha sua mente com paz e tranquilidade para explorar uma felicidade maior por dentro.",

    // Combate
    "Força": "Condicione seu corpo e sua força por meio de um treinamento intenso. Indivíduos mais fortes são mais bem pagos no serviço militar.",
    "Táticas de Batalha": "Crie e revise estratégias de batalha, melhorando a experiência adquirida nas forças militares.",
    "Memória Muscular": "Fortaleça seus neurônios através do hábito e da repetição, melhorando os ganhos de força em todo o corpo.",

    // Magic
    "Mana Control": "Strengthen your mana channels throughout your body, aiding you in becoming a more powerful magical user.",
    "Life Essence": "Lengthen your lifespan through the means of magic. However, is this truly the immortality you have tried seeking for...?",
    "Time Warping": "Bend space and time through forbidden techniques, speeding up your learning processes.",
    "Astral Body": "Lengthen your lifespan drastically beyond comprehension by harnessing ethereal energy.",
    "Temporal Dimension": "Create your own pocket dimension where centuries go by in mere seconds.",
    "All Seeing Eye": "As the highest rank of T.A.A, all funds go directly to you.",
    "Brainwashing": "A technique designed to manipulate human thought and action against their desire.",

    // Dark Magic - Evil Required
    "Dark Influence": "Encompass yourself with formidable power bestowed upon you by evil, allowing you to pick up and absorb any job or skill with ease.",
    "Evil Control": "Tame the raging and growing evil within you, improving evil gain in-between rebirths.",
    "Intimidation": "Learn to emit a devilish aura which strikes extreme fear into other merchants, forcing them to give you heavy discounts.",
    "Demon Training": "A mere human body is too feeble and weak to withstand evil. Train with forbidden methods to slowly manifest into a demon, capable of absorbing knowledge rapidly.",
    "Blood Meditation": "Grow and culture the evil within you through the sacrifice of other living beings, drastically increasing evil gain.",
    "Demon's Wealth": "Through the means of dark magic, multiply the raw matter of the coins you receive from your job.",
    "Dark Knowledge": "Sealed for a very long time, you utilize these forbidden texts for your own personal gain.",
    "Void Influence": "Tapping into the powers of the Void while combining them with evil grants you an unlimited potential.",
    "Time Loop": "Mastery is achieved when 'telling time' becomes 'telling time what to do'.",
    "Evil Incarnate": "You have became the very thing you swore to destroy.",

    // Void Manipulation
    "Absolute Wish": "The power to fulfill absolutely any and all wishes without any limitations.",
    "Void Amplification": "You surrender yourself to the Void, making it easier to take control of you.",
    "Mind Release": "In a trance like state, you feel the Void amplifying your thoughts, perception, memories, emotions and personality.",
    "Ceaseless Abyss": "Never ending torture, you swore to serve the Void for the rest of your existence.",
    "Void Symbiosis": "A symbiotic relationship that helps you become one with the Void.",
    "Void Embodiment": "If thou gaze long into an abyss, the abyss will also gaze into thee.",
    "Abyss Manipulation": "Allows you to shape your own reality within the Void itself.",

    // Celestial Powers
    "Cosmic Longevity": "You have seen it all, from the very beginning to the very end.",
    "Cosmic Recollection": "Being able to exist in multiple parallel timelines and manipulating you parallel selves, influencing their lives as you see fit.",
    "Essence Collector": "Exploit the unlimited potential of multiverse energies and collect its resources.",
    "Galactic Command": "Absolute power corrupts absolutely.",

    // Almightiness
    "Yin Yang": "Born from chaos when the universe was first created, believed to exist in harmony, balancing evil and good.",
    "Parallel Universe": "Self-contained plane of existence, co-existing with one's own, helping you restore fragments of your forgotten power.",
    "Higher Dimensions": "By possesing the power to partially alter the laws of physics and transceding lower dimensional spaces, your existence becomes never-ending.",
    "Epiphany": "You become one with everything.",

    // Darkness
    "Dark Prince": "You can increase your intelligence at an alarming rate due to your access to all libraries in the universe.",
    "Dark Ruler": "Ruling the universe allows you to collect more Dark Matter from your subordinates.",
    "Immortal Ruler": "You have only one goal: ruling this universe till infinity.",
    "Dark Magician": "By performing forbidden magic on your subordinates, you can extract every last drop of Essence from them.",
    "Universal Ruler": "No one dares to challenge your rule when ruling with an iron fist.",
    "Blinded By Darkness": "Blinded by darkness, you can no longer control yourself. You start to destroy everything in existance to calm yourself.",

    // Propriedades
    "Sem-teto": "Durma nas ruas desconfortáveis ​​e imundas enquanto quase morre de frio todas as noites.  Não pode ficar pior do que isso.",
    "Barraca": "Uma fina folha de pano esfarrapado sustentada por um par de varetas de madeira fracas.  Condições de vida horríveis, mas pelo menos você tem um teto sobre si.",
    "Cabana de Madeira": "Troncos surrados e feno sujo colados com esterco de cavalo.  Muito mais resistente que uma barraca, porém, o fedor não é muito agradável.",
    "Cottage": "Structured with a timber frame and a thatched roof. Provides decent living conditions for a fair price.",
    "House": "A building formed from stone bricks and sturdy timber, which contains a few rooms. Although quite expensive, it is a comfortable abode.",
    "Large House": "Much larger than a regular house, which boasts even more rooms and multiple floors. The building is quite spacious but comes with a hefty price tag.",
    "Small Palace": "A very rich and meticulously built structure rimmed with fine metals such as silver. Extremely high expenses to maintain for a lavish lifestyle.",
    "Grand Palace": "A grand residence completely composed of gold and silver. Provides the utmost luxurious and comfortable living conditions possible for a ludicrous price.",
    "Town Ruler": "You rule your very own community in your small town, owning multiple establishments.",
    "City Ruler": "As the highest ranking official, you manage and oversee everything that happens. While your pay is astronomical, so are your expenses.",
    "Nation Ruler": "You reign the whole nation. While your riches may be corrupted, everything you see belongs to you.",
    "Pocket Dimension": "A Dimension just for you that can be summoned at will. What happens there stays there.",
    "Void Realm": "Unknown how or when the Void realm came into existence, containing elements which don’t exist outside of its dimensional plane are now all to your disposal",
    "Void Universe": "Predating our own universe, the Void has an unlimited amount of space for your belongings, if you are willing to submit to it.",
    "Astral Realm": "Beneath personality and ego lays the source of our deep character, our personhood. Here are the psychic senses, our deep mind and emotions, symbols and inner reality.",
    "Galactic Throne": "You sit on your throne, overseeing the existence itself.",
    "Spaceship": "Your own personal cosmic house, able to travel anywhere in the universe at 99.99% of the speed of light.",
    "Planet": "A planet with the sole purpose of housing you and your family.",
    "Ringworld": "A construct with the mass of Jupiter and a surface area millions of times that of Earth, capable of housing trillions of humans and other animals including alien species. The expenses are literally astronomical due to the maintenance involved in keeping the structure stable and the inside area habitable, but the massive living space is worth it.",
    "Stellar Neighborhood": "A fully colonized network of stars and star systems spanning dozens of light years is ready for you to explore and call home.",
    "Galaxy": "You rule your very own galaxy the size of the Milky Way, with billions of planets organized into thousands of different states all under your control. While your power is astronomical, so are your responsibilities.",
    "Supercluster": "A cluster of galactic groups spanning hundreds of millions of light years across and containing thousands of galaxies is under your control.",
    "Galaxy Filament": "One of the largest known structures of the universe, containing dozens of superclusters and millions of galaxies.",
    "Observable Universe": "You did it! You finally rule the entire universe...or do you?",
    "Multiverse": "Universe is too small for you?!",
    "Quantum World": "You try to find at least some place that is still beyond your control, but all in vain.",
    "Boötes Void": "The Great Nothing",

    // Diversos
    "Livro": "Um lugar para anotar todos os seus pensamentos e descobertas, permitindo que você aprenda muito mais rapidamente.",
    "Dumbbells": "Heavy tools used in strenuous exercise to toughen up and accumulate strength even faster than before.",
    "Personal Squire": "Assists you in completing day to day activities, giving you more time to be productive at work.",
    "Steel Longsword": "A fine blade used to slay enemies even quicker in combat and therefore gain more experience.",
    "Butler": "Keeps your household clean at all times and also prepares three delicious meals per day, leaving you in a happier, stress-free mood.",
    "Sapphire Charm": "Embedded with a rare sapphire, this charm activates more mana channels within your body, providing a much easier time learning magic.",
    "Study Desk": "A dedicated area which provides many fine stationary and equipment designed for furthering your progress in research.",
    "Library": "Stores a collection of books, each containing vast amounts of information from basic life skills to complex magic spells.",
    "Observatory": "Used for observing terrestrial, marine and celestial events.",
    "Mind's Eye": "Lets you see memories, remember images, and even see new pictures and ideas.",
    "Void Necklace": "Helps you shape and manipulate void matter, even transmute and rebuild it into anything of your choosing.",
    "Void Armor": "Generates an innate armor as a part of your body, which is resistant to attacks, harm or pain.",
    "Void Blade": "Forged from void dust and dark matter, this blade can slash through dimensional barriers. It's a weapon of choice for every Void Reaver.",
    "Void Orb": "When the orb touches non void entities, it instantly disintegrates them by harnessing its power from Void realm.",
    "Void Dust": "Purest version of void created material; a teaspoon of it is as heavy as a small planet.",
    "Celestial Robe": "The most powerful and essential equipment of any Celestial. Acts as a source of infinite power.",
    "Universe Fragment": "From the time the universe was born. Can create more small universes.",
    "Multiverse Fragment": "Came into existance long before our universe was created, this strange looking object with no shape radiates unlimited energy.",
    "Stairway to heaven": "A staircase to the all mighty themselves.",
    "Highway to hell": "The devil invites you to his palace of terror.",
    "Tesseract": "This object is from a higher dimensional world.",
    "Desintegration": "Why do you need it?",
    "Custom Galaxy": "You know about the pocket dimension, right?",
    "Hypersphere": "You gain the limitless pow... ah, you're already omnipotent...",

    // Essence Milestones
    "Magic Eye": "The Eye in your Amulet starts to glow.",
    "Almighty Eye": "The Eye in your Amulet shines like a star.",
    "Deal with the Devil": "You made a deal with the Devil.",
    "Transcendent Master": "You've mastered Transcendence.",
    "Eternal Time": "Does time matter now?",
    "Hell Portal": "You've opened a portal to Hell.",
    "Inferno": "You are at the last level of Hell. What is next?",
    "God's Blessings": "God bless you!",
    "Faint Hope": "Maybe there is hope?",
    "New Beginning": "Try to upgrade One Above All to level 2000",

    // Heroic Milestones
    "Rise of Great Heroes": "Every active Great job or skill will increase Essence gain a bit.",
    "Lazy Heroes": "Total Hero XP multiplier is 5e20",
    "Dirty Heroes": "Total Hero XP multiplier is 5e35",
    "Angry Heroes": "Total Hero XP multiplier is 5e50",
    "Tired Heroes": "Total Hero XP multiplier is 5e65",
    "Scared Heroes": "Total Hero XP multiplier is 5e80",
    "Good Heroes": "Total Hero XP multiplier is 5e95",
    "Funny Heroes": "Total Hero XP multiplier is 5e120",
    "Beautiful Heroes": "Total Hero XP multiplier is 5e170",
    "Awesome Heroes": "Total Hero XP multiplier is 5e180",
    "Furious Heroes": "Total Hero XP multiplier is 5e198",
    "Superb Heroes": "Total Hero XP multiplier is 5e201",
    "A new beginning": "Unlocks the ability to reset for Dark Matter",

    // Dark Milestones
    "Mind Control": "Control the Devil by making him give you even more Evil per second",
    "Galactic Emperor": "Commander of the Galactic Council grants you the privilege to automatically collect Essence from the nearby planets",
    "Dark Matter Harvester": "Harvest the universe to extract even more Dark Matter from it.",
    "A Dark Era": "Start a new era of Dark Matter.",
    "Dark Orbiter": "Using some wizardry you can improve your Dark Orb generators massively.",
    "Dark Matter Mining": "Mine a huge amount of Dark Matter from each planet you visit.",
    "The new gold": "Essence might become the new gold due to mass adoption.",
    "The Devil inside you": "Shady deals with the Devil grant you a huge Evil bonus.",
    "Strange Magic": "A strange wizard offers you a few secret spells which might be useful.",
    "Life is valueable": "Time is limited... Even as the ruler of the universe.",
    "Speed speed speed": "You can affect the speed of the universe with your gigantic amount of Dark Matter.",
    "Dark Matter Millionaire": "This secret spell will help you reach your quest to become the first Dark Matter millionaire.",
    "The new Dark Matter": "Your amulet tears space and time through all multiverses. Welcome to Metaverse.",

    "Strong Hope": "Another Faint Hope buff?!",
    "Ruler of the Metaverse": "Now you are thinking with portals",
    "A New Hope": "No more of this Faint Hope nonsense!!!",
    "Time is a flat circle": "This is a world where nothing is solved. Someone once told me, time is a flat circle. Everything we’ve ever done or will do, we’re gonna do over and over and over again.",
    "The End is near": "We don't try to live forever",
    "The End": "There is always an end",
}
