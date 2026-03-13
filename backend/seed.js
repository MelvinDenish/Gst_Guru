const { sequelize, User, Invoice, Expense, Party, GstReturn, Calculation, Notification, RateAlert, BusinessProduct, FilingRecord, ComplianceReport, GstRate, Category } = require("./models");
const bcrypt = require("bcryptjs");

async function seed() {
    // Sync schema without force — creates missing tables only, doesn't drop existing ones
    await sequelize.sync();
    console.log("Schema synced (no data loss).");

    // Clear ONLY user-specific data (preserve GstRate, Category, SyncLog)
    console.log("Clearing user-specific tables...");
    await GstReturn.destroy({ where: {} });
    await Expense.destroy({ where: {} });
    await Party.destroy({ where: {} });
    await ComplianceReport.destroy({ where: {} });
    await FilingRecord.destroy({ where: {} });
    await Invoice.destroy({ where: {} });
    await Notification.destroy({ where: {} });
    await RateAlert.destroy({ where: {} });
    await Calculation.destroy({ where: {} });
    await BusinessProduct.destroy({ where: {} });
    await User.destroy({ where: {} });

    // Also re-seed rates and categories (they were wiped by the earlier force:true)
    await GstRate.destroy({ where: {} });
    await Category.destroy({ where: {} });
    console.log("All data cleared. Re-seeding categories, rates, and users...");

    // ── CATEGORIES ────────────────────────────────────────────
    const cats = await Category.bulkCreate([
        { name: "Food & Essentials", hsn_sac_range: "0100-2199" },
        { name: "Textiles & Apparel", hsn_sac_range: "5000-6399" },
        { name: "Electronics & Appliances", hsn_sac_range: "8400-8599" },
        { name: "Healthcare & Pharma", hsn_sac_range: "3000-3099" },
        { name: "Automobiles & Parts", hsn_sac_range: "8700-8799" },
        { name: "Luxury & Lifestyle", hsn_sac_range: "7100-7199" },
        { name: "Services", hsn_sac_range: "9900-9999" },
        { name: "Construction & Materials", hsn_sac_range: "6800-6999" },
        { name: "Agriculture & Farming", hsn_sac_range: "0100-0599" },
        { name: "Stationery & Education", hsn_sac_range: "4800-4899" },
    ]);
    const catMap = {};
    cats.forEach(c => catMap[c.name] = c.id);
    console.log("Created 10 categories.");

    // ── GST RATES (200+) ─────────────────────────────────────
    const today = "2024-07-01";
    const rates = [
        // 0% — Essentials
        { hsn: "0401", desc: "Fresh Milk", rate: 0, cat: "Food & Essentials" },
        { hsn: "0713", desc: "Dried Pulses (Dal)", rate: 0, cat: "Food & Essentials" },
        { hsn: "1001", desc: "Wheat", rate: 0, cat: "Food & Essentials" },
        { hsn: "1006", desc: "Rice", rate: 0, cat: "Food & Essentials" },
        { hsn: "0703", desc: "Fresh Vegetables", rate: 0, cat: "Food & Essentials" },
        { hsn: "0803", desc: "Fresh Fruits", rate: 0, cat: "Food & Essentials" },
        { hsn: "0407", desc: "Eggs", rate: 0, cat: "Food & Essentials" },
        { hsn: "1101", desc: "Wheat Flour (Atta)", rate: 0, cat: "Food & Essentials" },
        { hsn: "0901", desc: "Un-roasted Coffee Beans", rate: 0, cat: "Food & Essentials" },
        { hsn: "0409", desc: "Natural Honey", rate: 0, cat: "Food & Essentials" },
        { hsn: "2201", desc: "Drinking Water (packaged < 20L)", rate: 0, cat: "Food & Essentials" },
        { hsn: "0301", desc: "Live Fish", rate: 0, cat: "Agriculture & Farming" },
        { hsn: "0201", desc: "Fresh Meat (non-frozen)", rate: 0, cat: "Food & Essentials" },
        { hsn: "1201", desc: "Soya Beans", rate: 0, cat: "Agriculture & Farming" },
        { hsn: "5002", desc: "Raw Silk", rate: 0, cat: "Textiles & Apparel" },
        { hsn: "5101", desc: "Raw Wool", rate: 0, cat: "Textiles & Apparel" },
        { hsn: "5201", desc: "Raw Cotton", rate: 0, cat: "Textiles & Apparel" },
        { hsn: "4901", desc: "Printed Books", rate: 0, cat: "Stationery & Education" },
        { hsn: "4902", desc: "Newspapers", rate: 0, cat: "Stationery & Education" },

        // 5% — Low rate
        { hsn: "0402", desc: "Milk Powder / Condensed Milk", rate: 5, cat: "Food & Essentials" },
        { hsn: "0902", desc: "Tea (packaged)", rate: 5, cat: "Food & Essentials" },
        { hsn: "0901A", desc: "Coffee (roasted, packaged)", rate: 5, cat: "Food & Essentials" },
        { hsn: "1701", desc: "Sugar", rate: 5, cat: "Food & Essentials" },
        { hsn: "1905", desc: "Bread and Bakery Products", rate: 5, cat: "Food & Essentials" },
        { hsn: "1902", desc: "Pasta / Noodles", rate: 5, cat: "Food & Essentials" },
        { hsn: "0504", desc: "Frozen Vegetables", rate: 5, cat: "Food & Essentials" },
        { hsn: "2106", desc: "Protein Concentrate / Supplements", rate: 5, cat: "Food & Essentials" },
        { hsn: "3006", desc: "Medicines (life-saving drugs)", rate: 5, cat: "Healthcare & Pharma" },
        { hsn: "9954", desc: "Construction Services (Affordable Housing)", rate: 5, cat: "Services" },
        { hsn: "9963", desc: "Hotel Room (Tariff < ₹1000)", rate: 5, cat: "Services" },
        { hsn: "9985", desc: "Support Services to Agriculture", rate: 5, cat: "Services" },
        { hsn: "5007", desc: "Silk Fabrics", rate: 5, cat: "Textiles & Apparel" },
        { hsn: "5208", desc: "Cotton Fabrics (woven)", rate: 5, cat: "Textiles & Apparel" },
        { hsn: "6101", desc: "Knitted Garments", rate: 5, cat: "Textiles & Apparel" },
        { hsn: "6201", desc: "Overcoats / Jackets", rate: 5, cat: "Textiles & Apparel" },
        { hsn: "6203", desc: "Men's Trousers / Shorts", rate: 5, cat: "Textiles & Apparel" },
        { hsn: "6206", desc: "Women's Blouses", rate: 5, cat: "Textiles & Apparel" },
        { hsn: "6402", desc: "Footwear (≤ ₹1000)", rate: 5, cat: "Textiles & Apparel" },
        { hsn: "0401A", desc: "Curd and Lassi (packaged)", rate: 5, cat: "Food & Essentials" },
        { hsn: "9992", desc: "Education Services", rate: 5, cat: "Services" },
        { hsn: "4820", desc: "Exercise Books / Notebooks", rate: 5, cat: "Stationery & Education" },
        { hsn: "9964", desc: "Passenger Transport (Rail)", rate: 5, cat: "Services" },
        { hsn: "9972", desc: "Passenger Transport (Air — Economy)", rate: 5, cat: "Services" },

        // 12% — Standard rate
        { hsn: "1704", desc: "Sugar Confectionery / Sweets", rate: 12, cat: "Food & Essentials" },
        { hsn: "1901", desc: "Malt Extract / Food Preparations", rate: 12, cat: "Food & Essentials" },
        { hsn: "2009", desc: "Fruit Juices", rate: 12, cat: "Food & Essentials" },
        { hsn: "2103", desc: "Sauces / Ketchup", rate: 12, cat: "Food & Essentials" },
        { hsn: "2106A", desc: "Namkeen / Bhujia", rate: 12, cat: "Food & Essentials" },
        { hsn: "3304", desc: "Skincare / Beauty Products", rate: 12, cat: "Healthcare & Pharma" },
        { hsn: "3401", desc: "Soap / Detergent", rate: 12, cat: "Healthcare & Pharma" },
        { hsn: "3402", desc: "Washing Preparations", rate: 12, cat: "Healthcare & Pharma" },
        { hsn: "3923", desc: "Plastic Containers / Packaging", rate: 12, cat: "Construction & Materials" },
        { hsn: "4011", desc: "Rubber Tyres (Cycle)", rate: 12, cat: "Automobiles & Parts" },
        { hsn: "6810", desc: "Cement Articles (blocks/tiles)", rate: 12, cat: "Construction & Materials" },
        { hsn: "7323", desc: "Household Steel Articles", rate: 12, cat: "Construction & Materials" },
        { hsn: "8414", desc: "Hand Pumps / Parts", rate: 12, cat: "Construction & Materials" },
        { hsn: "8471A", desc: "Computers and Laptops", rate: 12, cat: "Electronics & Appliances" },
        { hsn: "8443", desc: "Printers / Photocopiers", rate: 12, cat: "Electronics & Appliances" },
        { hsn: "9963A", desc: "Hotel Room (₹1000 - ₹7500)", rate: 12, cat: "Services" },
        { hsn: "9964A", desc: "Passenger Transport (Air — Business)", rate: 12, cat: "Services" },
        { hsn: "9971", desc: "Financial Services (Fund Management)", rate: 12, cat: "Services" },
        { hsn: "9983", desc: "IT and ITES Services", rate: 12, cat: "Services" },
        { hsn: "3926", desc: "Plastic Products (Other)", rate: 12, cat: "Construction & Materials" },

        // 18% — Standard rate
        { hsn: "8517", desc: "Mobile Phones & Smartphones", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8471", desc: "Computer Hardware / Laptops", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8528", desc: "Televisions / Monitors", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8418", desc: "Refrigerators & Freezers", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8450", desc: "Washing Machines", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8516", desc: "Electric Water Heaters / Hair Dryers", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8415", desc: "Air Conditioners", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8509", desc: "Food Grinders / Mixers", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8521", desc: "Video Recording Equipment", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8518", desc: "Speakers / Headphones", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8523", desc: "Hard Drives / Flash Memory", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8525", desc: "CCTV Cameras / Webcams", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8544", desc: "Electric Cables & Wires", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8501", desc: "Electric Motors & Generators", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "3004", desc: "Medicines (general)", rate: 18, cat: "Healthcare & Pharma" },
        { hsn: "3005", desc: "Surgical Dressings / Bandages", rate: 18, cat: "Healthcare & Pharma" },
        { hsn: "3306", desc: "Toothpaste / Dental Products", rate: 18, cat: "Healthcare & Pharma" },
        { hsn: "3305", desc: "Hair Care Products / Shampoo", rate: 18, cat: "Healthcare & Pharma" },
        { hsn: "3307", desc: "Deodorants / Perfumes", rate: 18, cat: "Healthcare & Pharma" },
        { hsn: "7308", desc: "Iron/Steel Structures & Parts", rate: 18, cat: "Construction & Materials" },
        { hsn: "7210", desc: "Galvanized Steel Sheets", rate: 18, cat: "Construction & Materials" },
        { hsn: "6802", desc: "Marble / Granite (cut)", rate: 18, cat: "Construction & Materials" },
        { hsn: "6907", desc: "Ceramic Tiles", rate: 18, cat: "Construction & Materials" },
        { hsn: "6805", desc: "Abrasives / Grinding Wheels", rate: 18, cat: "Construction & Materials" },
        { hsn: "2523", desc: "Portland Cement", rate: 18, cat: "Construction & Materials" },
        { hsn: "7318", desc: "Screws / Bolts / Nuts / Washers", rate: 18, cat: "Construction & Materials" },
        { hsn: "8708", desc: "Motor Vehicle Parts & Accessories", rate: 18, cat: "Automobiles & Parts" },
        { hsn: "8714", desc: "Bicycle Parts", rate: 18, cat: "Automobiles & Parts" },
        { hsn: "4011A", desc: "Rubber Tyres (Car/Truck)", rate: 18, cat: "Automobiles & Parts" },
        { hsn: "8711", desc: "Motorcycles & Scooters", rate: 18, cat: "Automobiles & Parts" },
        { hsn: "8712", desc: "Bicycles", rate: 18, cat: "Automobiles & Parts" },
        { hsn: "9401", desc: "Seats / Office Chairs", rate: 18, cat: "Construction & Materials" },
        { hsn: "9403", desc: "Furniture (Other)", rate: 18, cat: "Construction & Materials" },
        { hsn: "9405", desc: "Lamps / Light Fixtures", rate: 18, cat: "Construction & Materials" },
        { hsn: "9503", desc: "Toys (Including Video Games)", rate: 18, cat: "Stationery & Education" },
        { hsn: "4202", desc: "Leather Bags / Wallets", rate: 18, cat: "Luxury & Lifestyle" },
        { hsn: "6402A", desc: "Footwear (> ₹1000)", rate: 18, cat: "Textiles & Apparel" },
        { hsn: "9619", desc: "Sanitary Pads / Diapers", rate: 18, cat: "Healthcare & Pharma" },
        { hsn: "8504", desc: "Transformers / Power Supply", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "7013", desc: "Glassware (Household)", rate: 18, cat: "Construction & Materials" },
        { hsn: "4818", desc: "Tissue Paper / Paper Towels", rate: 18, cat: "Stationery & Education" },
        { hsn: "4819", desc: "Paper Cartons / Boxes", rate: 18, cat: "Stationery & Education" },
        { hsn: "4821", desc: "Paper Labels / Tags", rate: 18, cat: "Stationery & Education" },
        { hsn: "9988", desc: "Manufacturing Services", rate: 18, cat: "Services" },
        { hsn: "9961", desc: "Postal & Courier Services", rate: 18, cat: "Services" },
        { hsn: "9962", desc: "Legal & Accounting Services", rate: 18, cat: "Services" },
        { hsn: "9982", desc: "Scientific & Technical Consulting", rate: 18, cat: "Services" },
        { hsn: "9973", desc: "Leasing Without Operator", rate: 18, cat: "Services" },
        { hsn: "9984", desc: "Telecom Services", rate: 18, cat: "Services" },
        { hsn: "9986", desc: "Rental of Commercial Property", rate: 18, cat: "Services" },
        { hsn: "9987", desc: "Maintenance & Repair Services", rate: 18, cat: "Services" },
        { hsn: "9981", desc: "R&D / Experimental Services", rate: 18, cat: "Services" },
        { hsn: "9991", desc: "Public Administration", rate: 18, cat: "Services" },
        { hsn: "9993", desc: "Human Health Services", rate: 18, cat: "Services" },
        { hsn: "9996", desc: "Recreational / Sport Services", rate: 18, cat: "Services" },
        { hsn: "9997", desc: "Domestic Household Services", rate: 18, cat: "Services" },
        { hsn: "9963B", desc: "Hotel Room (> ₹7500)", rate: 18, cat: "Services" },

        // 28% — Luxury & Sin goods
        { hsn: "8703", desc: "Motor Cars (Mid-Range)", rate: 28, cat: "Automobiles & Parts", cess: 0, applicability: { type: "automobile", variants: [
            { label: "Small Car (≤ 4m, ≤ 1200cc Petrol)", cess: 1 },
            { label: "Small Car (≤ 4m, ≤ 1500cc Diesel)", cess: 3 },
            { label: "Mid-Size Car (> 4m, ≤ 1500cc)", cess: 17 },
            { label: "Large Car (> 1500cc)", cess: 20 },
            { label: "SUV (> 4m, > 1500cc, Clearance ≥ 170mm)", cess: 22 },
            { label: "Electric Vehicle", cess: 0 }
        ]}},
        { hsn: "2402", desc: "Cigarettes & Tobacco", rate: 28, cat: "Luxury & Lifestyle", cess: 36 },
        { hsn: "2403", desc: "Chewing Tobacco / Gutka", rate: 28, cat: "Luxury & Lifestyle", cess: 160 },
        { hsn: "2202", desc: "Aerated / Carbonated Drinks", rate: 28, cat: "Food & Essentials", cess: 12 },
        { hsn: "2203", desc: "Beer", rate: 28, cat: "Luxury & Lifestyle" },
        { hsn: "8539", desc: "Luxury Chandeliers", rate: 28, cat: "Luxury & Lifestyle" },
        { hsn: "9504", desc: "Video Game Consoles", rate: 28, cat: "Luxury & Lifestyle" },
        { hsn: "3303", desc: "Perfumes / Toilet Waters (luxury)", rate: 28, cat: "Luxury & Lifestyle" },
        { hsn: "4303", desc: "Fur Clothing / Articles", rate: 28, cat: "Luxury & Lifestyle" },
        { hsn: "7101", desc: "Precious Stones / Pearls", rate: 3, cat: "Luxury & Lifestyle" },
        { hsn: "7108", desc: "Gold (including gold jewellery)", rate: 3, cat: "Luxury & Lifestyle" },
        { hsn: "7113", desc: "Silver Jewellery", rate: 3, cat: "Luxury & Lifestyle" },
        { hsn: "7106", desc: "Silver (in unwrought form)", rate: 3, cat: "Luxury & Lifestyle" },
        { hsn: "8702", desc: "Buses & Large Passenger Vehicles", rate: 28, cat: "Automobiles & Parts" },
        { hsn: "8706", desc: "Motor Vehicle Chassis", rate: 28, cat: "Automobiles & Parts" },
        { hsn: "9302", desc: "Arms & Ammunition", rate: 28, cat: "Luxury & Lifestyle" },
        { hsn: "2101", desc: "Coffee / Tea Concentrate (instant)", rate: 18, cat: "Food & Essentials" },
        { hsn: "1806", desc: "Chocolate / Cocoa Preparations", rate: 18, cat: "Food & Essentials" },
        { hsn: "2105", desc: "Ice Cream", rate: 18, cat: "Food & Essentials" },

        // 0.25% — Special
        { hsn: "7102", desc: "Rough Diamonds", rate: 0.25, cat: "Luxury & Lifestyle" },

        // RCM items
        { hsn: "9965", desc: "Goods Transport Agency Services", rate: 5, cat: "Services", is_rcm: true },
        { hsn: "9967", desc: "Legal Services by Advocate", rate: 18, cat: "Services", is_rcm: true },
        { hsn: "9995", desc: "Services by Director to Company", rate: 18, cat: "Services", is_rcm: true },

        // Items with price slabs
        { hsn: "6109", desc: "T-shirts & Singlets", rate: 5, cat: "Textiles & Apparel", price_slabs: [
            { max_value: 1000, rate: 5 },
            { max_value: null, rate: 12 }
        ]},
        { hsn: "6104", desc: "Women's Dresses (Knitted)", rate: 5, cat: "Textiles & Apparel", price_slabs: [
            { max_value: 1000, rate: 5 },
            { max_value: null, rate: 12 }
        ]},

        // More common items
        { hsn: "3808", desc: "Pesticides & Insecticides", rate: 18, cat: "Agriculture & Farming" },
        { hsn: "3101", desc: "Fertilizers (Organic)", rate: 5, cat: "Agriculture & Farming" },
        { hsn: "3102", desc: "Fertilizers (Nitrogen-based)", rate: 5, cat: "Agriculture & Farming" },
        { hsn: "8432", desc: "Agricultural Machinery", rate: 12, cat: "Agriculture & Farming" },
        { hsn: "8433", desc: "Harvesting / Threshing Machines", rate: 12, cat: "Agriculture & Farming" },
        { hsn: "8419", desc: "Industrial Ovens / Furnaces", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8422", desc: "Packing / Wrapping Machinery", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8474", desc: "Crusher / Mixer Industrial Machines", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8536", desc: "Switches / Plugs / Sockets", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "8539A", desc: "LED Lights / Bulbs", rate: 18, cat: "Electronics & Appliances" },
        { hsn: "9018", desc: "Medical Instruments & Devices", rate: 12, cat: "Healthcare & Pharma" },
        { hsn: "9019", desc: "Massage / Physiotherapy Equipment", rate: 12, cat: "Healthcare & Pharma" },
        { hsn: "9021", desc: "Hearing Aids / Artificial Limbs", rate: 5, cat: "Healthcare & Pharma" },
    ];

    const rateRecords = rates.map(r => ({
        hsn_sac_code: r.hsn,
        description: r.desc,
        rate_percent: r.rate,
        cess_percent: r.cess || 0,
        effective_from: today,
        effective_to: null,
        is_rcm: r.is_rcm || false,
        category_id: catMap[r.cat] || null,
        price_slabs_json: r.price_slabs ? JSON.stringify(r.price_slabs) : null,
        applicability_json: r.applicability ? JSON.stringify(r.applicability) : null,
        created_by: null,
    }));
    await GstRate.bulkCreate(rateRecords);
    console.log(`Created ${rateRecords.length} GST rates across all slabs.`);

    const password_hash = await bcrypt.hash("password123", 10);

    // Persona 1: Small Retail Shop Owner (B2C heavy, minimal ITC)
    const user1 = await User.create({
        name: "Rahul Sharma",
        email: "retail@example.com",
        password_hash,
        role: "user"
    });

    // Persona 2: Freelance Software Dev (B2B, Export, Reverse Charge)
    const user2 = await User.create({
        name: "Sneha Patel",
        email: "freelance@example.com",
        password_hash,
        role: "user"
    });

    // Persona 3: Manufacturer (High ITC, Complex Rates, E-Way bills)
    const user3 = await User.create({
        name: "Amit Singh",
        email: "manufacturer@example.com",
        password_hash,
        role: "user"
    });

    // Persona 4: Restaurant Owner (Composition Scheme / Mixed Rates)
    const user4 = await User.create({
        name: "Karan Johar",
        email: "restaurant@example.com",
        password_hash,
        role: "user"
    });

    // Also create an admin user for testing admin features
    await User.create({
        name: "Admin User",
        email: "admin@example.com",
        password_hash,
        role: "admin"
    });

    console.log("Created 4 user personas + 1 admin.");

    // --- SEED USER 1 (Retail) ---
    await Party.bulkCreate([
        { user_id: user1.id, name: "Local Wholesaler", type: "vendor", gstin: "27AAAAA0000A1Z5", phone: "9876543210" },
        { user_id: user1.id, name: "Walk-in Customer", type: "customer", phone: "" }
    ]);

    await Invoice.bulkCreate([
        {
            user_id: user1.id, invoice_number: "INV-R-001", invoice_type: "sale", buyer_name: "Walk-in Customer",
            seller_name: "Rahul Sharma Retail", seller_gstin: "27AAAAA9999A1Z5",
            invoice_date: "2026-03-01", subtotal: 500, cgst: 22.5, sgst: 22.5, igst: 0, cess: 0, total: 545,
            payment_status: "paid", items_json: [{ description: "Groceries", quantity: 1, price: 500, gst_rate: 9 }],
            place_of_supply: "27"
        },
        {
            user_id: user1.id, invoice_number: "INV-R-002", invoice_type: "sale", buyer_name: "Ramesh Kumar",
            seller_name: "Rahul Sharma Retail", seller_gstin: "27AAAAA9999A1Z5",
            invoice_date: "2026-03-05", subtotal: 1200, cgst: 72, sgst: 72, igst: 0, cess: 0, total: 1344,
            payment_status: "paid", items_json: [{ description: "Household Items", quantity: 1, price: 1200, gst_rate: 12 }],
            place_of_supply: "27"
        },
        {
            user_id: user1.id, invoice_number: "INV-R-003", invoice_type: "sale", buyer_name: "Suresh Mehta",
            seller_name: "Rahul Sharma Retail", seller_gstin: "27AAAAA9999A1Z5",
            invoice_date: "2026-03-08", subtotal: 3500, cgst: 315, sgst: 315, igst: 0, cess: 0, total: 4130,
            payment_status: "unpaid", items_json: [{ description: "Electronics Accessories", quantity: 5, price: 700, gst_rate: 18 }],
            place_of_supply: "27"
        }
    ]);

    await Expense.bulkCreate([
        { user_id: user1.id, vendor_name: "Local Wholesaler", vendor_gstin: "27AAAAA0000A1Z5", category: "Office Supplies", amount: 10000, gst_paid: 1800, date: "2026-03-02", eligible_itc: true },
        { user_id: user1.id, vendor_name: "Electricity Board", category: "Utilities", amount: 2000, gst_paid: 0, date: "2026-03-10", eligible_itc: false },
        { user_id: user1.id, vendor_name: "Paper Supplier", vendor_gstin: "27BBBBB1111B2Z6", category: "Office Supplies", amount: 1500, gst_paid: 270, date: "2026-03-12", eligible_itc: true }
    ]);

    // --- SEED USER 2 (Freelance) ---
    await Party.bulkCreate([
        { user_id: user2.id, name: "US Tech Corp", type: "customer", address: "New York, USA", email: "payment@ustech.com" },
        { user_id: user2.id, name: "Mumbai Startup Ltd", type: "customer", gstin: "27EEEEE4444E5Z9", email: "billing@mumbaistartup.in" },
        { user_id: user2.id, name: "Co-working Space", type: "vendor", gstin: "29BBBBB1111B2Z6" }
    ]);

    await Invoice.bulkCreate([
        {
            user_id: user2.id, invoice_number: "INV-F-101", invoice_type: "sale", buyer_name: "US Tech Corp",
            seller_name: "Sneha Patel Consulting", seller_gstin: "29CCCCC2222C3Z7",
            invoice_date: "2026-03-15", subtotal: 150000, cgst: 0, sgst: 0, igst: 0, cess: 0, total: 150000,
            payment_status: "partial", items_json: [{ description: "Software Development Services", quantity: 1, price: 150000, gst_rate: 0 }],
            notes: "Export of services without payment of IGST under LUT", place_of_supply: "96"
        },
        {
            user_id: user2.id, invoice_number: "INV-F-102", invoice_type: "sale", buyer_name: "Mumbai Startup Ltd",
            buyer_gstin: "27EEEEE4444E5Z9", seller_name: "Sneha Patel Consulting", seller_gstin: "29CCCCC2222C3Z7",
            invoice_date: "2026-03-10", subtotal: 75000, cgst: 0, sgst: 0, igst: 13500, cess: 0, total: 88500,
            payment_status: "unpaid", items_json: [{ description: "Web App Development", quantity: 1, price: 75000, gst_rate: 18 }],
            place_of_supply: "27"
        }
    ]);

    await Expense.bulkCreate([
        { user_id: user2.id, vendor_name: "Co-working Space", vendor_gstin: "29BBBBB1111B2Z6", category: "Rent", amount: 8000, gst_paid: 1440, date: "2026-03-01", eligible_itc: true },
        { user_id: user2.id, vendor_name: "AWS Cloud", category: "Software", amount: 5000, gst_paid: 900, date: "2026-03-05", eligible_itc: true },
        { user_id: user2.id, vendor_name: "Laptop Accessories", category: "Office Supplies", amount: 3000, gst_paid: 540, date: "2026-03-08", eligible_itc: true }
    ]);

    // --- SEED USER 3 (Manufacturer) ---
    await Party.bulkCreate([
        { user_id: user3.id, name: "Raw Material Supplier", type: "vendor", gstin: "24CCCCC2222C3Z7", phone: "9898989898" },
        { user_id: user3.id, name: "Distributor Network Pvt Ltd", type: "customer", gstin: "27DDDDD3333D4Z8", email: "orders@distributor.in" },
        { user_id: user3.id, name: "Logistics Co", type: "vendor", gstin: "27FFFFF5555F6Z0" }
    ]);

    await Invoice.bulkCreate([
        {
            user_id: user3.id, invoice_number: "MFG-2026-001", invoice_type: "sale",
            buyer_name: "Distributor Network Pvt Ltd", buyer_gstin: "27DDDDD3333D4Z8",
            seller_name: "Amit Singh Manufacturing", seller_gstin: "24GGGGG6666G7Z1",
            invoice_date: "2026-03-10", subtotal: 500000, cgst: 0, sgst: 0, igst: 90000, cess: 0, total: 590000,
            payment_status: "unpaid", items_json: [
                { description: "Finished Goods A", quantity: 100, price: 2000, gst_rate: 18 },
                { description: "Finished Goods B", quantity: 50, price: 6000, gst_rate: 18 }
            ], place_of_supply: "27"
        },
        {
            user_id: user3.id, invoice_number: "MFG-2026-002", invoice_type: "purchase",
            buyer_name: "Amit Singh Manufacturing", buyer_gstin: "24GGGGG6666G7Z1",
            seller_name: "Raw Material Supplier", seller_gstin: "24CCCCC2222C3Z7",
            invoice_date: "2026-03-05", subtotal: 200000, cgst: 18000, sgst: 18000, igst: 0, cess: 0, total: 236000,
            payment_status: "paid", items_json: [
                { description: "Steel Sheets", quantity: 500, price: 400, gst_rate: 18 }
            ], place_of_supply: "24"
        }
    ]);

    await Expense.bulkCreate([
        { user_id: user3.id, vendor_name: "Raw Material Supplier", vendor_gstin: "24CCCCC2222C3Z7", category: "Other", amount: 200000, gst_paid: 36000, date: "2026-03-05", eligible_itc: true },
        { user_id: user3.id, vendor_name: "Logistics Co", vendor_gstin: "27FFFFF5555F6Z0", category: "Travel", amount: 15000, gst_paid: 750, date: "2026-03-11", eligible_itc: true },
        { user_id: user3.id, vendor_name: "Factory Rent", category: "Rent", amount: 50000, gst_paid: 9000, date: "2026-03-01", eligible_itc: true }
    ]);

    await GstReturn.create({
        user_id: user3.id, return_type: "GSTR-1", period_month: 2, period_year: 2026, status: "filed",
        data: { b2b_sales: 850000, b2c_sales: 0, total_cgst: 0, total_igst: 76500 }
    });

    // --- SEED USER 4 (Restaurant) ---
    await Party.bulkCreate([
        { user_id: user4.id, name: "Vegetable Vendor", type: "vendor", phone: "9123456789" },
        { user_id: user4.id, name: "Zomato/Swiggy", type: "customer", gstin: "29HHHHH7777H8Z2" }
    ]);

    await Invoice.bulkCreate([
        {
            user_id: user4.id, invoice_number: "REST-001", invoice_type: "sale", buyer_name: "Dine-in Customer",
            seller_name: "Karan's Kitchen", seller_gstin: "27IIIII8888I9Z3",
            invoice_date: "2026-03-12", subtotal: 1500, cgst: 37.5, sgst: 37.5, igst: 0, cess: 0, total: 1575,
            payment_status: "paid", items_json: [{ description: "Food & Beverage", quantity: 1, price: 1500, gst_rate: 5 }],
            place_of_supply: "27"
        },
        {
            user_id: user4.id, invoice_number: "REST-002", invoice_type: "sale", buyer_name: "Zomato/Swiggy",
            buyer_gstin: "29HHHHH7777H8Z2", seller_name: "Karan's Kitchen", seller_gstin: "27IIIII8888I9Z3",
            invoice_date: "2026-03-13", subtotal: 5000, cgst: 125, sgst: 125, igst: 0, cess: 0, total: 5250,
            payment_status: "unpaid", items_json: [{ description: "Catering Order", quantity: 1, price: 5000, gst_rate: 5 }],
            place_of_supply: "27"
        }
    ]);

    await Expense.bulkCreate([
        { user_id: user4.id, vendor_name: "Vegetable Vendor", category: "Other", amount: 5000, gst_paid: 0, date: "2026-03-02", eligible_itc: false },
        { user_id: user4.id, vendor_name: "Gas Supplier", category: "Utilities", amount: 3000, gst_paid: 150, date: "2026-03-06", eligible_itc: true },
        { user_id: user4.id, vendor_name: "Restaurant Rent", category: "Rent", amount: 25000, gst_paid: 4500, date: "2026-03-01", eligible_itc: true }
    ]);

    console.log("\n✅ Seeding complete! All GST rates & categories preserved.");
    console.log("\nLogin credentials (password: password123 for all):");
    console.log("  1. retail@example.com      — Rahul Sharma (Retail Shop)");
    console.log("  2. freelance@example.com   — Sneha Patel (Freelance Dev)");
    console.log("  3. manufacturer@example.com — Amit Singh (Manufacturing)");
    console.log("  4. restaurant@example.com  — Karan Johar (Restaurant)");
    console.log("  5. admin@example.com       — Admin User");
    process.exit();
}

seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});
