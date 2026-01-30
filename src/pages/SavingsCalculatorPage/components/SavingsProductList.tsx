export const SavingsProductList = ({
  items,
  renderItem,
}: {
  items: any[];
  renderItem: (item: any) => React.ReactNode;
}) => {
  return <>{items.map(renderItem)}</>;
};
