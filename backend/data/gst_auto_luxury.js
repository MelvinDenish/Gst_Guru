// Automobiles & Parts, Luxury & Lifestyle GST Items
module.exports = [
    // ═══════════════════════════════════════════════════════════
    // AUTOMOBILES & PARTS
    // ═══════════════════════════════════════════════════════════
    // Motor Cars — 28% + Cess (varies by engine, fuel, length)
    {
        hsn: "8703A", name: "Small Car — Petrol ≤1200cc, ≤4m", category: "Automobiles & Parts", rate: 28, cess: 1, desc: "Petrol car ≤1200cc & length ≤4m (e.g. Alto, WagonR, i10)", applicability: {
            type: "automobile", variants: [
                { label: "Petrol ≤1200cc, Length ≤4m", cess: 1 },
            ]
        }
    },
    {
        hsn: "8703B", name: "Small Car — Diesel ≤1500cc, ≤4m", category: "Automobiles & Parts", rate: 28, cess: 3, desc: "Diesel car ≤1500cc & length ≤4m (e.g. Swift Dzire Diesel)", applicability: {
            type: "automobile", variants: [
                { label: "Diesel ≤1500cc, Length ≤4m", cess: 3 },
            ]
        }
    },
    {
        hsn: "8703C", name: "Mid-Size Car — Petrol 1200-1500cc", category: "Automobiles & Parts", rate: 28, cess: 3, desc: "Petrol car 1200–1500cc (e.g. City, Verna, Ciaz)", applicability: {
            type: "automobile", variants: [
                { label: "Petrol 1200–1500cc", cess: 3 },
            ]
        }
    },
    {
        hsn: "8703D", name: "Large Car — Petrol >1500cc", category: "Automobiles & Parts", rate: 28, cess: 15, desc: "Petrol car >1500cc (e.g. Camry, Accord)", applicability: {
            type: "automobile", variants: [
                { label: "Petrol >1500cc", cess: 15 },
            ]
        }
    },
    {
        hsn: "8703E", name: "Large Car — Diesel >1500cc", category: "Automobiles & Parts", rate: 28, cess: 15, desc: "Diesel car >1500cc (e.g. Fortuner, Endeavour)", applicability: {
            type: "automobile", variants: [
                { label: "Diesel >1500cc", cess: 15 },
            ]
        }
    },
    {
        hsn: "8703F", name: "SUV — Petrol >1500cc, >4m, GC>170mm", category: "Automobiles & Parts", rate: 28, cess: 22, desc: "SUV petrol >1500cc, length >4m, GC >170mm (e.g. Fortuner, Hector)", applicability: {
            type: "automobile", variants: [
                { label: "SUV: Petrol >1500cc, >4m, GC>170mm", cess: 22 },
            ]
        }
    },
    {
        hsn: "8703G", name: "SUV — Diesel >1500cc, >4m, GC>170mm", category: "Automobiles & Parts", rate: 28, cess: 22, desc: "SUV diesel >1500cc, length >4m, GC >170mm (e.g. Safari, Scorpio-N)", applicability: {
            type: "automobile", variants: [
                { label: "SUV: Diesel >1500cc, >4m, GC>170mm", cess: 22 },
            ]
        }
    },
    {
        hsn: "8703H", name: "Luxury Car (>₹40L ex-showroom)", category: "Automobiles & Parts", rate: 28, cess: 22, desc: "Luxury segment cars (e.g. BMW 3-Series, Audi A4, Mercedes C-Class)", applicability: {
            type: "automobile", variants: [
                { label: "Luxury Car >₹40 Lakh", cess: 22 },
            ]
        }
    },
    {
        hsn: "8703I", name: "Sports / Super Car", category: "Automobiles & Parts", rate: 28, cess: 22, desc: "High-performance sports cars (e.g. Porsche, Ferrari, Lamborghini)", applicability: {
            type: "automobile", variants: [
                { label: "Sports/Super Car", cess: 22 },
            ]
        }
    },
    {
        hsn: "8703J", name: "Hybrid Car — Petrol/CNG", category: "Automobiles & Parts", rate: 28, cess: 15, desc: "Mild/strong hybrid petrol cars (e.g. Grand Vitara Hybrid)", applicability: {
            type: "automobile", variants: [
                { label: "Hybrid (Petrol + Electric) ≤1500cc", cess: 3 },
                { label: "Hybrid (Petrol + Electric) >1500cc", cess: 15 },
            ]
        }
    },
    {
        hsn: "8703K", name: "CNG / LPG Car (Factory-fitted)", category: "Automobiles & Parts", rate: 28, cess: 1, desc: "Factory-fitted CNG/LPG cars ≤1200cc & ≤4m", applicability: {
            type: "automobile", variants: [
                { label: "CNG/LPG ≤1200cc, ≤4m", cess: 1 },
                { label: "CNG/LPG 1200-1500cc", cess: 3 },
                { label: "CNG/LPG >1500cc", cess: 15 },
            ]
        }
    },
    // Electric Vehicles — 5%
    { hsn: "8703EV", name: "Electric Car (BEV)", category: "Automobiles & Parts", rate: 5, desc: "Battery electric cars (e.g. Tata Nexon EV, MG ZS EV, Hyundai Ioniq 5)" },
    { hsn: "8711EV", name: "Electric Scooter / Bike", category: "Automobiles & Parts", rate: 5, desc: "Electric two-wheelers (e.g. Ola S1, Ather 450X, Revolt RV400)" },
    { hsn: "8703EV3", name: "Electric Three-Wheeler (Passenger)", category: "Automobiles & Parts", rate: 5, desc: "Electric auto-rickshaws, e-rickshaws" },
    { hsn: "8504EV", name: "EV Charger / Charging Station", category: "Automobiles & Parts", rate: 5, desc: "Electric vehicle charging infrastructure" },
    { hsn: "8507EV", name: "EV Battery Pack (Li-ion)", category: "Automobiles & Parts", rate: 18, desc: "Lithium-ion battery packs for EVs" },
    // Motorcycles — 28% + Cess
    { hsn: "8711A", name: "Motorcycle ≤75cc", category: "Automobiles & Parts", rate: 18, desc: "Moped / motorcycle ≤75cc engine" },
    {
        hsn: "8711B", name: "Motorcycle 75–250cc", category: "Automobiles & Parts", rate: 28, cess: 3, desc: "Motorcycle 75–250cc (e.g. Splendor, Pulsar 150, Apache)", applicability: {
            type: "automobile", variants: [
                { label: "75–250cc", cess: 3 },
            ]
        }
    },
    {
        hsn: "8711C", name: "Motorcycle 250–350cc", category: "Automobiles & Parts", rate: 28, cess: 3, desc: "Motorcycle 250–350cc (e.g. Classic 350, Himalayan, Duke 250)", applicability: {
            type: "automobile", variants: [
                { label: "250–350cc", cess: 3 },
            ]
        }
    },
    {
        hsn: "8711D", name: "Motorcycle >350cc", category: "Automobiles & Parts", rate: 28, cess: 15, desc: "Super bike / motorcycle >350cc (e.g. Interceptor 650, Hayabusa, Ninja)", applicability: {
            type: "automobile", variants: [
                { label: ">350cc", cess: 15 },
            ]
        }
    },
    {
        hsn: "8711E", name: "Scooter (Petrol, All cc)", category: "Automobiles & Parts", rate: 28, cess: 3, desc: "Petrol scooters (e.g. Activa, Jupiter, Access)", applicability: {
            type: "automobile", variants: [
                { label: "Scooter ≤350cc", cess: 3 },
            ]
        }
    },
    // Commercial Vehicles
    { hsn: "8702", name: "Buses & Coaches (>10 seats)", category: "Automobiles & Parts", rate: 28, desc: "Motor vehicles for ≥10 persons transport" },
    { hsn: "8702A", name: "Electric Bus", category: "Automobiles & Parts", rate: 12, desc: "Electric bus for public transport" },
    { hsn: "8704A", name: "Trucks — Small (GVW ≤5 ton)", category: "Automobiles & Parts", rate: 28, desc: "Pickup trucks, LCVs ≤5 ton GVW" },
    { hsn: "8704B", name: "Trucks — Medium (5-12 ton GVW)", category: "Automobiles & Parts", rate: 28, desc: "Medium commercial vehicles" },
    { hsn: "8704C", name: "Trucks — Heavy (>12 ton GVW)", category: "Automobiles & Parts", rate: 28, desc: "Heavy commercial vehicles, tractor-trailers" },
    { hsn: "8704D", name: "Three-Wheeler (Goods)", category: "Automobiles & Parts", rate: 28, desc: "Three-wheeled goods carrier (e.g. Ape, Piaggio)" },
    { hsn: "8704E", name: "Electric Goods Carrier", category: "Automobiles & Parts", rate: 5, desc: "Electric cargo vehicles" },
    { hsn: "8705", name: "Special Purpose Vehicles", category: "Automobiles & Parts", rate: 28, desc: "Crane lorries, fire engines, ambulances (non-exempt)" },
    { hsn: "8705A", name: "Ambulance", category: "Automobiles & Parts", rate: 28, cess: 0, desc: "Ambulance for medical emergencies (cess exempt)" },
    // Non-motorized
    { hsn: "8712", name: "Bicycles (Standard)", category: "Automobiles & Parts", rate: 12, desc: "Bicycles, cycles (standard)" },
    { hsn: "8712A", name: "Bicycles (Premium/Racing)", category: "Automobiles & Parts", rate: 12, desc: "Racing, mountain, premium bicycles" },
    { hsn: "8713", name: "Wheelchairs / Invalid Carriages", category: "Automobiles & Parts", rate: 0, desc: "Carriages for disabled persons" },
    // Spare Parts — 28%
    { hsn: "8708A", name: "Brake Pads & Linings", category: "Automobiles & Parts", rate: 28, desc: "Brake pads, brake shoes, disc pads" },
    { hsn: "8708B", name: "Clutch Plates & Assembly", category: "Automobiles & Parts", rate: 28, desc: "Clutch plate, pressure plate, bearing" },
    { hsn: "8708C", name: "Suspension & Shock Absorbers", category: "Automobiles & Parts", rate: 28, desc: "Shock absorbers, struts, spring" },
    { hsn: "8708D", name: "Radiators & Cooling Parts", category: "Automobiles & Parts", rate: 28, desc: "Radiators, cooling fans, thermostats" },
    { hsn: "8708E", name: "Exhaust / Silencer / Catalytic Converter", category: "Automobiles & Parts", rate: 28, desc: "Exhaust pipes, silencers, catalytic converters" },
    { hsn: "8708F", name: "Steering & Wheel Parts", category: "Automobiles & Parts", rate: 28, desc: "Steering wheels, columns, power steering parts" },
    { hsn: "8708G", name: "Gear Box & Transmission Parts", category: "Automobiles & Parts", rate: 28, desc: "Gear assemblies, drive shafts, axles" },
    { hsn: "8708H", name: "Body Panels & Bumpers", category: "Automobiles & Parts", rate: 28, desc: "Bumpers, fenders, doors, bonnets" },
    { hsn: "8708I", name: "Side Mirrors & Rear-View", category: "Automobiles & Parts", rate: 28, desc: "Rear-view mirrors, wing mirrors, mirror glass" },
    { hsn: "8708J", name: "Wipers & Wiper Blades", category: "Automobiles & Parts", rate: 28, desc: "Windshield wipers, wiper motors" },
    { hsn: "8511", name: "Spark Plugs & Ignition", category: "Automobiles & Parts", rate: 28, desc: "Spark plugs, ignition coils, distributors" },
    { hsn: "8421A", name: "Oil / Air / Fuel Filters", category: "Automobiles & Parts", rate: 28, desc: "Oil filters, air filters, fuel filters" },
    { hsn: "4011", name: "Tyres — Car / SUV (New)", category: "Automobiles & Parts", rate: 28, desc: "New pneumatic tyres for motor cars" },
    { hsn: "4011A", name: "Tyres — Two-Wheeler (New)", category: "Automobiles & Parts", rate: 28, desc: "New pneumatic tyres for motorcycles/scooters" },
    { hsn: "4011B", name: "Tyres — Heavy Vehicle (New)", category: "Automobiles & Parts", rate: 28, desc: "New pneumatic tyres for trucks, buses" },
    { hsn: "4012", name: "Retreaded / Used Tyres", category: "Automobiles & Parts", rate: 18, desc: "Retreaded or used pneumatic tyres" },
    { hsn: "4013", name: "Inner Tubes (All)", category: "Automobiles & Parts", rate: 28, desc: "Inner tubes of rubber" },
    { hsn: "8714", name: "Bicycle Parts & Accessories", category: "Automobiles & Parts", rate: 12, desc: "Frames, wheels, pedals, spokes, chains" },
    { hsn: "8714A", name: "Helmets (Safety/Bike)", category: "Automobiles & Parts", rate: 18, desc: "Safety helmets for two-wheeler riding" },
    { hsn: "2710", name: "Petrol / Motor Spirit", category: "Automobiles & Parts", rate: 0, desc: "Petrol — currently outside GST (state VAT + excise)" },
    { hsn: "2710A", name: "Diesel / HSD", category: "Automobiles & Parts", rate: 0, desc: "Diesel — currently outside GST (state VAT + excise)" },
    { hsn: "2711", name: "CNG / LPG (Auto fuel)", category: "Automobiles & Parts", rate: 5, desc: "CNG / LPG used as auto fuel" },
    { hsn: "2710B", name: "Engine Oil / Lubricants", category: "Automobiles & Parts", rate: 18, desc: "Motor oil, gear oil, transmission fluid, lubricants" },

    // ═══════════════════════════════════════════════════════════
    // LUXURY & LIFESTYLE
    // ═══════════════════════════════════════════════════════════
    // Jewellery — 3%
    { hsn: "7101", name: "Natural Pearls", category: "Luxury & Lifestyle", rate: 3, desc: "Natural/cultured pearls" },
    { hsn: "7102", name: "Diamonds (Rough/Uncut)", category: "Luxury & Lifestyle", rate: 0.25, desc: "Rough diamonds, industrial diamonds" },
    { hsn: "7102A", name: "Diamonds (Cut & Polished)", category: "Luxury & Lifestyle", rate: 1.5, desc: "Cut and polished diamonds" },
    { hsn: "7103", name: "Precious Stones (Ruby, Sapphire)", category: "Luxury & Lifestyle", rate: 0.25, desc: "Rubies, sapphires, emeralds — unset" },
    { hsn: "7106", name: "Silver Bullion / Bars", category: "Luxury & Lifestyle", rate: 3, desc: "Silver in unwrought form, bars" },
    { hsn: "7108", name: "Gold Bullion / Bars", category: "Luxury & Lifestyle", rate: 3, desc: "Gold in unwrought form, bars, coins" },
    { hsn: "7113", name: "Gold Jewellery (22K/18K)", category: "Luxury & Lifestyle", rate: 3, desc: "Gold jewellery — rings, chains, bangles, necklaces" },
    { hsn: "7113A", name: "Platinum Jewellery", category: "Luxury & Lifestyle", rate: 3, desc: "Platinum jewellery items" },
    { hsn: "7114", name: "Silver Jewellery & Articles", category: "Luxury & Lifestyle", rate: 3, desc: "Silverware, silver utensils, silver jewellery" },
    { hsn: "7117", name: "Imitation / Fashion Jewellery", category: "Luxury & Lifestyle", rate: 18, desc: "Artificial jewellery, costume jewellery" },
    // Watches
    { hsn: "9101", name: "Luxury Watches (Precious Metal)", category: "Luxury & Lifestyle", rate: 28, desc: "Watches with case of precious metal (Rolex, Omega)" },
    { hsn: "9102", name: "Standard Wrist Watches", category: "Luxury & Lifestyle", rate: 18, desc: "Wrist watches — standard brands (Titan, Casio, Fossil)" },
    { hsn: "9103", name: "Clocks — Wall / Table", category: "Luxury & Lifestyle", rate: 18, desc: "Wall clocks, alarm clocks, table clocks" },
    // Games & Entertainment
    { hsn: "9504", name: "Gaming Consoles (PS5, Xbox)", category: "Luxury & Lifestyle", rate: 28, desc: "Video game consoles, controllers" },
    { hsn: "9504A", name: "Gaming Accessories", category: "Luxury & Lifestyle", rate: 28, desc: "Gaming keyboards, mice, headsets" },
    { hsn: "9503", name: "Toys & Puzzles", category: "Luxury & Lifestyle", rate: 18, desc: "Dolls, toy cars, puzzles, board games" },
    { hsn: "9503A", name: "Remote Control Toys / Drones", category: "Luxury & Lifestyle", rate: 18, desc: "RC cars, drones (non-commercial), model kits" },
    // Sports
    { hsn: "9506", name: "Cricket Equipment", category: "Luxury & Lifestyle", rate: 18, desc: "Cricket bats, balls, pads, gloves, stumps" },
    { hsn: "9506A", name: "Football / Basketball / Volleyball", category: "Luxury & Lifestyle", rate: 18, desc: "Sports balls, goals, nets" },
    { hsn: "9506B", name: "Badminton / Tennis Equipment", category: "Luxury & Lifestyle", rate: 18, desc: "Rackets, shuttlecocks, tennis balls" },
    { hsn: "9506C", name: "Gym & Fitness Equipment", category: "Luxury & Lifestyle", rate: 28, desc: "Treadmills, exercise bikes, dumbbells, benches" },
    { hsn: "9506D", name: "Swimming & Water Sports", category: "Luxury & Lifestyle", rate: 18, desc: "Swimming goggles, fins, surfboards" },
    { hsn: "9506E", name: "Yoga Mats & Accessories", category: "Luxury & Lifestyle", rate: 18, desc: "Yoga mats, resistance bands, foam rollers" },
    // Home & Furniture
    { hsn: "9401", name: "Seats & Chairs (Office/Home)", category: "Luxury & Lifestyle", rate: 18, desc: "Office chairs, sofas, recliners, dining chairs" },
    { hsn: "9403", name: "Furniture (Wood/Metal)", category: "Luxury & Lifestyle", rate: 18, desc: "Beds, wardrobes, tables, shelves, desks" },
    { hsn: "9403A", name: "Modular Kitchen / Furniture", category: "Luxury & Lifestyle", rate: 18, desc: "Modular kitchen, wardrobes, custom furniture" },
    { hsn: "9404", name: "Mattresses (Foam/Spring)", category: "Luxury & Lifestyle", rate: 18, desc: "Mattresses — foam, spring, orthopaedic" },
    { hsn: "9404A", name: "Pillows & Cushions", category: "Luxury & Lifestyle", rate: 18, desc: "Pillows, bolsters, pouffes" },
    { hsn: "5703", name: "Carpets & Rugs", category: "Luxury & Lifestyle", rate: 12, desc: "Carpets, floor rugs, tufted" },
    // Musical & Art
    { hsn: "9201", name: "Pianos & Keyboards", category: "Luxury & Lifestyle", rate: 18, desc: "Pianos, digital keyboards" },
    { hsn: "9202", name: "String Instruments (Guitar, Sitar)", category: "Luxury & Lifestyle", rate: 18, desc: "Guitars, sitars, violins, veenas" },
    { hsn: "9206", name: "Drums & Percussion", category: "Luxury & Lifestyle", rate: 18, desc: "Drums, tabla, cymbals" },
    { hsn: "9208", name: "Harmoniums & Flutes", category: "Luxury & Lifestyle", rate: 18, desc: "Harmoniums, flutes, shehnai" },
    // Luxury Items — 28%
    { hsn: "3303", name: "Luxury Perfumes / Fragrances", category: "Luxury & Lifestyle", rate: 28, desc: "High-end perfumes, eau de parfum" },
    { hsn: "7018", name: "Crystal Glassware", category: "Luxury & Lifestyle", rate: 28, desc: "Glass beads, crystal articles" },
    { hsn: "9614", name: "Smoking Pipes (Luxury)", category: "Luxury & Lifestyle", rate: 28, desc: "Smoking pipes of wood, meerschaum" },
    { hsn: "8903", name: "Yachts & Boats (Pleasure)", category: "Luxury & Lifestyle", rate: 28, desc: "Yachts, pleasure boats", applicability: { type: "luxury_cess", cess_rate: 3, note: "3% compensation cess on yachts" } },
    { hsn: "8802", name: "Private Aircraft / Helicopter", category: "Luxury & Lifestyle", rate: 28, desc: "Private aircraft, helicopters (non-commercial)" },
];
