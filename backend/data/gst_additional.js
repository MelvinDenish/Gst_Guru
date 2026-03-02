// Additional GST Items — Chemicals, Plastics, Rubber, Machinery, Kitchenware,
// Baby Products, Pet Care, Energy, Handicrafts, Safety, Garden, Packaging, Arms
module.exports = [
    // ═══════════════════════════════════════════════════════════
    // CHEMICALS & INDUSTRIAL
    // ═══════════════════════════════════════════════════════════
    { hsn: "2801", name: "Chlorine & Fluorine", category: "Construction & Materials", rate: 18, desc: "Chemical elements — chlorine, fluorine, bromine" },
    { hsn: "2804", name: "Hydrogen / Nitrogen / Oxygen Gas", category: "Construction & Materials", rate: 18, desc: "Hydrogen, nitrogen, oxygen, industrial gases" },
    { hsn: "2806", name: "Hydrochloric Acid", category: "Construction & Materials", rate: 18, desc: "Hydrogen chloride, hydrochloric acid" },
    { hsn: "2811", name: "Sulphuric Acid / Nitric Acid", category: "Construction & Materials", rate: 18, desc: "Sulphuric acid, oleum, nitric acid" },
    { hsn: "2814", name: "Ammonia (Anhydrous)", category: "Construction & Materials", rate: 18, desc: "Ammonia, anhydrous or in solution" },
    { hsn: "2828", name: "Bleach (Sodium Hypochlorite)", category: "Construction & Materials", rate: 18, desc: "Bleaching agents, sodium hypochlorite" },
    { hsn: "2836", name: "Baking Soda / Washing Soda", category: "Food & Essentials", rate: 18, desc: "Sodium bicarbonate, sodium carbonate" },
    { hsn: "2853", name: "Distilled Water", category: "Healthcare & Pharma", rate: 18, desc: "Distilled water, conductivity water" },
    { hsn: "2901", name: "LPG — Domestic Cylinder", category: "Food & Essentials", rate: 5, desc: "LPG domestic cooking gas cylinder (14.2 kg)" },
    { hsn: "2901A", name: "LPG — Commercial Cylinder", category: "Food & Essentials", rate: 18, desc: "LPG commercial cylinder (19 kg / 47.5 kg)" },
    { hsn: "2701", name: "Coal (All Types)", category: "Construction & Materials", rate: 5, desc: "Coal — bituminous, anthracite, steam coal", applicability: { type: "cess_commodity", cess_rate: "₹400 per tonne", note: "Compensation cess on coal" } },
    { hsn: "2710C", name: "Kerosene — PDS", category: "Food & Essentials", rate: 5, desc: "Kerosene oil sold through PDS" },
    { hsn: "2710D", name: "Kerosene — Non-PDS", category: "Food & Essentials", rate: 18, desc: "Kerosene oil, non-PDS supply" },
    { hsn: "2711B", name: "Natural Gas (Piped)", category: "Construction & Materials", rate: 5, desc: "PNG — piped natural gas for domestic/commercial" },
    { hsn: "2713", name: "Petroleum Coke", category: "Construction & Materials", rate: 18, desc: "Petroleum coke, petroleum bitumen" },

    // ═══════════════════════════════════════════════════════════
    // PLASTICS & RUBBER PRODUCTS
    // ═══════════════════════════════════════════════════════════
    { hsn: "3901", name: "Polyethylene (LDPE/HDPE Granules)", category: "Construction & Materials", rate: 18, desc: "Polymers of ethylene — raw granules" },
    { hsn: "3902", name: "Polypropylene Granules", category: "Construction & Materials", rate: 18, desc: "Polymers of propylene — PP granules" },
    { hsn: "3904", name: "PVC Resin / Compound", category: "Construction & Materials", rate: 18, desc: "Polyvinyl chloride resin" },
    { hsn: "3918", name: "Plastic Floor Covering / Vinyl", category: "Construction & Materials", rate: 18, desc: "Vinyl flooring, plastic floor coverings" },
    { hsn: "3919", name: "Self-Adhesive Plastic Sheet / Tape", category: "Construction & Materials", rate: 18, desc: "Self-adhesive plates, tape of plastic" },
    { hsn: "3922", name: "Plastic Bath / Sanitary Fittings", category: "Construction & Materials", rate: 18, desc: "Baths, shower trays, wash basins, WC seats of plastic" },
    { hsn: "3923", name: "Plastic Containers / Bottles", category: "Construction & Materials", rate: 18, desc: "Plastic bottles, jars, containers, boxes" },
    { hsn: "3924", name: "Plastic Household Articles", category: "Luxury & Lifestyle", rate: 18, desc: "Plastic tableware, kitchenware, buckets, dustbins" },
    { hsn: "3926", name: "Plastic Articles (Other)", category: "Construction & Materials", rate: 18, desc: "Cable ties, ID cards, name plates of plastic" },
    { hsn: "3926A", name: "Plastic Carry Bags", category: "Construction & Materials", rate: 18, desc: "Plastic shopping bags, garbage bags" },
    { hsn: "4002", name: "Synthetic Rubber", category: "Construction & Materials", rate: 18, desc: "Synthetic rubber, factice from oils" },
    { hsn: "4005", name: "Rubber (Compounded)", category: "Construction & Materials", rate: 18, desc: "Compounded rubber, unvulcanised" },
    { hsn: "4006", name: "Rubber Sheets & Mats", category: "Construction & Materials", rate: 18, desc: "Rubber sheets, strips, floor mats" },
    { hsn: "4009", name: "Rubber Hoses & Tubes", category: "Construction & Materials", rate: 18, desc: "Rubber tubes, pipes, hoses" },
    { hsn: "4010", name: "Conveyor / Transmission Belts", category: "Construction & Materials", rate: 18, desc: "Conveyor belts, V-belts of rubber" },
    { hsn: "4014", name: "Rubber Gloves (Non-Medical)", category: "Construction & Materials", rate: 18, desc: "Rubber gloves — household, industrial" },
    { hsn: "4015", name: "Rubber Gloves (Medical/Surgical)", category: "Healthcare & Pharma", rate: 12, desc: "Surgical gloves, examination gloves of rubber" },
    { hsn: "4016A", name: "Rubber Gaskets & Seals", category: "Construction & Materials", rate: 18, desc: "Rubber gaskets, washers, O-rings, oil seals" },

    // ═══════════════════════════════════════════════════════════
    // KITCHENWARE, COOKWARE & UTENSILS
    // ═══════════════════════════════════════════════════════════
    { hsn: "7323", name: "Stainless Steel Utensils", category: "Luxury & Lifestyle", rate: 18, desc: "SS vessels, pots, pans, plates, tumblers" },
    { hsn: "7323A", name: "Pressure Cooker (SS/Aluminium)", category: "Luxury & Lifestyle", rate: 18, desc: "Pressure cookers — SS, aluminium, hard-anodised" },
    { hsn: "7323B", name: "Non-Stick Cookware", category: "Luxury & Lifestyle", rate: 18, desc: "Non-stick pans, tawa, kadhai, wok" },
    { hsn: "7615", name: "Aluminium Utensils", category: "Luxury & Lifestyle", rate: 18, desc: "Aluminium vessels, pots, pans, kitchen articles" },
    { hsn: "7615A", name: "Aluminium Foil (Kitchen)", category: "Luxury & Lifestyle", rate: 18, desc: "Aluminium foil, cling wrap, food wrap" },
    { hsn: "6911", name: "Ceramic Tableware", category: "Luxury & Lifestyle", rate: 18, desc: "Ceramic plates, bowls, cups, mugs" },
    { hsn: "6912", name: "Ceramic Cookware", category: "Luxury & Lifestyle", rate: 18, desc: "Ceramic pots, cruets, jars" },
    { hsn: "7013", name: "Glassware (Kitchen/Table)", category: "Luxury & Lifestyle", rate: 18, desc: "Glass tumblers, wine glasses, bowls, jars" },
    { hsn: "8210", name: "Kitchen Hand Tools", category: "Luxury & Lifestyle", rate: 18, desc: "Peelers, graters, slicers, can openers" },
    { hsn: "8211", name: "Knives & Cutlery", category: "Luxury & Lifestyle", rate: 18, desc: "Kitchen knives, table knives, bread knives" },
    { hsn: "8215", name: "Spoons, Forks & Ladles", category: "Luxury & Lifestyle", rate: 18, desc: "Spoons, forks, serving spoons, ladles" },
    { hsn: "7321", name: "Gas Stove / Cooking Range", category: "Electronics & Appliances", rate: 18, desc: "Gas burners, cooking stove, hobs" },
    { hsn: "7321A", name: "Gas Stove (2-Burner)", category: "Electronics & Appliances", rate: 18, desc: "Two-burner gas stove for domestic use" },
    { hsn: "3924A", name: "Lunch Boxes & Tiffin", category: "Luxury & Lifestyle", rate: 18, desc: "Plastic/steel lunch boxes, food containers" },
    { hsn: "3924B", name: "Water Bottles (Reusable)", category: "Luxury & Lifestyle", rate: 18, desc: "Reusable water bottles — steel, plastic, copper" },
    { hsn: "7310", name: "Thermos / Vacuum Flask", category: "Luxury & Lifestyle", rate: 18, desc: "Vacuum flasks, thermos, insulated containers" },

    // ═══════════════════════════════════════════════════════════
    // BABY & CHILD PRODUCTS
    // ═══════════════════════════════════════════════════════════
    { hsn: "1901A", name: "Baby Food / Cerelac", category: "Food & Essentials", rate: 5, desc: "Baby food preparations — infant cereal, malt extract" },
    { hsn: "0402A", name: "Infant Formula Milk", category: "Food & Essentials", rate: 5, desc: "Infant milk formula, follow-up formula" },
    { hsn: "8715", name: "Baby Stroller / Pram", category: "Luxury & Lifestyle", rate: 18, desc: "Baby carriages, strollers, prams" },
    { hsn: "9401A", name: "Car Seats (Baby/Child)", category: "Luxury & Lifestyle", rate: 18, desc: "Child car seats, booster seats" },
    { hsn: "9503B", name: "Baby / Toddler Toys (Educational)", category: "Luxury & Lifestyle", rate: 12, desc: "Educational toys, building blocks, stacking toys" },
    { hsn: "3924C", name: "Baby Feeding Bottles / Sippers", category: "Healthcare & Pharma", rate: 18, desc: "Feeding bottles, sippy cups, pacifiers" },
    { hsn: "9619B", name: "Baby Wipes", category: "Healthcare & Pharma", rate: 18, desc: "Baby wet wipes, cleaning wipes" },
    { hsn: "3401A", name: "Baby Soap / Body Wash", category: "Healthcare & Pharma", rate: 18, desc: "Baby soap, baby shampoo, baby lotion" },

    // ═══════════════════════════════════════════════════════════
    // PET PRODUCTS
    // ═══════════════════════════════════════════════════════════
    { hsn: "2309A", name: "Dog Food / Cat Food (Packaged)", category: "Food & Essentials", rate: 18, desc: "Packaged pet food — dog food, cat food" },
    { hsn: "2309B", name: "Pet Treats & Chews", category: "Food & Essentials", rate: 18, desc: "Pet snacks, dental chews, treat sticks" },
    { hsn: "7326A", name: "Pet Cages / Kennels", category: "Luxury & Lifestyle", rate: 18, desc: "Bird cages, dog kennels, pet carriers" },
    { hsn: "4201", name: "Pet Collars, Leashes & Harness", category: "Luxury & Lifestyle", rate: 18, desc: "Pet collars, leashes, harnesses of leather/nylon" },
    { hsn: "3004L", name: "Veterinary Medicines", category: "Healthcare & Pharma", rate: 12, desc: "Medicines for animal / veterinary use" },

    // ═══════════════════════════════════════════════════════════
    // MACHINERY, TOOLS & HARDWARE
    // ═══════════════════════════════════════════════════════════
    // Hand Tools
    { hsn: "8201", name: "Spades, Shovels & Pickaxes", category: "Construction & Materials", rate: 18, desc: "Hand tools — spades, shovels, mattocks, forks" },
    { hsn: "8202", name: "Hand Saws (All Types)", category: "Construction & Materials", rate: 18, desc: "Hand saws — wood, metal, hack saws" },
    { hsn: "8203", name: "Pliers, Pincers & Wrenches", category: "Construction & Materials", rate: 18, desc: "Pliers, plumber's tools, wrenches, spanners" },
    { hsn: "8204", name: "Spanners & Socket Sets", category: "Construction & Materials", rate: 18, desc: "Hand-operated spanners, socket sets" },
    { hsn: "8205", name: "Hammers & Mallets", category: "Construction & Materials", rate: 18, desc: "Hammers, rubber mallets, ball peen" },
    { hsn: "8206", name: "Tool Sets (Combined)", category: "Construction & Materials", rate: 18, desc: "Combined tool sets in a case" },
    { hsn: "8207", name: "Drill Bits & Cutting Tools", category: "Construction & Materials", rate: 18, desc: "Drill bits, taps, dies, boring tools" },
    // Power Tools
    { hsn: "8467", name: "Power Drill / Driver", category: "Construction & Materials", rate: 18, desc: "Hand-held power drills, impact drivers" },
    { hsn: "8467A", name: "Angle Grinder", category: "Construction & Materials", rate: 18, desc: "Angle grinders, die grinders" },
    { hsn: "8467B", name: "Circular Saw / Jigsaw", category: "Construction & Materials", rate: 18, desc: "Electric circular saws, jigsaws, reciprocating saws" },
    { hsn: "8467C", name: "Sander / Planer (Electric)", category: "Construction & Materials", rate: 18, desc: "Electric sanders, planers, routers" },
    { hsn: "8468", name: "Welding Machine", category: "Construction & Materials", rate: 18, desc: "Welding machines — arc, MIG, TIG welders" },
    { hsn: "8413B", name: "Air Compressor", category: "Construction & Materials", rate: 18, desc: "Air compressors — reciprocating, screw type" },
    // Industrial Machinery
    { hsn: "8429", name: "Bulldozers & Excavators", category: "Construction & Materials", rate: 18, desc: "Bulldozers, excavators, earth-moving machinery" },
    { hsn: "8430", name: "Pile-Drivers & Drilling Machinery", category: "Construction & Materials", rate: 18, desc: "Pile-driving, road-boring equipment" },
    { hsn: "8431", name: "Crane Parts & Accessories", category: "Construction & Materials", rate: 18, desc: "Parts for cranes, conveyors, lifts" },
    { hsn: "8425", name: "Pulleys, Hoists & Winches", category: "Construction & Materials", rate: 18, desc: "Pulley tackle, hoists, winches, jacks" },
    { hsn: "8426", name: "Cranes & Derricks", category: "Construction & Materials", rate: 18, desc: "Ship's derricks, cranes, overhead cranes" },
    { hsn: "8428", name: "Lifts & Escalators", category: "Construction & Materials", rate: 18, desc: "Lifts, escalators, moving walkways" },
    { hsn: "8474", name: "Concrete Mixer / Crusher", category: "Construction & Materials", rate: 18, desc: "Concrete mixers, stone crushers, batching plants" },
    // Generators & Motors
    { hsn: "8501", name: "Electric Motors", category: "Electronics & Appliances", rate: 18, desc: "Electric motors — AC, DC, single/three phase" },
    { hsn: "8502", name: "DG Sets / Diesel Generators", category: "Electronics & Appliances", rate: 18, desc: "Electric generating sets, diesel generators" },
    { hsn: "8502B", name: "Wind Turbines / Generators", category: "Electronics & Appliances", rate: 12, desc: "Wind-powered generating sets, wind turbines" },
    { hsn: "8503", name: "Generator Parts & Alternators", category: "Electronics & Appliances", rate: 18, desc: "Parts of electric generators, alternators" },

    // ═══════════════════════════════════════════════════════════
    // FIRE SAFETY & SECURITY EQUIPMENT
    // ═══════════════════════════════════════════════════════════
    { hsn: "8424B", name: "Fire Extinguishers", category: "Construction & Materials", rate: 18, desc: "Fire extinguishers — ABC, CO2, foam type" },
    { hsn: "8531", name: "Fire Alarm / Smoke Detector", category: "Construction & Materials", rate: 18, desc: "Smoke detectors, fire alarm panels, sirens" },
    { hsn: "8531A", name: "Burglar Alarm / Security System", category: "Construction & Materials", rate: 18, desc: "Burglar alarms, motion sensors, intruder alarms" },
    { hsn: "6506", name: "Safety Helmets (Construction)", category: "Construction & Materials", rate: 18, desc: "Safety helmets — construction, industrial" },
    { hsn: "9004", name: "Safety Goggles / Welding Masks", category: "Construction & Materials", rate: 18, desc: "Protective goggles, welding shields, face masks" },
    { hsn: "6116", name: "Safety Gloves (Industrial)", category: "Construction & Materials", rate: 12, desc: "Knitted safety gloves, leather work gloves" },
    { hsn: "6402A", name: "Safety Shoes / Gumboots", category: "Textiles & Apparel", rate: 18, desc: "Safety shoes with steel toe, gumboots" },
    { hsn: "8301", name: "Padlocks & Door Locks", category: "Construction & Materials", rate: 18, desc: "Padlocks, door locks, combination locks, keys" },
    { hsn: "8302", name: "Door Hinges, Handles & Closers", category: "Construction & Materials", rate: 18, desc: "Hinges, handles, door closers of base metal" },

    // ═══════════════════════════════════════════════════════════
    // HANDICRAFTS, KHADI & TRADITIONAL
    // ═══════════════════════════════════════════════════════════
    { hsn: "4602", name: "Basketwork / Wickerwork", category: "Agriculture & Farming", rate: 5, desc: "Baskets, cane furniture, wickerwork articles" },
    { hsn: "5311", name: "Handloom Fabrics", category: "Textiles & Apparel", rate: 5, desc: "Handloom woven fabrics — khadi, hand-spun" },
    { hsn: "5702", name: "Handmade Carpets / Durries", category: "Textiles & Apparel", rate: 5, desc: "Hand-knotted carpets, durries, kilims" },
    { hsn: "4602A", name: "Coir Products (Mats, Ropes)", category: "Agriculture & Farming", rate: 5, desc: "Coir mats, coir ropes, coir mattress" },
    { hsn: "5607", name: "Jute Twine & Rope", category: "Agriculture & Farming", rate: 5, desc: "Jute/hemp twine, rope, cordage" },
    { hsn: "6802B", name: "Stone Handicrafts / Idols", category: "Luxury & Lifestyle", rate: 12, desc: "Hand-carved stone idols, sculptures" },
    { hsn: "6913", name: "Ceramic Handicrafts / Pottery", category: "Luxury & Lifestyle", rate: 12, desc: "Ornamental ceramics, pottery, terra cotta" },
    { hsn: "4420", name: "Wood Handicrafts / Carvings", category: "Luxury & Lifestyle", rate: 12, desc: "Wooden statues, carvings, inlaid wood" },
    { hsn: "7117A", name: "Artificial Flowers / Decorations", category: "Luxury & Lifestyle", rate: 12, desc: "Artificial flowers, foliage, decorative items" },

    // ═══════════════════════════════════════════════════════════
    // GARDEN, OUTDOOR & CAMPING
    // ═══════════════════════════════════════════════════════════
    { hsn: "8433A", name: "Lawn Mower", category: "Agriculture & Farming", rate: 18, desc: "Lawn mowers — electric, petrol, robot" },
    { hsn: "8201A", name: "Garden Tools (Secateurs, Shears)", category: "Agriculture & Farming", rate: 18, desc: "Pruning shears, hedge shears, garden scissors" },
    { hsn: "3926B", name: "Garden Pots & Planters (Plastic)", category: "Agriculture & Farming", rate: 18, desc: "Plastic garden pots, planters, grow bags" },
    { hsn: "6306", name: "Tents & Tarpaulins", category: "Luxury & Lifestyle", rate: 18, desc: "Tents, tarpaulins, camping awnings" },
    { hsn: "6306A", name: "Sleeping Bags", category: "Luxury & Lifestyle", rate: 18, desc: "Sleeping bags for camping / travel" },
    { hsn: "9506F", name: "Camping Equipment (Stoves, Lanterns)", category: "Luxury & Lifestyle", rate: 18, desc: "Portable camping stoves, lanterns, compass" },

    // ═══════════════════════════════════════════════════════════
    // PACKAGING MATERIALS
    // ═══════════════════════════════════════════════════════════
    { hsn: "4819A", name: "Corrugated Boxes", category: "Stationery & Education", rate: 18, desc: "Corrugated paper/board boxes, cartons" },
    { hsn: "3923A", name: "Plastic Packaging (Pouches, Wraps)", category: "Construction & Materials", rate: 18, desc: "Plastic pouches, shrink wrap, bubble wrap" },
    { hsn: "4808", name: "Kraft Paper / Wrapping Paper", category: "Stationery & Education", rate: 12, desc: "Kraft paper, waxed paper, wrapping paper" },
    { hsn: "7612", name: "Aluminium Cans (Beverage)", category: "Construction & Materials", rate: 18, desc: "Aluminium collapsible tubes, beverage cans" },
    { hsn: "7010", name: "Glass Bottles / Jars (Packaging)", category: "Construction & Materials", rate: 18, desc: "Glass bottles, jars, vials for packaging" },
    { hsn: "3920", name: "Plastic Films (BOPP, PE)", category: "Construction & Materials", rate: 18, desc: "BOPP, PE, lamination films, stretch film" },
    { hsn: "4823", name: "Paper Plates & Cups (Disposable)", category: "Stationery & Education", rate: 18, desc: "Disposable paper/cardboard plates, cups, trays" },
    { hsn: "3924D", name: "Disposable Plastic Cups / Plates", category: "Construction & Materials", rate: 18, desc: "Plastic disposable cups, plates, cutlery" },

    // ═══════════════════════════════════════════════════════════
    // RENEWABLE ENERGY (Additional)
    // ═══════════════════════════════════════════════════════════
    { hsn: "8419A", name: "Solar Water Heater", category: "Electronics & Appliances", rate: 5, desc: "Solar water heating systems" },
    { hsn: "7611", name: "Biogas Plant Equipment", category: "Agriculture & Farming", rate: 12, desc: "Biogas plant components, tanks, pipes" },
    { hsn: "8541B", name: "Solar Battery Charger", category: "Electronics & Appliances", rate: 5, desc: "Solar-powered battery chargers" },

    // ═══════════════════════════════════════════════════════════
    // TRAVEL ACCESSORIES & LUGGAGE
    // ═══════════════════════════════════════════════════════════
    { hsn: "4202F", name: "Suitcases / Trolley Bags", category: "Textiles & Apparel", rate: 18, desc: "Trolley bags, suitcases, cabin luggage" },
    { hsn: "4202G", name: "Duffel Bags / Travel Bags", category: "Textiles & Apparel", rate: 18, desc: "Duffel bags, gym bags, travel bags" },
    { hsn: "4202H", name: "Laptop Bags / Sleeves", category: "Textiles & Apparel", rate: 18, desc: "Laptop bags, protective sleeves, tablet cases" },
    { hsn: "6601", name: "Umbrellas — Standard", category: "Textiles & Apparel", rate: 12, desc: "Umbrellas, sun umbrellas, walking sticks" },
    { hsn: "9004A", name: "Sunglasses", category: "Luxury & Lifestyle", rate: 18, desc: "Sunglasses — all types" },
    { hsn: "9003", name: "Spectacle Frames", category: "Luxury & Lifestyle", rate: 18, desc: "Frames for spectacles, goggles" },
    { hsn: "9001", name: "Optical Lenses (Spectacles)", category: "Healthcare & Pharma", rate: 12, desc: "Spectacle lenses, contact lenses" },

    // ═══════════════════════════════════════════════════════════
    // ARMS, AMMUNITION & HUNTING
    // ═══════════════════════════════════════════════════════════
    { hsn: "9302", name: "Revolvers & Pistols", category: "Luxury & Lifestyle", rate: 28, desc: "Revolvers, pistols (licensed firearms)" },
    { hsn: "9303", name: "Sporting Guns / Rifles", category: "Luxury & Lifestyle", rate: 28, desc: "Sporting and hunting rifles, shotguns" },
    { hsn: "9304", name: "Air Guns & Air Pistols", category: "Luxury & Lifestyle", rate: 28, desc: "Spring, air, gas-powered guns for sport" },
    { hsn: "9306", name: "Ammunition & Cartridges", category: "Luxury & Lifestyle", rate: 28, desc: "Cartridges, shells, bullets for firearms" },

    // ═══════════════════════════════════════════════════════════
    // ADDITIONAL SERVICE ITEMS
    // ═══════════════════════════════════════════════════════════
    { hsn: "9954A", name: "Interior Decorator Works", category: "Services", rate: 18, desc: "Interior decoration, turnkey interior projects" },
    { hsn: "9983C", name: "Digital Marketing / Advertising", category: "Services", rate: 18, desc: "Online advertising, SEO, social media marketing" },
    { hsn: "9983D", name: "Translation / Interpretation Services", category: "Services", rate: 18, desc: "Language translation, interpretation" },
    { hsn: "9987", name: "Maintenance & Repair (AMC)", category: "Services", rate: 18, desc: "Annual maintenance contracts, repair services" },
    { hsn: "9987A", name: "Home Cleaning / Pest Control", category: "Services", rate: 18, desc: "Professional cleaning, pest control services" },
    { hsn: "9985B", name: "Beauty Training / Salon Academy", category: "Services", rate: 18, desc: "Beauty training academies, salon courses" },
    { hsn: "9986", name: "Renting of Vehicles (With Operator)", category: "Services", rate: 12, desc: "Renting of motor vehicles with operator — bus, taxi fleet" },
    { hsn: "9994", name: "Sewage & Waste Management", category: "Services", rate: 18, desc: "Sewage treatment, solid waste management, recycling" },
    { hsn: "9961A", name: "Money Exchange / Forex", category: "Services", rate: 18, desc: "Foreign exchange services, money transfer" },
    { hsn: "9971E", name: "Payment Gateway / Fintech", category: "Services", rate: 18, desc: "Payment gateway charges, UPI/wallet services" },
    { hsn: "9996D", name: "Mandap / Convention Hall Rent", category: "Services", rate: 18, desc: "Convention halls, marriage halls, pandal rental" },
    { hsn: "9972C", name: "Co-Working Space", category: "Services", rate: 18, desc: "Co-working office space rental" },

    // ═══════════════════════════════════════════════════════════
    // ADDITIONAL ELECTRONICS
    // ═══════════════════════════════════════════════════════════
    { hsn: "8443B", name: "3D Printers", category: "Electronics & Appliances", rate: 18, desc: "3D printers for prototyping" },
    { hsn: "8471G", name: "Gaming Laptops / PCs", category: "Electronics & Appliances", rate: 18, desc: "High-performance gaming computers" },
    { hsn: "8471H", name: "NAS / Server Equipment", category: "Electronics & Appliances", rate: 18, desc: "Network attached storage, small servers" },
    { hsn: "8525B", name: "DSLR / Mirrorless Camera", category: "Electronics & Appliances", rate: 18, desc: "DSLR cameras, mirrorless cameras, lenses" },
    { hsn: "8525C", name: "Camera Lenses & Accessories", category: "Electronics & Appliances", rate: 18, desc: "Camera lenses, tripods, gimbals, filters" },
    { hsn: "8517F", name: "Walkie-Talkies / Two-Way Radio", category: "Electronics & Appliances", rate: 18, desc: "Two-way radios, walkie-talkies" },
    { hsn: "8526", name: "GPS Devices / Navigation", category: "Electronics & Appliances", rate: 18, desc: "GPS navigation devices, receivers" },

    // ═══════════════════════════════════════════════════════════
    // ADDITIONAL FOOD/BEVERAGE SPECIFICS
    // ═══════════════════════════════════════════════════════════
    { hsn: "0901A", name: "Roasted Coffee Beans", category: "Food & Essentials", rate: 5, desc: "Coffee beans, roasted (not instant)" },
    { hsn: "1704B", name: "Mithai / Indian Sweets", category: "Food & Essentials", rate: 5, desc: "Indian sweets — laddu, barfi, rasgulla, gulab jamun" },
    { hsn: "1905G", name: "Papad (Packaged)", category: "Food & Essentials", rate: 0, desc: "Papad / appalam — all varieties" },
    { hsn: "2304A", name: "De-oiled Rice Bran", category: "Agriculture & Farming", rate: 5, desc: "De-oiled rice bran for cattle feed" },
    { hsn: "2106D", name: "Ready-to-Cook Meal Kits", category: "Food & Essentials", rate: 18, desc: "Pre-packaged meal kits, curry paste, masala mixes" },
    { hsn: "2106E", name: "Idli/Dosa Batter (Packaged)", category: "Food & Essentials", rate: 5, desc: "Pre-packed idli/dosa batter, chapati dough" },
    { hsn: "2203", name: "Beer", category: "Food & Essentials", rate: 0, desc: "Beer — currently outside GST (state excise)" },
    { hsn: "2208", name: "Spirits / Liquor", category: "Food & Essentials", rate: 0, desc: "Whisky, vodka, rum, gin — outside GST (state excise)" },
    { hsn: "2106F", name: "Supari / Betel Nut (Processed)", category: "Food & Essentials", rate: 18, desc: "Processed areca/betel nut preparations" },
    { hsn: "2401", name: "Unmanufactured Tobacco", category: "Food & Essentials", rate: 28, desc: "Unmanufactured tobacco, tobacco refuse" },
    { hsn: "2404", name: "E-Cigarette / Vape Liquid", category: "Food & Essentials", rate: 28, desc: "Electronic nicotine delivery — banned in India" },

    // ═══════════════════════════════════════════════════════════
    // ADDITIONAL HEALTHCARE
    // ═══════════════════════════════════════════════════════════
    { hsn: "3003B", name: "Vitamin & Mineral Supplements", category: "Healthcare & Pharma", rate: 18, desc: "Vitamin tablets, mineral supplements, multivitamins" },
    { hsn: "3307B", name: "Mosquito Repellents", category: "Healthcare & Pharma", rate: 18, desc: "Mosquito coils, repellent sprays, liquid vaporizers" },
    { hsn: "9018F", name: "Wheelchair (Motorized)", category: "Healthcare & Pharma", rate: 0, desc: "Motorized wheelchairs, mobility scooters" },
    { hsn: "9018G", name: "Pregnancy Test Kits", category: "Healthcare & Pharma", rate: 12, desc: "Home pregnancy test kits, ovulation kits" },
    { hsn: "3004M", name: "Nasal Drops / Sprays", category: "Healthcare & Pharma", rate: 12, desc: "Nasal decongestant sprays, saline drops" },
    { hsn: "3004N", name: "Dermatology Creams (Rx)", category: "Healthcare & Pharma", rate: 12, desc: "Prescription skin creams, antifungal, steroid" },
    { hsn: "9402", name: "Hospital Furniture (Beds, Tables)", category: "Healthcare & Pharma", rate: 18, desc: "Hospital beds, operating tables, examination couches" },
];
