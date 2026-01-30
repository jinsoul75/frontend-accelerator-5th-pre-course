import { SavingsProduct } from '../types/types';
import { getMatchingProducts } from './getMatchingProducts';
import { getTopProductsByRate } from './getTopProductsByRate';

const RECOMMENDED_PRODUCT_COUNT = 2;

export function getRecommendedProducts(
  products: SavingsProduct[],
  savingsInput: { targetAmount: string; monthlyAmount: string; savingsTerm: number }
): SavingsProduct[] {
  const matchedProducts = getMatchingProducts(products, savingsInput);

  const topProducts = getTopProductsByRate(matchedProducts, RECOMMENDED_PRODUCT_COUNT);

  return topProducts;
}
