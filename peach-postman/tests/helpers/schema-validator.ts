import Ajv, { type ValidateFunction } from 'ajv';
import { readFileSync } from 'fs';
import { join } from 'path';

const ajv = new Ajv({ allErrors: true });
const schemaCache = new Map<string, ValidateFunction>();

export function validateSchema(data: unknown, schemaPath: string): void {
  const cached = schemaCache.get(schemaPath);
  if (cached) {
    const valid = cached(data);
    if (!valid) {
      const errors = cached.errors?.map((error) => String(error.instancePath) + ' ' + String(error.message)).join('; ');
      throw new Error('Schema validation failed: ' + errors);
    }
    return;
  }

  const schemaFile = readFileSync(join(__dirname, '..', 'fixtures', 'schemas', schemaPath), 'utf-8');
  const compiled = ajv.compile(JSON.parse(schemaFile)) as ValidateFunction;
  schemaCache.set(schemaPath, compiled);
  const valid = compiled(data);
  if (!valid) {
    const errors = compiled.errors?.map((error) => String(error.instancePath) + ' ' + String(error.message)).join('; ');
    throw new Error('Schema validation failed: ' + errors);
  }
}
