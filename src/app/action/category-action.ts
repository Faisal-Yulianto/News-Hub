"use server";

import prisma from "@/lib/prisma";

const INCLUDED_CATEGORY = [
  "Computers",
  "Movies",
  "Automotive",
  "Sports",
];

export async function getCategory() {
  try {
    const category = await prisma.category.findMany({
      where: {
        name: {
          in: INCLUDED_CATEGORY,
        },
      },
      orderBy: { name: "desc" },
    });
    return category;
  } catch {
    throw new Error("failed fetch category");
  }
}

export async function getMoreCategory() {
  try {
    const category = await prisma.category.findMany({
      where: {
        name: {
          notIn: INCLUDED_CATEGORY,
        },
      },
      orderBy: { name: "desc" },
    });
    return category;
  } catch {
    throw new Error("failed fetch category");
  }
}

export async function getAllCategory() {
  try {
    const category = await prisma.category.findMany({
      orderBy: { name: "desc" },
    });
    return category;
  } catch {
    throw new Error("failed fetch category");
  }
}
