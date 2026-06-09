import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import crypto from 'crypto';

const prisma = new PrismaClient();

async function main() {
  const hunt = await prisma.hunt.create({
    data: {
      name: "Animacode City CS Bootcamp",
      description: "Find all the clues across Zootopia!",
      status: "active",
      checkpoints: {
        create: [
          { name: "Tundratown", zootopiaIcon: "❄️", order: 1 },
          { name: "Sahara Square", zootopiaIcon: "🏜️", order: 2 },
          { name: "Rainforest District", zootopiaIcon: "🌧️", order: 3 },
          { name: "Bunnyburrow", zootopiaIcon: "🐰", order: 4 },
          { name: "Little Rodentia", zootopiaIcon: "🐭", order: 5 },
          { name: "The Naturalist Club", zootopiaIcon: "🧘", order: 6 },
          { name: "Zootopia City Hall", zootopiaIcon: "🏛️", order: 7 },
        ]
      }
    }
  });
  console.log(`Created Hunt: ${hunt.name}`);
}

main()
  .then(async () => { await prisma.$disconnect() })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
