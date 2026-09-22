import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    let category = await prisma.category.findFirst({ where: { slug: 'household' } });
    if (!category) {
      category = await prisma.category.create({
        data: {
          name: 'Household',
          slug: 'household',
          description: 'Smart home automation, utility appliances, kitchen innovations, and lighting solutions.',
          isFeatured: true,
        },
      });
    }

    const slug = 'solar-sensor-wall-light-set-of-2';
    const sku = 'FINDIFY-SOLAR-WL-SET2';

    const existing = await prisma.product.findFirst({
      where: { OR: [{ slug }, { sku }] },
    });

    if (existing) {
      const updated = await prisma.product.update({
        where: { id: existing.id },
        data: {
          name: 'Solar Sensor Wall Light (Pack of 2)',
          mrp: 1499,
          sellingPrice: 699,
          costPrice: 280,
          stock: 150,
          status: 'PUBLISHED',
          shortDescription: 'Set of 2 Premium Outdoor Solar Powered LED Sensor Wall Lights. Dual up & down warm architectural beams, 100% waterproof (IP65), zero electricity bill, and automatic dusk-to-dawn operation.',
          description: `
            <div className="space-y-6 text-[#333333]">
              <h2 className="text-xl font-bold text-[#171717]">Brighter Tomorrows Solar Sensor Wall Light (Pack of 2)</h2>
              <p className="leading-relaxed">
                Transform your home exterior into a luxury resort at night with the <strong>Brighter Tomorrows Solar Sensor Wall Light (Set of 2)</strong>. Engineered with sleek modern minimalism and dual up-and-down LED optical lenses, these lights cast a stunning warm architectural glow across your entrance, garden walls, staircases, and balconies—with <strong>zero wiring and ₹0 electricity bill forever</strong>!
              </p>

              <h3 className="text-lg font-semibold text-[#171717]">Key Highlights & Features</h3>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>☀️ 100% Solar Powered (Zero Bills)</strong>: High-efficiency monocrystalline solar panels absorb sunlight during the day to power ultra-bright warm LEDs all night.</li>
                <li><strong>🌙 Auto Dusk-to-Dawn Sensor</strong>: Built-in intelligent light sensors detect darkness automatically, turning the lights ON at dusk and OFF at sunrise.</li>
                <li><strong>🌧️ Weatherproof IP65 Rating</strong>: Built for Indian weather extremes—heavy monsoon rains, scorching summer heat, dust, and frost protection.</li>
                <li><strong>✨ Dual-Beam Architectural Glow</strong>: Premium up & down light distribution creates an inviting, luxurious ambient ambiance for any home wall.</li>
                <li><strong>🛠️ 3-Step Wireless Easy Installation</strong>: No electrician required! Mount anywhere in under 2 minutes with the included screws and wall anchors.</li>
              </ul>

              <h3 className="text-lg font-semibold text-[#171717]">Where to Use</h3>
              <p className="leading-relaxed">
                Perfect for Main Entrances, Villa Garden Walls, Outdoor Staircases, Balcony Railings, Patio Boundaries, Gate Pillars, and Compounds.
              </p>

              <h3 className="text-lg font-semibold text-[#171717]">What's in the Box (Set of 2)</h3>
              <ul className="list-disc pl-5 space-y-1">
                <li>2x Solar Sensor Wall Light Units</li>
                <li>4x Mounting Screws & Wall Anchors</li>
                <li>1x User & Installation Guide</li>
              </ul>
            </div>
          `,
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
        },
      });

      await prisma.productImage.deleteMany({ where: { productId: updated.id } });
      await prisma.productImage.createMany({
        data: [
          { productId: updated.id, url: '/uploads/products/solar-sensor-wall-light.png', order: 0 },
          { productId: updated.id, url: '/uploads/products/solar-sensor-wall-light-glow.jpg', order: 1 },
          { productId: updated.id, url: '/uploads/products/solar-sensor-wall-light-waterproof.jpg', order: 2 },
        ],
      });

      return NextResponse.json({ success: true, message: 'Updated existing product with gallery images', product: updated });
    }

    const product = await prisma.product.create({
      data: {
        name: 'Solar Sensor Wall Light (Pack of 2)',
        slug,
        sku,
        brand: 'FINDIFY.IN',
        categoryId: category.id,
        mrp: 1499,
        sellingPrice: 699,
        costPrice: 280,
        stock: 150,
        lowStockThreshold: 10,
        status: 'PUBLISHED',
        shortDescription: 'Set of 2 Premium Outdoor Solar Powered LED Sensor Wall Lights. Dual up & down warm architectural beams, 100% waterproof (IP65), zero electricity bill, and automatic dusk-to-dawn operation.',
        description: `
          <div className="space-y-6 text-[#333333]">
            <h2 className="text-xl font-bold text-[#171717]">Brighter Tomorrows Solar Sensor Wall Light (Pack of 2)</h2>
            <p className="leading-relaxed">
              Transform your home exterior into a luxury resort at night with the <strong>Brighter Tomorrows Solar Sensor Wall Light (Set of 2)</strong>. Engineered with sleek modern minimalism and dual up-and-down LED optical lenses, these lights cast a stunning warm architectural glow across your entrance, garden walls, staircases, and balconies—with <strong>zero wiring and ₹0 electricity bill forever</strong>!
            </p>

            <h3 className="text-lg font-semibold text-[#171717]">Key Highlights & Features</h3>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>☀️ 100% Solar Powered (Zero Bills)</strong>: High-efficiency monocrystalline solar panels absorb sunlight during the day to power ultra-bright warm LEDs all night.</li>
              <li><strong>🌙 Auto Dusk-to-Dawn Sensor</strong>: Built-in intelligent light sensors detect darkness automatically, turning the lights ON at dusk and OFF at sunrise.</li>
              <li><strong>🌧️ Weatherproof IP65 Rating</strong>: Built for Indian weather extremes—heavy monsoon rains, scorching summer heat, dust, and frost protection.</li>
              <li><strong>✨ Dual-Beam Architectural Glow</strong>: Premium up & down light distribution creates an inviting, luxurious ambient ambiance for any home wall.</li>
              <li><strong>🛠️ 3-Step Wireless Easy Installation</strong>: No electrician required! Mount anywhere in under 2 minutes with the included screws and wall anchors.</li>
            </ul>

            <h3 className="text-lg font-semibold text-[#171717]">Where to Use</h3>
            <p className="leading-relaxed">
              Perfect for Main Entrances, Villa Garden Walls, Outdoor Staircases, Balcony Railings, Patio Boundaries, Gate Pillars, and Compounds.
            </p>

            <h3 className="text-lg font-semibold text-[#171717]">What's in the Box (Set of 2)</h3>
            <ul className="list-disc pl-5 space-y-1">
              <li>2x Solar Sensor Wall Light Units</li>
              <li>4x Mounting Screws & Wall Anchors</li>
              <li>1x User & Installation Guide</li>
            </ul>
          </div>
        `,
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
        images: {
          create: [
            { url: '/uploads/products/solar-sensor-wall-light.png', order: 0 },
            { url: '/uploads/products/solar-sensor-wall-light-glow.jpg', order: 1 },
            { url: '/uploads/products/solar-sensor-wall-light-waterproof.jpg', order: 2 },
          ],
        },
        reviews: {
          create: [
            {
              authorName: 'Vikramaditya S.',
              rating: 5,
              comment: 'Absolutely stunning warm glow! Installed 4 packs around my villa garden wall. Charges effortlessly during daytime and lights up automatically at night.',
              isVerified: true,
            },
            {
              authorName: 'Meera Deshmukh',
              rating: 5,
              comment: 'No wiring hassle at all. Took 5 minutes to screw onto the balcony wall. Heavy rain passed yesterday and they are 100% waterproof!',
              isVerified: true,
            },
            {
              authorName: 'Rohan Gupta',
              rating: 5,
              comment: 'Super value for ₹699 for a set of 2. Gives a ₹10,000 resort lighting vibe to my entryway.',
              isVerified: true,
            }
          ]
        }
      },
    });

    return NextResponse.json({ success: true, message: 'Created new product', product });
  } catch (error: any) {
    console.error('Seed solar light error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
