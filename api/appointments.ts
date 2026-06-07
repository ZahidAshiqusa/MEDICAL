import type { VercelRequest, VercelResponse } from '@vercel/node';
import { readJsonFile, updateJsonFile } from '../src/utils/githubCommit.js';

interface Appointment {
  tokenNumber: number;
  patientName: string;
  idCard?: string;
  age: number;
  phone: string;
  issue: string;
  doctor: string;
  createdAt: string;
}

interface TokenCounter {
  nextToken: number;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    switch (req.method) {
      case 'GET': {
        const appointments = await readJsonFile<Appointment[]>('data/appointments.json');
        
        let filtered = appointments;
        const { doctor, from, to } = req.query;
        
        if (doctor) {
          filtered = filtered.filter(a => a.doctor === doctor);
        }
        if (from) {
          filtered = filtered.filter(a => new Date(a.createdAt) >= new Date(from as string));
        }
        if (to) {
          filtered = filtered.filter(a => new Date(a.createdAt) <= new Date(to as string));
        }
        
        return res.json(filtered);
      }

      case 'POST': {
        const { patientName, idCard, age, phone, issue, doctor } = req.body;
        if (!patientName || !age || !phone || !issue) {
          return res.status(400).json({ error: 'Patient name, age, phone, and issue are required' });
        }

        // Get and increment token number atomically
        const counter = await updateJsonFile<TokenCounter>(
          'data/token-counter.json',
          (data) => ({ nextToken: (data?.nextToken || 0) + 1 }),
          'Increment token counter'
        );

        const newAppointment: Appointment = {
          tokenNumber: counter.nextToken,
          patientName: patientName.trim(),
          idCard: idCard?.trim() || undefined,
          age: Number(age),
          phone: phone.trim(),
          issue: issue.trim(),
          doctor: doctor?.trim() || 'Regular',
          createdAt: new Date().toISOString()
        };

        await updateJsonFile<Appointment[]>(
          'data/appointments.json',
          (appointments) => [...appointments, newAppointment],
          `New appointment: Token #${newAppointment.tokenNumber}`
        );

        return res.json(newAppointment);
      }

      case 'PUT': {
        const { tokenNumber, patientName, idCard, age, phone, issue, doctor } = req.body;
        if (!tokenNumber) {
          return res.status(400).json({ error: 'Token number is required' });
        }

        await updateJsonFile<Appointment[]>(
          'data/appointments.json',
          (appointments) => appointments.map(a => 
            a.tokenNumber === tokenNumber 
              ? { ...a, patientName, idCard, age: Number(age), phone, issue, doctor }
              : a
          ),
          `Update appointment: Token #${tokenNumber}`
        );

        return res.json({ success: true });
      }

      case 'DELETE': {
        const { tokenNumber } = req.query;
        if (!tokenNumber) {
          return res.status(400).json({ error: 'Token number is required' });
        }

        await updateJsonFile<Appointment[]>(
          'data/appointments.json',
          (appointments) => appointments.filter(a => a.tokenNumber !== Number(tokenNumber)),
          `Remove appointment: Token #${tokenNumber}`
        );

        return res.json({ success: true });
      }

      default:
        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end();
    }
  } catch (error) {
    console.error('Appointments API error:', error);
    return res.status(500).json({ error: error instanceof Error ? error.message : 'Internal error' });
  }
}
