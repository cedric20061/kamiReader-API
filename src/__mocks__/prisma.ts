// __mocks__/prisma.ts
export default {
  library: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
  },
  preference: {
    findMany: jest.fn(),
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    upsert: jest.fn(),
    
  },
  libraryItem: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
};
