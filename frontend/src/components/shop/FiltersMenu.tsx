'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Checkbox, CheckboxField, CheckboxGroup } from '@/shared/checkbox';
import { Radio, RadioField, RadioGroup } from '@/shared/radio';
import * as Headless from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import {
  DollarCircleIcon,
  FilterVerticalIcon,
  Note01Icon,
  PackageDimensions01Icon,
  PaintBucketIcon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import clsx from 'clsx';
import Form from 'next/form';
import ButtonPrimary from '@/shared/Button/ButtonPrimary';
import ButtonThird from '@/shared/Button/ButtonThird';
import ButtonClose from '@/shared/Button/ButtonClose';
import { PriceRangeSlider } from './PriceRangeSlider';
import { useGetFilterOptions } from '@/lib/queries/product';

type FilterOption = {
  id: string;
  name: string;
  type: 'checkbox' | 'price-range' | 'radio';
  hugeIcon?: any;
  options?: { name: string; value: string }[];
  min?: number;
  max?: number;
};

type Props = {
  className?: string;
};

export const FiltersMenuTabs = ({ className }: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: filterOptionsData, isLoading: isLoadingOptions } = useGetFilterOptions();
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    if (filterOptionsData) {
      const options: FilterOption[] = [
        {
          id: 'categories',
          name: 'Categories',
          type: 'checkbox',
          hugeIcon: Note01Icon,
          options: filterOptionsData.categories.map((cat) => ({
            name: cat.nome,
            value: cat.id,
          })),
        },
        {
          id: 'brands',
          name: 'Brands',
          type: 'checkbox',
          hugeIcon: Note01Icon,
          options: filterOptionsData.brands.map((brand) => ({
            name: brand,
            value: brand,
          })),
        },
        {
          id: 'colors',
          name: 'Colors',
          type: 'checkbox',
          hugeIcon: PaintBucketIcon,
          options: filterOptionsData.colors.map((color) => ({
            name: color,
            value: color,
          })),
        },
        {
          id: 'sizes',
          name: 'Sizes',
          type: 'checkbox',
          hugeIcon: PackageDimensions01Icon,
          options: filterOptionsData.sizes.map((size) => ({
            name: size,
            value: size,
          })),
        },
        {
          id: 'conditions',
          name: 'Condition',
          type: 'checkbox',
          hugeIcon: Note01Icon,
          options: filterOptionsData.conditions.map((cond) => ({
            name: cond,
            value: cond,
          })),
        },
        {
          id: 'price',
          name: 'Price',
          type: 'price-range',
          min: filterOptionsData.priceRange.min,
          max: filterOptionsData.priceRange.max,
          hugeIcon: DollarCircleIcon,
        },
        {
          id: 'sortBy',
          name: 'Sort by',
          type: 'radio',
          hugeIcon: Note01Icon,
          options: [
            { name: 'Mais Populares', value: 'most-popular' },
            { name: 'Melhor avaliados', value: 'best-rating' },
            { name: 'Novidades', value: 'newest' },
            { name: 'Baixo preço - alto', value: 'price-low-high' },
            { name: 'Alto preço - baixo', value: 'price-high-low' },
          ],
        },
        {
          id: 'inStock',
          name: 'In Stock',
          type: 'checkbox',
          hugeIcon: Note01Icon,
          options: [{ name: 'In Stock', value: 'true' }],
        },
      ];
      setFilterOptions(options);
    }

    const initialFilters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key === 'priceMin' || key === 'priceMax') {
        initialFilters.price = initialFilters.price || {};
        initialFilters.price[key === 'priceMin' ? 'min' : 'max'] = Number(value);
      } else if (key === 'sortBy') {
        initialFilters[key] = value;
      } else if (key === 'inStock') {
        initialFilters[key] = [value];
      } else {
        initialFilters[key] = initialFilters[key] || [];
        initialFilters[key].push(value);
      }
    });
    setSelectedFilters(initialFilters);
  }, [searchParams, filterOptionsData]);

  const handleFilterChange = (filterId: string, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleFormSubmit = async () => {
    const queryParams = new URLSearchParams();
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (key === 'price') {
        if (value.min !== undefined) queryParams.append('priceMin', value.min.toString());
        if (value.max !== undefined) queryParams.append('priceMax', value.max.toString());
      } else if (key === 'inStock') {
        if (value.includes('true')) queryParams.append('inStock', 'true');
      } else if (Array.isArray(value)) {
        value.forEach((val: string) => queryParams.append(key, val));
      } else if (value) {
        queryParams.append(key, value);
      }
    });

    router.push(`/products?${queryParams.toString()}`);
  };

  if (isLoadingOptions) {
    return <div>Carregando opções de filtros...</div>;
  }

  if (!filterOptions.length) {
    return <div>Nenhuma opção de filtro disponivel</div>;
  }

  return (
    <div className={clsx('flex flex-wrap md:gap-x-4 md:gap-y-2', className)}>
      <div className="shrink-0 md:hidden">
        <FiltersMenuDialog selectedFilters={selectedFilters} onFilterChange={handleFilterChange} />
      </div>
      <div className="hidden md:block">
        <Headless.PopoverGroup as={Form} action={handleFormSubmit}>
          <fieldset className="flex flex-wrap gap-x-4 gap-y-2">
            {filterOptions.map((filterOption) => {
              if (!filterOption) return null;

              const checkedNumber = Array.isArray(selectedFilters[filterOption.id])
                ? selectedFilters[filterOption.id].length
                : selectedFilters[filterOption.id] ? 1 : 0;

              return (
                <Headless.Popover className="relative" key={filterOption.id}>
                  <Headless.PopoverButton
                    className={clsx(
                      'relative flex items-center justify-center rounded-full px-4 py-2.5 text-sm select-none ring-inset group-data-open:ring-2 group-data-open:ring-black hover:bg-neutral-50 focus:outline-hidden dark:group-data-open:ring-white dark:hover:bg-neutral-900',
                      checkedNumber
                        ? 'ring-2 ring-black dark:ring-white'
                        : 'ring-1 ring-neutral-300 dark:ring-neutral-700'
                    )}
                  >
                    {filterOption.hugeIcon && <HugeiconsIcon icon={filterOption.hugeIcon} size={18} />}
                    <span className="ms-2">{filterOption.name}</span>
                    <ChevronDownIcon className="ms-3 size-4" />
                    {checkedNumber ? (
                      <span className="absolute top-0 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-black text-[0.65rem] font-semibold text-white ring-2 ring-white dark:bg-neutral-200 dark:text-neutral-900 dark:ring-neutral-900">
                        {checkedNumber}
                      </span>
                    ) : null}
                  </Headless.PopoverButton>

                  <Headless.PopoverPanel
                    transition
                    unmount={false}
                    className="absolute -start-5 top-full z-50 mt-3 w-sm transition data-closed:translate-y-1 data-closed:opacity-0"
                  >
                    <div className="rounded-2xl border border-neutral-200 bg-white shadow-xl dark:border-neutral-700 dark:bg-neutral-900">
                      <div className="hidden-scrollbar max-h-[28rem] overflow-y-auto px-5 py-6">
                        {filterOption.type === 'checkbox' && (
                          <CheckboxGroup>
                            {filterOption.options?.map((option) => {
                              if (!option) return null;
                              const isChecked = selectedFilters[filterOption.id]?.includes(option.value);
                              return (
                                <CheckboxField key={option.value}>
                                  <Checkbox
                                    name={filterOption.id}
                                    value={option.value}
                                    checked={isChecked}
                                    onChange={() => {
                                      const currentValues = selectedFilters[filterOption.id] || [];
                                      const newValues = isChecked
                                        ? currentValues.filter((v: string) => v !== option.value)
                                        : [...currentValues, option.value];
                                      handleFilterChange(filterOption.id, newValues);
                                    }}
                                  />
                                  <Headless.Label className="text-sm/6">{option.name}</Headless.Label>
                                </CheckboxField>
                              );
                            })}
                          </CheckboxGroup>
                        )}
                        {filterOption.type === 'price-range' && (
                          <PriceRangeSlider
                            min={filterOption.min ?? 0}
                            max={filterOption.max ?? 1000}
                            name={filterOption.id}
                            onChange={(value) => handleFilterChange(filterOption.id, value)}
                          />
                        )}
                        {filterOption.type === 'radio' && (
                          <RadioGroup
                            name={filterOption.id}
                            value={selectedFilters[filterOption.id] || filterOption.options?.[0]?.value}
                            onChange={(value) => handleFilterChange(filterOption.id, value)}
                          >
                            {filterOption.options?.map((option) => {
                              if (!option) return null;
                              return (
                                <RadioField key={option.value}>
                                  <Radio value={option.value} />
                                  <Headless.Label className="text-sm/6">{option.name}</Headless.Label>
                                </RadioField>
                              );
                            })}
                          </RadioGroup>
                        )}
                      </div>

                      <div className="flex items-center justify-between rounded-b-2xl bg-neutral-50 p-5 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
                        <Headless.CloseButton className="-mx-3" size="smaller" as={ButtonThird} type="button">
                          Cancelar
                        </Headless.CloseButton>
                        <Headless.CloseButton size="smaller" as={ButtonPrimary} type="submit">
                          Aplicar
                        </Headless.CloseButton>
                      </div>
                    </div>
                  </Headless.PopoverPanel>
                </Headless.Popover>
              );
            })}
          </fieldset>
        </Headless.PopoverGroup>
      </div>
    </div>
  );
};

export const FiltersMenuSidebar = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data: filterOptionsData, isLoading: isLoadingOptions } = useGetFilterOptions();
  const [filterOptions, setFilterOptions] = useState<FilterOption[]>([]);
  const [selectedFilters, setSelectedFilters] = useState<Record<string, any>>({});

  useEffect(() => {
    if (filterOptionsData) {
      const options: FilterOption[] = [
        // Same filter options as in FiltersMenuTabs
        {
          id: 'categories',
          name: 'Categories',
          type: 'checkbox',
          hugeIcon: Note01Icon,
          options: filterOptionsData.categories.map((cat) => ({
            name: cat.nome,
            value: cat.id,
          })),
        },
        {
          id: 'brands',
          name: 'Brands',
          type: 'checkbox',
          hugeIcon: Note01Icon,
          options: filterOptionsData.brands.map((brand) => ({
            name: brand,
            value: brand,
          })),
        },
        {
          id: 'colors',
          name: 'Colors',
          type: 'checkbox',
          hugeIcon: PaintBucketIcon,
          options: filterOptionsData.colors.map((color) => ({
            name: color,
            value: color,
          })),
        },
        {
          id: 'sizes',
          name: 'Sizes',
          type: 'checkbox',
          hugeIcon: PackageDimensions01Icon,
          options: filterOptionsData.sizes.map((size) => ({
            name: size,
            value: size,
          })),
        },
        {
          id: 'conditions',
          name: 'Condition',
          type: 'checkbox',
          hugeIcon: Note01Icon,
          options: filterOptionsData.conditions.map((cond) => ({
            name: cond,
            value: cond,
          })),
        },
        {
          id: 'price',
          name: 'Price',
          type: 'price-range',
          min: filterOptionsData.priceRange.min,
          max: filterOptionsData.priceRange.max,
          hugeIcon: DollarCircleIcon,
        },
        {
          id: 'sortBy',
          name: 'Sort by',
          type: 'radio',
          hugeIcon: Note01Icon,
          options: [
            { name: 'Most Popular', value: 'most-popular' },
            { name: 'Best Rating', value: 'best-rating' },
            { name: 'Newest', value: 'newest' },
            { name: 'Price Low - High', value: 'price-low-high' },
            { name: 'Price High - Low', value: 'price-high-low' },
          ],
        },
        {
          id: 'inStock',
          name: 'In Stock',
          type: 'checkbox',
          hugeIcon: Note01Icon,
          options: [{ name: 'In Stock', value: 'true' }],
        },
      ];
      setFilterOptions(options);
    }

    const initialFilters: Record<string, any> = {};
    searchParams.forEach((value, key) => {
      if (key === 'priceMin' || key === 'priceMax') {
        initialFilters.price = initialFilters.price || {};
        initialFilters.price[key === 'priceMin' ? 'min' : 'max'] = Number(value);
      } else if (key === 'sortBy') {
        initialFilters[key] = value;
      } else if (key === 'inStock') {
        initialFilters[key] = [value];
      } else {
        initialFilters[key] = initialFilters[key] || [];
        initialFilters[key].push(value);
      }
    });
    setSelectedFilters(initialFilters);
  }, [searchParams, filterOptionsData]);

  const handleFilterChange = (filterId: string, value: any) => {
    setSelectedFilters((prev) => ({
      ...prev,
      [filterId]: value,
    }));
  };

  const handleFormSubmit = async () => {
    const queryParams = new URLSearchParams();
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (key === 'price') {
        if (value.min !== undefined) queryParams.append('priceMin', value.min.toString());
        if (value.max !== undefined) queryParams.append('priceMax', value.max.toString());
      } else if (key === 'inStock') {
        if (value.includes('true')) queryParams.append('inStock', 'true');
      } else if (Array.isArray(value)) {
        value.forEach((val: string) => queryParams.append(key, val));
      } else if (value) {
        queryParams.append(key, value);
      }
    });

    router.push(`/products?${queryParams.toString()}`);
  };

  if (isLoadingOptions) {
    return <div>Carregando opções de filtros ...</div>;
  }

  if (!filterOptions.length) {
    return <div>Nenhuma opção de filtro disponivel</div>;
  }

  return (
    <>
      <div className="shrink-0 lg:hidden">
        <FiltersMenuDialog  selectedFilters={selectedFilters} onFilterChange={handleFilterChange} />
      </div>
      <div className="hidden lg:block">
        <Form action={handleFormSubmit}>
          <fieldset className="w-full">
            <div className="divide-y divide-neutral-200 dark:divide-neutral-800">
              {filterOptions.map((filterOption) => {
                if (!filterOption) return null;
                return (
                  <div key={filterOption.id} className="py-10 first:pt-0 last:pb-0">
                    <legend className="text-lg font-medium">{filterOption.name}</legend>
                    <div className="pt-7">
                      {filterOption.type === 'checkbox' && (
                        <CheckboxGroup>
                          {filterOption.options?.map((option) => {
                            if (!option) return null;
                            const isChecked = selectedFilters[filterOption.id]?.includes(option.value);
                            return (
                              <CheckboxField key={option.value}>
                                <Checkbox
                                  name={filterOption.id}
                                  value={option.value}
                                  checked={isChecked}
                                  onChange={() => {
                                    const currentValues = selectedFilters[filterOption.id] || [];
                                    const newValues = isChecked
                                      ? currentValues.filter((v: string) => v !== option.value)
                                      : [...currentValues, option.value];
                                    handleFilterChange(filterOption.id, newValues);
                                  }}
                                />
                                <Headless.Label className="text-sm/6">{option.name}</Headless.Label>
                              </CheckboxField>
                            );
                          })}
                        </CheckboxGroup>
                      )}
                      {filterOption.type === 'price-range' && (
                        <PriceRangeSlider
                          min={filterOption.min ?? 0}
                          max={filterOption.max ?? 1000}
                          name={filterOption.id}
                         
                          onChange={(value) => handleFilterChange(filterOption.id, value)}
                        />
                      )}
                      {filterOption.type === 'radio' && (
                        <RadioGroup
                          name={filterOption.id}
                          value={selectedFilters[filterOption.id] || filterOption.options?.[0]?.value}
                          onChange={(value) => handleFilterChange(filterOption.id, value)}
                        >
                          {filterOption.options?.map((option) => {
                            if (!option) return null;
                            return (
                              <RadioField key={option.value}>
                                <Radio value={option.value} />
                                <Headless.Label className="text-sm/6">{option.name}</Headless.Label>
                              </RadioField>
                            );
                          })}
                        </RadioGroup>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </fieldset>
        </Form>
      </div>
    </>
  );
};

export function FiltersMenuDialog({ className, selectedFilters }: Props & { selectedFilters: Record<string, any>, onFilterChange: (id: string, value: any) => void }) {
  const [showAllFilter, setShowAllFilter] = useState(false);
  const router = useRouter();

  const handleFormSubmit = async () => {
    const queryParams = new URLSearchParams();
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (key === 'price') {
        if (value.min !== undefined) queryParams.append('priceMin', value.min.toString());
        if (value.max !== undefined) queryParams.append('priceMax', value.max.toString());
      } else if (key === 'inStock') {
        if (value.includes('true')) queryParams.append('inStock', 'true');
      } else if (Array.isArray(value)) {
        value.forEach((val: string) => queryParams.append(key, val));
      } else if (value) {
        queryParams.append(key, value);
      }
    });

    router.push(`/products?${queryParams.toString()}`);
    setShowAllFilter(false);
  };

  const checkedNumber = Object.values(selectedFilters).reduce(
    (sum, value) => sum + (Array.isArray(value) ? value.length : value ? 1 : 0),
    0
  );

  return (
    <div className={clsx('shrink-0', className)}>
      <Headless.Button
        className={clsx(
          'relative flex items-center justify-center rounded-full px-4 py-2.5 text-sm select-none ring-inset group-data-open:ring-2 group-data-open:ring-black hover:bg-neutral-50 focus:outline-hidden dark:group-data-open:ring-white dark:hover:bg-neutral-900',
          checkedNumber ? 'ring-2 ring-black dark:ring-white' : 'ring-1 ring-neutral-300 dark:ring-neutral-700'
        )}
        onClick={() => setShowAllFilter(true)}
      >
        <HugeiconsIcon icon={FilterVerticalIcon} size={18} />
        <span className="ms-2">All filters</span>
        <ChevronDownIcon className="ms-3 size-4" />
        {checkedNumber ? (
          <span className="absolute top-0 -right-0.5 flex size-4.5 items-center justify-center rounded-full bg-black text-[0.65rem] font-semibold text-white ring-2 ring-white dark:bg-neutral-200 dark:text-neutral-900 dark:ring-neutral-900">
            {checkedNumber}
          </span>
        ) : null}
      </Headless.Button>

      <Headless.Dialog open={showAllFilter} onClose={() => setShowAllFilter(false)} className="relative z-50">
        <Headless.DialogBackdrop
          transition
          className="fixed inset-0 bg-black/50 duration-200 ease-out data-closed:opacity-0"
        />
        <Form
          action={handleFormSubmit}
          className="fixed inset-0 flex max-h-screen w-screen items-center justify-center pt-3"
        >
          <Headless.DialogPanel
            className="flex max-h-full w-full max-w-3xl flex-col overflow-hidden rounded-t-2xl bg-white text-left align-middle shadow-xl duration-200 ease-out data-closed:translate-y-16 data-closed:opacity-0 dark:border dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
            transition
            as={'fieldset'}
          >
            <div className="relative shrink-0 border-b border-neutral-200 p-4 text-center sm:px-8 dark:border-neutral-800">
              <Headless.DialogTitle as="h3" className="text-lg leading-6 font-medium text-gray-900">
                Filtros
              </Headless.DialogTitle>
              <div className="absolute end-2 top-2">
                <Headless.CloseButton
                  as={ButtonClose}
                  colorClassName="bg-white text-neutral-900 hover:bg-neutral-100"
                />
              </div>
            </div>

            <div className="hidden-scrollbar grow overflow-y-auto text-start">
              <div className="divide-y divide-neutral-200 px-4 sm:px-8 dark:divide-neutral-800">
                {/* {filterOptions?.map((filterOption) => {
                  if (!filterOption) return null;
                  return (
                    <div key={filterOption.id} className="py-7">
                      <p className="text-lg font-medium">{filterOption.name}</p>
                      <div className="mt-6">
                        {filterOption.type === 'checkbox' && (
                          <CheckboxGroup>
                            {filterOption.options?.map((option) => {
                              if (!option) return null;
                              const isChecked = selectedFilters[filterOption.id]?.includes(option.value);
                              return (
                                <CheckboxField key={option.value}>
                                  <Checkbox
                                    name={filterOption.id}
                                    value={option.value}
                                    checked={isChecked}
                                    onChange={() => {
                                      const currentValues = selectedFilters[filterOption.id] || [];
                                      const newValues = isChecked
                                        ? currentValues.filter((v: string) => v !== option.value)
                                        : [...currentValues, option.value];
                                      onFilterChange(filterOption.id, newValues);
                                    }}
                                  />
                                  <Headless.Label className="text-sm/6">{option.name}</Headless.Label>
                                </CheckboxField>
                              );
                            })}
                          </CheckboxGroup>
                        )}
                        {filterOption.type === 'price-range' && (
                          <PriceRangeSlider
                            min={filterOption.min ?? 0}
                            max={filterOption.max ?? 1000}
                            name={filterOption.id}
                            value={selectedFilters[filterOption.id] || { min: filterOption.min, max: filterOption.max }}
                            onChange={(value) => onFilterChange(filterOption.id, value)}
                          />
                        )}
                        {filterOption.type === 'radio' && (
                          <RadioGroup
                            name={filterOption.id}
                            value={selectedFilters[filterOption.id] || filterOption.options?.[0]?.value}
                            onChange={(value) => onFilterChange(filterOption.id, value)}
                          >
                            {filterOption.options?.map((option) => {
                              if (!option) return null;
                              return (
                                <RadioField key={option.value}>
                                  <Radio value={option.value} />
                                  <Headless.Label className="text-sm/6">{option.name}</Headless.Label>
                                </RadioField>
                              );
                            })}
                          </RadioGroup>
                        )}
                      </div>
                    </div>
                  );
                })} */}
              </div>
            </div>

            <div className="flex shrink-0 items-center justify-between bg-neutral-50 p-4 sm:px-8 dark:border-t dark:border-neutral-800 dark:bg-neutral-900">
              <Headless.CloseButton as={ButtonThird} size="smaller" className="-mx-2" type="button">
                Cancelar
              </Headless.CloseButton>
              <Headless.CloseButton as={ButtonPrimary} size="smaller" type="submit">
                Aplicar filtros
              </Headless.CloseButton>
            </div>
          </Headless.DialogPanel>
        </Form>
      </Headless.Dialog>
    </div>
  );
}