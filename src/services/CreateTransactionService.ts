import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';
import Category from '../models/Category';
// import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total - value < 0) {
      throw new AppError(
        'Cannot create outcome transaction without a valid balance',
      );
    }

    const newTransaction = transactionsRepository.create({
      title,
      type,
      value,
    });

    const categoryRepository = getRepository(Category);
    const loadedCategory = await categoryRepository.findOne({
      where: { title: category },
    });

    if (!loadedCategory) {
      const newCategory = categoryRepository.create({
        title: category,
      });
      const savedCategory = await categoryRepository.save(newCategory);
      newTransaction.category_id = savedCategory.id;
    } else {
      newTransaction.category_id = loadedCategory.id;
    }

    return transactionsRepository.save(newTransaction);
  }
}

export default CreateTransactionService;
