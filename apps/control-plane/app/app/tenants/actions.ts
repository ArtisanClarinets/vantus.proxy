'use server';
import { prisma } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createTenant(formData: FormData) {
  const name = formData.get('name') as string;
  const slug = formData.get('slug') as string;

  if (!name || name.length < 3) {
      throw new Error("Name must be at least 3 characters.");
  }

  // Sanitize and Validate Slug
  if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
      throw new Error("Invalid slug. Only lowercase letters, numbers, and dashes are allowed.");
  }

  // Check if exists
  const existing = await prisma.tenant.findUnique({ where: { slug } });
  if (existing) {
      throw new Error("Slug already taken.");
  }

  try {
      await prisma.tenant.create({
        data: {
          name,
          slug,
          domains: {
            create: {
                name: `${slug}.vantus.systems`
            }
          }
        }
      });
      revalidatePath('/app/tenants');
      revalidatePath('/app/nginx/render-preview');
  } catch (e) {
      console.error(e);
      throw new Error("Failed to create tenant.");
  }
}
