import {
  Assets,
  Border,
  ListHeader,
  ListRow,
  NavigationBar,
  SelectBottomSheet,
  Spacing,
  Tab,
  TextField,
} from 'tosslib';
import { SavingsProduct } from './types/types';
import { useState } from 'react';

import { formatCurrency } from './lib/formatCurrency';
import { extractNumbers } from './lib/extractNumbers';
import { SavingsCalculationSummary } from './components/SavingsCalculationSummary';
import { SavingsProductItem } from './components/SavingsProductItem';
import {
  calculateDifference,
  calculateExpectedAmount,
  calculateRecommendedMonthlyAmount,
} from './utils/savingsCalculations';
import { isProductMatchingInput } from './utils/savingsProductFilters';
import { getTopProductsByRate } from './utils/productSorting';
import { useSavingsProducts } from './hooks/useSavingsProducts';
import { SavingsProductList } from './components/SavingsProductList';

export function SavingsCalculatorPage() {
  const [savingsInput, setSavingsInput] = useState({
    targetAmount: '',
    monthlyAmount: '',
    savingsTerm: 12,
  });
  const [savingsProductTab, setSavingsProductTab] = useState<'products' | 'results'>('products');
  const [selectedSavingsProduct, setSelectedSavingsProduct] = useState<SavingsProduct | null>(null);

  const { data: savingsProducts = [], isLoading, isError } = useSavingsProducts();

  // formatCurrency, extractNumbers 같은 유틸함수들은 how다. 드러낼 필요가 있을까?
  // 그런데 저 how들을 숨기고 컴포넌트를 만든다면 똑같은 props를 받고 그대로 쓰는 한번 더 래핑한 컴포넌트가 되지 않을까?
  // 그럼에도 불구하고 AmountField처럼 금액 단위를 포매팅하는 how를 숨긴 직관적인 컴포넌트틑 만드는것과
  // 한 번 추상화된(TextField) 컴포넌트를 그대로 사용하는것에 대한 트레이드 오프는 무엇일까?
  // 결론적으로 나는 이 컴포넌트가 현재 2곳에서 쓰이고 리팩토링 비용을 쓸 만한 컴포넌트인지 의문이 들기 때문에 이대로 사용하기로 했다.
  // 하지만 formatCurrency, extractNumbers 같은 유틸함수가 드러나는것이 덜컥거린다.
  // 추상화를 한다면 AmountField로 할 것. 왜냐하면 이 컴포넌트의 본질을 생각했을 때 포매팅을한 금액을 보여주기 떄문에(일반적인 숫자들을 콤마를 찍는 .. 가? 찍겠다.
  // 그러면 NumberField가 좋겠다.

  return (
    <>
      <NavigationBar title="적금 계산기" />

      <Spacing size={16} />

      <TextField
        label="목표 금액"
        placeholder="목표 금액을 입력하세요"
        suffix="원"
        value={savingsInput.targetAmount && formatCurrency(Number(savingsInput.targetAmount))}
        onChange={e => setSavingsInput({ ...savingsInput, targetAmount: extractNumbers(e.target.value) })}
      />
      <Spacing size={16} />
      <TextField
        label="월 납입액"
        placeholder="희망 월 납입액을 입력하세요"
        suffix="원"
        value={savingsInput.monthlyAmount && formatCurrency(Number(savingsInput.monthlyAmount))}
        onChange={e => setSavingsInput({ ...savingsInput, monthlyAmount: extractNumbers(e.target.value) })}
      />
      <Spacing size={16} />
      <SelectBottomSheet
        label="저축 기간"
        title="저축 기간을 선택해주세요"
        value={savingsInput.savingsTerm}
        onChange={value => setSavingsInput({ ...savingsInput, savingsTerm: Number(value) })}
      >
        <SelectBottomSheet.Option value={6}>6개월</SelectBottomSheet.Option>
        <SelectBottomSheet.Option value={12}>12개월</SelectBottomSheet.Option>
        <SelectBottomSheet.Option value={24}>24개월</SelectBottomSheet.Option>
      </SelectBottomSheet>

      <Spacing size={24} />
      <Border height={16} />
      <Spacing size={8} />

      <Tab onChange={value => setSavingsProductTab(value as 'products' | 'results')}>
        <Tab.Item value="products" selected={savingsProductTab === 'products'}>
          적금 상품
        </Tab.Item>
        <Tab.Item value="results" selected={savingsProductTab === 'results'}>
          계산 결과
        </Tab.Item>
      </Tab>
      {/*
      그럼 NumberField와 같은 시각으로 봤을 때 filter도 how일까?
      filter가 드러나지 않으려면 컴포넌트화를 해야하는데
      각각의 컴포넌트에 filter로직이 다르다면 결국 how도 드러나는거 아닌가?
      필터마다 다른이름의 컴포넌트...........?
      */}
      {savingsProductTab === 'products' && (
        <>
          {isLoading ? (
            <ListRow contents={<ListRow.Texts type="1RowTypeA" top="불러오는 중..." />} />
          ) : isError ? (
            <ListRow contents={<ListRow.Texts type="1RowTypeA" top="상품 정보를 불러오지 못했습니다." />} />
          ) : (
            <SavingsProductList
              items={savingsProducts.filter(product => isProductMatchingInput(product, savingsInput))}
              renderItem={product => {
                const isSelected = selectedSavingsProduct?.id === product.id;
                return (
                  <ListRow
                    key={product.id}
                    right={isSelected ? <Assets.Icon name="icon-check-circle-green" /> : null}
                    contents={<SavingsProductItem product={product} />}
                    onClick={() => setSelectedSavingsProduct(isSelected ? null : product)}
                  />
                );
              }}
            />
          )}
        </>
      )}

      {savingsProductTab === 'results' && (
        <>
          <Spacing size={8} />
          {selectedSavingsProduct ? (
            <>
              <SavingsCalculationSummary
                label="예상 수익 금액"
                amount={calculateExpectedAmount({
                  monthlyAmount: Number(savingsInput.monthlyAmount),
                  savingsTerm: savingsInput.savingsTerm,
                  annualRate: selectedSavingsProduct.annualRate,
                })}
              />
              <SavingsCalculationSummary
                label="목표 금액과의 차이"
                amount={calculateDifference({
                  targetAmount: Number(savingsInput.targetAmount),
                  monthlyAmount: Number(savingsInput.monthlyAmount),
                  savingsTerm: savingsInput.savingsTerm,
                  annualRate: selectedSavingsProduct.annualRate,
                })}
              />
              <SavingsCalculationSummary
                label="추천 월 납입 금액"
                amount={calculateRecommendedMonthlyAmount({
                  targetAmount: Number(savingsInput.targetAmount),
                  savingsTerm: savingsInput.savingsTerm,
                  annualRate: selectedSavingsProduct.annualRate,
                })}
              />
            </>
          ) : (
            <ListRow contents={<ListRow.Texts type="1RowTypeA" top="상품을 선택해주세요." />} />
          )}

          <Spacing size={8} />
          <Border height={16} />
          <Spacing size={8} />
          <ListHeader title={<ListHeader.TitleParagraph fontWeight="bold">추천 상품 목록</ListHeader.TitleParagraph>} />
          <Spacing size={12} />

          {/*
            UI에서 봤을 때 가장 상위 2개의 상품을 노출하라는 것을 알 수 가 없음.
            결국 기획서를 봐야하는 부분인데
            코드단에서 그 의도를 잘 전달하려면?
          */}
          {isLoading ? (
            <ListRow contents={<ListRow.Texts type="1RowTypeA" top="불러오는 중..." />} />
          ) : isError ? (
            <ListRow contents={<ListRow.Texts type="1RowTypeA" top="추천 상품을 불러오지 못했습니다." />} />
          ) : (
            <SavingsProductList
              items={getTopProductsByRate(
                savingsProducts.filter(product => isProductMatchingInput(product, savingsInput)),
                2
              )}
              renderItem={product => {
                const isSelected = selectedSavingsProduct?.id === product.id;
                return (
                  <ListRow
                    key={product.id}
                    right={isSelected ? <Assets.Icon name="icon-check-circle-green" /> : null}
                    contents={<SavingsProductItem product={product} />}
                  />
                );
              }}
            />
          )}
        </>
      )}
    </>
  );
}
