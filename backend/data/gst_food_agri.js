// Food & Essentials + Agriculture & Farming GST Items
module.exports = [
    // ═══════════════════════════════════════════════════════════
    // FOOD & ESSENTIALS — 0% (Nil Rated / Exempt)
    // ═══════════════════════════════════════════════════════════
    // Fresh Produce & Grains (unbranded, loose)
    { hsn: "1001", name: "Wheat (Loose/Unbranded)", category: "Food & Essentials", rate: 0, desc: "Wheat grains, unprocessed, sold loose" },
    { hsn: "1006", name: "Rice (Loose/Unbranded)", category: "Food & Essentials", rate: 0, desc: "Rice in husk (paddy or rough), loose" },
    { hsn: "1006A", name: "Rice (Pre-packed ≤25kg)", category: "Food & Essentials", rate: 5, desc: "Pre-packed & labelled rice up to 25kg — per 2022 amendment" },
    { hsn: "1005", name: "Maize / Corn (Loose)", category: "Food & Essentials", rate: 0, desc: "Maize, fresh or dried, loose" },
    { hsn: "1008", name: "Millets (Ragi, Bajra, Jowar)", category: "Food & Essentials", rate: 0, desc: "Ragi, bajra, jowar, other millets, loose" },
    { hsn: "1008A", name: "Millets (Pre-packed)", category: "Food & Essentials", rate: 5, desc: "Pre-packed & labelled millets — per 2022 amendment" },
    { hsn: "0713", name: "Pulses — Toor Dal (Loose)", category: "Food & Essentials", rate: 0, desc: "Arhar/toor dal, dried, unbranded loose" },
    { hsn: "0713A", name: "Pulses — Moong Dal (Loose)", category: "Food & Essentials", rate: 0, desc: "Moong dal, dried, unbranded loose" },
    { hsn: "0713B", name: "Pulses — Chana Dal (Loose)", category: "Food & Essentials", rate: 0, desc: "Chana dal, dried, unbranded loose" },
    { hsn: "0713C", name: "Pulses — Urad Dal (Loose)", category: "Food & Essentials", rate: 0, desc: "Urad dal, dried, unbranded loose" },
    { hsn: "0713D", name: "Pulses — Masoor Dal (Loose)", category: "Food & Essentials", rate: 0, desc: "Masoor dal, dried, unbranded loose" },
    { hsn: "0713P", name: "Pulses (Pre-packed/Branded)", category: "Food & Essentials", rate: 5, desc: "Any pre-packed & labelled pulses — per 2022 amendment" },
    // Fresh Vegetables
    { hsn: "0701", name: "Potatoes (Fresh)", category: "Food & Essentials", rate: 0, desc: "Potatoes, fresh or chilled" },
    { hsn: "0702", name: "Tomatoes (Fresh)", category: "Food & Essentials", rate: 0, desc: "Tomatoes, fresh or chilled" },
    { hsn: "0703", name: "Onions (Fresh)", category: "Food & Essentials", rate: 0, desc: "Onions, shallots, leeks, garlic, fresh" },
    { hsn: "0704", name: "Cauliflower & Broccoli", category: "Food & Essentials", rate: 0, desc: "Cabbages, cauliflowers, broccoli, fresh" },
    { hsn: "0705", name: "Lettuce & Salad Greens", category: "Food & Essentials", rate: 0, desc: "Lettuce, chicory, fresh" },
    { hsn: "0706", name: "Carrots & Turnips", category: "Food & Essentials", rate: 0, desc: "Carrots, turnips, beetroot, radish, fresh" },
    { hsn: "0707", name: "Cucumbers & Gherkins", category: "Food & Essentials", rate: 0, desc: "Cucumbers, fresh" },
    { hsn: "0708", name: "Peas & Beans (Fresh)", category: "Food & Essentials", rate: 0, desc: "Fresh peas, French beans" },
    { hsn: "0709", name: "Other Fresh Vegetables", category: "Food & Essentials", rate: 0, desc: "Okra, spinach, bitter gourd, other vegetables" },
    { hsn: "0709A", name: "Mushrooms (Fresh)", category: "Food & Essentials", rate: 0, desc: "Fresh mushrooms" },
    { hsn: "0710", name: "Frozen Vegetables", category: "Food & Essentials", rate: 0, desc: "Vegetables frozen, uncooked" },
    // Fresh Fruits
    { hsn: "0803", name: "Bananas (Fresh)", category: "Food & Essentials", rate: 0, desc: "Bananas including plantains, fresh" },
    { hsn: "0804", name: "Dates & Figs (Fresh)", category: "Food & Essentials", rate: 0, desc: "Fresh dates, figs, pineapples" },
    { hsn: "0805", name: "Citrus Fruits", category: "Food & Essentials", rate: 0, desc: "Oranges, lemons, limes, grapefruit" },
    { hsn: "0806", name: "Grapes (Fresh)", category: "Food & Essentials", rate: 0, desc: "Grapes, fresh" },
    { hsn: "0807", name: "Melons & Papaya", category: "Food & Essentials", rate: 0, desc: "Watermelon, muskmelon, papaya" },
    { hsn: "0808", name: "Apples & Pears", category: "Food & Essentials", rate: 0, desc: "Apples, pears, quinces" },
    { hsn: "0809", name: "Stone Fruits", category: "Food & Essentials", rate: 0, desc: "Apricots, cherries, peaches, plums" },
    { hsn: "0810", name: "Berries & Tropical Fruits", category: "Food & Essentials", rate: 0, desc: "Strawberries, guavas, mangoes, pomegranates" },
    // Dairy — 0%
    { hsn: "0401", name: "Fresh Milk (Unpasteurised)", category: "Food & Essentials", rate: 0, desc: "Fresh milk, not concentrated or sweetened" },
    { hsn: "0403", name: "Curd / Lassi / Buttermilk (Loose)", category: "Food & Essentials", rate: 0, desc: "Curd, lassi, buttermilk — unbranded, loose" },
    { hsn: "0403P", name: "Curd / Lassi (Pre-packed)", category: "Food & Essentials", rate: 5, desc: "Curd, lassi — pre-packed & labelled — per 2022 amendment" },
    { hsn: "0406A", name: "Paneer (Loose)", category: "Food & Essentials", rate: 0, desc: "Paneer, cottage cheese — unbranded, loose" },
    { hsn: "0406P", name: "Paneer (Pre-packed)", category: "Food & Essentials", rate: 5, desc: "Paneer — pre-packed & labelled" },
    { hsn: "0407", name: "Fresh Eggs", category: "Food & Essentials", rate: 0, desc: "Birds' eggs, in shell, fresh" },
    { hsn: "0801", name: "Coconuts (Fresh)", category: "Food & Essentials", rate: 0, desc: "Fresh coconuts" },
    { hsn: "0409", name: "Natural Honey (Loose)", category: "Food & Essentials", rate: 0, desc: "Natural honey, unprocessed, loose" },
    { hsn: "0409P", name: "Natural Honey (Pre-packed)", category: "Food & Essentials", rate: 5, desc: "Natural honey — pre-packed & labelled" },
    // Spices & Condiments — 0%
    { hsn: "0904", name: "Black Pepper (Whole)", category: "Food & Essentials", rate: 0, desc: "Pepper of genus Piper, unprocessed, loose" },
    { hsn: "0905", name: "Vanilla", category: "Food & Essentials", rate: 0, desc: "Vanilla pods, fresh" },
    { hsn: "0906", name: "Cinnamon", category: "Food & Essentials", rate: 0, desc: "Cinnamon, fresh" },
    { hsn: "0907", name: "Cloves", category: "Food & Essentials", rate: 0, desc: "Cloves, fresh" },
    { hsn: "0908", name: "Nutmeg & Cardamom", category: "Food & Essentials", rate: 0, desc: "Nutmeg, cardamom, fresh" },
    { hsn: "0910", name: "Ginger & Turmeric (Fresh)", category: "Food & Essentials", rate: 0, desc: "Ginger, saffron, turmeric, fresh" },
    // Other 0% essentials
    { hsn: "1101", name: "Wheat Flour / Atta (Loose)", category: "Food & Essentials", rate: 0, desc: "Wheat flour, unbranded loose" },
    { hsn: "1101P", name: "Wheat Flour / Atta (Pre-packed)", category: "Food & Essentials", rate: 5, desc: "Wheat flour — pre-packed & labelled" },
    { hsn: "1901", name: "Puffed Rice / Flattened Rice", category: "Food & Essentials", rate: 0, desc: "Murmure, poha, chura, unbranded" },
    { hsn: "1201", name: "Soya Beans", category: "Food & Essentials", rate: 0, desc: "Soya beans, broken or not" },
    { hsn: "2201", name: "Drinking Water (≥20L)", category: "Food & Essentials", rate: 0, desc: "Drinking water packed ≥20L bulk" },
    { hsn: "0504", name: "Common Salt (Loose)", category: "Food & Essentials", rate: 0, desc: "Common salt / rock salt, loose" },
    { hsn: "0504P", name: "Common Salt (Branded/Iodised)", category: "Food & Essentials", rate: 5, desc: "Branded/iodised salt, pre-packed" },
    { hsn: "1209", name: "Seeds for Sowing", category: "Food & Essentials", rate: 0, desc: "Seeds, fruit and spores for sowing" },

    // ═══════════════════════════════════════════════════════════
    // FOOD & ESSENTIALS — 5%
    // ═══════════════════════════════════════════════════════════
    { hsn: "0402", name: "Milk Powder / Condensed Milk", category: "Food & Essentials", rate: 5, desc: "Milk in powder, granules; condensed milk" },
    { hsn: "0405", name: "Ghee (Loose/Unbranded)", category: "Food & Essentials", rate: 0, desc: "Ghee — unbranded, loose" },
    { hsn: "0405P", name: "Ghee (Pre-packed/Branded)", category: "Food & Essentials", rate: 5, desc: "Ghee — pre-packed & labelled" },
    { hsn: "0901", name: "Coffee Beans (Unroasted)", category: "Food & Essentials", rate: 5, desc: "Coffee beans, not roasted, not decaffeinated" },
    { hsn: "0902", name: "Tea Leaves (All types)", category: "Food & Essentials", rate: 5, desc: "Green tea, black tea, whether or not flavoured" },
    { hsn: "1701", name: "Cane/Beet Sugar", category: "Food & Essentials", rate: 5, desc: "Cane or beet sugar, solid form" },
    { hsn: "1702", name: "Jaggery (Gur/Shakkar)", category: "Food & Essentials", rate: 5, desc: "Jaggery of all types including cane jaggery" },
    { hsn: "1905A", name: "Bread (Plain, Not Frozen)", category: "Food & Essentials", rate: 0, desc: "Plain bread, not frozen or toasted" },
    { hsn: "1905B", name: "Rusk & Toast", category: "Food & Essentials", rate: 5, desc: "Rusks, toasted bread" },
    { hsn: "0306", name: "Fish — Frozen/Dried", category: "Food & Essentials", rate: 5, desc: "Fish frozen, dried, salted or in brine" },
    { hsn: "0302", name: "Fish — Fresh/Chilled", category: "Food & Essentials", rate: 0, desc: "Fish, fresh or chilled (excluding fillets)" },
    { hsn: "0201", name: "Meat — Fresh/Chilled", category: "Food & Essentials", rate: 0, desc: "Meat of bovine animals, fresh or chilled" },
    { hsn: "0202", name: "Meat — Frozen", category: "Food & Essentials", rate: 0, desc: "Meat of bovine animals, frozen" },
    { hsn: "0207", name: "Poultry Meat (Fresh)", category: "Food & Essentials", rate: 0, desc: "Fresh chicken, turkey meat" },
    { hsn: "0210", name: "Meat — Salted/Smoked", category: "Food & Essentials", rate: 5, desc: "Meat salted, smoked, dried" },
    // Edible Oils — 5%
    { hsn: "1507", name: "Soybean Oil", category: "Food & Essentials", rate: 5, desc: "Soya-bean oil, crude or refined" },
    { hsn: "1508", name: "Groundnut Oil", category: "Food & Essentials", rate: 5, desc: "Ground-nut oil, crude or refined" },
    { hsn: "1509", name: "Olive Oil", category: "Food & Essentials", rate: 5, desc: "Olive oil, virgin or refined" },
    { hsn: "1510", name: "Sesame / Til Oil", category: "Food & Essentials", rate: 5, desc: "Sesame (gingelly) oil" },
    { hsn: "1512", name: "Sunflower Oil", category: "Food & Essentials", rate: 5, desc: "Sunflower-seed oil, safflower oil" },
    { hsn: "1513", name: "Coconut Oil", category: "Food & Essentials", rate: 5, desc: "Coconut (copra) oil, crude or refined" },
    { hsn: "1514", name: "Rapeseed / Canola Oil", category: "Food & Essentials", rate: 5, desc: "Rape, colza, or mustard oil" },
    { hsn: "1515", name: "Mustard Oil", category: "Food & Essentials", rate: 5, desc: "Mustard oil, fixed vegetable fats" },
    { hsn: "1516", name: "Vanaspati / Hydrogenated Oil", category: "Food & Essentials", rate: 5, desc: "Hydrogenated vegetable fats" },
    // Nuts & Dry Fruits — 5% raw
    { hsn: "0801A", name: "Cashew Nuts (Raw, In Shell)", category: "Food & Essentials", rate: 5, desc: "Cashew nuts, in shell" },
    { hsn: "0801B", name: "Cashew Nuts (Shelled, Roasted)", category: "Food & Essentials", rate: 12, desc: "Cashew kernels, roasted/salted" },
    { hsn: "0802A", name: "Almonds (In Shell)", category: "Food & Essentials", rate: 5, desc: "Almonds, in shell" },
    { hsn: "0802B", name: "Almonds (Shelled/Processed)", category: "Food & Essentials", rate: 12, desc: "Almonds, shelled or processed" },
    { hsn: "0802C", name: "Walnuts", category: "Food & Essentials", rate: 5, desc: "Walnuts, in shell" },
    { hsn: "0802D", name: "Pistachios", category: "Food & Essentials", rate: 5, desc: "Pistachios, fresh or dried" },
    { hsn: "0813", name: "Dried Fruits (Raisins, Figs)", category: "Food & Essentials", rate: 5, desc: "Dried apricots, prunes, raisins, figs" },
    // Flour & Cereals
    { hsn: "1102", name: "Maize / Corn Flour", category: "Food & Essentials", rate: 5, desc: "Maize (corn) flour" },
    { hsn: "1103", name: "Cereal Groats & Semolina", category: "Food & Essentials", rate: 5, desc: "Sooji (semolina), cereal groats, meal" },
    { hsn: "1104", name: "Rolled/Flaked Oats", category: "Food & Essentials", rate: 5, desc: "Cereal grains rolled, flaked, or pearled" },
    { hsn: "0904P", name: "Black Pepper (Powdered/Packed)", category: "Food & Essentials", rate: 5, desc: "Pepper, crushed or ground, packed" },
    { hsn: "0910P", name: "Turmeric Powder (Packed)", category: "Food & Essentials", rate: 5, desc: "Turmeric powder, pre-packed" },
    { hsn: "2201A", name: "Packaged Drinking Water (<20L)", category: "Food & Essentials", rate: 18, desc: "Packaged drinking water, bottles <20L" },

    // ═══════════════════════════════════════════════════════════
    // FOOD & ESSENTIALS — 12%
    // ═══════════════════════════════════════════════════════════
    { hsn: "0405A", name: "Butter", category: "Food & Essentials", rate: 12, desc: "Butter and other fats derived from milk" },
    { hsn: "0406", name: "Cheese & Processed Cheese", category: "Food & Essentials", rate: 12, desc: "Cheese, curd, processed cheese" },
    { hsn: "1704", name: "Sugar Confectionery", category: "Food & Essentials", rate: 12, desc: "Candies, toffees, lozenges (not chocolate)" },
    { hsn: "2009", name: "Fruit Juices (Packaged)", category: "Food & Essentials", rate: 12, desc: "Packaged fruit/vegetable juices, unfermented" },
    { hsn: "1902", name: "Pasta & Noodles (Uncooked)", category: "Food & Essentials", rate: 12, desc: "Pasta, noodles, couscous, uncooked" },
    { hsn: "1902A", name: "Instant Noodles (Ready-to-eat)", category: "Food & Essentials", rate: 18, desc: "Instant noodles, ready-to-eat preparations" },
    { hsn: "1905C", name: "Biscuits (≤₹100/kg sale price)", category: "Food & Essentials", rate: 5, desc: "Biscuits, plain, max retail price ≤₹100/kg" },
    { hsn: "1905D", name: "Biscuits (>₹100/kg)", category: "Food & Essentials", rate: 18, desc: "Biscuits, premium/chocolate coated >₹100/kg" },
    { hsn: "1905E", name: "Cake & Pastry", category: "Food & Essentials", rate: 18, desc: "Cakes, pastries, waffles" },
    { hsn: "1905F", name: "Pizza Bread / Burger Buns", category: "Food & Essentials", rate: 5, desc: "Pizza bread base, burger buns" },
    { hsn: "2004", name: "Frozen Ready-to-Eat Items", category: "Food & Essentials", rate: 12, desc: "Frozen vegetables prepared, french fries" },
    { hsn: "2005", name: "Pickles & Chutneys", category: "Food & Essentials", rate: 12, desc: "Prepared pickles, mango chutney" },
    { hsn: "2106", name: "Dry Fruits (Flavoured/Processed)", category: "Food & Essentials", rate: 12, desc: "Processed, flavoured dry fruits & mixes" },
    { hsn: "2106A", name: "Protein Powders & Supplements", category: "Food & Essentials", rate: 18, desc: "Food supplements, protein powder" },

    // ═══════════════════════════════════════════════════════════
    // FOOD & ESSENTIALS — 18%
    // ═══════════════════════════════════════════════════════════
    { hsn: "2101", name: "Instant Coffee / Tea Extracts", category: "Food & Essentials", rate: 18, desc: "Coffee extracts, instant coffee, tea preparations" },
    { hsn: "2103", name: "Sauces, Ketchup & Condiments", category: "Food & Essentials", rate: 18, desc: "Soy sauce, tomato ketchup, mustard, sauces" },
    { hsn: "2104", name: "Soups & Broths", category: "Food & Essentials", rate: 18, desc: "Soups, broths, preparations thereof" },
    { hsn: "2105", name: "Ice Cream", category: "Food & Essentials", rate: 18, desc: "Ice cream and other edible ice" },
    { hsn: "1806", name: "Chocolate & Cocoa Preparations", category: "Food & Essentials", rate: 18, desc: "Chocolate in all forms, cocoa preparations" },
    { hsn: "1806A", name: "Cocoa Powder (Unsweetened)", category: "Food & Essentials", rate: 18, desc: "Cocoa powder, not containing sugar" },
    { hsn: "2106B", name: "Namkeen / Savoury Snacks", category: "Food & Essentials", rate: 12, desc: "Namkeen, bhujia, mixture" },
    { hsn: "2106C", name: "Chips & Extruded Snacks", category: "Food & Essentials", rate: 12, desc: "Potato chips, corn puffs, kurkure" },
    { hsn: "1704A", name: "Chewing Gum", category: "Food & Essentials", rate: 18, desc: "Chewing gum, sugar-coated or not" },
    { hsn: "2202A", name: "Flavoured Milk Drinks", category: "Food & Essentials", rate: 12, desc: "Flavoured milk, milkshakes" },
    { hsn: "2202B", name: "Fruit Drinks / Squashes", category: "Food & Essentials", rate: 12, desc: "Fruit-based drinks, squashes, syrups" },
    { hsn: "2202C", name: "Energy / Sports Drinks", category: "Food & Essentials", rate: 28, desc: "Caffeinated/energy/sports beverages", applicability: { type: "cess_beverage", cess_rate: 12, note: "12% cess in addition to 28% GST" } },
    { hsn: "2201B", name: "Mineral / Soda Water", category: "Food & Essentials", rate: 18, desc: "Mineral water, soda water, aerated" },

    // ═══════════════════════════════════════════════════════════
    // FOOD & ESSENTIALS — 28%
    // ═══════════════════════════════════════════════════════════
    {
        hsn: "2402", name: "Cigars & Cigarettes", category: "Food & Essentials", rate: 28, desc: "Cigars, cheroots, cigarettes", applicability: {
            type: "tobacco", variants: [
                { label: "Filter cigarette ≤65mm", cess: 5, cess_type: "percent + ₹specific", specific: "₹440 per 1000" },
                { label: "Filter cigarette 65-70mm", cess: 5, cess_type: "percent + ₹specific", specific: "₹690 per 1000" },
                { label: "Filter cigarette 70-75mm", cess: 5, cess_type: "percent + ₹specific", specific: "₹750 per 1000" },
                { label: "Filter cigarette >75mm", cess: 36, cess_type: "percent + ₹specific", specific: "₹900 per 1000" },
                { label: "Non-filter cigarette ≤65mm", cess: 5, cess_type: "percent + ₹specific", specific: "₹440 per 1000" },
                { label: "Non-filter cigarette >65mm", cess: 5, cess_type: "percent + ₹specific", specific: "₹535 per 1000" },
                { label: "Cigar / Cheroot", cess: 21, cess_type: "percent_or_specific", specific: "₹4170 per 1000" }
            ]
        }
    },
    {
        hsn: "2403", name: "Chewing Tobacco / Pan Masala", category: "Food & Essentials", rate: 28, desc: "Manufactured chewing tobacco, pan masala with tobacco", applicability: {
            type: "tobacco", variants: [
                { label: "Pan Masala (without tobacco)", cess: 0 },
                { label: "Pan Masala (with tobacco — Gutkha)", cess: "160% or ₹69/unit", cess_type: "ad_valorem" },
                { label: "Chewing tobacco (branded)", cess: "50% + specific", cess_type: "ad_valorem" }
            ]
        }
    },
    { hsn: "2403A", name: "Hookah / Smoking Tobacco", category: "Food & Essentials", rate: 28, desc: "Hookah tobacco, smoking mixtures", cess: 290 },
    { hsn: "2204", name: "Aerated Beverages / Cola", category: "Food & Essentials", rate: 28, desc: "Carbonated beverages with added sugar", applicability: { type: "cess_beverage", cess_rate: 12, note: "12% compensation cess on aerated drinks" } },

    // ═══════════════════════════════════════════════════════════
    // AGRICULTURE & FARMING — 0%
    // ═══════════════════════════════════════════════════════════
    { hsn: "0101", name: "Live Horses & Donkeys", category: "Agriculture & Farming", rate: 0, desc: "Live horses, asses, mules, hinnies" },
    { hsn: "0102", name: "Live Cattle", category: "Agriculture & Farming", rate: 0, desc: "Live bovine animals" },
    { hsn: "0103", name: "Live Swine", category: "Agriculture & Farming", rate: 0, desc: "Live pigs" },
    { hsn: "0104", name: "Live Sheep & Goats", category: "Agriculture & Farming", rate: 0, desc: "Live sheep and goats" },
    { hsn: "0105", name: "Live Poultry", category: "Agriculture & Farming", rate: 0, desc: "Live chickens, ducks, geese, turkeys" },
    { hsn: "0301", name: "Live Fish", category: "Agriculture & Farming", rate: 0, desc: "Live ornamental fish and seed/fry for aquaculture" },
    { hsn: "0602", name: "Live Plants & Saplings", category: "Agriculture & Farming", rate: 0, desc: "Plants, seeds, saplings for planting" },
    { hsn: "3101", name: "Organic Fertilizers (Compost)", category: "Agriculture & Farming", rate: 0, desc: "Animal/vegetable fertilisers, compost, vermicompost" },
    { hsn: "2302", name: "Cattle Feed / Animal Feed", category: "Agriculture & Farming", rate: 0, desc: "Bran, sharps, residues — animal feed" },
    { hsn: "2304", name: "Oil Cake (Cattle Feed)", category: "Agriculture & Farming", rate: 0, desc: "Oil-cake and soya-bean for animal feed" },
    { hsn: "2309", name: "Poultry / Aquatic Feed", category: "Agriculture & Farming", rate: 0, desc: "Preparations for animal/poultry/aquatic feed" },
    // Agriculture — 5%
    { hsn: "3102", name: "Urea Fertilizer", category: "Agriculture & Farming", rate: 5, desc: "Nitrogenous fertilisers — urea, ammonium" },
    { hsn: "3103", name: "Phosphatic Fertilizers", category: "Agriculture & Farming", rate: 5, desc: "Phosphatic fertilisers — DAP, SSP, TSP" },
    { hsn: "3104", name: "Potassic Fertilizers (MOP)", category: "Agriculture & Farming", rate: 5, desc: "Muriate of potash, potassic fertilisers" },
    { hsn: "3105", name: "NPK / Complex Fertilizers", category: "Agriculture & Farming", rate: 5, desc: "NPK complex fertilisers" },
    { hsn: "5201", name: "Raw Cotton (Not carded)", category: "Agriculture & Farming", rate: 5, desc: "Cotton, not carded or combed", is_rcm: true },
    { hsn: "5101", name: "Raw Wool", category: "Agriculture & Farming", rate: 5, desc: "Wool, not carded or combed" },
    { hsn: "0711", name: "Dried Vegetables", category: "Agriculture & Farming", rate: 5, desc: "Vegetables provisionally preserved, dried" },
    { hsn: "1301", name: "Lac / Natural Gums", category: "Agriculture & Farming", rate: 5, desc: "Lac, natural gums, resins" },
    // Agriculture — 12%
    { hsn: "8432", name: "Ploughs & Harrows", category: "Agriculture & Farming", rate: 12, desc: "Agricultural ploughs, harrows, cultivators" },
    { hsn: "8433", name: "Harvesting & Threshing Machines", category: "Agriculture & Farming", rate: 12, desc: "Harvesting, threshing machinery" },
    { hsn: "8434", name: "Milking Machines", category: "Agriculture & Farming", rate: 12, desc: "Milking machines, dairy machinery" },
    { hsn: "8436", name: "Poultry Equipment", category: "Agriculture & Farming", rate: 12, desc: "Poultry incubators, brooders" },
    { hsn: "8436A", name: "Animal Husbandry Equipment", category: "Agriculture & Farming", rate: 12, desc: "Other agricultural, forestry equipment" },
    { hsn: "8701", name: "Tractors (Agricultural)", category: "Agriculture & Farming", rate: 12, desc: "Tractors for agricultural use" },
    { hsn: "8424", name: "Sprayers / Sprinklers (Manual)", category: "Agriculture & Farming", rate: 12, desc: "Manual sprayers, sprinklers for agriculture" },
    { hsn: "8424A", name: "Drip Irrigation Systems", category: "Agriculture & Farming", rate: 12, desc: "Drip irrigation pipes, emitters, filters" },
    { hsn: "8413", name: "Water Pumps (Agriculture)", category: "Agriculture & Farming", rate: 12, desc: "Centrifugal pumps for farm irrigation" },
    // Agriculture — 18%
    { hsn: "3808", name: "Insecticides & Pesticides", category: "Agriculture & Farming", rate: 18, desc: "Insecticides, fungicides, herbicides, weedicides" },
    { hsn: "3808A", name: "Bio-pesticides", category: "Agriculture & Farming", rate: 12, desc: "Bio-pesticides, neem-based products for agriculture" },
    { hsn: "8437", name: "Rice Milling Machinery", category: "Agriculture & Farming", rate: 18, desc: "Rice hulling, milling, polishing machines" },
    { hsn: "8438", name: "Food Processing Machinery", category: "Agriculture & Farming", rate: 18, desc: "Bakery, confectionery, sugar manufacturing equipment" },
];
