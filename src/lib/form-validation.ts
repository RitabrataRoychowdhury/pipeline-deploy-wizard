import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Please enter a valid email address');
export const urlSchema = z.string().url('Please enter a valid URL');
export const requiredStringSchema = z.string().min(1, 'This field is required');
export const optionalStringSchema = z.string().optional();

// Pipeline validation schemas
export const pipelineNameSchema = z
  .string()
  .min(1, 'Pipeline name is required')
  .max(100, 'Pipeline name must be less than 100 characters')
  .regex(/^[a-zA-Z0-9\-_\s]+$/, 'Pipeline name can only contain letters, numbers, spaces, hyphens, and underscores');

export const pipelineDescriptionSchema = z
  .string()
  .max(500, 'Description must be less than 500 characters')
  .optional();

export const repositoryUrlSchema = z
  .string()
  .min(1, 'Repository URL is required')
  .regex(
    /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w\-\.]+\/[\w\-\.]+(?:\.git)?$/,
    'Please enter a valid Git repository URL'
  );

export const branchNameSchema = z
  .string()
  .min(1, 'Branch name is required')
  .regex(/^[a-zA-Z0-9\-_\/]+$/, 'Branch name contains invalid characters');

// Form validation schemas
export const createPipelineSchema = z.object({
  name: pipelineNameSchema,
  description: pipelineDescriptionSchema,
  repository: requiredStringSchema,
  branch: branchNameSchema,
  trigger: z.enum(['manual', 'push', 'pull_request', 'schedule']),
});

export const repositorySchema = z.object({
  name: requiredStringSchema,
  url: repositoryUrlSchema,
  provider: z.enum(['github', 'gitlab', 'bitbucket']),
  defaultBranch: branchNameSchema,
});

export const userSettingsSchema = z.object({
  instanceName: requiredStringSchema,
  baseUrl: urlSchema,
  timezone: requiredStringSchema,
  apiKey: requiredStringSchema,
  sessionTimeout: z.string().regex(/^\d+$/, 'Must be a number'),
  requireAuthentication: z.boolean(),
  emailNotifications: z.boolean(),
  slackNotifications: z.boolean(),
  webhookNotifications: z.boolean(),
  notificationEmail: emailSchema.optional(),
  slackWebhook: urlSchema.optional(),
  maxConcurrentBuilds: z.string().regex(/^\d+$/, 'Must be a number'),
  buildTimeout: z.string().regex(/^\d+$/, 'Must be a number'),
  cleanupPolicy: z.string().regex(/^\d+$/, 'Must be a number'),
  dockerImage: requiredStringSchema,
  dbHost: requiredStringSchema,
  dbPort: z.string().regex(/^\d+$/, 'Must be a valid port number'),
  dbName: requiredStringSchema,
  backupInterval: z.enum(['never', 'daily', 'weekly', 'monthly']),
});

// Node configuration validation
export const nodeConfigSchema = z.object({
  label: requiredStringSchema,
  stepType: requiredStringSchema,
  command: z.string().optional(),
  configuration: z.record(z.any()).optional(),
});

// Validation utility functions
export const validateForm = <T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  errors?: Record<string, string>;
} => {
  try {
    const validatedData = schema.parse(data);
    return { success: true, data: validatedData };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {};
      error.errors.forEach((err) => {
        const path = err.path.join('.');
        errors[path] = err.message;
      });
      return { success: false, errors };
    }
    return { success: false, errors: { general: 'Validation failed' } };
  }
};

export const validateField = <T>(schema: z.ZodSchema<T>, value: unknown): {
  success: boolean;
  error?: string;
} => {
  try {
    schema.parse(value);
    return { success: true };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0]?.message || 'Validation failed' };
    }
    return { success: false, error: 'Validation failed' };
  }
};

// Real-time validation hook
export const useFormValidation = <T>(schema: z.ZodSchema<T>) => {
  const validate = (data: unknown) => validateForm(schema, data);
  const validateSingle = (field: keyof T, value: unknown) => {
    try {
      const fieldSchema = (schema as any).shape?.[field as string];
      if (fieldSchema) {
        return validateField(fieldSchema, value);
      }
    } catch {
      // Field schema not available
    }
    return { success: true };
  };

  return { validate, validateSingle };
};

// Common validation patterns
export const ValidationPatterns = {
  email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  url: /^https?:\/\/.+/,
  gitUrl: /^https?:\/\/(github\.com|gitlab\.com|bitbucket\.org)\/[\w\-\.]+\/[\w\-\.]+(?:\.git)?$/,
  branchName: /^[a-zA-Z0-9\-_\/]+$/,
  pipelineName: /^[a-zA-Z0-9\-_\s]+$/,
  dockerImage: /^[a-z0-9]+(?:[._-][a-z0-9]+)*(?:\/[a-z0-9]+(?:[._-][a-z0-9]+)*)*(?::[a-zA-Z0-9_][a-zA-Z0-9._-]{0,127})?$/,
  port: /^\d{1,5}$/,
  ipAddress: /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/,
  hostname: /^[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9\-]{0,61}[a-zA-Z0-9])?)*$/,
};

// Sanitization functions
export const sanitizeInput = (input: string): string => {
  return input.trim().replace(/[<>]/g, '');
};

export const sanitizeUrl = (url: string): string => {
  try {
    const parsed = new URL(url);
    return parsed.toString();
  } catch {
    return '';
  }
};

export const sanitizeFilename = (filename: string): string => {
  return filename.replace(/[^a-zA-Z0-9\-_\.]/g, '_');
};

// Form field validation messages
export const ValidationMessages = {
  required: 'This field is required',
  email: 'Please enter a valid email address',
  url: 'Please enter a valid URL',
  minLength: (min: number) => `Must be at least ${min} characters`,
  maxLength: (max: number) => `Must be no more than ${max} characters`,
  pattern: 'Invalid format',
  number: 'Must be a valid number',
  positive: 'Must be a positive number',
  integer: 'Must be a whole number',
  range: (min: number, max: number) => `Must be between ${min} and ${max}`,
};

export type ValidationResult = {
  success: boolean;
  data?: any;
  errors?: Record<string, string>;
};

export type FieldValidationResult = {
  success: boolean;
  error?: string;
};