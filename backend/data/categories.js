// ── Category & Sub-Category definitions ──────────────────
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

// Sub-categories (parent name → children)
const SUB_CATEGORIES = {
    "Food & Essentials": [
        { name: "Fresh Produce & Grains", hsn_sac_range: "0100-1200" },
        { name: "Dairy & Animal Products", hsn_sac_range: "0400-0500" },
        { name: "Packaged & Processed Food", hsn_sac_range: "1600-2200" },
        { name: "Beverages", hsn_sac_range: "2200-2400" },
        { name: "Tobacco & Pan Masala", hsn_sac_range: "2400-2404" },
    ],
    "Textiles & Apparel": [
        { name: "Fabrics & Raw Textiles", hsn_sac_range: "5000-5600" },
        { name: "Garments (Men)", hsn_sac_range: "6100-6200" },
        { name: "Garments (Women)", hsn_sac_range: "6100-6200" },
        { name: "Footwear", hsn_sac_range: "6400-6405" },
        { name: "Bags & Accessories", hsn_sac_range: "4200-4205" },
    ],
    "Electronics & Appliances": [
        { name: "Computers & Peripherals", hsn_sac_range: "8470-8473" },
        { name: "Mobile & Communication", hsn_sac_range: "8517-8518" },
        { name: "Home Appliances", hsn_sac_range: "8414-8516" },
        { name: "Batteries & Power", hsn_sac_range: "8504-8507" },
        { name: "Lighting & Solar", hsn_sac_range: "8539-8541" },
    ],
    "Healthcare & Pharma": [
        { name: "Life-Saving Drugs", hsn_sac_range: "3001-3004" },
        { name: "OTC & General Medicine", hsn_sac_range: "3003-3006" },
        { name: "Personal Care & Hygiene", hsn_sac_range: "3300-3402" },
        { name: "Medical Equipment", hsn_sac_range: "9018-9022" },
    ],
    "Automobiles & Parts": [
        { name: "Cars & SUVs", hsn_sac_range: "8703-8703" },
        { name: "Two & Three Wheelers", hsn_sac_range: "8711-8711" },
        { name: "Commercial Vehicles", hsn_sac_range: "8702-8704" },
        { name: "Electric Vehicles", hsn_sac_range: "8703-8711" },
        { name: "Auto Spare Parts", hsn_sac_range: "8708-8714" },
    ],
    "Services": [
        { name: "Hospitality & Hotels", hsn_sac_range: "9963-9963" },
        { name: "Transport & Logistics", hsn_sac_range: "9964-9966" },
        { name: "Professional Services", hsn_sac_range: "9981-9983" },
        { name: "Education & Healthcare Services", hsn_sac_range: "9984-9985" },
        { name: "Entertainment & Events", hsn_sac_range: "9996-9999" },
    ],
    "Construction & Materials": [
        { name: "Cement & Concrete", hsn_sac_range: "2523-6810" },
        { name: "Steel & Metals", hsn_sac_range: "7200-7600" },
        { name: "Electrical & Plumbing", hsn_sac_range: "8535-8544" },
        { name: "Wood & Boards", hsn_sac_range: "4400-4420" },
    ],
    "Agriculture & Farming": [
        { name: "Live Animals & Plants", hsn_sac_range: "0100-0602" },
        { name: "Fertilizers & Chemicals", hsn_sac_range: "3100-3808" },
        { name: "Farm Machinery", hsn_sac_range: "8432-8436" },
    ],
};

module.exports = { CATEGORIES, SUB_CATEGORIES };
