import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsCorporateEmail(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isCorporateEmail',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (typeof value !== 'string') {
            return false;
          }
          const parts = value.split('@');
          if (parts.length !== 2) {
            return false;
          }
          const domain = parts[1].toLowerCase();
          const blockList = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com'];
          return !blockList.includes(domain);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a corporate email address (public domains like gmail.com, yahoo.com, hotmail.com, or outlook.com are not allowed)`;
        },
      },
    });
  };
}
