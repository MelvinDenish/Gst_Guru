const { sequelize, User, Invoice, Expense, Party, GstReturn } = require("./models");
const bcrypt = require("bcryptjs"); // Note: password_hash uses bcrypt. We'll use a simple password for testing.

async function seed() {
    await sequelize.sync({ force: true }); // Reset DB for clean mock data

    console.log("Database reset. Seeding 4 personas...");

    const password_hash = await bcrypt.hash("password123", 10);

    // Persona 1: Small Retail Shop Owner (B2C heavy, minimal ITC)
    const user1 = await User.create({
        name: "Rahul Sharma (Retail Shop)",
        email: "retail@example.com",
        password_hash,
        role: "user"
    });

    // Persona 2: Freelance Software Dev (B2B, Export, Reverse Charge)
    const user2 = await User.create({
        name: "Sneha Patel (Freelance Dev)",
        email: "freelance@example.com",
        password_hash,
        role: "user"
    });

    // Persona 3: Manufacturer (High ITC, Complex Rates, E-Way bills)
    const user3 = await User.create({
        name: "Amit Singh (Manufacturing)",
        email: "manufacturer@example.com",
        password_hash,
        role: "user"
    });

    // Persona 4: Restaurant Owner (Composition Scheme / Mixed Rates)
    const user4 = await User.create({
        name: "Karan Johar (Restaurant)",
        email: "restaurant@example.com",
        password_hash,
        role: "user"
    });

    console.log("Created 4 users.");

    // --- SEED USER 1 (Retail) ---
    await Party.bulkCreate([
        { user_id: user1.id, name: "Local Wholesaler", type: "vendor", gstin: "27AAAAA0000A1Z5", phone: "9876543210" },
        { user_id: user1.id, name: "Walk-in Customer", type: "customer", phone: "" } // B2C
    ]);

    await Invoice.bulkCreate([
        {
            user_id: user1.id, invoice_number: "INV-R-001", invoice_type: "sale", buyer_name: "Walk-in Customer",
            invoice_date: "2026-03-01", subtotal: 500, cgst: 22.5, sgst: 22.5, igst: 0, cess: 0, total: 545,
            payment_status: "paid", items_json: [{ description: "Groceries", quantity: 1, price: 500, gst_rate: 9 }]
        },
        {
            user_id: user1.id, invoice_number: "INV-R-002", invoice_type: "sale", buyer_name: "Ramesh (B2C)",
            invoice_date: "2026-03-05", subtotal: 1200, cgst: 72, sgst: 72, igst: 0, cess: 0, total: 1344,
            payment_status: "paid", items_json: [{ description: "Household Items", quantity: 1, price: 1200, gst_rate: 12 }]
        }
    ]);

    await Expense.bulkCreate([
        { user_id: user1.id, vendor_name: "Local Wholesaler", category: "Inventory", amount: 10000, gst_paid: 1800, date: "2026-03-02", eligible_itc: true },
        { user_id: user1.id, vendor_name: "Electricity Board", category: "Utilities", amount: 2000, gst_paid: 0, date: "2026-03-10", eligible_itc: false }
    ]);


    // --- SEED USER 2 (Freelance) ---
    await Party.bulkCreate([
        { user_id: user2.id, name: "US Tech Corp", type: "customer", address: "New York, USA", email: "payment@ustech.com" },
        { user_id: user2.id, name: "Co-working Space", type: "vendor", gstin: "29BBBBB1111B2Z6" }
    ]);

    await Invoice.bulkCreate([
        {
            user_id: user2.id, invoice_number: "INV-F-101", invoice_type: "sale", buyer_name: "US Tech Corp",
            invoice_date: "2026-03-15", subtotal: 150000, cgst: 0, sgst: 0, igst: 0, cess: 0, total: 150000, // Export (LUT)
            payment_status: "partial", items_json: [{ description: "Software Development Services", quantity: 1, price: 150000, gst_rate: 0 }],
            notes: "Export of services without payment of IGST under LUT"
        }
    ]);

    await Expense.bulkCreate([
        { user_id: user2.id, vendor_name: "Co-working Space", category: "Rent", amount: 8000, gst_paid: 1440, date: "2026-03-01", eligible_itc: true },
        { user_id: user2.id, vendor_name: "AWS Cloud", category: "Software", amount: 5000, gst_paid: 900, date: "2026-03-05", eligible_itc: true }
    ]);


    // --- SEED USER 3 (Manufacturer) ---
    await Party.bulkCreate([
        { user_id: user3.id, name: "Raw Material Supplier", type: "vendor", gstin: "24CCCCC2222C3Z7" },
        { user_id: user3.id, name: "Distributor Network Private Ltd", type: "customer", gstin: "27DDDDD3333D4Z8" }
    ]);

    // B2B Sales
    await Invoice.bulkCreate([
        {
            user_id: user3.id, invoice_number: "MFG-2026-001", invoice_type: "sale", buyer_name: "Distributor Network Private Ltd", buyer_gstin: "27DDDDD3333D4Z8",
            invoice_date: "2026-03-10", subtotal: 500000, cgst: 45000, sgst: 45000, igst: 0, cess: 0, total: 590000,
            payment_status: "unpaid", items_json: [
                { description: "Finished Goods A", quantity: 100, price: 2000, gst_rate: 18 },
                { description: "Finished Goods B", quantity: 50, price: 6000, gst_rate: 18 }
            ]
        }
    ]);

    await Expense.bulkCreate([
        { user_id: user3.id, vendor_name: "Raw Material Supplier", vendor_gstin: "24CCCCC2222C3Z7", category: "Raw Materials", amount: 200000, gst_paid: 36000, date: "2026-03-05", eligible_itc: true },
        { user_id: user3.id, vendor_name: "Logistics Co", category: "Transport", amount: 15000, gst_paid: 750, date: "2026-03-11", eligible_itc: true }
    ]);

    await GstReturn.create({
        user_id: user3.id, return_type: "GSTR-1", period_month: 2, period_year: 2026, status: "filed",
        data: { "b2b_sales": 850000 }
    });

    // --- SEED USER 4 (Restaurant) ---
    await Invoice.bulkCreate([
        {
            user_id: user4.id, invoice_number: "REST-001", invoice_type: "sale", buyer_name: "Dine-in Cust 1",
            invoice_date: "2026-03-12", subtotal: 1500, cgst: 37.5, sgst: 37.5, igst: 0, cess: 0, total: 1575,
            payment_status: "paid", items_json: [{ description: "Food & Beverage", quantity: 1, price: 1500, gst_rate: 5 }]
        }
    ]);

    await Expense.bulkCreate([
        { user_id: user4.id, vendor_name: "Vegetable Vendor", category: "Inventory", amount: 5000, gst_paid: 0, date: "2026-03-02", eligible_itc: false }
    ]);


    console.log("Seeding complete! You can log in with:");
    console.log("1. retail@example.com (password123)");
    console.log("2. freelance@example.com (password123)");
    console.log("3. manufacturer@example.com (password123)");
    console.log("4. restaurant@example.com (password123)");
    process.exit();
}

seed().catch(err => {
    console.error("Seed error:", err);
    process.exit(1);
});
