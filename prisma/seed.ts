import { PrismaClient, Country } from 'generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });
console.log(process.env.DATABASE_URL);
const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});
export const prisma = new PrismaClient({ adapter });

async function main() {
  // Clear existing data to keep seed idempotent for development
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.paymentMethod.deleteMany();
  await prisma.order.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.restaurant.deleteMany();

  const indiaRestaurant = await prisma.restaurant.create({
    data: {
      name: 'Mumbai Spice House',
      country: Country.INDIA,
      description: 'Classic Indian dishes with a modern twist.',
      menuItems: {
        create: [
          {
            name: 'Butter Chicken',
            price: 350,
            description: 'Creamy tomato-based curry with tender chicken.',
          },
          {
            name: 'Paneer Tikka',
            price: 280,
            description: 'Grilled cottage cheese with spices.',
          },
        ],
      },
    },
    include: { menuItems: true },
  });
  const indiaRestaurant2 = await prisma.restaurant.create({
    data: {
      name: 'Chennai Spice House',
      country: Country.INDIA,
      description: 'Classic Indian dishes with a modern twist.',
      menuItems: {
        create: [
          {
            name: ' Chicken',
            price: 350,
            description: 'Creamy tomato-based curry with tender chicken.',
          },
          {
            name: ' Tikka',
            price: 280,
            description: 'Grilled cottage cheese with spices.',
          },
        ],
      },
    },
    include: { menuItems: true },
  });

  const usRestaurant = await prisma.restaurant.create({
    data: {
      name: 'New York Burger Co.',
      country: Country.AMERICA,
      description: 'Gourmet burgers and fries.',
      menuItems: {
        create: [
          {
            name: 'Classic Cheeseburger',
            price: 12,
            description: 'Beef patty with cheddar, lettuce, and tomato.',
          },
          {
            name: 'Veggie Burger',
            price: 11,
            description: 'Grilled veggie patty with house sauce.',
          },
        ],
      },
    },
    include: { menuItems: true },
  });

  console.log('Seeded restaurants and menu items:', {
    indiaRestaurant,
    usRestaurant,
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
