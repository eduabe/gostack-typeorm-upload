import { Router } from 'express';
import { getCustomRepository, Transaction } from 'typeorm';
import fs from 'fs';
import uploadConfig from '../config/upload';
import multer from 'multer';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  const transactions = await transactionsRepository.find();

  const balance = await transactionsRepository.getBalance();

  const allTransactions = {
    transactions,
    balance,
  };

  return response.status(200).json(allTransactions);
});

transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createTransaction = new CreateTransactionService();

  const newTransaction = await createTransaction.execute({
    title,
    value,
    type,
    category,
  });

  return response.status(201).json(newTransaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;

  const deleteTransaction = new DeleteTransactionService();

  await deleteTransaction.execute(id);

  return response.status(204).send();
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    console.log(request.file);

    const importTransaction = new ImportTransactionsService();
    const savedTransactions = await importTransaction.execute(
      request.file.filename,
    );

    return response.status(200).json(savedTransactions);
    0;
  },
);

export default transactionsRouter;
