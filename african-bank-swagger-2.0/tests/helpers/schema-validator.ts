import Ajv, { type ValidateFunction } from 'ajv';
import { readFileSync } from 'fs';
import { join } from 'path';

const ajv = new Ajv({ allErrors: true });
const schemaCache = new Map<string, ValidateFunction>();

export function validateSchema(data: unknown, schemaPath: string): void {
  let validate = schemaCache.get(schemaPath);
  if (!validate) {
    const schemaFile = readFileSync(
      join(__dirname, '..', 'fixtures', 'schemas', schemaPath),
      'utf-8',
    );
    validate = ajv.compile(JSON.parse(schemaFile));
    schemaCache.set(schemaPath, validate);
  }

  const valid = validate(data);
  if (!valid) {
    const errors = validate.errors
      ?.map((e) => `${e.instancePath} ${e.message}`)
      .join('; ');
    throw new Error(`Schema validation failed: ${errors}`);
  }
}
