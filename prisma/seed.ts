import { PrismaClient, Role, NewsStatus } from "@prisma/client";
import { faker } from "@faker-js/faker";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Start seeding...");

  // Hapus semua data biar gak bentrok
  await prisma.$transaction([
    prisma.commentLike.deleteMany(),
    prisma.newsLike.deleteMany(),
    prisma.comment.deleteMany(),
    prisma.contentImage.deleteMany(),
    prisma.news.deleteMany(),
    prisma.user.deleteMany(),
    prisma.category.deleteMany(),
  ]);

  // 1. CATEGORY (10 data unik)
  console.log("Creating categories...");
  const categoryNames = Array.from(
    new Set(Array.from({ length: 20 }, () => faker.commerce.department()))
  ).slice(0, 10);

  await prisma.category.createMany({
    data: categoryNames.map((name) => ({ name })),
    skipDuplicates: true,
  });

  const categories = await prisma.category.findMany();

  // 2. USER (50 data)
  console.log("Creating users...");
  const users = await Promise.all(
    Array.from({ length: 50 }).map(async () => {
      const email = faker.internet.email().toLowerCase();
      return prisma.user.create({
        data: {
          name: faker.person.fullName(),
          email,
          password: faker.internet.password({ length: 10 }),
          avatar: faker.image.avatar(),
          role: Role.READER,
        },
      });
    })
  );

  // 3. NEWS (50 data)
  console.log("Creating news...");
  const newsItems = [];
  for (let i = 0; i < 50; i++) {
    const author = faker.helpers.arrayElement(users);
    const category = faker.helpers.arrayElement(categories);

    const title = faker.lorem.sentence(5);
    const slug = faker.helpers.slugify(title).toLowerCase();

    const news = await prisma.news.create({
      data: {
        title,
        slug,
        content: faker.lorem.paragraphs({ min: 10, max: 15 }),
        excerpt: faker.lorem.paragraphs({ min:2, max:5}),
        thumbnailUrl: `https://picsum.photos/seed/${i}/800/600`,
        status: NewsStatus.PUBLISHED,
        isBreaking: faker.datatype.boolean(),
        source: faker.internet.url(),
        metaTitle: title,
        metaDescription: faker.lorem.sentence(),
        publishedAt: faker.date.recent({ days: 60 }),
        authorId: author.id,
        categoryId: category.id,
      },
    });

    newsItems.push(news);
  }

  // 4. CONTENT IMAGES (masing-masing news punya 1–3)
  console.log("Adding content images...");
  for (const n of newsItems) {
    const imgCount = faker.number.int({ min: 1, max: 3 });
    await Promise.all(
      Array.from({ length: imgCount }).map((_, idx) =>
        prisma.contentImage.create({
          data: {
            url: `https://picsum.photos/seed/${n.id}-${idx}/1200/800`,
            caption: faker.lorem.sentence(),
            newsId: n.id,
          },
        })
      )
    );
  }

  // 5. COMMENTS
  console.log("Creating comments...");
  const comments = [];
  for (let i = 0; i < 50; i++) {
    const news = faker.helpers.arrayElement(newsItems);
    const user = faker.helpers.arrayElement(users);

    const comment = await prisma.comment.create({
      data: {
        content: faker.lorem.sentence(),
        newsId: news.id,
        userId: user.id,
      },
    });
    comments.push(comment);
  }

  // 6. NESTED REPLIES
  console.log("Creating replies...");
  for (let i = 0; i < 20; i++) {
    const parent = faker.helpers.arrayElement(comments);
    const user = faker.helpers.arrayElement(users);
    await prisma.comment.create({
      data: {
        content: faker.lorem.sentence(),
        newsId: parent.newsId,
        userId: user.id,
        parentId: parent.id,
      },
    });
  }

  // 7. NEWS LIKES
  console.log("Creating news likes...");
  for (let i = 0; i < 50; i++) {
    const user = faker.helpers.arrayElement(users);
    const news = faker.helpers.arrayElement(newsItems);
    try {
      await prisma.newsLike.create({
        data: {
          userId: user.id,
          newsId: news.id,
          isLike: faker.datatype.boolean(),
        },
      });
    } catch {}
  }

  // 8. COMMENT LIKES
  console.log("Creating comment likes...");
  for (let i = 0; i < 50; i++) {
    const user = faker.helpers.arrayElement(users);
    const comment = faker.helpers.arrayElement(comments);
    try {
      await prisma.commentLike.create({
        data: {
          userId: user.id,
          commentId: comment.id,
          isLike: faker.datatype.boolean(),
        },
      });
    } catch {}
  }

  console.log("✅ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Error seeding:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
