// Services, Construction & Materials, Stationery & Education GST Items
module.exports = [
    // ═══════════════════════════════════════════════════════════
    // SERVICES (SAC Codes)
    // ═══════════════════════════════════════════════════════════
    // Hotel Accommodation — Rate varies by tariff
    { hsn: "9963A", name: "Hotel Room — Budget (≤₹1000/night)", category: "Services", rate: 0, desc: "Hotel room tariff ≤₹1,000 per night — exempt" },
    { hsn: "9963B", name: "Hotel Room — Economy (₹1001-₹2500)", category: "Services", rate: 12, desc: "Hotel room tariff ₹1,001–₹2,500 per night" },
    { hsn: "9963C", name: "Hotel Room — Mid-Range (₹2501-₹7500)", category: "Services", rate: 12, desc: "Hotel room tariff ₹2,501–₹7,500 per night" },
    { hsn: "9963D", name: "Hotel Room — Premium (>₹7500)", category: "Services", rate: 18, desc: "Hotel room tariff >₹7,500 per night" },
    { hsn: "9963E", name: "Hotel Room — Luxury 5-Star", category: "Services", rate: 18, desc: "5-star luxury hotel accommodation" },
    // Restaurant Services
    { hsn: "9963F", name: "Restaurant — Non-AC / Small", category: "Services", rate: 5, desc: "Non-AC restaurant, café, dhaba — no ITC available" },
    { hsn: "9963G", name: "Restaurant — AC / Branded", category: "Services", rate: 5, desc: "AC restaurants, branded chains — no ITC (post-Nov 2017)" },
    { hsn: "9963H", name: "Restaurant — 5-Star Hotel (Indoor)", category: "Services", rate: 18, desc: "Restaurant service within 5-star rated hotel — ITC available" },
    { hsn: "9963I", name: "Outdoor Catering Service", category: "Services", rate: 18, desc: "Outdoor catering, banquet catering — ITC available" },
    { hsn: "9963J", name: "Cloud Kitchen / Food Delivery", category: "Services", rate: 5, desc: "Cloud kitchen meals via Swiggy/Zomato — no ITC" },
    { hsn: "9963K", name: "Canteen Services (Corporate)", category: "Services", rate: 5, desc: "Corporate/factory canteen services — no ITC" },
    // Transport Services
    { hsn: "9964A", name: "Local Bus (Non-AC)", category: "Services", rate: 0, desc: "Non-AC public transport — bus, auto, metro" },
    { hsn: "9964B", name: "Inter-City Bus (AC)", category: "Services", rate: 5, desc: "AC bus, Volvo inter-city transport" },
    { hsn: "9964C", name: "Railway — Sleeper / General", category: "Services", rate: 0, desc: "Rail transport — sleeper, general class" },
    { hsn: "9964D", name: "Railway — AC Classes", category: "Services", rate: 5, desc: "Rail transport — AC 1st/2nd/3rd/Chair Car" },
    { hsn: "9964E", name: "Metro / Monorail", category: "Services", rate: 0, desc: "Metro rail, monorail services" },
    { hsn: "9964F", name: "Air Travel — Economy Domestic", category: "Services", rate: 5, desc: "Economy class air travel within India" },
    { hsn: "9964G", name: "Air Travel — Business Class", category: "Services", rate: 12, desc: "Business/first class air travel" },
    { hsn: "9964H", name: "Air Travel — International", category: "Services", rate: 0, desc: "International air travel (zero-rated export)" },
    { hsn: "9966", name: "Cab / Ride-Sharing (Ola/Uber)", category: "Services", rate: 5, desc: "Cab aggregator services — no ITC" },
    { hsn: "9966A", name: "Rental Cars (Self-Drive)", category: "Services", rate: 18, desc: "Self-drive car rental services" },
    { hsn: "9965", name: "Goods Transport (GTA)", category: "Services", rate: 5, desc: "Goods transport agency services", is_rcm: true },
    { hsn: "9965A", name: "Courier & Postal Services", category: "Services", rate: 18, desc: "Courier, parcel, speed post services" },
    { hsn: "9965B", name: "Warehouse / Cold Storage", category: "Services", rate: 18, desc: "Warehousing, cold storage services" },
    { hsn: "9968", name: "Goods Transport (Vessel/Rail)", category: "Services", rate: 5, desc: "Transport of goods by vessel or rail" },
    // Financial & Insurance Services
    { hsn: "9971", name: "Banking Services (General)", category: "Services", rate: 18, desc: "Account charges, ATM charges, locker rent" },
    { hsn: "9971A", name: "Loan Processing Charges", category: "Services", rate: 18, desc: "Loan processing fees, foreclosure charges" },
    { hsn: "9971B", name: "Credit Card Charges", category: "Services", rate: 18, desc: "Credit card annual fees, late payment charges" },
    { hsn: "9971C", name: "Mutual Fund / AMC Fees", category: "Services", rate: 18, desc: "Fund management, advisory, AMC charges" },
    { hsn: "9971D", name: "Stock Brokerage", category: "Services", rate: 18, desc: "Stock broking, demat/trading charges" },
    { hsn: "9962", name: "Life Insurance Premium", category: "Services", rate: 18, desc: "Life insurance premium — GST on risk portion" },
    { hsn: "9962A", name: "Health Insurance Premium", category: "Services", rate: 18, desc: "Health/mediclaim insurance premium" },
    { hsn: "9962B", name: "Motor Insurance Premium", category: "Services", rate: 18, desc: "Vehicle third-party & comprehensive insurance" },
    { hsn: "9962C", name: "Fire / Property Insurance", category: "Services", rate: 18, desc: "Fire, property, marine insurance" },
    // Telecom & IT
    { hsn: "9984B", name: "Mobile Recharge / Postpaid", category: "Services", rate: 18, desc: "Prepaid/postpaid mobile telecom services" },
    { hsn: "9984C", name: "Broadband / Internet", category: "Services", rate: 18, desc: "Internet, broadband, fibre, wi-fi services" },
    { hsn: "9981", name: "IT / Software Services", category: "Services", rate: 18, desc: "Custom software development, IT consulting" },
    { hsn: "9981A", name: "SaaS / Cloud Services", category: "Services", rate: 18, desc: "SaaS subscriptions, cloud hosting, AWS/Azure" },
    { hsn: "9981B", name: "OTT / Streaming Subscriptions", category: "Services", rate: 18, desc: "Netflix, Hotstar, Spotify subscriptions" },
    // Professional Services (many under RCM)
    { hsn: "9982", name: "Legal / Advocate Services", category: "Services", rate: 18, desc: "Legal services by advocate/law firm", is_rcm: true },
    { hsn: "9982A", name: "CA / Audit Services", category: "Services", rate: 18, desc: "Chartered accountant, auditing services" },
    { hsn: "9983", name: "Management Consulting", category: "Services", rate: 18, desc: "Management, HR, marketing consulting" },
    { hsn: "9983A", name: "Architect / Interior Design", category: "Services", rate: 18, desc: "Architectural, interior design services" },
    { hsn: "9983B", name: "Recruitment / Staffing", category: "Services", rate: 18, desc: "Manpower recruitment, staffing agency" },
    // Real Estate
    { hsn: "9972", name: "Affordable Housing (≤₹45L)", category: "Services", rate: 1, desc: "Affordable housing ≤₹45L, carpet ≤60sqm metro / ≤90sqm non-metro — no ITC" },
    { hsn: "9972A", name: "Premium Housing (>₹45L)", category: "Services", rate: 5, desc: "Under-construction premium housing >₹45L — no ITC" },
    { hsn: "9972B", name: "Commercial Construction", category: "Services", rate: 12, desc: "Commercial building construction" },
    { hsn: "9973", name: "Renting — Commercial Property", category: "Services", rate: 18, desc: "Commercial rent — shops, offices, godowns" },
    { hsn: "9973A", name: "Renting — Residential (to business)", category: "Services", rate: 18, desc: "Residential rent to registered person — RCM", is_rcm: true },
    { hsn: "9973B", name: "Renting — Residential (to individual)", category: "Services", rate: 0, desc: "Residential rent to individual for dwelling — exempt" },
    // Education & Healthcare Services
    { hsn: "9992", name: "School / College Education", category: "Services", rate: 0, desc: "Education by recognized school/college — exempt" },
    { hsn: "9992A", name: "Coaching / Tutoring", category: "Services", rate: 18, desc: "Private coaching, tuition classes" },
    { hsn: "9992B", name: "Online Education Platforms", category: "Services", rate: 18, desc: "Online courses — Byju's, Unacademy, Udemy" },
    { hsn: "9993", name: "Hospital / Clinical Services", category: "Services", rate: 0, desc: "Healthcare by hospital, clinic, doctor — exempt" },
    { hsn: "9993A", name: "Diagnostic Lab Services", category: "Services", rate: 0, desc: "Pathology, radiology by clinical labs — exempt" },
    { hsn: "9993B", name: "Cosmetic / Elective Surgery", category: "Services", rate: 18, desc: "Cosmetic surgery, laser treatments, hair transplant" },
    { hsn: "9993C", name: "Veterinary Services", category: "Services", rate: 18, desc: "Veterinary hospital, animal treatment" },
    // Entertainment & Events
    { hsn: "9996", name: "Event Management", category: "Services", rate: 18, desc: "Event planning, wedding management" },
    { hsn: "9996A", name: "Photography / Videography", category: "Services", rate: 18, desc: "Professional photography, wedding shoots" },
    { hsn: "9996B", name: "DJ / Sound / Lighting Hire", category: "Services", rate: 18, desc: "Sound system, DJ, stage lighting rental" },
    { hsn: "9996C", name: "Decoration / Florist Services", category: "Services", rate: 18, desc: "Event decoration, flower arrangement" },
    { hsn: "9997", name: "Cinema Hall — Movie Tickets (≤₹100)", category: "Services", rate: 12, desc: "Movie tickets ≤₹100" },
    { hsn: "9997A", name: "Cinema Hall — Movie Tickets (>₹100)", category: "Services", rate: 18, desc: "Movie tickets >₹100" },
    { hsn: "9997B", name: "Amusement Park / Theme Park", category: "Services", rate: 18, desc: "Amusement park, water park entry" },
    { hsn: "9997C", name: "Online Gaming / Betting", category: "Services", rate: 28, desc: "Online gaming, fantasy sports, horse racing, betting" },
    { hsn: "9998", name: "Laundry & Dry Cleaning", category: "Services", rate: 18, desc: "Laundry, dry cleaning, ironing services" },
    { hsn: "9999", name: "Gym & Fitness Centre", category: "Services", rate: 18, desc: "Gym membership, fitness classes, yoga studio" },
    { hsn: "9999A", name: "Spa & Salon Services", category: "Services", rate: 18, desc: "Hair salon, spa, beauty parlour services" },
    { hsn: "9995", name: "Printing & Publishing", category: "Services", rate: 18, desc: "Commercial printing, publishing services" },
    { hsn: "9954", name: "Construction Contract (Works)", category: "Services", rate: 12, desc: "Composite works contract services" },
    // Government & Charitable
    { hsn: "9991", name: "Government Services (General)", category: "Services", rate: 0, desc: "Services by government — passport, visa, licence" },
    { hsn: "9991A", name: "Charitable / Religious Services", category: "Services", rate: 0, desc: "Services by charitable/religious trusts — exempt" },

    // ═══════════════════════════════════════════════════════════
    // CONSTRUCTION & MATERIALS
    // ═══════════════════════════════════════════════════════════
    // Cement & Concrete — 28%
    { hsn: "2523", name: "Portland Cement (OPC/PPC)", category: "Construction & Materials", rate: 28, desc: "Ordinary/pozzolana/slag Portland cement" },
    { hsn: "2523A", name: "White Cement", category: "Construction & Materials", rate: 28, desc: "White Portland cement" },
    { hsn: "6810", name: "Concrete Blocks / Pavers", category: "Construction & Materials", rate: 18, desc: "Concrete blocks, paving blocks, kerb stones" },
    { hsn: "6810A", name: "Ready-Mix Concrete (RMC)", category: "Construction & Materials", rate: 18, desc: "Ready-mix concrete" },
    // Bricks & Blocks
    { hsn: "6901", name: "Clay Bricks (Handmade)", category: "Construction & Materials", rate: 5, desc: "Building bricks of clay — handmade" },
    { hsn: "6901A", name: "Fly Ash Bricks", category: "Construction & Materials", rate: 5, desc: "Fly ash bricks, fly ash blocks" },
    { hsn: "6901B", name: "AAC Blocks", category: "Construction & Materials", rate: 12, desc: "Autoclaved aerated concrete (AAC) blocks" },
    { hsn: "6904", name: "Ceramic / Clay Pipes", category: "Construction & Materials", rate: 18, desc: "Ceramic building pipes, conduit" },
    // Stone & Tile
    { hsn: "2515", name: "Marble (Raw Blocks)", category: "Construction & Materials", rate: 12, desc: "Marble blocks, rough-cut slabs" },
    { hsn: "6802", name: "Marble (Polished Slabs)", category: "Construction & Materials", rate: 28, desc: "Polished marble slabs, tiles, countertops" },
    { hsn: "6802A", name: "Granite (Polished)", category: "Construction & Materials", rate: 28, desc: "Polished granite slabs, tiles" },
    { hsn: "6907", name: "Ceramic Floor Tiles", category: "Construction & Materials", rate: 18, desc: "Ceramic/porcelain floor tiles" },
    { hsn: "6907A", name: "Vitrified Tiles", category: "Construction & Materials", rate: 18, desc: "Vitrified tiles, glazed tiles" },
    { hsn: "6910", name: "Sanitary Ware (Ceramic)", category: "Construction & Materials", rate: 18, desc: "WC pans, wash basins, pedestals" },
    { hsn: "6910A", name: "Bathtubs & Shower Trays", category: "Construction & Materials", rate: 18, desc: "Bathtubs, shower trays of ceramic/acrylic" },
    { hsn: "2505", name: "Natural Sand", category: "Construction & Materials", rate: 5, desc: "Natural sands of all kinds" },
    { hsn: "2517", name: "Crushed Stone / Aggregates", category: "Construction & Materials", rate: 5, desc: "Crushed stone, gravel, macadam" },
    // Steel & Metals
    { hsn: "7213", name: "Steel Bars & Rods (Hot-Rolled)", category: "Construction & Materials", rate: 18, desc: "Hot-rolled bars — round, square" },
    { hsn: "7214", name: "TMT Steel Bars (Reinforcement)", category: "Construction & Materials", rate: 18, desc: "TMT bars for RCC construction" },
    { hsn: "7210", name: "Galvanized Steel Sheets", category: "Construction & Materials", rate: 18, desc: "Galvanized, coated flat-rolled steel" },
    { hsn: "7210A", name: "Colour-Coated / Roofing Sheets", category: "Construction & Materials", rate: 18, desc: "Colour-coated roofing sheets — GI, GL" },
    { hsn: "7306", name: "Steel Pipes & Tubes", category: "Construction & Materials", rate: 18, desc: "Welded / seamless steel tubes, pipes" },
    { hsn: "7308", name: "Structural Steel (Beams, Channels)", category: "Construction & Materials", rate: 18, desc: "Steel structures, I-beams, channels, angles" },
    { hsn: "7318", name: "Nuts, Bolts & Screws (Steel)", category: "Construction & Materials", rate: 18, desc: "Screws, bolts, nuts, washers of iron/steel" },
    { hsn: "7604", name: "Aluminium Bars / Profiles", category: "Construction & Materials", rate: 18, desc: "Aluminium profiles, window/door frames" },
    { hsn: "7608", name: "Aluminium Pipes & Tubes", category: "Construction & Materials", rate: 18, desc: "Aluminium tubes, pipes" },
    { hsn: "7407", name: "Copper Bars / Rods", category: "Construction & Materials", rate: 18, desc: "Copper bars, rods, profiles" },
    // Glass
    { hsn: "7005", name: "Float Glass (Plain)", category: "Construction & Materials", rate: 18, desc: "Float glass, polished non-wired" },
    { hsn: "7007", name: "Toughened / Laminated Safety Glass", category: "Construction & Materials", rate: 18, desc: "Safety glass — toughened, laminated" },
    { hsn: "7009", name: "Glass Mirrors", category: "Construction & Materials", rate: 18, desc: "Glass mirrors, framed or unframed" },
    // Wood & Boards
    { hsn: "4403", name: "Timber (Rough / Sawn)", category: "Construction & Materials", rate: 18, desc: "Wood in the rough, sawn timber, logs" },
    { hsn: "4407", name: "Finished Timber / Planks", category: "Construction & Materials", rate: 18, desc: "Wood sawn lengthwise, planed, sanded" },
    { hsn: "4410", name: "Particle Board / MDF", category: "Construction & Materials", rate: 18, desc: "Particle board, MDF, oriented strand board" },
    { hsn: "4411", name: "Hardboard / Fibreboard", category: "Construction & Materials", rate: 18, desc: "Fibreboard of wood" },
    { hsn: "4412", name: "Plywood (All Types)", category: "Construction & Materials", rate: 18, desc: "Plywood, laminated wood" },
    { hsn: "4418", name: "Doors, Windows & Frames (Wood)", category: "Construction & Materials", rate: 18, desc: "Wooden doors, windows, frames, shutters" },
    // Paints & Finishes
    { hsn: "3208", name: "Paints (Synthetic / Enamel)", category: "Construction & Materials", rate: 28, desc: "Paints, varnishes, enamels" },
    { hsn: "3209", name: "Water-Based / Distemper", category: "Construction & Materials", rate: 18, desc: "Water-based paints, acrylic emulsions, distemper" },
    { hsn: "3210", name: "Primer & Undercoats", category: "Construction & Materials", rate: 28, desc: "Primer, undercoats, base coats" },
    { hsn: "3214", name: "Wall Putty / Filler", category: "Construction & Materials", rate: 18, desc: "Wall putty, glaziers putty, surface filler" },
    // Plastic Pipes & Fittings
    { hsn: "3917", name: "PVC Pipes & Fittings", category: "Construction & Materials", rate: 18, desc: "Rigid PVC pipes, SWR pipes, fittings" },
    { hsn: "3917A", name: "CPVC / PPR Pipes (Hot Water)", category: "Construction & Materials", rate: 18, desc: "CPVC, PPR pipes for hot water plumbing" },
    { hsn: "3917B", name: "HDPE Pipes (Water Supply)", category: "Construction & Materials", rate: 18, desc: "HDPE pipes for water supply, drainage" },
    // Electrical
    { hsn: "8544", name: "Electrical Wires & Cables", category: "Construction & Materials", rate: 18, desc: "Insulated copper wires, cables, flexible" },
    { hsn: "8536", name: "Switches, Sockets & MCBs", category: "Construction & Materials", rate: 18, desc: "Electrical switches, sockets, MCBs, RCCBs" },
    { hsn: "8536A", name: "Distribution Boards / Panels", category: "Construction & Materials", rate: 18, desc: "Electrical distribution boards, panels" },
    { hsn: "8535", name: "Fuses & Circuit Breakers", category: "Construction & Materials", rate: 18, desc: "HRC fuses, circuit breakers >1000V" },
    // Plumbing & CP Fittings
    { hsn: "7324", name: "Stainless Steel Sinks", category: "Construction & Materials", rate: 18, desc: "SS sinks, stainless steel kitchen sinks" },
    { hsn: "8481", name: "Taps, Valves & Cocks", category: "Construction & Materials", rate: 18, desc: "Taps, stop cocks, ball valves, CP fittings" },
    { hsn: "8481A", name: "Shower / Bath Fittings (Premium)", category: "Construction & Materials", rate: 18, desc: "Rain showers, body jets, premium bath fittings" },
    // Waterproofing & Insulation
    { hsn: "6807", name: "Bitumen Waterproofing", category: "Construction & Materials", rate: 18, desc: "Bituminous articles — waterproofing rolls, membranes" },
    { hsn: "3921", name: "Thermal Insulation (EPS/XPS)", category: "Construction & Materials", rate: 18, desc: "Expanded polystyrene, insulation boards" },

    // ═══════════════════════════════════════════════════════════
    // STATIONERY & EDUCATION
    // ═══════════════════════════════════════════════════════════
    // 0% — Books & Newspapers
    { hsn: "4901", name: "Printed Books (All)", category: "Stationery & Education", rate: 0, desc: "Printed books, brochures, leaflets — all" },
    { hsn: "4902", name: "Newspapers & Journals", category: "Stationery & Education", rate: 0, desc: "Newspapers, journals, periodicals" },
    { hsn: "4903", name: "Children's Picture / Drawing Books", category: "Stationery & Education", rate: 0, desc: "Colouring books, drawing books for children" },
    { hsn: "4905", name: "Maps & Globes", category: "Stationery & Education", rate: 0, desc: "Maps, atlases, globes printed" },
    // 5%
    { hsn: "4901A", name: "E-Books (Digital)", category: "Stationery & Education", rate: 5, desc: "Electronic/digital books — Kindle editions" },
    // 12%
    { hsn: "4820", name: "Exercise Books / Notebooks", category: "Stationery & Education", rate: 12, desc: "Notebooks, registers, account books" },
    { hsn: "4820A", name: "Diaries & Planners", category: "Stationery & Education", rate: 12, desc: "Printed diaries, planners, organizers" },
    { hsn: "4802", name: "A4 Printer Paper / Copier Paper", category: "Stationery & Education", rate: 12, desc: "Uncoated paper for printing, photocopying" },
    { hsn: "4802A", name: "Chart Paper & Drawing Sheets", category: "Stationery & Education", rate: 12, desc: "Drawing sheets, chart paper, cartridge paper" },
    { hsn: "4811", name: "Carbon Paper / Tracing Paper", category: "Stationery & Education", rate: 12, desc: "Self-copying, carbon, tracing paper" },
    { hsn: "9609", name: "Pencils (Standard)", category: "Stationery & Education", rate: 12, desc: "Pencils, colour pencils, crayons, pastels" },
    { hsn: "4821", name: "Labels, Tags & Stickers", category: "Stationery & Education", rate: 12, desc: "Paper labels, price tags, adhesive stickers" },
    // 18%
    { hsn: "9608", name: "Ball Point Pens", category: "Stationery & Education", rate: 18, desc: "Ball point pens, felt-tip pens" },
    { hsn: "9608A", name: "Fountain Pens / Gel Pens", category: "Stationery & Education", rate: 18, desc: "Fountain pens, roller-ball, gel pens" },
    { hsn: "9608B", name: "Marker Pens & Highlighters", category: "Stationery & Education", rate: 18, desc: "Markers, highlighters, sketch pens" },
    { hsn: "9608C", name: "Pen Refills & Cartridges", category: "Stationery & Education", rate: 18, desc: "Pen refills, ink cartridges" },
    { hsn: "3215", name: "Printer Ink / Writing Ink", category: "Stationery & Education", rate: 18, desc: "Printing ink, writing ink, stamp pad ink" },
    { hsn: "3506", name: "Glue Sticks & Adhesives", category: "Stationery & Education", rate: 18, desc: "Adhesive tapes, glue sticks, office glue" },
    { hsn: "8304", name: "Stapler & Paper Clips", category: "Stationery & Education", rate: 18, desc: "Staplers, paper clips, binder clips, pins" },
    { hsn: "8304A", name: "Scissors & Paper Cutters", category: "Stationery & Education", rate: 18, desc: "Scissors, craft knives, paper trimmers" },
    { hsn: "4817", name: "Envelopes & Postcards", category: "Stationery & Education", rate: 18, desc: "Envelopes, letter cards, postcards" },
    { hsn: "9610", name: "Writing Boards (Slate/White)", category: "Stationery & Education", rate: 18, desc: "Writing slates, whiteboards, chalkboards" },
    { hsn: "4016", name: "Erasers (Rubber)", category: "Stationery & Education", rate: 18, desc: "Rubber erasers, correction products" },
    { hsn: "9017", name: "Geometry Box / Drawing Instruments", category: "Stationery & Education", rate: 18, desc: "Compass, protractor, set squares, rulers" },
    { hsn: "9017A", name: "Scientific Calculator", category: "Stationery & Education", rate: 18, desc: "Scientific, graphing calculators" },
    // Art Supplies
    { hsn: "3213", name: "Artist Colours & Paints", category: "Stationery & Education", rate: 18, desc: "Water colours, poster colours, acrylic paints for art" },
    { hsn: "5901", name: "Canvas (Artist)", category: "Stationery & Education", rate: 12, desc: "Primed canvas, painting canvas, art rolls" },
    { hsn: "9603", name: "Paint Brushes (Artist)", category: "Stationery & Education", rate: 18, desc: "Artist paint brushes" },
    // Education Aids
    { hsn: "8528C", name: "Interactive Smart Boards", category: "Stationery & Education", rate: 18, desc: "Interactive flat panels, smart boards for education" },
    { hsn: "9023", name: "Models & Teaching Aids", category: "Stationery & Education", rate: 18, desc: "Anatomical models, scientific models, teaching aids" },
    { hsn: "4202E", name: "School Bags & Backpacks", category: "Stationery & Education", rate: 18, desc: "School bags, student backpacks, satchels" },
    { hsn: "9021B", name: "Magnifying Glasses & Loupes", category: "Stationery & Education", rate: 18, desc: "Magnifying glasses, magnifiers for reading" },
    { hsn: "8472", name: "Photocopiers & Laminators", category: "Stationery & Education", rate: 18, desc: "Office photocopiers, laminating machines" },
    { hsn: "8472A", name: "Paper Shredders", category: "Stationery & Education", rate: 18, desc: "Document shredders for office" },
    { hsn: "4819", name: "Cardboard Boxes / Packaging", category: "Stationery & Education", rate: 18, desc: "Corrugated boxes, cartons, file folders of paper" },
];
