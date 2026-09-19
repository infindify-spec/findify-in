import { z } from 'zod';

// Indian 6-digit Pincode regex (100000 - 999999, cannot start with 0)
export const pincodeRegex = /^[1-9][0-9]{5}$/;

// Indian 10-digit Mobile regex (starts with 6, 7, 8, or 9)
export const mobileRegex = /^[6-9]\d{9}$/;

export const addressSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters'),
  mobile: z.string().regex(mobileRegex, 'Please enter a valid 10-digit Indian mobile number'),
  email: z.string().email('Please enter a valid email address'),
  houseFlat: z.string().min(1, 'House/Flat number is required'),
  street: z.string().min(2, 'Street or building name is required'),
  area: z.string().min(2, 'Area or locality is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().regex(pincodeRegex, 'Please enter a valid 6-digit Indian Pincode'),
  landmark: z.string().optional(),
});

export const checkoutSchema = z.object({
  customer: addressSchema,
  paymentMethod: z.enum(['PREPAID', 'COD']),
  couponCode: z.string().optional(),
});

export const productSchema = z.object({
  name: z.string().min(3, 'Product name required'),
  sku: z.string().min(3, 'SKU required'),
  categoryId: z.string().min(1, 'Category required'),
  subcategoryId: z.string().optional(),
  mrp: z.number().positive('MRP must be positive'),
  sellingPrice: z.number().positive('Selling price must be positive'),
  costPrice: z.number().optional(),
  stock: z.number().int().nonnegative('Stock cannot be negative'),
  lowStockThreshold: z.number().int().default(5),
  description: z.string().min(10, 'Description required'),
  shortDescription: z.string().optional(),
  images: z.array(z.string().url()).min(1, 'At least one image URL required'),
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});
