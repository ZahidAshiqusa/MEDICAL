import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJsonFile, updateJsonFile, generateRecordId } from '../src/utils/githubCommit.js';

interface Complaint {
  id: string;
  patientName: string;
  issue: string;
  resolved: boolean;
  createdAt: string;
  resolvedAt?: string;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const complaints = await readJsonFile<Complaint[]>('data/complaints.json');
        return res.json(complaints);
      }

      case 'POST': {
        const { patientName, issue } = req.body;
        if (!patientName || !issue) {
          return res.status(400).json({ error: 'Patient name and issue are required' });
        }

        const newComplaint: Complaint = {
          id: generateRecordId(),
          patientName: patientName.trim(),
          issue: issue.trim(),
          resolved: false,
          createdAt: new Date().toISOString()
        };

        await updateJsonFile<Complaint[]>(
          'data/complaints.json',
          (complaints) => [...complaints, newComplaint],
          `New complaint: ${newComplaint.patientName}`
        );

        return res.json(newComplaint);
      }

      case 'PUT': {
        const { id, resolved } = req.body;
        if (!id) {
          return res.status(400).json({ error: 'Complaint ID is required' });
        }

        await updateJsonFile<Complaint[]>(
          'data/complaints.json',
          (complaints) => complaints.map(c => 
            c.id === id 
              ? { ...c, resolved: !!resolved, resolvedAt: resolved ? new Date().toISOString() : undefined }
              : c
          ),
          `Update complaint: ${id}`
        );

        return res.json({ success: true });
      }

      case 'DELETE': {
        const { id } = req.query;
        if (!id) {
          return res.status(400).json({ error: 'Complaint ID is required' });
        }

        await updateJsonFile<Complaint[]>(
          'data/complaints.json',
          (complaints) => complaints.filter(c => c.id !== id),
          `Remove complaint: ${id}`
        );

        return res.json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end();
    }
  } catch (error) {
    console.error('Complaints API error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal error' });
  }
}
