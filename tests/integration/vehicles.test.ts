import request from 'supertest';
import app from '../../src/server/app';
import { prisma } from '../../src/server/db';
import { generateToken } from '../../src/server/middleware/auth';

describe('Vehicle Endpoints Integration Tests', () => {
  let userToken: string;
  let adminToken: string;
  let testVehicleId: string;

  beforeAll(async () => {
    // Generate valid tokens
    userToken = generateToken({
      id: 'test-user-id',
      email: 'testuser@incubytemotors.com',
      role: 'USER',
    });

    adminToken = generateToken({
      id: 'test-admin-id',
      email: 'admin@incubytemotors.com',
      role: 'ADMIN',
    });

    // Create a test vehicle for test suite
    const created = await prisma.vehicle.create({
      data: {
        make: 'TestMake',
        model: 'TestModel',
        category: 'EV',
        price: 50000.0,
        quantity: 5,
      },
    });
    testVehicleId = created.id;
  });

  afterAll(async () => {
    await prisma.vehicle.deleteMany({
      where: { make: { in: ['TestMake', 'NewAdminMake', 'SearchMake'] } },
    });
    await prisma.$disconnect();
  });

  describe('Unauthenticated Request Rejection', () => {
    it('should return 401 when accessing GET /api/vehicles without token', async () => {
      const res = await request(app).get('/api/vehicles');
      expect(res.status).toBe(401);
      expect(res.body.error).toBeDefined();
    });
  });

  describe('GET /api/vehicles', () => {
    it('should list vehicles with pagination', async () => {
      const res = await request(app)
        .get('/api/vehicles?page=1&limit=5')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.vehicles)).toBe(true);
      expect(res.body.total).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/vehicles/search', () => {
    it('should filter vehicles by search criteria', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=TestMake&category=EV&minPrice=10000&maxPrice=100000')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicles.length).toBeGreaterThanOrEqual(1);
      expect(res.body.vehicles[0].make).toBe('TestMake');
    });

    it('should return empty list when no matches found', async () => {
      const res = await request(app)
        .get('/api/vehicles/search?make=NonExistentMake99999')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.vehicles.length).toBe(0);
    });
  });

  describe('POST /api/vehicles (Create Vehicle)', () => {
    it('should allow ADMIN to create vehicle', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          make: 'NewAdminMake',
          model: 'Speedster',
          category: 'Coupe',
          price: 75000,
          quantity: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.make).toBe('NewAdminMake');
    });

    it('should deny non-ADMIN user from creating vehicle (403)', async () => {
      const res = await request(app)
        .post('/api/vehicles')
        .set('Authorization', `Bearer ${userToken}`)
        .send({
          make: 'UserMake',
          model: 'UserModel',
          category: 'Sedan',
          price: 30000,
          quantity: 1,
        });

      expect(res.status).toBe(403);
      expect(res.body.error).toMatch(/Admin access required/i);
    });
  });

  describe('POST /api/vehicles/:id/purchase', () => {
    it('should decrement vehicle quantity on valid purchase', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${testVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(200);
      expect(res.body.vehicle.quantity).toBe(4);
    });

    it('should return 400 if purchase quantity exceeds available stock', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${testVehicleId}/purchase`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 999 });

      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/insufficient quantity/i);
    });

    it('should return 404 for non-existent vehicle ID', async () => {
      const res = await request(app)
        .post('/api/vehicles/invalid-vehicle-id-999/purchase')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 1 });

      expect(res.status).toBe(404);
      expect(res.body.error).toMatch(/vehicle not found/i);
    });
  });

  describe('POST /api/vehicles/:id/restock', () => {
    it('should allow ADMIN to restock vehicle quantity', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${testVehicleId}/restock`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ quantity: 10 });

      expect(res.status).toBe(200);
      expect(res.body.vehicle.quantity).toBe(14);
    });

    it('should deny regular USER from restocking (403)', async () => {
      const res = await request(app)
        .post(`/api/vehicles/${testVehicleId}/restock`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ quantity: 5 });

      expect(res.status).toBe(403);
    });
  });

  describe('PUT /api/vehicles/:id (Update)', () => {
    it('should allow ADMIN to update vehicle details', async () => {
      const res = await request(app)
        .put(`/api/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ price: 55000.0 });

      expect(res.status).toBe(200);
      expect(res.body.price).toBe(55000.0);
    });
  });

  describe('DELETE /api/vehicles/:id (Delete)', () => {
    it('should deny regular USER from deleting vehicle (403)', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });

    it('should allow ADMIN to delete vehicle (200)', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.message).toMatch(/deleted successfully/i);
    });

    it('should return 404 when deleting already deleted vehicle', async () => {
      const res = await request(app)
        .delete(`/api/vehicles/${testVehicleId}`)
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
    });
  });
});
