import { Assets, colors, ListRow } from 'tosslib';

import { SavingsProduct } from '../types/types';
import { formatCurrency } from '../lib/formatCurrency';

export const SavingsProductItem = ({
  product,
  isSelected,
  onClick,
}: {
  product: SavingsProduct;
  isSelected: boolean;
  onClick?: () => void;
}) => {
  return (
    <ListRow
      key={product.id}
      contents={
        <ListRow.Texts
          type="3RowTypeA"
          top={product.name}
          topProps={{ fontSize: 16, fontWeight: 'bold', color: colors.grey900 }}
          middle={`연 이자율: ${product.annualRate}%`}
          middleProps={{ fontSize: 14, color: colors.blue600, fontWeight: 'medium' }}
          bottom={`${formatCurrency(product.minMonthlyAmount)} ~ ${formatCurrency(product.maxMonthlyAmount)} | ${product.availableTerms}개월`}
          bottomProps={{ fontSize: 13, color: colors.grey600 }}
        />
      }
      right={isSelected ? <Assets.Icon name="icon-check-circle-green" /> : null}
      onClick={onClick}
    />
  );
};
