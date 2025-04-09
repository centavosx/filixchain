import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';

export function IsExistingOnly<T = unknown>(
  validator: (ctx: T) => boolean,
  validationOptions?: ValidationOptions,
) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isExistingOnly',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          if (value !== undefined && value !== null) {
            return validator(args.object as any);
          }

          return true;
        },
      },
    });
  };
}
