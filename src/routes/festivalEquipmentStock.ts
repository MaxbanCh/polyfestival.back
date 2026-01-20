import { Router } from 'express';
import type { FestivalEquipmentStock } from '../types/festivalEquipmentStock';
import {
  getStocksByFestival,
  getAllStocks,
  addStock,
  updateStock,
  deleteStock,
} from '../festival/festivalEquipmentStock';

const festivalEquipmentStockRouter = Router();

festivalEquipmentStockRouter.get('/', async (req, res) => {
  const festivalId = parseInt(req.query.festivalId as string, 10);
  if (Number.isFinite(festivalId)) {
    const stocks: FestivalEquipmentStock[] = await getStocksByFestival(festivalId);
    return res.json(stocks);
  }
  const stocks: FestivalEquipmentStock[] = await getAllStocks();
  res.json(stocks);
});

festivalEquipmentStockRouter.post('/', async (req, res) => {
  const { festivalId, equipmentId, quantityAvailable } = req.body ?? {};
  if (!Number.isFinite(festivalId) || !Number.isFinite(equipmentId)) {
    return res.status(400).json({ error: 'festivalId et equipmentId requis' });
  }
  if (!Number.isFinite(quantityAvailable)) {
    return res.status(400).json({ error: 'quantityAvailable requis' });
  }

  const newStock: Omit<FestivalEquipmentStock, 'id'> = {
    festivalId,
    equipmentId,
    quantityAvailable,
  };
  const stock: FestivalEquipmentStock = await addStock(newStock);
  res.status(201).json(stock);
});

festivalEquipmentStockRouter.post('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }
  const { quantityAvailable } = req.body ?? {};

  const stock: FestivalEquipmentStock | null = await updateStock(id, quantityAvailable);
  if (stock) {
    res.json(stock);
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

festivalEquipmentStockRouter.delete('/:id', async (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (!Number.isFinite(id)) {
    return res.status(400).json({ error: 'Id invalide' });
  }
  const success: boolean = await deleteStock(id);
  if (success) {
    res.status(204).send();
  } else {
    res.status(404).json({ error: 'Introuvable' });
  }
});

export default festivalEquipmentStockRouter;