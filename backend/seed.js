const bcrypt = require("bcryptjs");
const { sequelize, User, Category, GstRate } = require("./models");
const path = require("path");
const fs = require("fs");

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ── Category definitions ──────────────────────────────────
const CATEGORIES = [
    { name: "Food & Essentials", hsn_sac_range: "0100-2400" },
    { name: "Textiles & Apparel", hsn_sac_range: "5000-6500" },
    { name: "Electronics & Appliances", hsn_sac_range: "8400-8600" },
    { name: "Healthcare & Pharma", hsn_sac_range: "3000-3400" },
    { name: "Automobiles & Parts", hsn_sac_range: "8700-8714" },
    { name: "Luxury & Lifestyle", hsn_sac_range: "7100-9600" },
    { name: "Services", hsn_sac_range: "9900-9999" },
    { name: "Construction & Materials", hsn_sac_range: "2500-7600" },
    { name: "Agriculture & Farming", hsn_sac_range: "0100-8700" },
    { name: "Stationery & Education", hsn_sac_range: "4800-9700" },
];

// ── GST Rate data (200+ items) ────────────────────────────
const GST_ITEMS = [
    // FOOD & ESSENTIALS — 0%
    { hsn: "1001", name: "Wheat", category: "Food & Essentials", rate: 0, desc: "Wheat grains, unprocessed" },
    { hsn: "1006", name: "Rice", category: "Food & Essentials", rate: 0, desc: "Rice in husk (paddy or rough)" },
    { hsn: "0401", name: "Fresh Milk", category: "Food & Essentials", rate: 0, desc: "Fresh milk, not concentrated" },
    { hsn: "0407", name: "Fresh Eggs", category: "Food & Essentials", rate: 0, desc: "Birds' eggs, in shell, fresh" },
    { hsn: "0713", name: "Pulses (Dried)", category: "Food & Essentials", rate: 0, desc: "Dried leguminous vegetables" },
    { hsn: "0701", name: "Fresh Potatoes", category: "Food & Essentials", rate: 0, desc: "Potatoes, fresh or chilled" },
    { hsn: "0702", name: "Fresh Tomatoes", category: "Food & Essentials", rate: 0, desc: "Tomatoes, fresh or chilled" },
    { hsn: "0703", name: "Onions", category: "Food & Essentials", rate: 0, desc: "Onions, shallots, leeks, fresh" },
    { hsn: "0709", name: "Fresh Vegetables", category: "Food & Essentials", rate: 0, desc: "Other vegetables, fresh or chilled" },
    { hsn: "0803", name: "Bananas", category: "Food & Essentials", rate: 0, desc: "Bananas including plantains, fresh" },
    { hsn: "0805", name: "Citrus Fruits", category: "Food & Essentials", rate: 0, desc: "Oranges, lemons, limes" },
    { hsn: "1101", name: "Wheat Flour (Atta)", category: "Food & Essentials", rate: 0, desc: "Wheat or meslin flour" },
    { hsn: "1901", name: "Puffed Rice (Murmure)", category: "Food & Essentials", rate: 0, desc: "Puffed rice, flattened rice" },
    { hsn: "0801", name: "Coconuts (Fresh)", category: "Food & Essentials", rate: 0, desc: "Fresh coconuts" },
    { hsn: "0409", name: "Natural Honey", category: "Food & Essentials", rate: 0, desc: "Natural honey, unprocessed" },
    { hsn: "0910", name: "Fresh Ginger & Turmeric", category: "Food & Essentials", rate: 0, desc: "Ginger, saffron, turmeric, fresh" },
    { hsn: "1008", name: "Cereals (Other)", category: "Food & Essentials", rate: 0, desc: "Buckwheat, millet, canary seeds" },
    { hsn: "1201", name: "Soya Beans", category: "Food & Essentials", rate: 0, desc: "Soya beans, broken or not" },
    { hsn: "2201", name: "Drinking Water", category: "Food & Essentials", rate: 0, desc: "Drinking water packed 20L" },
    { hsn: "0504", name: "Salt", category: "Food & Essentials", rate: 0, desc: "Common salt / rock salt" },
    // FOOD & ESSENTIALS — 5%
    { hsn: "0402", name: "Milk Powder", category: "Food & Essentials", rate: 5, desc: "Milk in powder, concentrated" },
    { hsn: "0901", name: "Coffee (Unroasted)", category: "Food & Essentials", rate: 5, desc: "Coffee beans, not roasted" },
    { hsn: "0902", name: "Tea Leaves", category: "Food & Essentials", rate: 5, desc: "Tea, whether or not flavoured" },
    { hsn: "1701", name: "Cane Sugar", category: "Food & Essentials", rate: 5, desc: "Cane or beet sugar, solid" },
    { hsn: "1702", name: "Jaggery (Gur)", category: "Food & Essentials", rate: 5, desc: "Other sugars including jaggery" },
    { hsn: "1905", name: "Bread", category: "Food & Essentials", rate: 5, desc: "Bread, plain" },
    { hsn: "0306", name: "Frozen Fish", category: "Food & Essentials", rate: 5, desc: "Fish — frozen, dried or salted" },
    { hsn: "1507", name: "Edible Oil (Soybean)", category: "Food & Essentials", rate: 5, desc: "Soya-bean oil" },
    { hsn: "1512", name: "Edible Oil (Sunflower)", category: "Food & Essentials", rate: 5, desc: "Sunflower-seed oil" },
    { hsn: "1513", name: "Edible Oil (Coconut)", category: "Food & Essentials", rate: 5, desc: "Coconut (copra) oil" },
    { hsn: "1515", name: "Edible Oil (Mustard)", category: "Food & Essentials", rate: 5, desc: "Mustard oil" },
    { hsn: "0802", name: "Cashew Nuts (Raw)", category: "Food & Essentials", rate: 5, desc: "Cashew nuts, in shell" },
    { hsn: "1102", name: "Maize Flour", category: "Food & Essentials", rate: 5, desc: "Maize (corn) flour" },
    { hsn: "0904", name: "Black Pepper", category: "Food & Essentials", rate: 5, desc: "Pepper of genus Piper" },
    // FOOD & ESSENTIALS — 12%
    { hsn: "0405", name: "Butter", category: "Food & Essentials", rate: 12, desc: "Butter and dairy fats" },
    { hsn: "0406", name: "Cheese", category: "Food & Essentials", rate: 12, desc: "Cheese and curd" },
    { hsn: "2106", name: "Dry Fruits (Processed)", category: "Food & Essentials", rate: 12, desc: "Processed dry fruits" },
    { hsn: "1704", name: "Sugar Confectionery", category: "Food & Essentials", rate: 12, desc: "Candies, toffees" },
    { hsn: "2009", name: "Fruit Juices (Packaged)", category: "Food & Essentials", rate: 12, desc: "Packaged fruit juices" },
    { hsn: "1902", name: "Pasta & Noodles", category: "Food & Essentials", rate: 12, desc: "Pasta, noodles" },
    // FOOD & ESSENTIALS — 18%
    { hsn: "2101", name: "Instant Coffee", category: "Food & Essentials", rate: 18, desc: "Coffee/tea extracts" },
    { hsn: "2103", name: "Sauces & Ketchup", category: "Food & Essentials", rate: 18, desc: "Soy sauce, ketchup" },
    { hsn: "2105", name: "Ice Cream", category: "Food & Essentials", rate: 18, desc: "Ice cream & edible ice" },
    { hsn: "1806", name: "Chocolates", category: "Food & Essentials", rate: 18, desc: "Chocolate preparations" },
    { hsn: "2202", name: "Aerated Drinks (Fruit)", category: "Food & Essentials", rate: 18, desc: "Flavoured beverages" },
    { hsn: "1905B", name: "Biscuits (Premium)", category: "Food & Essentials", rate: 18, desc: "Biscuits with chocolate" },
    // FOOD & ESSENTIALS — 28%
    { hsn: "2402", name: "Cigars & Cigarettes", category: "Food & Essentials", rate: 28, desc: "Tobacco products" },
    { hsn: "2403", name: "Chewing Tobacco", category: "Food & Essentials", rate: 28, desc: "Manufactured tobacco" },
    { hsn: "2204", name: "Aerated Beverages", category: "Food & Essentials", rate: 28, desc: "Carbonated beverages" },

    // TEXTILES & APPAREL
    { hsn: "5007", name: "Silk Fabrics", category: "Textiles & Apparel", rate: 5, desc: "Woven fabrics of silk" },
    { hsn: "5208", name: "Cotton Fabrics", category: "Textiles & Apparel", rate: 5, desc: "Woven cotton fabrics" },
    { hsn: "5209", name: "Cotton Fabric (Heavy)", category: "Textiles & Apparel", rate: 5, desc: "Woven cotton > 200 g/m²" },
    { hsn: "5407", name: "Synthetic Fabrics", category: "Textiles & Apparel", rate: 5, desc: "Synthetic filament yarn fabrics" },
    { hsn: "6101", name: "Men's Overcoats", category: "Textiles & Apparel", rate: 5, desc: "Men's overcoats, knitted" },
    { hsn: "6104", name: "Women's Suits", category: "Textiles & Apparel", rate: 5, desc: "Women's suits, knitted" },
    { hsn: "6105", name: "Men's Shirts (Knitted)", category: "Textiles & Apparel", rate: 5, desc: "Men's shirts, knitted" },
    { hsn: "6106", name: "Women's Blouses", category: "Textiles & Apparel", rate: 5, desc: "Women's blouses, knitted" },
    { hsn: "6109", name: "T-Shirts & Vests", category: "Textiles & Apparel", rate: 5, desc: "T-shirts, vests, knitted" },
    { hsn: "6203", name: "Men's Trousers", category: "Textiles & Apparel", rate: 5, desc: "Men's trousers, shorts" },
    { hsn: "6204", name: "Women's Trousers", category: "Textiles & Apparel", rate: 5, desc: "Women's trousers, shorts" },
    { hsn: "6205", name: "Men's Shirts (Woven)", category: "Textiles & Apparel", rate: 5, desc: "Men's shirts, woven" },
    { hsn: "6301", name: "Blankets", category: "Textiles & Apparel", rate: 5, desc: "Blankets, travelling rugs" },
    { hsn: "6302", name: "Bed Linen", category: "Textiles & Apparel", rate: 5, desc: "Bed linen, table linen" },
    { hsn: "6401", name: "Footwear (≤ ₹1000)", category: "Textiles & Apparel", rate: 5, desc: "Footwear ≤ ₹1000" },
    { hsn: "6402", name: "Footwear (> ₹1000)", category: "Textiles & Apparel", rate: 18, desc: "Footwear > ₹1000" },
    { hsn: "6501", name: "Hats & Headgear", category: "Textiles & Apparel", rate: 12, desc: "Hat-forms, hat bodies" },
    { hsn: "4202", name: "Leather Handbags", category: "Textiles & Apparel", rate: 18, desc: "Handbags of leather" },
    { hsn: "4203", name: "Leather Gloves", category: "Textiles & Apparel", rate: 18, desc: "Gloves of leather" },

    // ELECTRONICS & APPLIANCES
    { hsn: "8471", name: "Computers & Laptops", category: "Electronics & Appliances", rate: 18, desc: "Data processing machines" },
    { hsn: "8517", name: "Mobile Phones", category: "Electronics & Appliances", rate: 18, desc: "Telephone sets, smartphones" },
    { hsn: "8518", name: "Headphones & Speakers", category: "Electronics & Appliances", rate: 18, desc: "Loudspeakers, headphones" },
    { hsn: "8528", name: "Television Sets", category: "Electronics & Appliances", rate: 18, desc: "Monitors, TVs" },
    { hsn: "8516", name: "Electric Water Heater", category: "Electronics & Appliances", rate: 18, desc: "Water heaters, hair dryers" },
    { hsn: "8415", name: "Air Conditioners", category: "Electronics & Appliances", rate: 28, desc: "AC machines" },
    { hsn: "8418", name: "Refrigerators", category: "Electronics & Appliances", rate: 18, desc: "Refrigerators, freezers" },
    { hsn: "8450", name: "Washing Machines", category: "Electronics & Appliances", rate: 18, desc: "Washing machines" },
    { hsn: "8509", name: "Mixer Grinders", category: "Electronics & Appliances", rate: 18, desc: "Domestic appliances" },
    { hsn: "8414", name: "Fans & Blowers", category: "Electronics & Appliances", rate: 18, desc: "Fans, blowers" },
    { hsn: "8443", name: "Printers", category: "Electronics & Appliances", rate: 18, desc: "Printers" },
    { hsn: "8525", name: "CCTV Cameras", category: "Electronics & Appliances", rate: 18, desc: "TV cameras" },
    { hsn: "8506", name: "Batteries (Primary)", category: "Electronics & Appliances", rate: 18, desc: "Primary cells" },
    { hsn: "8507", name: "Lithium-Ion Batteries", category: "Electronics & Appliances", rate: 18, desc: "Li-ion batteries" },
    { hsn: "8504", name: "Power Banks / Chargers", category: "Electronics & Appliances", rate: 18, desc: "Chargers" },
    { hsn: "8523", name: "Pen Drives / Memory Cards", category: "Electronics & Appliances", rate: 18, desc: "Storage devices" },
    { hsn: "8422", name: "Dishwashers", category: "Electronics & Appliances", rate: 28, desc: "Dish-washing machines" },
    { hsn: "8508", name: "Vacuum Cleaners", category: "Electronics & Appliances", rate: 28, desc: "Vacuum cleaners" },

    // HEALTHCARE & PHARMA
    { hsn: "3001", name: "Blood / Organ Products", category: "Healthcare & Pharma", rate: 0, desc: "Human blood for therapeutic use" },
    { hsn: "3002", name: "Vaccines", category: "Healthcare & Pharma", rate: 5, desc: "Vaccines, toxins" },
    { hsn: "3003", name: "Medicaments (Bulk)", category: "Healthcare & Pharma", rate: 12, desc: "Medicaments not in doses" },
    { hsn: "3004", name: "Medicaments (Packaged)", category: "Healthcare & Pharma", rate: 12, desc: "Medicaments in doses" },
    { hsn: "3005", name: "Bandages & Dressings", category: "Healthcare & Pharma", rate: 12, desc: "Wadding, gauze, bandages" },
    { hsn: "3006", name: "Surgical Sutures", category: "Healthcare & Pharma", rate: 12, desc: "Sutures, dental cements" },
    { hsn: "9018", name: "Medical Instruments", category: "Healthcare & Pharma", rate: 12, desc: "Surgical instruments" },
    { hsn: "9019", name: "Massage Equipment", category: "Healthcare & Pharma", rate: 18, desc: "Massage apparatus" },
    { hsn: "9021", name: "Orthopaedic Appliances", category: "Healthcare & Pharma", rate: 12, desc: "Hearing aids, orthopaedics" },
    { hsn: "3304", name: "Beauty & Skin Care", category: "Healthcare & Pharma", rate: 18, desc: "Skin care products" },
    { hsn: "3305", name: "Hair Care Products", category: "Healthcare & Pharma", rate: 18, desc: "Shampoos, conditioners" },
    { hsn: "3306", name: "Oral Hygiene", category: "Healthcare & Pharma", rate: 18, desc: "Toothpaste, dental floss" },
    { hsn: "3307", name: "Perfumes & Deodorants", category: "Healthcare & Pharma", rate: 28, desc: "Perfumes, toilet waters" },
    { hsn: "3401", name: "Soap", category: "Healthcare & Pharma", rate: 18, desc: "Soap, washing preparations" },
    { hsn: "3402", name: "Detergents", category: "Healthcare & Pharma", rate: 18, desc: "Detergents" },
    { hsn: "4818", name: "Sanitary Pads", category: "Healthcare & Pharma", rate: 0, desc: "Sanitary napkins" },
    { hsn: "9619", name: "Diapers", category: "Healthcare & Pharma", rate: 12, desc: "Diapers" },

    // AUTOMOBILES & PARTS
    { hsn: "8703A", name: "Small Cars (≤ 1200cc)", category: "Automobiles & Parts", rate: 28, desc: "Petrol ≤ 1200 cc", cess: 1 },
    { hsn: "8703B", name: "Mid-Size Cars", category: "Automobiles & Parts", rate: 28, desc: "Petrol 1200-1500 cc", cess: 3 },
    { hsn: "8703C", name: "Large Cars (> 1500cc)", category: "Automobiles & Parts", rate: 28, desc: "Petrol > 1500 cc", cess: 15 },
    { hsn: "8703D", name: "SUVs", category: "Automobiles & Parts", rate: 28, desc: "SUVs > 1500 cc, > 4m", cess: 22 },
    { hsn: "8711", name: "Motorcycles (≤ 350cc)", category: "Automobiles & Parts", rate: 28, desc: "Motorcycles ≤ 350 cc", cess: 3 },
    { hsn: "8711B", name: "Motorcycles (> 350cc)", category: "Automobiles & Parts", rate: 28, desc: "Motorcycles > 350 cc", cess: 15 },
    { hsn: "8712", name: "Bicycles", category: "Automobiles & Parts", rate: 12, desc: "Bicycles" },
    { hsn: "8714", name: "Bicycle Parts", category: "Automobiles & Parts", rate: 12, desc: "Bicycle parts" },
    { hsn: "8708", name: "Motor Vehicle Parts", category: "Automobiles & Parts", rate: 28, desc: "Auto parts" },
    { hsn: "4011", name: "Tyres (New)", category: "Automobiles & Parts", rate: 28, desc: "Pneumatic tyres" },
    { hsn: "4013", name: "Inner Tubes", category: "Automobiles & Parts", rate: 28, desc: "Inner tubes" },
    { hsn: "8702", name: "Buses & Coaches", category: "Automobiles & Parts", rate: 28, desc: "Transport ≥ 10 persons" },
    { hsn: "8704", name: "Trucks", category: "Automobiles & Parts", rate: 28, desc: "Goods transport" },
    { hsn: "8713", name: "Wheelchairs", category: "Automobiles & Parts", rate: 0, desc: "Invalid carriages" },
    { hsn: "8704E", name: "Electric Vehicles", category: "Automobiles & Parts", rate: 5, desc: "Electric vehicles" },

    // LUXURY & LIFESTYLE
    { hsn: "7113", name: "Gold Jewellery", category: "Luxury & Lifestyle", rate: 3, desc: "Precious metal jewellery" },
    { hsn: "7114", name: "Silver Articles", category: "Luxury & Lifestyle", rate: 3, desc: "Silversmith wares" },
    { hsn: "7117", name: "Imitation Jewellery", category: "Luxury & Lifestyle", rate: 18, desc: "Imitation jewellery" },
    { hsn: "9101", name: "Wrist Watches (Premium)", category: "Luxury & Lifestyle", rate: 28, desc: "Watches, precious metal" },
    { hsn: "9102", name: "Wrist Watches (Standard)", category: "Luxury & Lifestyle", rate: 18, desc: "Wrist watches, other" },
    { hsn: "9504", name: "Gaming Consoles", category: "Luxury & Lifestyle", rate: 28, desc: "Video game consoles" },
    { hsn: "9506", name: "Sports Equipment", category: "Luxury & Lifestyle", rate: 18, desc: "Sports articles" },
    { hsn: "3303", name: "Perfumes (Luxury)", category: "Luxury & Lifestyle", rate: 28, desc: "Luxury perfumes" },
    { hsn: "9503", name: "Toys & Games", category: "Luxury & Lifestyle", rate: 18, desc: "Toys, puzzles" },
    { hsn: "7101", name: "Pearls", category: "Luxury & Lifestyle", rate: 3, desc: "Natural/cultured pearls" },
    { hsn: "7102", name: "Diamonds (Unset)", category: "Luxury & Lifestyle", rate: 0.25, desc: "Diamonds" },
    { hsn: "9404", name: "Mattresses", category: "Luxury & Lifestyle", rate: 18, desc: "Mattresses" },
    { hsn: "9403", name: "Furniture", category: "Luxury & Lifestyle", rate: 18, desc: "Furniture" },

    // SERVICES
    { hsn: "9954", name: "Construction Services", category: "Services", rate: 18, desc: "Building construction" },
    { hsn: "9961", name: "Financial Services", category: "Services", rate: 18, desc: "Banking, insurance" },
    { hsn: "9962", name: "Insurance Services", category: "Services", rate: 18, desc: "Life/general insurance" },
    { hsn: "9963", name: "Hotel (≤ ₹1000)", category: "Services", rate: 0, desc: "Room ≤ ₹1000" },
    { hsn: "9963A", name: "Hotel (₹1001–₹7500)", category: "Services", rate: 12, desc: "Room ₹1001–₹7500" },
    { hsn: "9963B", name: "Hotel (> ₹7500)", category: "Services", rate: 18, desc: "Room > ₹7500" },
    { hsn: "9964", name: "Transport (AC)", category: "Services", rate: 5, desc: "AC transport" },
    { hsn: "9964A", name: "Transport (Non-AC)", category: "Services", rate: 0, desc: "Non-AC transport" },
    { hsn: "9964B", name: "Air Travel (Economy)", category: "Services", rate: 5, desc: "Economy air travel" },
    { hsn: "9964C", name: "Air Travel (Business)", category: "Services", rate: 12, desc: "Business class" },
    { hsn: "9965", name: "Goods Transport (GTA)", category: "Services", rate: 5, desc: "GTA services" },
    { hsn: "9966", name: "Cab / Ride Sharing", category: "Services", rate: 5, desc: "Ride-sharing" },
    { hsn: "9967", name: "Courier & Postal", category: "Services", rate: 18, desc: "Courier services" },
    { hsn: "9971", name: "Telecom Services", category: "Services", rate: 18, desc: "Telecom" },
    { hsn: "9972", name: "Real Estate (Affordable)", category: "Services", rate: 5, desc: "Affordable housing" },
    { hsn: "9972A", name: "Real Estate (Premium)", category: "Services", rate: 12, desc: "Premium housing" },
    { hsn: "9973", name: "Leasing & Rental", category: "Services", rate: 18, desc: "Rental services" },
    { hsn: "9981", name: "IT & Software Services", category: "Services", rate: 18, desc: "Software services" },
    { hsn: "9982", name: "Legal Services", category: "Services", rate: 18, desc: "Legal, accounting" },
    { hsn: "9983", name: "Consulting Services", category: "Services", rate: 18, desc: "Management consulting" },
    { hsn: "9984", name: "Education (Coaching)", category: "Services", rate: 18, desc: "Private coaching" },
    { hsn: "9984A", name: "Education (School)", category: "Services", rate: 0, desc: "Recognised institutions" },
    { hsn: "9985", name: "Healthcare (Hospital)", category: "Services", rate: 0, desc: "Hospital services" },
    { hsn: "9985A", name: "Cosmetic Surgery", category: "Services", rate: 18, desc: "Cosmetic surgery" },
    { hsn: "9991", name: "Govt. Services", category: "Services", rate: 0, desc: "Government services" },
    { hsn: "9992", name: "Charitable Services", category: "Services", rate: 0, desc: "Charitable trusts" },
    { hsn: "9995", name: "Restaurant (Non-AC)", category: "Services", rate: 5, desc: "Non-AC restaurant" },
    { hsn: "9995A", name: "Restaurant (5-Star)", category: "Services", rate: 18, desc: "5-star restaurant" },
    { hsn: "9996", name: "Event Management", category: "Services", rate: 18, desc: "Events" },
    { hsn: "9997", name: "Entertainment (Movies)", category: "Services", rate: 18, desc: "Cinema, theatre" },
    { hsn: "9997A", name: "Online Gaming", category: "Services", rate: 28, desc: "Online gaming" },
    { hsn: "9997B", name: "Amusement Parks", category: "Services", rate: 18, desc: "Amusement parks" },
    { hsn: "9998", name: "Laundry & Dry Cleaning", category: "Services", rate: 18, desc: "Washing, cleaning" },
    { hsn: "9999", name: "Gym & Fitness", category: "Services", rate: 18, desc: "Sports, fitness" },

    // CONSTRUCTION & MATERIALS
    { hsn: "2523", name: "Cement", category: "Construction & Materials", rate: 28, desc: "Portland cement" },
    { hsn: "6802", name: "Marble & Granite", category: "Construction & Materials", rate: 28, desc: "Building stone" },
    { hsn: "7213", name: "Steel Bars & Rods", category: "Construction & Materials", rate: 18, desc: "Hot-rolled bars" },
    { hsn: "7214", name: "TMT Steel Bars", category: "Construction & Materials", rate: 18, desc: "TMT bars" },
    { hsn: "7210", name: "Steel Sheets", category: "Construction & Materials", rate: 18, desc: "Coated steel" },
    { hsn: "7306", name: "Steel Pipes", category: "Construction & Materials", rate: 18, desc: "Steel tubes" },
    { hsn: "6907", name: "Ceramic Tiles", category: "Construction & Materials", rate: 18, desc: "Ceramic tiles" },
    { hsn: "6910", name: "Sanitary Ware", category: "Construction & Materials", rate: 18, desc: "Ceramic sinks" },
    { hsn: "7007", name: "Safety Glass", category: "Construction & Materials", rate: 18, desc: "Toughened glass" },
    { hsn: "7604", name: "Aluminium Bars", category: "Construction & Materials", rate: 18, desc: "Aluminium rods" },
    { hsn: "3925", name: "PVC Pipes", category: "Construction & Materials", rate: 18, desc: "Plastic pipes" },
    { hsn: "4410", name: "Plywood", category: "Construction & Materials", rate: 18, desc: "Particle board" },
    { hsn: "2515", name: "Marble (Raw)", category: "Construction & Materials", rate: 12, desc: "Marble blocks" },
    { hsn: "2505", name: "Sand (Natural)", category: "Construction & Materials", rate: 5, desc: "Natural sands" },
    { hsn: "6810", name: "Concrete Blocks", category: "Construction & Materials", rate: 18, desc: "Concrete articles" },
    { hsn: "7308", name: "Structural Steel", category: "Construction & Materials", rate: 18, desc: "Steel structures" },
    { hsn: "3214", name: "Wall Putty / Paint", category: "Construction & Materials", rate: 18, desc: "Wall putty" },
    { hsn: "3208", name: "Paints & Varnishes", category: "Construction & Materials", rate: 28, desc: "Paints, varnishes" },
    { hsn: "7009", name: "Glass Mirrors", category: "Construction & Materials", rate: 18, desc: "Glass mirrors" },

    // AGRICULTURE & FARMING
    { hsn: "0101", name: "Live Horses", category: "Agriculture & Farming", rate: 0, desc: "Live horses, donkeys" },
    { hsn: "0102", name: "Live Cattle", category: "Agriculture & Farming", rate: 0, desc: "Live bovine animals" },
    { hsn: "0301", name: "Live Fish", category: "Agriculture & Farming", rate: 0, desc: "Live fish" },
    { hsn: "1209", name: "Seeds for Sowing", category: "Agriculture & Farming", rate: 0, desc: "Seeds, spores" },
    { hsn: "3101", name: "Organic Fertilizers", category: "Agriculture & Farming", rate: 0, desc: "Organic fertilisers" },
    { hsn: "3102", name: "Urea", category: "Agriculture & Farming", rate: 5, desc: "Nitrogenous fertilisers" },
    { hsn: "3105", name: "NPK Fertilizers", category: "Agriculture & Farming", rate: 5, desc: "NPK fertilisers" },
    { hsn: "3808", name: "Insecticides", category: "Agriculture & Farming", rate: 18, desc: "Insecticides, pesticides" },
    { hsn: "8432", name: "Agricultural Machinery", category: "Agriculture & Farming", rate: 12, desc: "Ploughs, harrows" },
    { hsn: "8433", name: "Harvesting Machinery", category: "Agriculture & Farming", rate: 12, desc: "Harvesting machines" },
    { hsn: "8701", name: "Tractors", category: "Agriculture & Farming", rate: 12, desc: "Tractors" },
    { hsn: "8436", name: "Poultry Machinery", category: "Agriculture & Farming", rate: 12, desc: "Poultry equipment" },
    { hsn: "0602", name: "Live Plants", category: "Agriculture & Farming", rate: 0, desc: "Plants, saplings" },
    { hsn: "5201", name: "Raw Cotton", category: "Agriculture & Farming", rate: 5, desc: "Cotton, uncarded" },
    { hsn: "5101", name: "Raw Wool", category: "Agriculture & Farming", rate: 5, desc: "Wool, uncarded" },

    // STATIONERY & EDUCATION
    { hsn: "4901", name: "Printed Books", category: "Stationery & Education", rate: 0, desc: "Books, brochures" },
    { hsn: "4902", name: "Newspapers", category: "Stationery & Education", rate: 0, desc: "Newspapers, journals" },
    { hsn: "4903", name: "Children's Picture Books", category: "Stationery & Education", rate: 0, desc: "Colouring books" },
    { hsn: "4820", name: "Exercise Books", category: "Stationery & Education", rate: 12, desc: "Notebooks, registers" },
    { hsn: "9608", name: "Ball Point Pens", category: "Stationery & Education", rate: 18, desc: "Pens" },
    { hsn: "9609", name: "Pencils", category: "Stationery & Education", rate: 12, desc: "Pencils, crayons" },
    { hsn: "8304", name: "Staples & Paper Clips", category: "Stationery & Education", rate: 18, desc: "Paper clips, staples" },
    { hsn: "4802", name: "Printer Paper", category: "Stationery & Education", rate: 12, desc: "Uncoated paper" },
    { hsn: "4817", name: "Envelopes", category: "Stationery & Education", rate: 18, desc: "Envelopes, postcards" },
    { hsn: "9017", name: "Geometry Sets", category: "Stationery & Education", rate: 18, desc: "Drawing instruments" },
    { hsn: "3506", name: "Glue & Adhesives", category: "Stationery & Education", rate: 18, desc: "Adhesives" },
    { hsn: "9610", name: "Slates & Boards", category: "Stationery & Education", rate: 18, desc: "Writing boards" },
    { hsn: "4821", name: "Labels & Tags", category: "Stationery & Education", rate: 12, desc: "Paper labels" },
    { hsn: "3215", name: "Printing Ink", category: "Stationery & Education", rate: 18, desc: "Printing ink" },
];

async function seed() {
    try {
        console.log("Syncing database...");
        await sequelize.sync({ force: true });

        // Create categories
        console.log("Creating categories...");
        const categoryMap = {};
        for (const cat of CATEGORIES) {
            const created = await Category.create(cat);
            categoryMap[cat.name] = created.id;
        }
        console.log(`Created ${CATEGORIES.length} categories`);

        // Create default admin user
        console.log("Creating admin user...");
        const adminHash = await bcrypt.hash("admin123", 12);
        await User.create({
            email: "admin@gstguru.in",
            password_hash: adminHash,
            name: "System Administrator",
            role: "admin",
            business_name: "GST Guru",
        });

        // Create demo business user
        const bizHash = await bcrypt.hash("business123", 12);
        await User.create({
            email: "demo@business.in",
            password_hash: bizHash,
            name: "Demo Business User",
            role: "business",
            business_name: "Demo Enterprises",
            gstin: "27AADCB2230M1Z3",
        });

        console.log("Created admin (admin@gstguru.in / admin123) and demo user (demo@business.in / business123)");

        // Seed GST rates
        console.log("Seeding GST rates...");
        let count = 0;
        for (const item of GST_ITEMS) {
            await GstRate.create({
                hsn_sac_code: item.hsn,
                description: `${item.name} — ${item.desc}`,
                rate_percent: item.rate,
                cess_percent: item.cess || 0,
                effective_from: "2024-01-01",
                effective_to: null,
                category_id: categoryMap[item.category] || null,
            });
            count++;
        }

        console.log(`\nSeeded ${count} GST rate items across ${CATEGORIES.length} categories`);
        console.log("Database seeded successfully!");
        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err);
        process.exit(1);
    }
}

seed();
