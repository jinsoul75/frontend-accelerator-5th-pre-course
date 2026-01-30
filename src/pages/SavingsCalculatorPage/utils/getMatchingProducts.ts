import { SavingsProduct, SavingsInput } from '../types/types';
import { isProductMatchingInput } from './isProductMatchingInput';

export const getMatchingProducts = (
  savingsProducts: SavingsProduct[],
  savingsInput: SavingsInput
): SavingsProduct[] => {
  return savingsProducts.filter(product => isProductMatchingInput(product, savingsInput));
};
