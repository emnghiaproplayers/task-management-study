import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';

describe('UsersController (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
      }),
    );
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /users -> should create user successfully with valid payload (201)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'john.doe@company.com',
        address: {
          street: '123 Main Street',
          city: 'New York',
          zipCode: '10001',
        },
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.email).toBe('john.doe@company.com');
        expect(res.body.address.zipCode).toBe('10001');
      });
  });

  it('POST /users -> should fail with 400 when zipCode is invalid (path address.zipCode)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'john.doe@company.com',
        address: {
          street: '123 Main Street',
          city: 'New York',
          zipCode: '12',
        },
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toContain(
          'address.zipCode must be a numeric string between 4 and 10 digits',
        );
      });
  });

  it('POST /users -> should fail with 400 when email domain is public (gmail.com)', () => {
    return request(app.getHttpServer())
      .post('/users')
      .send({
        email: 'john.doe@gmail.com',
        address: {
          street: '123 Main Street',
          city: 'New York',
          zipCode: '10001',
        },
      })
      .expect(400)
      .expect((res) => {
        expect(res.body.message[0]).toContain(
          'must be a corporate email address',
        );
      });
  });
});
