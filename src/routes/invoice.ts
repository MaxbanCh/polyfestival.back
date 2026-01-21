import { Router } from 'express';
import type { Invoice } from '../types/invoice';
import {
  getInvoicesByReservation,
  getAllInvoices,
  addInvoice,
  markInvoiceAsPaid,
  updateInvoice,
  deleteInvoice,
} from '../reservation/invoice';

const invoiceRouter = Router();

invoiceRouter.get('/', async (req, res) => {
  const reservationId = parseInt(req.query.reservationId as string, 10);
  if (Number.isFinite(reservationId)) {
    const invoices: Invoice[] = await getInvoicesByReservation(reservationId);
    return res.json(invoices);
  }

  const invoices: Invoice[] = await getAllInvoices();
  res.json(invoices);
});

invoiceRouter.post('/', async (req, res) => {
  const { reservationId, amountTtc, vatRate } = req.body ?? {};
  if (!Number.isFinite(reservationId) || !Number.isFinite(amountTtc)) {
    return res.status(400).json({ error: 'reservationId et amountTtc requis' });
  }

  const invoice: Invoice = await addInvoice(reservationId, amountTtc, vatRate ?? 20);
  res.status(201).json(invoice);
});

invoiceRouter.post('/:id/pay', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }

  const invoice: Invoice | null = await markInvoiceAsPaid(id);
  if (invoice) {
    res.json(invoice);
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

invoiceRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }
  const { amountTtc, vatRate, status, issuedAt, dueDate } = req.body ?? {};

  const invoice: Invoice | null = await updateInvoice(id, {
    amountTtc,
    vatRate,
    status,
    issuedAt,
    dueDate,
  });
  if (invoice) {
    res.json(invoice);
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

invoiceRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }
  const success: boolean = await deleteInvoice(id);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

export default invoiceRouter;