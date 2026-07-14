/**
 * WEM OS seed script
 * ------------------
 * Populates the database with a realistic demo dataset:
 *   4 users · 2 warehouses · ~150 products · 30 customers
 *   20 quotes · 40 sales orders · 15 missing product requests
 *
 * Deterministic: faker is seeded, so every run produces the same data.
 * Run with `npm run db:seed` (or automatically via `prisma migrate reset`).
 *
 * Demo logins (password for all: wemos1234)
 *   owner@wem.ph      OWNER
 *   manager@wem.ph    MANAGER
 *   sales@wem.ph      SALES
 *   warehouse@wem.ph  WAREHOUSE
 */

import { faker } from "@faker-js/faker";
import {
  MissingProductStatus,
  PriceLevel,
  PrismaClient,
  ProductStatus,
  QuoteStatus,
  SalesOrderStatus,
} from "@prisma/client";
import { hashPassword } from "better-auth/crypto";
import { randomUUID } from "node:crypto";

const prisma = new PrismaClient();
faker.seed(1337);

const PASSWORD = "wemos1234";
const TAX_RATE = 0.12;

const round = (value: number) => Math.round(value * 100) / 100;

function computeTotals(
  items: { quantity: number; unitPrice: number }[],
  discount: number,
) {
  const subtotal = round(
    items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0),
  );
  const cappedDiscount = Math.min(round(discount), subtotal);
  const taxable = subtotal - cappedDiscount;
  const tax = round(taxable * TAX_RATE);
  const total = round(taxable + tax);
  return { subtotal, discount: cappedDiscount, tax, total };
}

function pastDate(maxDaysAgo: number) {
  return faker.date.recent({ days: maxDaysAgo });
}

// ── Catalog source data ──────────────────────────────────────────────────────

type CategorySeed = {
  name: string;
  prefix: string;
  group: "water" | "electric" | "more";
  nouns: string[];
};

const CATEGORY_SEEDS: CategorySeed[] = [
  // Water
  { name: "Pumps", prefix: "WTR-PMP", group: "water", nouns: ["Jet Pump", "Submersible Pump", "Booster Pump", "Peripheral Pump", "Centrifugal Pump"] },
  { name: "Pipes & Fittings", prefix: "WTR-PIP", group: "water", nouns: ["PVC Pipe", "PPR Pipe", "Elbow Fitting", "Tee Fitting", "Coupling", "Union Fitting"] },
  { name: "Valves", prefix: "WTR-VLV", group: "water", nouns: ["Gate Valve", "Ball Valve", "Check Valve", "Float Valve", "Angle Valve"] },
  { name: "Water Tanks", prefix: "WTR-TNK", group: "water", nouns: ["Vertical Tank", "Horizontal Tank", "Pressure Tank", "Slim Tank"] },
  { name: "Filtration", prefix: "WTR-FIL", group: "water", nouns: ["Sediment Filter", "Carbon Filter", "Filter Housing", "UV Sterilizer", "RO Membrane"] },
  { name: "Faucets & Showers", prefix: "WTR-FCT", group: "water", nouns: ["Kitchen Faucet", "Lavatory Faucet", "Shower Head", "Bidet Spray", "Hose Bib"] },
  { name: "Water Heaters", prefix: "WTR-HTR", group: "water", nouns: ["Instant Heater", "Multipoint Heater", "Storage Heater"] },
  // Electric
  { name: "Wiring & Cables", prefix: "ELC-WIR", group: "electric", nouns: ["THHN Wire", "Flexible Cord", "Royal Cord", "Flat Cord", "Armored Cable"] },
  { name: "Circuit Breakers", prefix: "ELC-BRK", group: "electric", nouns: ["Plug-in Breaker", "Bolt-on Breaker", "MCB", "Safety Breaker", "Panel Board"] },
  { name: "Lighting", prefix: "ELC-LGT", group: "electric", nouns: ["LED Bulb", "LED Tube", "Downlight", "Floodlight", "Emergency Light", "High Bay Light"] },
  { name: "Outlets & Switches", prefix: "ELC-OUT", group: "electric", nouns: ["Duplex Outlet", "Universal Outlet", "One-Gang Switch", "Three-Gang Switch", "Dimmer Switch"] },
  { name: "Conduits & Boxes", prefix: "ELC-CND", group: "electric", nouns: ["PVC Conduit", "EMT Conduit", "Junction Box", "Utility Box", "Pull Box"] },
  { name: "Electrical Tools", prefix: "ELC-TLS", group: "electric", nouns: ["Multimeter", "Wire Stripper", "Crimping Tool", "Voltage Tester", "Fish Tape"] },
  { name: "Extension & Power", prefix: "ELC-PWR", group: "electric", nouns: ["Extension Cord", "Power Strip", "AVR", "Surge Protector"] },
  // More
  { name: "Adhesives & Sealants", prefix: "GEN-ADH", group: "more", nouns: ["Solvent Cement", "Teflon Tape", "Epoxy", "Silicone Sealant", "Contact Cement"] },
  { name: "Safety Gear", prefix: "GEN-SFT", group: "more", nouns: ["Safety Helmet", "Work Gloves", "Safety Goggles", "Rubber Boots", "Safety Vest"] },
  { name: "Hardware", prefix: "GEN-HRD", group: "more", nouns: ["Machine Screw Set", "Wall Anchor", "Padlock", "Hinge", "Hose Clamp"] },
  { name: "Hand Tools", prefix: "GEN-TLS", group: "more", nouns: ["Pipe Wrench", "Adjustable Wrench", "Screwdriver Set", "Hacksaw", "Pliers"] },
  { name: "Paint & Finishing", prefix: "GEN-PNT", group: "more", nouns: ["Latex Paint", "Enamel Paint", "Paint Brush", "Roller Set", "Paint Thinner"] },
  { name: "Cleaning & Maintenance", prefix: "GEN-CLN", group: "more", nouns: ["Drain Cleaner", "Degreaser", "Rust Remover", "Lubricant Spray"] },
];

const BRAND_NAMES = [
  "AquaFlow", "HydroMax", "Voltek", "LumenPro", "PhilStrong",
  "TitanWorks", "BlueCore", "PowerLine", "SteelGrip", "EverBright",
];

const SUPPLIER_NAMES = [
  "Manila Industrial Supply Co.",
  "Cebu Hardware Distributors",
  "Pacific Trade & Logistics",
  "Luzon Electrical Wholesale",
  "Golden Gate Import Corp.",
];

const COUNTRIES = ["Philippines", "China", "Japan", "Taiwan", "Germany", "USA"];

const PH_REGIONS = [
  "Metro Manila", "Calabarzon", "Central Luzon",
  "Central Visayas", "Davao Region", "Western Visayas", "Ilocos Region",
];

const VARIANTS = [
  '1/2"', '3/4"', '1"', "1HP", "0.5HP", "2HP", "10W", "20W", "50W",
  "20A", "30A", "60A", "100L", "500L", "1000L", "3m", "10m", "Heavy Duty",
  "Slim", "Pro Series", "Standard", "Industrial",
];

// ── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("🌱 Seeding WEM OS…");

  // Clean slate (delete in dependency order)
  await prisma.activityLog.deleteMany();
  await prisma.missingProductRequest.deleteMany();
  await prisma.salesOrderItem.deleteMany();
  await prisma.salesOrder.deleteMany();
  await prisma.quoteItem.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.inventory.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.brand.deleteMany();
  await prisma.supplier.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.warehouse.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.verification.deleteMany();
  await prisma.user.deleteMany();

  // Users ─────────────────────────────────────────────────────────────────
  const passwordHash = await hashPassword(PASSWORD);
  const userSeeds = [
    { name: "Olivia Ramos", email: "owner@wem.ph", role: "OWNER" },
    { name: "Marco Dela Cruz", email: "manager@wem.ph", role: "MANAGER" },
    { name: "Sofia Santos", email: "sales@wem.ph", role: "SALES" },
    { name: "Warren Bautista", email: "warehouse@wem.ph", role: "WAREHOUSE" },
  ] as const;

  const users = [];
  for (const seed of userSeeds) {
    const user = await prisma.user.create({
      data: {
        id: randomUUID(),
        name: seed.name,
        email: seed.email,
        emailVerified: true,
        role: seed.role,
      },
    });
    await prisma.account.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        accountId: user.id,
        providerId: "credential",
        password: passwordHash,
      },
    });
    users.push(user);
  }
  const [owner, manager, sales, warehouseUser] = users;
  console.log(`  👤 ${users.length} users`);

  // Warehouses ────────────────────────────────────────────────────────────
  const mainWarehouse = await prisma.warehouse.create({
    data: {
      code: "MAIN",
      name: "Main Warehouse",
      address: "Parañaque, Metro Manila",
      isDefault: true,
    },
  });
  await prisma.warehouse.create({
    data: { code: "ANNEX", name: "Annex Warehouse", address: "Cavite", isDefault: false },
  });
  console.log("  🏭 2 warehouses");

  // Taxonomy ──────────────────────────────────────────────────────────────
  const categories = [];
  for (const seed of CATEGORY_SEEDS) {
    categories.push({
      seed,
      record: await prisma.category.create({
        data: {
          name: seed.name,
          slug: seed.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        },
      }),
    });
  }
  const brands = [];
  for (const name of BRAND_NAMES) {
    brands.push(await prisma.brand.create({ data: { name } }));
  }
  const suppliers = [];
  for (const name of SUPPLIER_NAMES) {
    suppliers.push(
      await prisma.supplier.create({
        data: {
          name,
          contactPerson: faker.person.fullName(),
          email: `orders@${name.toLowerCase().replace(/[^a-z]/g, "").slice(0, 12)}.ph`,
          phone: `+63 2 ${faker.string.numeric(4)} ${faker.string.numeric(4)}`,
          country: "Philippines",
        },
      }),
    );
  }
  console.log(
    `  🗂  ${categories.length} categories, ${brands.length} brands, ${suppliers.length} suppliers`,
  );

  // Products + inventory ──────────────────────────────────────────────────
  const PRODUCT_COUNT = 150;
  const products = [];
  const skuCounters = new Map<string, number>();

  for (let i = 0; i < PRODUCT_COUNT; i++) {
    const { seed, record: category } =
      categories[i % categories.length];
    const noun = faker.helpers.arrayElement(seed.nouns);
    const variant = faker.helpers.arrayElement(VARIANTS);
    const brand = faker.helpers.arrayElement(brands);
    const supplier = faker.helpers.arrayElement(suppliers);

    const counter = (skuCounters.get(seed.prefix) ?? 0) + 1;
    skuCounters.set(seed.prefix, counter);
    const sku = `${seed.prefix}-${String(counter).padStart(4, "0")}`;

    // cost < dealer < srp
    const cost = round(faker.number.float({ min: 40, max: 8000 }));
    const dealerPrice = round(cost * faker.number.float({ min: 1.15, max: 1.4 }));
    const srp = round(dealerPrice * faker.number.float({ min: 1.15, max: 1.45 }));

    const status = faker.helpers.weightedArrayElement([
      { value: ProductStatus.ACTIVE, weight: 88 },
      { value: ProductStatus.INACTIVE, weight: 7 },
      { value: ProductStatus.DISCONTINUED, weight: 5 },
    ]);

    const product = await prisma.product.create({
      data: {
        sku,
        name: `${brand.name} ${noun} ${variant}`,
        description: faker.commerce.productDescription(),
        categoryId: category.id,
        brandId: brand.id,
        supplierId: supplier.id,
        country: faker.helpers.arrayElement(COUNTRIES),
        cost,
        srp,
        dealerPrice,
        status,
      },
    });
    products.push(product);

    // Inventory in the main warehouse, spread across health bands.
    const band = faker.helpers.weightedArrayElement([
      { value: "healthy", weight: 62 },
      { value: "low", weight: 23 },
      { value: "critical", weight: 15 },
    ]);
    const minimumStock = faker.number.int({ min: 3, max: 10 });
    const reorderPoint = minimumStock + faker.number.int({ min: 5, max: 15 });
    const physicalStock =
      band === "healthy"
        ? reorderPoint + faker.number.int({ min: 10, max: 120 })
        : band === "low"
          ? faker.number.int({ min: minimumStock + 1, max: reorderPoint })
          : faker.number.int({ min: 0, max: minimumStock });

    await prisma.inventory.create({
      data: {
        productId: product.id,
        warehouseId: mainWarehouse.id,
        physicalStock,
        reservedStock: 0,
        minimumStock,
        reorderPoint,
      },
    });
  }
  const activeProducts = products.filter((p) => p.status === "ACTIVE");
  console.log(`  📦 ${products.length} products (+inventory rows)`);

  // Customers ─────────────────────────────────────────────────────────────
  const CUSTOMER_COUNT = 30;
  const customers = [];
  for (let i = 0; i < CUSTOMER_COUNT; i++) {
    const company = `${faker.company.name()} ${faker.helpers.arrayElement(["Trading", "Hardware", "Builders", "Enterprises", "Supply"])}`;
    customers.push(
      await prisma.customer.create({
        data: {
          company,
          contactPerson: faker.person.fullName(),
          email: `contact${i + 1}@${company.toLowerCase().replace(/[^a-z]/g, "").slice(0, 14)}.ph`,
          phone: `+63 9${faker.string.numeric(2)} ${faker.string.numeric(3)} ${faker.string.numeric(4)}`,
          address: faker.location.streetAddress(),
          region: faker.helpers.arrayElement(PH_REGIONS),
          priceLevel: faker.helpers.weightedArrayElement([
            { value: PriceLevel.SRP, weight: 55 },
            { value: PriceLevel.DEALER, weight: 45 },
          ]),
          notes: faker.helpers.maybe(() => faker.lorem.sentence(), {
            probability: 0.3,
          }),
        },
      }),
    );
  }
  console.log(`  🤝 ${customers.length} customers`);

  // Helper to build random line items priced by the customer's level ──────
  function randomItems(priceLevel: PriceLevel) {
    const count = faker.number.int({ min: 1, max: 5 });
    const chosen = faker.helpers.arrayElements(activeProducts, count);
    return chosen.map((product) => ({
      productId: product.id,
      quantity: faker.number.int({ min: 1, max: 12 }),
      unitPrice: Number(
        priceLevel === "DEALER" ? product.dealerPrice : product.srp,
      ),
    }));
  }

  let quoteSeq = 0;
  let orderSeq = 0;
  const year = new Date().getFullYear();

  // Standalone sales orders (no quote) ────────────────────────────────────
  const ORDER_COUNT = 32; // + 8 from accepted quotes below = 40 total
  for (let i = 0; i < ORDER_COUNT; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const items = randomItems(customer.priceLevel);
    const discount = faker.helpers.maybe(
      () => round(faker.number.float({ min: 50, max: 500 })),
      { probability: 0.3 },
    ) ?? 0;
    const totals = computeTotals(items, discount);
    const status = faker.helpers.weightedArrayElement([
      { value: SalesOrderStatus.PENDING, weight: 25 },
      { value: SalesOrderStatus.PROCESSING, weight: 25 },
      { value: SalesOrderStatus.COMPLETED, weight: 50 },
    ]);
    const createdBy = faker.helpers.arrayElement([sales, manager, owner]);
    const createdAt = pastDate(170);

    orderSeq += 1;
    const order = await prisma.salesOrder.create({
      data: {
        orderNumber: `SO-${year}-${String(orderSeq).padStart(4, "0")}`,
        customerId: customer.id,
        createdById: createdBy.id,
        status,
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.25,
        }),
        ...totals,
        createdAt,
        items: {
          create: items.map((item) => ({
            ...item,
            lineTotal: round(item.quantity * item.unitPrice),
          })),
        },
      },
    });

    // Keep stock consistent: open orders hold reservations.
    if (status !== "COMPLETED") {
      for (const item of items) {
        await prisma.inventory.update({
          where: {
            productId_warehouseId: {
              productId: item.productId,
              warehouseId: mainWarehouse.id,
            },
          },
          data: {
            physicalStock: { increment: item.quantity }, // ensure ≥ reserved
            reservedStock: { increment: item.quantity },
          },
        });
      }
    }

    await prisma.activityLog.create({
      data: {
        action: "order.created",
        entityType: "SalesOrder",
        entityId: order.id,
        summary: `${createdBy.name} created sales order ${order.orderNumber}`,
        userId: createdBy.id,
        createdAt,
      },
    });
  }

  // Quotes (some accepted → linked orders) ────────────────────────────────
  const QUOTE_COUNT = 20;
  for (let i = 0; i < QUOTE_COUNT; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const items = randomItems(customer.priceLevel);
    const discount = faker.helpers.maybe(
      () => round(faker.number.float({ min: 50, max: 500 })),
      { probability: 0.3 },
    ) ?? 0;
    const totals = computeTotals(items, discount);
    const status = faker.helpers.weightedArrayElement([
      { value: QuoteStatus.DRAFT, weight: 25 },
      { value: QuoteStatus.SENT, weight: 25 },
      { value: QuoteStatus.ACCEPTED, weight: 40 },
      { value: QuoteStatus.DECLINED, weight: 10 },
    ]);
    const createdBy = faker.helpers.arrayElement([sales, manager]);
    const createdAt = pastDate(120);

    quoteSeq += 1;
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: `Q-${year}-${String(quoteSeq).padStart(4, "0")}`,
        customerId: customer.id,
        createdById: createdBy.id,
        status,
        validUntil: faker.date.soon({ days: 30, refDate: createdAt }),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.25,
        }),
        ...totals,
        createdAt,
        items: {
          create: items.map((item) => ({
            ...item,
            lineTotal: round(item.quantity * item.unitPrice),
          })),
        },
      },
    });

    await prisma.activityLog.create({
      data: {
        action: "quote.created",
        entityType: "Quote",
        entityId: quote.id,
        summary: `${createdBy.name} drafted quote ${quote.quoteNumber}`,
        userId: createdBy.id,
        createdAt,
      },
    });

    if (status === "ACCEPTED") {
      orderSeq += 1;
      const orderStatus = faker.helpers.arrayElement([
        SalesOrderStatus.PENDING,
        SalesOrderStatus.PROCESSING,
        SalesOrderStatus.COMPLETED,
      ]);
      const order = await prisma.salesOrder.create({
        data: {
          orderNumber: `SO-${year}-${String(orderSeq).padStart(4, "0")}`,
          customerId: customer.id,
          createdById: createdBy.id,
          quoteId: quote.id,
          status: orderStatus,
          ...totals,
          createdAt: faker.date.soon({ days: 5, refDate: createdAt }),
          items: {
            create: items.map((item) => ({
              ...item,
              lineTotal: round(item.quantity * item.unitPrice),
            })),
          },
        },
      });

      if (orderStatus !== "COMPLETED") {
        for (const item of items) {
          await prisma.inventory.update({
            where: {
              productId_warehouseId: {
                productId: item.productId,
                warehouseId: mainWarehouse.id,
              },
            },
            data: {
              physicalStock: { increment: item.quantity },
              reservedStock: { increment: item.quantity },
            },
          });
        }
      }

      await prisma.activityLog.create({
        data: {
          action: "quote.accepted",
          entityType: "Quote",
          entityId: quote.id,
          summary: `${manager.name} accepted quote ${quote.quoteNumber} for ${customer.company} → order ${order.orderNumber}`,
          userId: manager.id,
          createdAt: order.createdAt,
        },
      });
    }
  }
  console.log(`  📄 ${QUOTE_COUNT} quotes, ${orderSeq} sales orders`);

  // Missing product requests ──────────────────────────────────────────────
  const MISSING_COUNT = 15;
  const missingDescriptions = [
    "Solar-powered submersible pump, 1.5HP, stainless body",
    "Smart WiFi circuit breaker with energy monitoring, 63A",
    "Stainless flexible hose 24 inches, braided",
    "Industrial water softener system, 2000L/hr",
    "Explosion-proof LED floodlight, 100W",
    "PEX pipe crimping tool set, 1/2 to 1 inch",
    "Copper pipe type L, 3/4 inch x 3m",
    "Automatic transfer switch, 100A, dual power",
    "Rainwater harvesting first-flush diverter kit",
    "Digital water pressure gauge with data logging",
    "Fire sprinkler head, pendent type, K5.6",
    "Grease trap, stainless, 25GPM under-sink",
    "Cable tray, hot-dip galvanized, 300mm x 3m",
    "Pipe insulation foam, 1 inch x 6ft, fire-rated",
    "Variable frequency drive for 3HP pump, single phase input",
  ];
  for (let i = 0; i < MISSING_COUNT; i++) {
    const customer = faker.helpers.arrayElement(customers);
    const requestedBy = faker.helpers.arrayElement([sales, warehouseUser, manager]);
    const createdAt = pastDate(60);
    const request = await prisma.missingProductRequest.create({
      data: {
        customerId: customer.id,
        requestedById: requestedBy.id,
        description: missingDescriptions[i],
        quantity: faker.number.int({ min: 1, max: 20 }),
        status: faker.helpers.weightedArrayElement([
          { value: MissingProductStatus.OPEN, weight: 40 },
          { value: MissingProductStatus.SOURCING, weight: 30 },
          { value: MissingProductStatus.FULFILLED, weight: 20 },
          { value: MissingProductStatus.CLOSED, weight: 10 },
        ]),
        notes: faker.helpers.maybe(() => faker.lorem.sentence(), {
          probability: 0.4,
        }),
        createdAt,
      },
    });
    await prisma.activityLog.create({
      data: {
        action: "missing.created",
        entityType: "MissingProductRequest",
        entityId: request.id,
        summary: `${requestedBy.name} logged a missing product request from ${customer.company}`,
        userId: requestedBy.id,
        createdAt,
      },
    });
  }
  console.log(`  🔍 ${MISSING_COUNT} missing product requests`);

  console.log("\n✅ Seed complete. Demo logins (password: wemos1234):");
  for (const seed of userSeeds) {
    console.log(`   ${seed.email.padEnd(20)} ${seed.role}`);
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
