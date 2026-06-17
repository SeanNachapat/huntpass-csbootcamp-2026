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
          { name: "Tundratown", zootopiaIcon: "❄️", order: 1, type: "badge" },
          { name: "Sahara Square", zootopiaIcon: "🏜️", order: 2, type: "badge" },
          { name: "Rainforest Badge", zootopiaIcon: "🌧️", order: 3, type: "badge" },
          { name: "Bunnyburrow", zootopiaIcon: "🐰", order: 4, type: "badge" },
          { name: "Little Rodentia", zootopiaIcon: "🐭", order: 5, type: "badge" },
          { name: "The Naturalist Club", zootopiaIcon: "🧘", order: 6, type: "badge" },
          { name: "Zootopia City Hall", zootopiaIcon: "🏛️", order: 7, type: "badge" },
          { name: "Day 1 Attendance", zootopiaIcon: "📅", order: 8, type: "daily_attendance" },
          { name: "Day 2 Attendance", zootopiaIcon: "📅", order: 9, type: "daily_attendance" },
          { name: "Day 3 Attendance", zootopiaIcon: "📅", order: 10, type: "daily_attendance" },
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
