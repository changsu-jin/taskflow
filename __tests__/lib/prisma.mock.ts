import { PrismaClient } from "@prisma/client";
import { mockDeep, DeepMockProxy } from "jest-mock-extended";

export type MockPrismaClient = DeepMockProxy<PrismaClient>;

const mockPrisma = mockDeep<PrismaClient>();

jest.mock("@/lib/prisma", () => ({
  prisma: mockPrisma,
}));

export default mockPrisma;
