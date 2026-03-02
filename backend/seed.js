const bcrypt = require("bcryptjs");
const { sequelize, User, Category, GstRate } = require("./models");
const path = require("path");
const fs = require("fs");

// Ensure data directory exists
const dataDir = path.join(__dirname, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

// ── Import modular data ───────────────────────────────────
const { CATEGORIES, SUB_CATEGORIES } = require("./data/categories");
const gstFoodAgri = require("./data/gst_food_agri");
const gstTextileElecHealth = require("./data/gst_textile_elec_health");
const gstAutoLuxury = require("./data/gst_auto_luxury");
const gstServicesConstEdu = require("./data/gst_services_construction_edu");
const gstAdditional = require("./data/gst_additional");

// Merge all GST items
const GST_ITEMS = [
    ...gstFoodAgri,
    ...gstTextileElecHealth,
    ...gstAutoLuxury,
    ...gstServicesConstEdu,
    ...gstAdditional,
];

async function seed() {
    try {
        console.log("Syncing database...");
        await sequelize.sync({ force: true });

        // ── Create main categories ───────────────────────────
        console.log("Creating categories...");
        const categoryMap = {};
        for (const cat of CATEGORIES) {
            const created = await Category.create(cat);
            categoryMap[cat.name] = created.id;
        }
        console.log(`  ✓ Created ${CATEGORIES.length} main categories`);

        // ── Create sub-categories using parent_id ────────────
        let subCatCount = 0;
        for (const [parentName, children] of Object.entries(SUB_CATEGORIES)) {
            const parentId = categoryMap[parentName];
            if (!parentId) {
                console.warn(`  ⚠ Parent category "${parentName}" not found, skipping sub-categories`);
                continue;
            }
            for (const sub of children) {
                const created = await Category.create({
                    ...sub,
                    parent_id: parentId,
                });
                // Also register in categoryMap for potential use
                categoryMap[sub.name] = created.id;
                subCatCount++;
            }
        }
        console.log(`  ✓ Created ${subCatCount} sub-categories`);

        // ── Create default admin user ────────────────────────
        console.log("Creating users...");
        const adminHash = await bcrypt.hash("admin123", 12);
        await User.create({
            email: "admin@gstguru.in",
            password_hash: adminHash,
            name: "System Administrator",
            role: "admin",
            business_name: "GST Guru",
        });

        const bizHash = await bcrypt.hash("business123", 12);
        await User.create({
            email: "demo@business.in",
            password_hash: bizHash,
            name: "Demo Business User",
            role: "business",
            business_name: "Demo Enterprises",
            gstin: "27AADCB2230M1Z3",
        });
        console.log("  ✓ Created admin (admin@gstguru.in / admin123) and demo user (demo@business.in / business123)");

        // ── Seed GST rates ───────────────────────────────────
        console.log("Seeding GST rates...");
        const categoryBreakdown = {};
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
                is_rcm: item.is_rcm || false,
                price_slabs_json: item.price_slabs || null,
                applicability_json: item.applicability || null,
            });
            count++;

            // Track breakdown
            categoryBreakdown[item.category] = (categoryBreakdown[item.category] || 0) + 1;
        }

        // ── Summary ──────────────────────────────────────────
        console.log(`\n${"═".repeat(50)}`);
        console.log(`  DATABASE SEEDED SUCCESSFULLY`);
        console.log(`${"═".repeat(50)}`);
        console.log(`  Total GST items: ${count}`);
        console.log(`  Main categories: ${CATEGORIES.length}`);
        console.log(`  Sub-categories:  ${subCatCount}`);
        console.log(`\n  Breakdown by category:`);
        for (const [cat, num] of Object.entries(categoryBreakdown).sort((a, b) => b[1] - a[1])) {
            console.log(`    ${cat.padEnd(28)} ${num} items`);
        }
        console.log(`${"═".repeat(50)}\n`);

        process.exit(0);
    } catch (err) {
        console.error("Seed error:", err);
        process.exit(1);
    }
}

seed();
