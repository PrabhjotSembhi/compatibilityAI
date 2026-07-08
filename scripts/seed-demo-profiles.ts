import "dotenv/config";

import fs from "node:fs";
import path from "node:path";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient, type Prisma } from "../src/generated/prisma/client";

type FakeProfile = {
  id: string;
  name: string;
  age: number;
  gender: string;
  orientation: string;
  city: string;
  country: string;
  languages: string[];
  relationship_goal: string;
  personality: {
    big_five: Record<string, number>;
    communication_style: string;
    attachment_style: string;
    love_language: string;
    conflict_style: string;
  };
  lifestyle: Record<string, unknown>;
  career: Record<string, unknown>;
  interests: string[];
  values: string[];
  deal_breakers: string[];
  green_flags: string[];
  red_flags: string[];
  relationship_strengths: string[];
  blind_spots: string[];
  ai_summary: string;
  ideal_partner: string;
  embedding: number[];
};

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required.");
}

assertLocalDatabase(databaseUrl);

const fixturePath =
  process.env.DEMO_FIXTURE_PATH ??
  "C:\\Users\\Ryzen\\Desktop\\fake_compatibility_profiles_50.json";
const resolvedFixturePath = path.resolve(fixturePath);
const rawProfiles = JSON.parse(
  fs.readFileSync(resolvedFixturePath, "utf8"),
) as FakeProfile[];

const adapter = new PrismaPg({ connectionString: databaseUrl });
const prisma = new PrismaClient({ adapter });

async function main() {
  if (!Array.isArray(rawProfiles) || rawProfiles.length === 0) {
    throw new Error("Demo fixture must be a non-empty JSON array.");
  }

  const context = await prisma.relationshipContext.upsert({
    where: { slug: "demo-dating" },
    update: {
      name: "Demo Dating",
      status: "ACTIVE",
      description: "Local-only demo context for testing matching flows.",
    },
    create: {
      id: "demo_dating",
      slug: "demo-dating",
      name: "Demo Dating",
      status: "ACTIVE",
      description: "Local-only demo context for testing matching flows.",
      scoringConfig: {
        weights: {
          lifestyle: 20,
          personality: 20,
          interests: 15,
          values: 25,
          vector: 20,
        },
      },
    },
  });

  for (const profile of rawProfiles) {
    const now = new Date();

    await prisma.user.upsert({
      where: { id: profile.id },
      update: {
        name: profile.name,
        email: `${profile.id}@demo.local`,
        emailVerified: true,
        updatedAt: now,
      },
      create: {
        id: profile.id,
        name: profile.name,
        email: `${profile.id}@demo.local`,
        emailVerified: true,
        createdAt: now,
        updatedAt: now,
      },
    });

    const existingProfile = await prisma.profile.findUnique({
      where: {
        userId_relationshipContextId: {
          userId: profile.id,
          relationshipContextId: context.id,
        },
      },
    });

    const profileRecord = existingProfile
      ? await prisma.profile.update({
          where: { id: existingProfile.id },
          data: profileData(profile, context.id),
        })
      : await prisma.profile.create({
          data: {
            userId: profile.id,
            ...profileData(profile, context.id),
          },
        });

    await prisma.personalityProfile.upsert({
      where: { profileId: profileRecord.id },
      update: personalityData(profile),
      create: {
        userId: profile.id,
        profileId: profileRecord.id,
        ...personalityData(profile),
      },
    });

    await prisma.compatibilityProfile.upsert({
      where: { profileId: profileRecord.id },
      update: compatibilityData(profile, context.id),
      create: {
        userId: profile.id,
        profileId: profileRecord.id,
        ...compatibilityData(profile, context.id),
      },
    });
  }

  console.log(
    `Seeded ${rawProfiles.length} demo profiles into local context ${context.id} (${context.slug}).`,
  );
  console.log(
    "Try actorUserId=user_001 and relationshipContextId=" + context.id,
  );
}

function profileData(profile: FakeProfile, relationshipContextId: string) {
  return {
    relationshipContextId,
    displayName: profile.name,
    bio: profile.ai_summary,
    city: profile.city,
    country: profile.country,
    languages: profile.languages,
    visibility: "DISCOVERABLE" as const,
    status: "ACTIVE" as const,
    attributes: toInputJsonObject({
      age: profile.age,
      gender: profile.gender,
      orientation: profile.orientation,
      relationshipGoal: profile.relationship_goal,
      lifestyle: profile.lifestyle,
      career: profile.career,
      greenFlags: profile.green_flags,
      redFlags: profile.red_flags,
      idealPartner: profile.ideal_partner,
    }),
    preferences: toInputJsonObject({
      idealPartner: profile.ideal_partner,
      relationshipGoal: profile.relationship_goal,
    }),
    constraints: toInputJsonObject({}),
  };
}

function personalityData(profile: FakeProfile) {
  return {
    dimensions: toInputJsonObject({
      bigFive: profile.personality.big_five,
      loveLanguage: profile.personality.love_language,
    }),
    strengths: toInputJsonObject({
      items: profile.relationship_strengths,
      greenFlags: profile.green_flags,
    }),
    blindSpots: toInputJsonObject({
      items: profile.blind_spots,
      redFlags: profile.red_flags,
    }),
    communicationStyle: profile.personality.communication_style,
    conflictStyle: profile.personality.conflict_style,
    attachmentStyle: profile.personality.attachment_style,
    source: "local_demo_seed",
    confidence: 0.8,
  };
}

function compatibilityData(
  profile: FakeProfile,
  relationshipContextId: string,
) {
  return {
    relationshipContextId,
    features: toInputJsonObject({
      lifestyle: profile.lifestyle,
      career: profile.career,
      relationshipGoal: profile.relationship_goal,
      orientation: profile.orientation,
      age: profile.age,
    }),
    values: toInputJsonObject(
      Object.fromEntries(profile.values.map((value) => [value, true])),
    ),
    interests: toInputJsonObject(
      Object.fromEntries(profile.interests.map((interest) => [interest, true])),
    ),
    dealBreakers: toInputJsonObject({
      excludedAttributes: {},
      notes: profile.deal_breakers,
    }),
    embedding: profile.embedding,
  };
}

function toInputJsonObject(value: unknown) {
  return value as Prisma.InputJsonObject;
}

function assertLocalDatabase(url: string) {
  const hostname = readDatabaseHostname(url);
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);
  const allowRemote = process.env.ALLOW_REMOTE_DEMO_SEED === "true";

  if (localHosts.has(hostname) || allowRemote) {
    return;
  }

  throw new Error(
    [
      "Refusing to seed demo data into a non-local database.",
      `Database host: ${hostname}`,
      "Use a local DATABASE_URL for demo testing.",
      "Only set ALLOW_REMOTE_DEMO_SEED=true for a disposable test database.",
    ].join("\n"),
  );
}

function readDatabaseHostname(url: string) {
  try {
    return new URL(url).hostname;
  } catch {
    const match = url.match(/@([^/:?]+)(?::\d+)?(?:\/|\?)/);

    if (!match?.[1]) {
      throw new Error("Could not read database host from DATABASE_URL.");
    }

    return match[1];
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
