import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJsonFile, updateJsonFile, generateRecordId } from '../src/utils/githubCommit.js';

interface AttendanceRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  field?: string;
  checkIn: string;
  notes?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const records = await readJsonFile<AttendanceRecord[]>('data/attendance.json');
        
        let filtered = records;
        const { staffId, name, role, from, to } = req.query;
        
        if (staffId) {
          filtered = filtered.filter(r => r.staffId === staffId);
        }
        if (name) {
          filtered = filtered.filter(r => r.staffName.toLowerCase().includes((name as string).toLowerCase()));
        }
        if (role) {
          filtered = filtered.filter(r => r.role === role);
        }
        if (from) {
          filtered = filtered.filter(r => new Date(r.checkIn) >= new Date(from as string));
        }
        if (to) {
          filtered = filtered.filter(r => new Date(r.checkIn) <= new Date(to as string));
        }
        
        return res.json(filtered);
      }

      case 'POST': {
        const { staffId, staffName, role, field, notes } = req.body;
        if (!staffId || !staffName || !role) {
          return res.status(400).json({ error: 'Staff ID, name, and role are required' });
        }

        // Enforce daily limit: only 1 attendance per staff per day
        const existingRecords = await readJsonFile<AttendanceRecord[]>('data/attendance.json');
        const today = new Date().toDateString();
        const alreadyMarked = existingRecords.some(
          r => r.staffId === staffId && new Date(r.checkIn).toDateString() === today
        );
        if (alreadyMarked) {
          return res.status(409).json({ error: 'Attendance already marked for today' });
        }

        const newRecord: AttendanceRecord = {
          id: generateRecordId(),
          staffId,
          staffName: staffName.trim(),
          role,
          field: field?.trim() || undefined,
          checkIn: new Date().toISOString(),
          notes: notes?.trim() || undefined
        };

        await updateJsonFile<AttendanceRecord[]>(
          'data/attendance.json',
          (records) => [...records, newRecord],
          `Attendance: ${newRecord.staffName}`
        );

        return res.json(newRecord);
      }

      case 'PUT': {
        const { id, notes } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Record ID is required' });
        }

        await updateJsonFile<AttendanceRecord[]>(
          'data/attendance.json',
          (records) => records.map(r => r.id === id ? { ...r, notes } : r),
          `Update attendance: ${id}`
        );

        return res.json({ success: true });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Record ID is required' });
        }

        await updateJsonFile<AttendanceRecord[]>(
          'data/attendance.json',
          (records) => records.filter(r => r.id !== id),
          `Remove attendance: ${id}`
        );

        return res.json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end();
    }
  } catch (error) {
    console.error('Attendance API error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal error' });
  }
}
