import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJsonFile, updateJsonFile, generateUniqueId, generateRecordId } from '../src/utils/githubCommit.js';

interface StaffMember {
  id: string;
  name: string;
  role: string;
  field?: string;
  phone?: string;
  joined: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const staff = await readJsonFile<StaffMember[]>('data/staff.json');
        return res.json(staff);
      }

      case 'POST': {
        const { name, role, field, phone } = req.body;
        if (!name || !role) {
          return res.status(400).json({ error: 'Name and role are required' });
        }

        let id = generateUniqueId(12);
        const existing = await readJsonFile<StaffMember[]>('data/staff.json');
        while (existing.some(s => s.id === id)) {
          id = generateUniqueId(12);
        }

        const newStaff: StaffMember = {
          id,
          name: name.trim(),
          role,
          field: field?.trim() || undefined,
          phone: phone?.trim() || undefined,
          joined: new Date().toISOString()
        };

        const updated = await updateJsonFile<StaffMember[]>(
          'data/staff.json',
          (staff) => [...staff, newStaff],
          `Add staff: ${newStaff.name}`
        );

        return res.json(newStaff);
      }

      case 'PUT': {
        const { id, name, role, field, phone } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Staff ID is required' });
        }

        const updated = await updateJsonFile<StaffMember[]>(
          'data/staff.json',
          (staff) => staff.map(s => s.id === id ? { ...s, name, role, field, phone } : s),
          `Update staff: ${name || id}`
        );

        return res.json({ success: true });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Staff ID is required' });
        }

        await updateJsonFile<StaffMember[]>(
          'data/staff.json',
          (staff) => staff.filter(s => s.id !== id),
          `Remove staff: ${id}`
        );

        return res.json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end();
    }
  } catch (error) {
    console.error('Staff API error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal error' });
  }
}
