import { PrismaClient, Role, ProductStatus, DiscountType, ReviewStatus } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // 1. Create Default Site Settings
  await prisma.siteSettings.upsert({
    where: { id: 'default' },
    update: {},
    create: {
      id: 'default',
      storeName: 'FINDIFY.IN',
      supportEmail: 'support@findify.in',
      supportPhone: '+91 98765 43210',
      address: '102 Tech Park, Sector 62, Noida, UP 201309',
      announcementBar: '⚡ FREE Shipping on Prepaid Orders above ₹999 | Use Code FIRST10 for 10% OFF',
      announcementActive: true,
      codEnabled: true,
      codCharge: 49,
      freeShippingThreshold: 999,
      standardShippingFee: 79,
    },
  });

  // 2. Create Super Admin User
  const adminPasswordHash = await bcrypt.hash('Admin@123456', 10);
  const superAdmin = await prisma.adminUser.upsert({
    where: { email: 'admin@dropship.in' },
    update: {},
    create: {
      email: 'admin@dropship.in',
      passwordHash: adminPasswordHash,
      name: 'Rajesh Kumar (Super Admin)',
      role: Role.SUPER_ADMIN,
      isActive: true,
    },
  });
  console.log('👤 Created Super Admin:', superAdmin.email);

  // 3. Create Sample Customer User
  const customerPasswordHash = await bcrypt.hash('Customer@123456', 10);
  const sampleCustomer = await prisma.user.upsert({
    where: { email: 'ananya.sharma@example.com' },
    update: {},
    create: {
      email: 'ananya.sharma@example.com',
      passwordHash: customerPasswordHash,
      name: 'Ananya Sharma',
      phone: '+91 98123 45678',
    },
  });

  // Address for sample customer
  await prisma.address.create({
    data: {
      userId: sampleCustomer.id,
      fullName: 'Ananya Sharma',
      mobile: '9812345678',
      email: 'ananya.sharma@example.com',
      houseFlat: 'Flat 402, Green Valley Apartments',
      street: 'Koramangala 4th Block',
      area: 'Near Sony World Signal',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560034',
      isDefault: true,
    },
  });

  // 4. Create Primary Categories & Subcategories
  const techCategory = await prisma.category.upsert({
    where: { slug: 'technology' },
    update: {},
    create: {
      name: 'Technology',
      slug: 'technology',
      description: 'Cutting-edge smart gadgets, audio gear, action cameras, and digital accessories.',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      seoTitle: 'Technology & Smart Gadgets Store | FINDIFY.IN',
      seoDescription: 'Shop high-performance wireless earbuds, smartwatches, and tech accessories in India.',
    },
  });

  const householdCategory = await prisma.category.upsert({
    where: { slug: 'household' },
    update: {},
    create: {
      name: 'Household',
      slug: 'household',
      description: 'Smart home automation, utility appliances, kitchen innovations, and cleaning solutions.',
      image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=800&q=80',
      isFeatured: true,
      seoTitle: 'Household & Kitchen Innovations | FINDIFY.IN',
      seoDescription: 'Discover smart kitchen appliances, cleaning electronics, and home utility gear.',
    },
  });

  // Subcategories
  const smartDevicesSub = await prisma.subcategory.upsert({
    where: { slug: 'smart-devices' },
    update: {},
    create: {
      name: 'Smart Devices',
      slug: 'smart-devices',
      categoryId: techCategory.id,
      description: 'Wearables, trackers, and connected IoT devices.',
    },
  });

  const audioGadgetsSub = await prisma.subcategory.upsert({
    where: { slug: 'audio-accessories' },
    update: {},
    create: {
      name: 'Audio & Accessories',
      slug: 'audio-accessories',
      categoryId: techCategory.id,
      description: 'ANC Earbuds, Bluetooth Speakers, and Fast Chargers.',
    },
  });

  const kitchenAppSub = await prisma.subcategory.upsert({
    where: { slug: 'kitchen-utilities' },
    update: {},
    create: {
      name: 'Kitchen Utilities',
      slug: 'kitchen-utilities',
      categoryId: householdCategory.id,
      description: 'Automatic choppers, dispensers, and smart cookware.',
    },
  });

  const cleaningHomeSub = await prisma.subcategory.upsert({
    where: { slug: 'cleaning-home' },
    update: {},
    create: {
      name: 'Cleaning & Home Care',
      slug: 'cleaning-home',
      categoryId: householdCategory.id,
      description: 'Electric mops, ultrasonic cleaners, and lint removers.',
    },
  });

  // 5. Create Real Technology & Household Products
  const productsData = [
    {
      name: 'AAN UltraFit Pro Smartwatch with Bluetooth Calling & AMOLED Display',
      slug: 'ultrafit-pro-smartwatch-amoled',
      sku: 'AAN-TECH-SW01',
      brand: 'AAN Electronics',
      categoryId: techCategory.id,
      subcategoryId: smartDevicesSub.id,
      mrp: 4999,
      sellingPrice: 1999,
      costPrice: 850,
      discountPercent: 60,
      stock: 45,
      lowStockThreshold: 5,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      description: 'Experience crystal clear 1.96-inch AMOLED display, BT 5.3 calling, 100+ sports modes, 7-day battery backup, and IP68 water resistance.',
      shortDescription: '1.96 AMOLED display, Bluetooth calling, 7-day battery, IP68 water resistance.',
      specifications: JSON.stringify({
        Display: '1.96" AMOLED HD Touchscreen',
        Battery: '340 mAh (Up to 7 Days)',
        Connectivity: 'Bluetooth 5.3',
        WaterResistance: 'IP68',
        Warranty: '1 Year Brand Warranty',
      }),
      features: JSON.stringify([
        'Ultra-bright 600 nits AMOLED Display',
        'Dual-chip Bluetooth calling with noise cancellation',
        '24/7 Heart rate, SpO2 & Sleep tracking',
        '100+ customizable watch faces',
      ]),
      images: [
        'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { sku: 'AAN-TECH-SW01-BLK', name: 'Obsidian Black', price: 1999, stock: 25, optionColor: 'Black' },
        { sku: 'AAN-TECH-SW01-SLV', name: 'Silver Steel', price: 2199, stock: 20, optionColor: 'Silver' },
      ],
    },
    {
      name: 'AAN SoundPods ANC Active Noise Cancelling Wireless Earbuds',
      slug: 'soundpods-anc-wireless-earbuds',
      sku: 'AAN-TECH-EB02',
      brand: 'AAN Audio',
      categoryId: techCategory.id,
      subcategoryId: audioGadgetsSub.id,
      mrp: 3499,
      sellingPrice: 1299,
      costPrice: 520,
      discountPercent: 63,
      stock: 60,
      lowStockThreshold: 10,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      description: 'True Active Noise Cancellation (-30dB), Quad Mic ENC for crystal clear calls, 40-hour total playback time, and 45ms ultra-low latency gaming mode.',
      shortDescription: '30dB ANC, Quad Mic ENC, 40H Playtime, Low Latency Gaming Mode.',
      specifications: JSON.stringify({
        ANC: '30dB Active Noise Cancellation',
        Battery: '40 Hours with Charging Case',
        Drivers: '13mm Titanium Dynamic Drivers',
        Charging: 'Type-C Fast Charge (10 min = 120 min play)',
      }),
      features: JSON.stringify([
        'Active Noise Cancellation for immersive listening',
        'Quad ENC microphones for crystal-clear phone calls',
        'Instant Auto Pair with Hall Switch technology',
        'Sweatproof IPX5 rating for workouts',
      ]),
      images: [
        'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
        'https://images.unsplash.com/photo-1572536147248-ac59a8abfa4b?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [
        { sku: 'AAN-TECH-EB02-WHT', name: 'Pearl White', price: 1299, stock: 35, optionColor: 'White' },
        { sku: 'AAN-TECH-EB02-BLK', name: 'Matte Black', price: 1299, stock: 25, optionColor: 'Black' },
      ],
    },
    {
      name: 'AAN 4K Ultra HD Dual-Screen Waterproof Action Camera',
      slug: '4k-ultrahd-dual-screen-action-camera',
      sku: 'AAN-TECH-CAM03',
      brand: 'AAN Vision',
      categoryId: techCategory.id,
      subcategoryId: smartDevicesSub.id,
      mrp: 8999,
      sellingPrice: 3999,
      costPrice: 1800,
      discountPercent: 55,
      stock: 18,
      lowStockThreshold: 3,
      isFeatured: true,
      isTrending: false,
      isBestSeller: true,
      description: 'Capture incredible 4K 60FPS video with EIS 6-axis gyro stabilization, dual screens (front selfie display), 30M waterproof housing, and Wi-Fi App remote control.',
      shortDescription: '4K 60FPS, Dual Screen, 6-Axis EIS Gyro Stabilization, 30M Waterproof.',
      specifications: JSON.stringify({
        Resolution: '4K Native @ 60FPS / 20MP Photos',
        Stabilization: '6-Axis Gyro Electronic Image Stabilization',
        Waterproof: '30 Meters with included case',
        WiFi: 'Integrated WiFi with iOS/Android App',
      }),
      features: JSON.stringify([
        'Dual Color Screen: Front 1.4" + Back 2.0" HD Touchscreen',
        '170-degree Ultra-Wide Angle Lens',
        'Supports external mic and wrist remote control',
        'Includes 15-piece mounting accessory kit',
      ]),
      images: [
        'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [],
    },
    {
      name: 'Solar Sensor Wall Light (Pack of 2)',
      slug: 'solar-sensor-wall-light-set-of-2',
      sku: 'FINDIFY-SOLAR-WL-SET2',
      brand: 'FINDIFY.IN',
      categoryId: householdCategory.id,
      subcategoryId: cleaningHomeSub.id,
      mrp: 1499,
      sellingPrice: 699,
      costPrice: 280,
      discountPercent: 53,
      stock: 150,
      lowStockThreshold: 10,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      description: 'Transform your home exterior into a luxury resort at night with the Brighter Tomorrows Solar Sensor Wall Light (Set of 2). Engineered with sleek modern minimalism and dual up-and-down LED optical lenses, these lights cast a stunning warm architectural glow across your entrance, garden walls, staircases, and balconies—with zero wiring and ₹0 electricity bill forever!',
      shortDescription: 'Set of 2 Premium Outdoor Solar Powered LED Sensor Wall Lights. Dual up & down warm architectural beams, 100% waterproof (IP65), zero electricity bill, and automatic dusk-to-dawn operation.',
      specifications: JSON.stringify({
        'Package Contains': '2 Solar Sensor Wall Light Units + Screws',
        'Dimensions': '8.5 cm (H) x 6.5 cm (W) x 3 cm (D)',
        'Power Source': 'High-Efficiency Monocrystalline Solar Panel',
        'Lighting Mode': 'Warm White Up & Down Dual Architectural Beam',
        'Sensor Type': 'Automatic Dusk-to-Dawn Light Sensor',
        'Waterproof Grade': 'IP65 Certified All-Weather Waterproof',
        'Body Material': 'Heavy-Duty ABS Architectural Casing',
        'Battery': 'Rechargeable Solar Lithium Cell',
      }),
      features: JSON.stringify([
        'Set of 2 Premium Architectural Solar Wall Lights',
        '100% Solar Powered — Zero Electricity Bill',
        'Automatic Dusk-to-Dawn Smart Light Sensor',
        'IP65 All-Weather Waterproofing (Rain, Heat & Frost Proof)',
        'Minimalist Up-Down Dual Beam Ambiance',
        'Quick 3-Step DIY Wireless Installation',
      ]),
      images: [
        '/uploads/products/solar-sensor-wall-light.png',
      ],
      variants: [],
    },
    {
      name: 'AAN Automatic Infrared Touchless Soap & Sanitizer Dispenser 400ml',
      slug: 'automatic-touchless-soap-dispenser-400ml',
      sku: 'AAN-HOME-SD01',
      brand: 'AAN Home',
      categoryId: householdCategory.id,
      subcategoryId: kitchenAppSub.id,
      mrp: 1999,
      sellingPrice: 799,
      costPrice: 280,
      discountPercent: 60,
      stock: 80,
      lowStockThreshold: 10,
      isFeatured: true,
      isTrending: true,
      isBestSeller: true,
      description: 'Smart infrared motion sensor dispenses rich foam or liquid in 0.25 seconds. Waterproof IPX4 rating, USB-C rechargeable battery, and 4-level foam volume control.',
      shortDescription: '0.25s IR Sensor, 400ml Tank, USB-C Rechargeable, Waterproof IPX4.',
      specifications: JSON.stringify({
        Capacity: '400 ml Liquid Reservoir',
        SensorSpeed: '0.25 seconds rapid response',
        Power: 'Built-in 1200mAh Lithium Battery (USB-C)',
        Material: 'ABS Eco-friendly Plastic',
      }),
      features: JSON.stringify([
        'Hygiene-first touchless infrared detection',
        '4 adjustable liquid volume settings',
        'Transparent container window for level monitoring',
        'Compatible with hand soap, dishwashing liquid, and sanitizer',
      ]),
      images: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [],
    },
    {
      name: 'AAN Ultrasonic Professional Jewelry & Eyeglass Cleaner 45Khz',
      slug: 'ultrasonic-jewelry-eyeglass-cleaner-45khz',
      sku: 'AAN-HOME-UC02',
      brand: 'AAN Home',
      categoryId: householdCategory.id,
      subcategoryId: cleaningHomeSub.id,
      mrp: 2999,
      sellingPrice: 1199,
      costPrice: 460,
      discountPercent: 60,
      stock: 35,
      lowStockThreshold: 5,
      isFeatured: true,
      isTrending: true,
      isBestSeller: false,
      description: 'High-frequency 45,000Hz ultrasonic sound waves create microscopic bubbles to effortlessly remove dirt, grime, oil, and oxidation from jewelry, watches, glasses, and dentures in 3 minutes.',
      shortDescription: '45,000Hz Ultrasonic Waves, 304 Stainless Steel Tank, 3-Min Timer.',
      specifications: JSON.stringify({
        Frequency: '45,000 Hz Ultrasonic',
        TankCapacity: '450 ml Stainless Steel 304',
        Power: '24W High Power Module',
        Timer: '3-Minute Auto Off Cycle',
      }),
      features: JSON.stringify([
        '360-degree deep cleaning without damaging delicate items',
        'Food-grade 304 stainless steel interior tank',
        'Whisper-quiet operational noise reduction design',
      ]),
      images: [
        'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [],
    },
    {
      name: 'AAN Smart RGB LED Strip Light 10M with Music Sync & App Remote',
      slug: 'smart-rgb-led-strip-light-10m-app',
      sku: 'AAN-HOME-LED03',
      brand: 'AAN Home',
      categoryId: householdCategory.id,
      subcategoryId: cleaningHomeSub.id,
      mrp: 1899,
      sellingPrice: 699,
      costPrice: 240,
      discountPercent: 63,
      stock: 120,
      lowStockThreshold: 15,
      isFeatured: false,
      isTrending: true,
      isBestSeller: true,
      description: 'Transform your room with 16 million colors, dynamic pulse modes, built-in mic for rhythm music sync, 24-key IR remote, and smartphone app control.',
      shortDescription: '10 Meters RGB, App & IR Remote Control, Music Rhythm Sync, 16M Colors.',
      specifications: JSON.stringify({
        Length: '10 Meters (2 rolls of 5M)',
        LEDType: 'High-brightness 5050 RGB SMD',
        Control: 'Bluetooth App + IR Remote + 3-Button Controller',
        PowerSupply: '12V DC Indian Adapter included',
      }),
      features: JSON.stringify([
        '16 Million colors with dimmable brightness',
        'Built-in high sensitivity mic for music synchronization',
        'Easy peel-and-stick 3M self-adhesive backing',
      ]),
      images: [
        'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
      ],
      variants: [],
    },
  ];

  for (const prod of productsData) {
    const { images, variants, ...productFields } = prod;
    
    const createdProduct = await prisma.product.upsert({
      where: { sku: prod.sku },
      update: {},
      create: {
        ...productFields,
        images: {
          create: images.map((url, idx) => ({ url, order: idx })),
        },
        variants: {
          create: variants,
        },
        inventoryMovements: {
          create: {
            type: 'RESTOCK',
            quantity: prod.stock,
            previousStock: 0,
            newStock: prod.stock,
            note: 'Initial inventory seeding',
          },
        },
      },
    });

    // Add 1 sample review per product
    await prisma.review.create({
      data: {
        productId: createdProduct.id,
        authorName: 'Rohan Mehta',
        authorEmail: 'rohan.m@example.com',
        rating: 5,
        comment: `Absolutely brilliant product! High quality, fast delivery in 3 days to Delhi. Highly recommended!`,
        isVerified: true,
        status: ReviewStatus.APPROVED,
      },
    });

    console.log(`📦 Seeded Product: ${createdProduct.name}`);
  }

  // 6. Create Coupons
  await prisma.coupon.upsert({
    where: { code: 'FIRST10' },
    update: {},
    create: {
      code: 'FIRST10',
      discountType: DiscountType.PERCENTAGE,
      discountValue: 10,
      minOrderValue: 499,
      maxDiscount: 200,
      isFirstOrderOnly: true,
      perCustomerLimit: 1,
      isActive: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: 'PREPAID100' },
    update: {},
    create: {
      code: 'PREPAID100',
      discountType: DiscountType.FIXED,
      discountValue: 100,
      minOrderValue: 999,
      isPrepaidOnly: true,
      perCustomerLimit: 2,
      isActive: true,
    },
  });

  // 7. Create Homepage Banners
  await prisma.banner.createMany({
    data: [
      {
        title: 'Next-Gen Smart Electronics & Wearables',
        subtitle: 'Upgrade your digital lifestyle with AMOLED Smartwatches and ANC Earbuds',
        imageUrl: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1400&q=80',
        linkUrl: '/products?category=technology',
        badgeText: 'FESTIVE SALE — UP TO 60% OFF',
        order: 1,
      },
      {
        title: 'Smart Household & Kitchen Appliances',
        subtitle: 'Innovative touchless tools, ultrasonic cleaners, and home automation',
        imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=1400&q=80',
        linkUrl: '/products?category=household',
        badgeText: 'FREE SHIPPING ON PREPAID ORDERS',
        order: 2,
      },
    ],
  });

  // 8. Create Editable CMS Pages
  await prisma.cMSPage.upsert({
    where: { slug: 'about-us' },
    update: {},
    create: {
      slug: 'about-us',
      title: 'About FINDIFY.IN',
      content: `
        <h2>Who We Are</h2>
        <p>FINDIFY.IN is India's premier online destination for cutting-edge technology products and smart household utilities. Founded in 2024, our mission is to deliver high-quality, genuine, and modern tech products directly to Indian homes at direct-to-consumer prices.</p>
        
        <h2>Our Promise</h2>
        <ul>
          <li><strong>100% Genuine Products:</strong> Rigorously tested for quality and performance.</li>
          <li><strong>Fast Pan-India Delivery:</strong> Orders dispatched within 24 hours with live step-by-step courier tracking.</li>
          <li><strong>Dedicated Customer Support:</strong> Prompt resolution for inquiries, warranties, and returns.</li>
        </ul>
      `,
    },
  });

  await prisma.cMSPage.upsert({
    where: { slug: 'shipping-policy' },
    update: {},
    create: {
      slug: 'shipping-policy',
      title: 'Shipping Policy',
      content: `
        <h2>Shipping & Delivery Information</h2>
        <p>We provide fast and reliable pan-India delivery across 26,000+ pincodes through premier logistics partners including Delhivery, BlueDart, and Ecom Express.</p>
        
        <h3>Dispatch Timeline</h3>
        <p>Orders placed before 2:00 PM IST are processed and handed over to courier partners on the same business day.</p>
        
        <h3>Delivery Charges</h3>
        <ul>
          <li><strong>Prepaid Orders:</strong> FREE delivery on orders above ₹999. Standard fee of ₹79 applies for orders below ₹999.</li>
          <li><strong>Cash on Delivery (COD):</strong> Convenience fee of ₹49 applies on all COD orders.</li>
        </ul>
      `,
    },
  });

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
