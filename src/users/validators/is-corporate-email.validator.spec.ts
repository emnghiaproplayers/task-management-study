import { validate } from 'class-validator';
import { IsCorporateEmail } from './is-corporate-email.validator';

class TestUserDto {
  @IsCorporateEmail()
  email: string;
}

describe('IsCorporateEmail Decorator', () => {
  it('should pass for a valid corporate email', async () => {
    const dto = new TestUserDto();
    dto.email = 'john.doe@company.com';
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject a gmail domain', async () => {
    const dto = new TestUserDto();
    dto.email = 'john.doe@gmail.com';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isCorporateEmail).toBeDefined();
    expect(errors[0].constraints?.isCorporateEmail).toContain(
      'must be a corporate email address',
    );
  });

  it('should reject a yahoo domain', async () => {
    const dto = new TestUserDto();
    dto.email = 'john.doe@yahoo.com';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isCorporateEmail).toBeDefined();
  });

  it('should reject an uppercase public domain to prevent bypass', async () => {
    const dto = new TestUserDto();
    dto.email = 'john.doe@GMAIL.COM';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
    expect(errors[0].constraints?.isCorporateEmail).toBeDefined();
  });
});
