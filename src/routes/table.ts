import { Router } from 'express';
import type Table from '../types/table';
import { addTable, modifyTable, getTablesforFestival } from '../festival/table';

const tableRouter = Router();

tableRouter.get('/', async (req, res) => {
    if (req.query.festivalId) {
        const festivalId = parseInt(req.query.festivalId as string, 10);
        const tables: Table[] = await getTablesforFestival(festivalId);
        res.json(tables);
        return;
    }
    // else {
    //     const tables: Table[] = await listTables();
    //     res.json(tables);
    // }
});

tableRouter.post('/', async (req, res) => {
    try {
        const newTable: Omit<Table, "id"> = req.body;
        const retTable: Table = await addTable(newTable.festivalId, newTable.type, newTable.quantityUsedTable, newTable.quantityMaxTable);
        res.status(201).json(retTable);
    } catch (error) {
        res.status(400).send(error instanceof Error ? error.message : 'Invalid request');
    }
});

tableRouter.post('/:id', async (req, res) => {
    const id = parseInt(req.params.id, 10);
    if (id !== req.body.id) {
        res.status(400).send('ID in URL does not match ID in body');
        return;
    }
    const updatedTable: Table | null = await modifyTable(req.body);
    if (updatedTable) {
        res.json(updatedTable);
    }
    else {
        res.status(404).send('Table not found');
    }
});

export default tableRouter;