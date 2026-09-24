import { useEffect, useMemo, useRef, useState } from 'react'

import {
  ShoppingCart,
  CaretRight,
  MagnifyingGlass,
  Plus,
  Wallet,
  Star,
} from '@phosphor-icons/react'


type PaymentMethod =
  | 'Cash'
  | 'UPI'
  | 'Wallet'
  | 'Points'
  | 'Gift Card'
  | 'Coupon'
  | 'Credit Card'
  | 'Debit Card'

type DiscountType = 'amount' | 'percent'
type CashbackType = 'amount' | 'percent'

type PosSku = {
  sku: string
  product: string
  variant: string
  size: string
  colour: string
  price: number
  stock: number
  category: string
  gstRate: number
  hsn: string
}

type CartItem = PosSku & {
  quantity: number
  discountType: DiscountType
  discountValue: number
}

type Customer = {
  id: string
  name: string
  phone: string
  wallet: number
  points: number
}

type PaymentLine = {
  id: string
  method: PaymentMethod
  amount: number
  cardCharge: number
}

type POSCart = {
  id: string
  name: string
  cart: CartItem[]
  customer: Customer | null
  cartDiscountType: DiscountType
  cartDiscountValue: number
  cashbackType: CashbackType
  cashbackValue: number
  pointsCashback: number
  note: string
  status: 'active' | 'draft'
}

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'

const money = (value: number) =>
  `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const skuCatalog: PosSku[] = [
  {
    sku: '522684000001',
    product: 'Premium Cotton Suit',
    variant: 'M 38 / Maroon',
    size: 'M 38',
    colour: 'Maroon',
    price: 2499,
    stock: 5,
    category: 'Suits',
    gstRate: 5,
    hsn: '6204',
  },
  {
    sku: '522684000002',
    product: 'Premium Cotton Suit',
    variant: 'L 40 / Maroon',
    size: 'L 40',
    colour: 'Maroon',
    price: 2499,
    stock: 8,
    category: 'Suits',
    gstRate: 5,
    hsn: '6204',
  },
  {
    sku: '522684000003',
    product: 'Premium Cotton Suit',
    variant: 'XL 42 / Navy Blue',
    size: 'XL 42',
    colour: 'Navy Blue',
    price: 2499,
    stock: 4,
    category: 'Suits',
    gstRate: 5,
    hsn: '6204',
  },
  {
    sku: '522684000004',
    product: 'Premium Cotton Suit',
    variant: '2XL 44 / Navy Blue',
    size: '2XL 44',
    colour: 'Navy Blue',
    price: 2499,
    stock: 2,
    category: 'Suits',
    gstRate: 5,
    hsn: '6204',
  },
  {
    sku: '526317000001',
    product: 'Printed Cotton Kurti',
    variant: 'M 38 / Pink',
    size: 'M 38',
    colour: 'Pink',
    price: 1399,
    stock: 6,
    category: 'Kurtis',
    gstRate: 5,
    hsn: '6204',
  },
  {
    sku: '526317000002',
    product: 'Printed Cotton Kurti',
    variant: 'L 40 / Sky Blue',
    size: 'L 40',
    colour: 'Sky Blue',
    price: 1399,
    stock: 3,
    category: 'Kurtis',
    gstRate: 5,
    hsn: '6204',
  },
  {
    sku: '531248000001',
    product: 'Cotton Churidar Set',
    variant: 'L 40 / Black',
    size: 'L 40',
    colour: 'Black',
    price: 1590,
    stock: 0,
    category: 'Churidar',
    gstRate: 12,
    hsn: '6211',
  },
  {
    sku: '541782000001',
    product: 'Cotton Dupatta',
    variant: 'Free Size / White',
    size: 'Free Size',
    colour: 'White',
    price: 700,
    stock: 2,
    category: 'Dupatta',
    gstRate: 18,
    hsn: '6307',
  },
]

const initialCustomers: Customer[] = [
  {
    id: 'CUS-001',
    name: 'Rina Khatun',
    phone: '9876543210',
    wallet: 350,
    points: 420,
  },
  {
    id: 'CUS-002',
    name: 'Mousumi Das',
    phone: '9830123456',
    wallet: 125,
    points: 180,
  },
  {
    id: 'CUS-003',
    name: 'Sultana Begum',
    phone: '9007123456',
    wallet: 800,
    points: 650,
  },
]

const topSellingSkus = [
  '522684000002',
  '526317000001',
  '526317000002',
  '541782000001',
]

function discountAmount(item: CartItem) {
  const base = item.price * item.quantity

  if (item.discountValue <= 0) return 0

  return item.discountType === 'percent'
    ? Math.min(base, (base * item.discountValue) / 100)
    : Math.min(base, item.discountValue)
}

function itemNet(item: CartItem) {
  return item.price * item.quantity - discountAmount(item)
}

function getCartTotals(
  cart: CartItem[],
  discountType: DiscountType,
  discountValue: number,
) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  )

  const itemDiscount = cart.reduce(
    (sum, item) => sum + discountAmount(item),
    0,
  )

  const afterItemDiscount = Math.max(
    0,
    subtotal - itemDiscount,
  )

  const cartDiscount = Math.min(
    afterItemDiscount,
    discountType === 'percent'
      ? (afterItemDiscount * discountValue) / 100
      : discountValue,
  )

  return {
    subtotal,
    itemDiscount,
    cartDiscount,
    finalPayable: Math.max(
      0,
      afterItemDiscount - cartDiscount,
    ),
  }
}

function SectionTitle({
  title,
  count,
  action,
}: {
  title: string
  count?: number
  action?: React.ReactNode
}) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {typeof count === 'number' && (
          <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {count}
          </span>
        )}
      </div>
      {action}
    </div>
  )
}

function ProductSearchPanel({
  onAdd,
  scannerDisabled = false,
}: {
  onAdd: (sku: PosSku) => void
  scannerDisabled?: boolean
}) {
  const [query, setQuery] = useState('')
  const [scanValue, setScanValue] = useState('')
  const [category, setCategory] = useState('All Products')
  const scanRef = useRef<HTMLInputElement>(null)

  const categories = useMemo(() => {
    const counts = new Map<string, number>()

    skuCatalog.forEach((item) => {
      if (item.stock <= 0) return
      counts.set(
        item.category,
        (counts.get(item.category) ?? 0) + 1,
      )
    })

    return [
      {
        name: 'All Products',
        count: skuCatalog.filter((i) => i.stock > 0).length,
      },
      ...Array.from(counts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([name, count]) => ({
          name,
          count,
        })),
    ]
  }, [])

  const results = useMemo(() => {
    const q = query.trim().toLowerCase()

    return skuCatalog.filter((item) => {
      const matchesCategory =
        category === 'All Products' ||
        item.category === category

      const matchesSearch =
        !q ||
        item.sku.toLowerCase().includes(q) ||
        item.product.toLowerCase().includes(q) ||
        item.variant.toLowerCase().includes(q) ||
        item.size.toLowerCase().includes(q) ||
        item.colour.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)

      return matchesCategory && matchesSearch
    })
  }, [category, query])

  useEffect(() => {
    if (scannerDisabled) return
    scanRef.current?.focus()
    const refocus = (event: KeyboardEvent) => {
      const t = event.target as HTMLElement | null
      if (
        t &&
        (t.tagName === 'INPUT' ||
          t.tagName === 'TEXTAREA' ||
          t.tagName === 'SELECT' ||
          t.isContentEditable)
      )
        return
      scanRef.current?.focus()
    }
    window.addEventListener('keydown', refocus)
    return () => window.removeEventListener('keydown', refocus)
  }, [scannerDisabled])

  const topItems = useMemo(
    () => skuCatalog.filter((i) => i.stock > 0).slice(0, 8),
    [],
  )

  const scan = () => {
    if (scannerDisabled) return
    const value = scanValue.trim()

    if (!value) return

    const exact = skuCatalog.find(
      (item) => item.sku === value,
    )

    if (!exact) {
      window.alert(`SKU ${value} was not found.`)
      return
    }

    if (exact.stock <= 0) {
      window.alert(`${exact.sku} is out of stock.`)
      return
    }

    onAdd(exact)
    setScanValue('')
    scanRef.current?.focus()
  }

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Products
            </h2>
            <p className="mt-0.5 text-[10px] text-slate-400">
              Select a product or scan an exact SKU.
            </p>
          </div>

          <span className="rounded-md bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-500">
            {results.length} products
          </span>
        </div>

        <div className="mt-3 flex gap-2">
          <div className="relative min-w-0 flex-1">
            <MagnifyingGlass
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />

            <input
              className="h-10 w-full rounded-lg border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs outline-none transition focus:border-slate-400 focus:bg-white"
              value={query}
              onChange={(event) =>
                setQuery(event.target.value)
              }
              onKeyDown={(event) => {
                if (event.key !== 'Enter' || scannerDisabled)
                  return
                const value = query.trim()
                const exact = skuCatalog.find(
                  (item) => item.sku === value && item.stock > 0,
                )
                if (exact) {
                  onAdd(exact)
                  setQuery('')
                }
              }}
              placeholder="Search product, SKU, barcode, size or colour..."
            />
          </div>

          <input
            ref={scanRef}
            aria-label="Barcode scanner input"
            className="sr-only"
            tabIndex={-1}
            value={scanValue}
            onChange={(event) =>
              setScanValue(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === 'Enter') scan()
            }}
          />
        </div>
      </div>

      <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50/70 px-3 py-1.5">
        <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.12em] text-slate-400">
          Categories
        </span>

        <div className="flex min-w-0 flex-1 flex-nowrap items-center gap-1 overflow-x-auto whitespace-nowrap">
          {categories.map((item) => {
            const active = category === item.name

            return (
              <button
                key={item.name}
                type="button"
                onClick={() => setCategory(item.name)}
                className={`shrink-0 rounded-full px-3 py-1 text-[11px] transition ${
                  active
                    ? 'bg-slate-900 font-semibold text-white shadow-sm'
                    : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-100'
                }`}
              >
                {item.name === 'All Products' ? 'All' : item.name}
                <span
                  className={`ml-1.5 text-[9px] ${
                    active ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1">
        <div className="h-full min-h-0 overflow-y-auto p-2">
          {results.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 min-[1600px]:grid-cols-4 min-[2000px]:grid-cols-5 min-[2500px]:grid-cols-6">
              {results.map((item) => {
                const outOfStock =
                  item.stock <= 0

                return (
                  <button
                    key={item.sku}
                    type="button"
                    disabled={outOfStock}
                    onClick={() =>
                      !outOfStock && onAdd(item)
                    }
                    className="group rounded-lg border border-slate-200 bg-white p-2 text-left transition hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <div className="relative flex h-14 items-center justify-center overflow-hidden rounded-lg bg-slate-100">
                      <div className="text-center">
                        <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">
                          {item.category}
                        </div>
                        <div className="mt-1 text-[9px] text-slate-400">
                          {item.colour}
                        </div>
                      </div>

                      <span className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900 text-base font-medium text-white shadow-sm transition group-hover:scale-105">
                        +
                      </span>
                    </div>

                    <div className="mt-2">
                      <p className="truncate text-xs font-semibold text-slate-800">
                        {item.product}
                      </p>

                      <p className="mt-0.5 truncate text-[10px] text-slate-500">
                        {item.size} / {item.colour}
                      </p>

                      <p className="mt-1 truncate text-[9px] text-slate-400">
                        {item.sku}
                      </p>

                      <div className="mt-2 flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {money(item.price)}
                        </span>

                        <span
                          className={`rounded-md px-1.5 py-1 text-[9px] font-semibold ${
                            item.stock > 5
                              ? 'bg-emerald-50 text-emerald-600'
                              : item.stock > 0
                                ? 'bg-amber-50 text-amber-600'
                                : 'bg-red-50 text-red-600'
                          }`}
                        >
                          {item.stock > 0
                            ? `${item.stock} stock`
                            : 'Out'}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <div className="flex h-full min-h-[260px] items-center justify-center text-center">
              <div>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                  <MagnifyingGlass size={20} />
                </div>
                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No products found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try another search or category.
                </p>
              </div>
            </div>
          )}

          {topItems.length > 0 && (
            <div className="mt-3 border-t border-slate-100 pt-3">
              <h3 className="text-xs font-semibold text-slate-800">
                In-stock Picks
              </h3>
              <div className="mt-2 grid grid-cols-2 gap-2 min-[1280px]:grid-cols-4 min-[1600px]:grid-cols-6 min-[2000px]:grid-cols-8">
                {topItems.map((item) => (
                  <button
                    key={item.sku}
                    type="button"
                    onClick={() => onAdd(item)}
                    className="rounded-lg border border-slate-200 bg-white p-2 text-left hover:border-slate-300 hover:shadow-sm"
                  >
                    <p className="truncate text-[11px] font-semibold text-slate-800">
                      {item.product}
                    </p>
                    <p className="truncate text-[9px] text-slate-500">
                      {item.size} / {item.colour}
                    </p>
                    <p className="mt-1 text-xs font-bold text-slate-900">
                      {money(item.price)}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function TopSellingPanel({
  onAdd,
}: {
  onAdd: (sku: PosSku) => void
}) {
  const products = topSellingSkus
    .map((sku) =>
      skuCatalog.find((item) => item.sku === sku),
    )
    .filter(Boolean) as PosSku[]

  return (
    <div className="border-t border-slate-100 bg-white px-4 py-2">
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="shrink-0 text-[9px] font-bold uppercase tracking-[0.1em] text-slate-400">
          Quick Add
        </span>

        {products.map((item) => (
          <button
            key={item.sku}
            type="button"
            disabled={item.stock <= 0}
            onClick={() => onAdd(item)}
            className="flex shrink-0 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:opacity-40"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-md bg-slate-100 text-[8px] font-bold text-slate-500">
              {item.category.slice(0, 2).toUpperCase()}
            </span>

            <span>
              <span className="block max-w-[110px] truncate text-[10px] font-semibold text-slate-700">
                {item.product}
              </span>
              <span className="block text-[9px] text-slate-400">
                {money(item.price)}
              </span>
            </span>

            <Plus size={13} className="text-slate-400" />
          </button>
        ))}
      </div>
    </div>
  )
}

function CustomerBox({
  customer,
  customers,
  onSelect,
  onAdd,
}: {
  customer: Customer | null
  customers: Customer[]
  onSelect: (customer: Customer | null) => void
  onAdd: (customer: Customer) => void
}) {
  const [phone, setPhone] = useState('')
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState('')

  const matches = phone.length >= 3
    ? customers.filter((item) => item.phone.includes(phone))
    : []

  const createCustomer = () => {
    if (!phone.trim() || !newName.trim()) {
      window.alert('Enter customer name and phone number.')
      return
    }

    const newCustomer: Customer = {
      id: `CUS-${String(Date.now()).slice(-5)}`,
      name: newName.trim(),
      phone: phone.trim(),
      wallet: 0,
      points: 0,
    }

    onAdd(newCustomer)
    setShowNew(false)
    setNewName('')
  }

  if (customer) {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
        <div className="flex items-center justify-between gap-2">
          <div>
            <p className="text-xs font-semibold text-slate-800">
              {customer.name}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-400">
              {customer.phone}
            </p>
          </div>

          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-[10px] font-semibold text-slate-500 hover:text-slate-800"
          >
            Change
          </button>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <div className="rounded-md bg-white px-2.5 py-2">
            <p className="text-[9px] text-slate-400">Wallet</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">
              {money(customer.wallet)}
            </p>
          </div>

          <div className="rounded-md bg-white px-2.5 py-2">
            <p className="text-[9px] text-slate-400">Points</p>
            <p className="mt-0.5 text-xs font-semibold text-slate-800">
              {customer.points}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          className={inputClass}
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="Customer phone number"
          inputMode="numeric"
        />

        <button
          type="button"
          onClick={() => setShowNew(true)}
          className="shrink-0 rounded-lg border border-slate-200 px-3 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
        >
          + New
        </button>
      </div>

      {matches.length > 0 && (
        <div className="mt-2 overflow-hidden rounded-lg border border-slate-200 bg-white">
          {matches.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onSelect(item)
                setPhone('')
              }}
              className="flex w-full items-center justify-between border-b border-slate-50 px-3 py-2.5 text-left last:border-0 hover:bg-slate-50"
            >
              <span>
                <span className="block text-xs font-semibold text-slate-700">
                  {item.name}
                </span>
                <span className="block text-[10px] text-slate-400">
                  {item.phone}
                </span>
              </span>
              <span className="text-[10px] font-semibold text-slate-400">
                Select
              </span>
            </button>
          ))}
        </div>
      )}

      {showNew && (
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3">
          <p className="mb-2 text-xs font-semibold text-slate-700">
            New Customer
          </p>

          <div className="space-y-2">
            <input
              className={inputClass}
              value={newName}
              onChange={(event) => setNewName(event.target.value)}
              placeholder="Customer name"
            />

            <input
              className={inputClass}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Phone number"
              inputMode="numeric"
            />
          </div>

          <div className="mt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowNew(false)}
              className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-[10px] font-semibold text-slate-500"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={createCustomer}
              className="rounded-md bg-slate-900 px-3 py-1.5 text-[10px] font-semibold text-white"
            >
              Add Customer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function CartPanel({
  cart,
  customer,
  customers,
  onAdd,
  onUpdate,
  onRemove,
  onCustomer,
  onNewCustomer,
  onProceed,
  cartDiscountType,
  cartDiscountValue,
  onCartDiscountType,
  onCartDiscountValue,
  cashbackType,
  cashbackValue,
  walletCashback,
  pointsCashback,
  onCashbackType,
  onCashbackValue,
  onPointsCashback,
}: {
  cart: CartItem[]
  customer: Customer | null
  customers: Customer[]
  onAdd: (sku: PosSku) => void
  onUpdate: (
    sku: string,
    changes: Partial<CartItem>,
  ) => void
  onRemove: (sku: string) => void
  onCustomer: (customer: Customer | null) => void
  onNewCustomer: (customer: Customer) => void
  onProceed: () => void
  cartDiscountType: DiscountType
  cartDiscountValue: number
  onCartDiscountType: (type: DiscountType) => void
  onCartDiscountValue: (value: number) => void
  cashbackType: CashbackType
  cashbackValue: number
  walletCashback: number
  pointsCashback: number
  onCashbackType: (type: CashbackType) => void
  onCashbackValue: (value: number) => void
  onPointsCashback: (value: number) => void
}) {
  const [coupon, setCoupon] = useState('')

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0,
  )

  const itemDiscount = cart.reduce(
    (sum, item) =>
      sum + discountAmount(item),
    0,
  )

  const afterItemDiscount =
    subtotal - itemDiscount

  const cartDiscount = Math.min(
    afterItemDiscount,
    cartDiscountType === 'percent'
      ? (afterItemDiscount *
          cartDiscountValue) /
          100
      : cartDiscountValue,
  )

  const finalPayable = Math.max(
    0,
    afterItemDiscount - cartDiscount,
  )

  const itemCount = cart.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  return (
    <div className="flex h-full min-h-0 flex-col bg-white">
      {/* Cart header */}
      <div className="shrink-0 border-b border-slate-100 px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div className="flex min-w-0 items-center gap-2">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white">
              🛒
            </span>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-semibold text-slate-900">
                  Current Cart
                </h2>

                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[9px] font-semibold text-slate-500">
                  {itemCount} items
                </span>
              </div>

              <p className="mt-0.5 truncate text-[10px] text-slate-400">
                {customer
                  ? customer.name
                  : 'Walk-in Customer'}
              </p>
            </div>
          </div>

          <span className="text-[10px] text-slate-400">
            {cart.length} SKU{cart.length === 1 ? '' : 's'}
          </span>
        </div>
      </div>

      {/* Customer */}
      <div className="shrink-0 border-b border-slate-100 px-4 py-2.5">
        {customer ? (
          <div className="flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-slate-800">
                {customer.name}
              </p>
              <p className="text-[9px] text-slate-400">
                {customer.phone}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onCustomer(null)}
              className="text-[10px] font-semibold text-slate-500 hover:text-slate-900"
            >
              Change
            </button>
          </div>
        ) : (
          <details className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between rounded-lg border border-dashed border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <span>+ Add customer</span>
              <CaretRight
                size={14}
                className="transition-transform group-open:rotate-90"
              />
            </summary>

            <div className="mt-2 rounded-lg bg-slate-50 p-2">
              <CustomerBox
                customer={customer}
                customers={customers}
                onSelect={onCustomer}
                onAdd={onNewCustomer}
              />
            </div>
          </details>
        )}
      </div>

      {/* Items */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {cart.length === 0 ? (
          <div className="flex h-full min-h-[280px] items-center justify-center px-8 text-center">
            <div>
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-2xl">
                🛒
              </div>

              <p className="mt-4 text-sm font-semibold text-slate-700">
                Your cart is empty
              </p>

              <p className="mt-1 text-xs leading-5 text-slate-400">
                Select a product from the catalog
                or scan a SKU to start billing.
              </p>
            </div>
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {cart.map((item) => {
              const gross =
                item.price * item.quantity
              const discount =
                discountAmount(item)
              const net = itemNet(item)

              return (
                <div
                  key={item.sku}
                  className="px-3 py-1.5"
                >
                  <div className="flex gap-2">

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-800">
                            {item.product}
                          </p>

                          <p className="mt-0.5 truncate text-[10px] text-slate-500">
                            {item.size} / {item.colour} · {item.sku}
                          </p>

                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            onRemove(item.sku)
                          }
                          className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-slate-300 hover:bg-red-50 hover:text-red-500"
                          aria-label={`Remove ${item.product}`}
                        >
                          ×
                        </button>
                      </div>

                      <div className="mt-1 flex items-center gap-1.5">
                        <div className="flex shrink-0 items-center rounded-md border border-slate-200">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdate(item.sku, {
                                quantity: Math.max(1, item.quantity - 1),
                              })
                            }
                            className="h-6 w-6 text-sm text-slate-500 hover:bg-slate-50"
                          >
                            −
                          </button>

                          <span className="w-7 text-center text-xs font-semibold tabular-nums text-slate-800">
                            {item.quantity}
                          </span>

                          <button
                            type="button"
                            onClick={() => onAdd(item)}
                            disabled={item.quantity >= item.stock}
                            className="h-6 w-6 text-sm text-slate-500 hover:bg-slate-50 disabled:opacity-30"
                          >
                            +
                          </button>
                        </div>

                        <div className="flex min-w-0 flex-1 items-center justify-between gap-3">
                          <div className="flex shrink-0 items-center">
                            <input
                              type="number"
                              min="0"
                              max={item.discountType === 'percent' ? 100 : undefined}
                              step="0.01"
                              className="h-7 w-14 rounded-l-md border border-slate-200 px-2 text-right text-[10px] font-semibold outline-none focus:border-slate-400"
                              value={item.discountValue || ''}
                              onChange={(event) =>
                                onUpdate(item.sku, {
                                  discountValue: Math.max(
                                    0,
                                    Number(event.target.value),
                                  ),
                                })
                              }
                              placeholder="0"
                              aria-label="Item discount value"
                            />

                            <select
                              className="h-7 w-9 shrink-0 rounded-r-md border border-l-0 border-slate-200 bg-white px-0.5 text-center text-[10px] font-bold text-slate-600 outline-none focus:border-slate-400"
                              value={item.discountType}
                              onChange={(event) =>
                                onUpdate(item.sku, {
                                  discountType:
                                    event.target.value as DiscountType,
                                })
                              }
                              aria-label="Item discount type"
                            >
                              <option value="percent">%</option>
                              <option value="amount">₹</option>
                            </select>
                          </div>

                          <div className="min-w-[150px] text-right leading-tight">
                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[8px] text-slate-400">
                                Original
                              </span>
                              <span className="text-[10px] tabular-nums text-slate-500">
                                {money(gross)}
                              </span>
                            </div>

                            <div className="flex items-center justify-end gap-2">
                              <span className="text-[8px] text-slate-400">
                                Discount
                              </span>
                              <span className="text-[10px] font-semibold tabular-nums text-emerald-600">
                                - {money(discount)}
                              </span>
                            </div>

                            <div className="mt-0.5 flex items-center justify-end gap-2">
                              <span className="text-[8px] font-medium text-slate-500">
                                After discount
                              </span>
                              <span className="text-sm font-bold tabular-nums text-slate-900">
                                {money(net)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Checkout */}
      <div className="shrink-0 border-t border-slate-200 bg-white">
        {cart.length > 0 && (
          <>
            <div className="px-3 pt-2">
              <div className="flex gap-2">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-sm font-bold text-slate-600">
                  %
                </div>

                <input
                  value={coupon}
                  onChange={(event) =>
                    setCoupon(event.target.value)
                  }
                  className="h-8 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-xs outline-none focus:border-slate-400"
                  placeholder="Enter coupon code"
                />

                <button
                  type="button"
                  className="h-8 rounded-lg border border-slate-200 px-3 text-[10px] font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="px-3 py-1">
              <div className="flex items-center justify-between py-0.5 text-xs text-slate-500">
                <span>Subtotal ({itemCount} items)</span>
                <span>{money(subtotal)}</span>
              </div>

              <div className="flex items-center justify-between py-0.5 text-xs text-slate-500">
                <span>Item Discount</span>
                <span className="text-emerald-600">
                  - {money(itemDiscount)}
                </span>
              </div>

              <div className="flex items-center justify-between py-0.5">
                <span className="text-xs font-medium text-slate-600">
                  Discount Calculator
                </span>

                <div className="flex items-center gap-0.5">
                  <button
                    type="button"
                    onClick={() =>
                      onCartDiscountType('amount')
                    }
                    className={`rounded px-1 py-0.5 text-[9px] font-bold ${
                      cartDiscountType ===
                      'amount'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    ₹
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      onCartDiscountType('percent')
                    }
                    className={`rounded px-1 py-0.5 text-[9px] font-bold ${
                      cartDiscountType ===
                      'percent'
                        ? 'bg-slate-900 text-white'
                        : 'text-slate-400'
                    }`}
                  >
                    %
                  </button>

                  <input
                    type="number"
                    min="0"
                    max={
                      cartDiscountType ===
                      'percent'
                        ? 100
                        : undefined
                    }
                    value={
                      cartDiscountValue || ''
                    }
                    onChange={(event) =>
                      onCartDiscountValue(
                        Math.max(
                          0,
                          Number(
                            event.target.value,
                          ),
                        ),
                      )
                    }
                    className="h-6 w-14 rounded-md border border-slate-200 px-1.5 text-[10px] text-right outline-none"
                  />

                  <span className="w-14 text-right text-xs text-emerald-600">
                    - {money(cartDiscount)}
                  </span>
                </div>
              </div>

              <div className="mt-1 flex items-center justify-between border-t border-slate-100 pt-1.5">
                <div className="flex items-center gap-1.5">
                  {/* Wallet Cashback */}
                  <div
                    title="Wallet Cashback"
                    className="flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5"
                  >
                    <Wallet
                      size={14}
                      weight="duotone"
                      className="text-emerald-600"
                    />

                    <input
                      type="number"
                      min="0"
                      step="0.1"
                      disabled={!customer}
                      value={
                        cashbackType === 'percent'
                          ? cashbackValue || ''
                          : cashbackValue || ''
                      }
                      onChange={(event) =>
                        onCashbackValue(
                          Math.max(
                            0,
                            Number(event.target.value) || 0,
                          ),
                        )
                      }
                      className="h-5 w-9 border-0 bg-transparent p-0 text-right text-[10px] font-semibold text-slate-700 outline-none"
                      placeholder="2"
                      aria-label="Cashback percentage"
                    />

                    <button
                      type="button"
                      disabled={!customer}
                      onClick={() => onCashbackType('percent')}
                      className={`text-[9px] font-bold ${
                        cashbackType === 'percent'
                          ? 'text-slate-700'
                          : 'text-slate-400'
                      }`}
                      title="Cashback percentage"
                    >
                      %
                    </button>

                    <span className="text-[9px] font-semibold text-emerald-600">
                      {money(walletCashback)}
                    </span>
                  </div>

                  {/* Loyalty Points */}
                  <div
                    title="Loyalty Points · 1 point per ₹100"
                    className="flex h-7 items-center gap-1 rounded-md border border-slate-200 bg-white px-1.5"
                  >
                    <Star
                      size={14}
                      weight="duotone"
                      className="text-amber-500"
                    />

                    <span className="text-[9px] text-slate-400">
                      /₹100
                    </span>

                    <input
                      type="number"
                      min="0"
                      step="1"
                      disabled={!customer}
                      value={pointsCashback || ''}
                      onChange={(event) =>
                        onPointsCashback(
                          Math.max(
                            0,
                            Math.floor(
                              Number(event.target.value) || 0,
                            ),
                          ),
                        )
                      }
                      className="h-5 w-10 border-0 bg-transparent p-0 text-right text-[10px] font-semibold text-slate-700 outline-none"
                      placeholder="0"
                      aria-label="Loyalty points"
                    />

                    <span className="text-[9px] font-semibold text-amber-600">
                      pts
                    </span>
                  </div>
                </div>

                <span className="text-[8px] text-slate-400">
                  after payment
                </span>
              </div>
            </div>

            <div className="border-t border-slate-100 bg-slate-50 px-4 py-2">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                    Total Payable
                  </p>

                  <p className="mt-1 text-[10px] text-slate-400">
                    Cashback is credited after payment.
                  </p>
                </div>

                <p className="text-2xl font-bold tracking-tight text-slate-900">
                  {money(finalPayable)}
                </p>
              </div>

              <div className="mt-2 grid grid-cols-[110px_1fr] gap-2">
                <button
                  type="button"
                  className="h-10 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Hold Cart
                </button>

                <button
                  type="button"
                  disabled={cart.length === 0}
                  onClick={onProceed}
                  className="h-10 rounded-lg bg-slate-900 text-xs font-semibold text-white shadow-sm transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400"
                >
                  Proceed to Payment →
                </button>
              </div>

</div>
          </>
        )}
      </div>
    </div>
  )
}



type ReceiptSnapshot = {
  invoiceNo: string
  issuedAt: string
  cart: CartItem[]
  customer: Customer | null
  subtotal: number
  itemDiscount: number
  billDiscount: number
  finalPayable: number
  walletCashback: number
  pointsCashback: number
  payments: PaymentLine[]
  lastChange: number
  lastPaymentMethod: PaymentMethod
}

const receiptStore = {
  name: 'TAZEEN',
  tagline: 'Fashion & Lifestyle',
  address: 'Ground Floor, Jal Tank Road, Lalgola, Berhampore - 742148, West Bengal',
  phone: '+91 92427 12601',
  whatsapp: '+91 92427 12601',
  gstin: '19DSWPS4139D1Z2',
}

function ReceiptPreview({
  receipt,
  onNewSale,
}: {
  receipt: ReceiptSnapshot
  onNewSale: () => void
}) {
  const itemRows = receipt.cart.map((item) => {
    const gross = item.price * item.quantity
    const discount = discountAmount(item)
    const net = Math.max(0, gross - discount)

    return {
      item,
      gross,
      discount,
      net,
    }
  })

  const afterItemDiscount = Math.max(
    0,
    receipt.subtotal - receipt.itemDiscount,
  )

  const afterBillDiscount = Math.max(
    0,
    afterItemDiscount - receipt.billDiscount,
  )

  const billFactor =
    afterItemDiscount > 0
      ? afterBillDiscount / afterItemDiscount
      : 0

  const taxLines = itemRows.map((row) => {
    const discountedNet = row.net * billFactor
    const rate = row.item.gstRate || 0

    const taxable =
      rate > 0
        ? discountedNet / (1 + rate / 100)
        : discountedNet

    const gst = discountedNet - taxable

    return {
      ...row,
      discountedNet,
      taxable,
      gst,
      rate,
    }
  })

  const taxableValue = taxLines.reduce(
    (sum, row) => sum + row.taxable,
    0,
  )

  const gstTotal = taxLines.reduce(
    (sum, row) => sum + row.gst,
    0,
  )

  const totalPaid = receipt.payments.reduce(
    (sum, payment) =>
      sum + payment.amount + payment.cardCharge,
    0,
  )

  const cashPayment = receipt.payments.find(
    (payment) => payment.method === 'Cash',
  )

  const cashReceived =
    receipt.lastPaymentMethod === 'Cash' &&
    receipt.lastChange > 0 &&
    cashPayment
      ? cashPayment.amount + receipt.lastChange
      : null

  const giftVoucherPayment = receipt.payments.find(
    (payment) => payment.method === 'Gift Card',
  )

  const formatDateTime = receipt.issuedAt

  const paymentLabel = (method: PaymentMethod) =>
    method === 'Gift Card'
      ? 'Gift Voucher'
      : method

  return (
    <div className="fixed inset-0 z-[120] overflow-y-auto bg-slate-100 p-3 sm:p-5">
      <style>{`
        @media print {
          @page {
            size: 80mm auto;
            margin: 0;
          }

          html,
          body {
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          body *:not(:has(#tazeen-receipt-print)):not(#tazeen-receipt-print):not(#tazeen-receipt-print *) {
            display: none !important;
          }

          html,
          body,
          body *:has(#tazeen-receipt-print) {
            position: static !important;
            display: block !important;
            overflow: visible !important;
            height: auto !important;
            min-height: 0 !important;
            max-height: none !important;
            padding: 0 !important;
            margin: 0 !important;
            transform: none !important;
            background: white !important;
          }

          .receipt-screen-scale {
            zoom: 1 !important;
            width: 80mm !important;
            max-width: 80mm !important;
          }

          #tazeen-receipt-print {
            width: 80mm !important;
            min-height: auto !important;
            margin: 0 !important;
            padding: 5mm !important;
            box-shadow: none !important;
            border: 0 !important;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }

          .receipt-print-hide {
            display: none !important;
          }
        }
      `}</style>

      <div className="mx-auto flex max-w-5xl items-start justify-center gap-5">
        <div className="receipt-print-hide sticky top-3 hidden w-56 shrink-0 flex-col gap-2 lg:flex">
          <button
            type="button"
            onClick={() => window.print()}
            className="h-11 rounded-xl bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            Print Bill
          </button>

          <button
            type="button"
            onClick={onNewSale}
            className="h-11 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            New Sale
          </button>

          <div className="rounded-xl border border-slate-200 bg-white p-3 text-xs leading-5 text-slate-500">
            <p className="font-semibold text-slate-700">
              80mm Thermal Receipt
            </p>
            <p className="mt-1">
              Business information, receipt policy and other configurable
              content will move to Settings after the backend is built.
            </p>
          </div>
        </div>

        <div className="receipt-screen-scale w-full max-w-[80mm]" style={{ zoom: 1.45 }}>
          <div
            id="tazeen-receipt-print"
            className="mx-auto w-[80mm] bg-white p-[5mm] text-[10px] leading-[1.35] text-slate-900 shadow-xl"
          >
            {/* Header / Logo */}
            <div className="text-center">
              <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-lg font-bold text-white">
                T
              </div>

              <p className="mt-2 text-[17px] font-extrabold tracking-[0.16em]">
                {receiptStore.name}
              </p>

              <p className="text-[9px] font-medium text-slate-500">
                {receiptStore.tagline}
              </p>

              <p className="mt-2 text-[9px] leading-4 text-slate-600">
                {receiptStore.address}
              </p>

              <p className="mt-1 text-[9px] text-slate-600">
                Phone: {receiptStore.phone}
              </p>

              <p className="text-[9px] text-slate-600">
                WhatsApp: {receiptStore.whatsapp}
              </p>

              <p className="mt-1 text-[9px] text-slate-500">
                GSTIN: {receiptStore.gstin}
              </p>
            </div>

            <div className="my-3 border-t border-dashed border-slate-400" />

            {/* Invoice */}
            <div className="space-y-1 text-[9px]">
              <div className="flex justify-between">
                <span>Invoice No</span>
                <span className="font-semibold">
                  {receipt.invoiceNo}
                </span>
              </div>

              <div className="flex justify-between">
                <span>Date / Time</span>
                <span>{formatDateTime}</span>
              </div>

              {receipt.customer && (
                <>
                  <div className="flex justify-between">
                    <span>Customer</span>
                    <span className="max-w-[48mm] text-right font-semibold">
                      {receipt.customer.name}
                    </span>
                  </div>

                  <div className="flex justify-between">
                    <span>Mobile</span>
                    <span>{receipt.customer.phone}</span>
                  </div>
                </>
              )}
            </div>

            <div className="my-3 border-t border-dashed border-slate-400" />

            {/* Items */}
            <div>
              <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.08em]">
                Items
              </p>

              <div className="space-y-3">
                {itemRows.map((row) => (
                  <div key={row.item.sku}>
                    <div className="font-semibold">
                      {row.item.product}
                    </div>

                    <div className="flex justify-between text-[9px] text-slate-600">
                      <span>
                        {row.item.variant}
                      </span>
                      <span className="shrink-0 pl-2">
                        {row.item.quantity} × {money(row.item.price)}
                      </span>
                    </div>

                    {row.discount > 0 && (
                      <div className="mt-0.5 flex justify-between text-[9px] text-slate-500">
                        <span>Discount</span>
                        <span>
                          -{money(row.discount)}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="my-3 border-t border-dashed border-slate-400" />

            {/* Bill Summary */}
            <div className="space-y-1 text-[9px]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{money(receipt.subtotal)}</span>
              </div>

              <div className="flex justify-between">
                <span>Item Discount</span>
                <span>-{money(receipt.itemDiscount)}</span>
              </div>

              <div className="flex justify-between">
                <span>Discount Calculator</span>
                <span>-{money(receipt.billDiscount)}</span>
              </div>

              <div className="flex justify-between">
                <span>Taxable Value</span>
                <span>{money(taxableValue)}</span>
              </div>

              <div className="flex justify-between">
                <span>GST</span>
                <span>{money(gstTotal)}</span>
              </div>

              <div className="my-2 border-t border-slate-300" />

              <div className="flex justify-between text-[12px] font-extrabold">
                <span>FINAL PAID AMOUNT</span>
                <span>{money(receipt.finalPayable)}</span>
              </div>
            </div>

            <div className="my-3 border-t border-dashed border-slate-400" />

            {/* Payment */}
            <div>
              <p className="mb-2 text-[9px] font-extrabold uppercase tracking-[0.08em]">
                Payment
              </p>

              <div className="space-y-1">
                {receipt.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex justify-between"
                  >
                    <span>{paymentLabel(payment.method)}</span>
                    <span>{money(payment.amount)}</span>
                  </div>
                ))}
              </div>

              <div className="mt-2 border-t border-slate-200 pt-2">
                <div className="flex justify-between font-semibold">
                  <span>Total Paid</span>
                  <span>{money(totalPaid)}</span>
                </div>

                {cashReceived !== null && (
                  <div className="mt-1 flex justify-between">
                    <span>Cash Received</span>
                    <span>{money(cashReceived)}</span>
                  </div>
                )}

                {receipt.lastChange > 0 && (
                  <div className="mt-1 flex justify-between font-semibold">
                    <span>Change Returned</span>
                    <span>{money(receipt.lastChange)}</span>
                  </div>
                )}

                {totalPaid < receipt.finalPayable && (
                  <div className="mt-1 flex justify-between font-semibold text-red-600">
                    <span>Amount Due</span>
                    <span>
                      {money(receipt.finalPayable - totalPaid)}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Wallet Cashback */}
            {receipt.walletCashback > 0 && (
              <>
                <div className="my-3 border-t border-dashed border-slate-400" />

                <div>
                  <p className="mb-1 text-[9px] font-extrabold uppercase tracking-[0.08em]">
                    Wallet Cashback
                  </p>

                  <div className="flex justify-between">
                    <span>Earned</span>
                    <span className="font-semibold">
                      {money(receipt.walletCashback)}
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Loyalty Points */}
            {receipt.pointsCashback > 0 && (
              <>
                <div className="my-3 border-t border-dashed border-slate-400" />

                <div>
                  <p className="mb-1 text-[9px] font-extrabold uppercase tracking-[0.08em]">
                    Loyalty Points
                  </p>

                  <div className="flex justify-between">
                    <span>Earned</span>
                    <span className="font-semibold">
                      {receipt.pointsCashback} pts
                    </span>
                  </div>
                </div>
              </>
            )}

            {/* Gift Voucher */}
            {giftVoucherPayment && (
              <>
                <div className="my-3 border-t border-dashed border-slate-400" />

                <div>
                  <p className="mb-1 text-[9px] font-extrabold uppercase tracking-[0.08em]">
                    Gift Voucher
                  </p>

                  <div className="flex justify-between">
                    <span>Voucher</span>
                    <span>****</span>
                  </div>

                  <div className="mt-1 flex justify-between">
                    <span>Used</span>
                    <span>
                      {money(giftVoucherPayment.amount)}
                    </span>
                  </div>
                </div>
              </>
            )}

            <div className="my-3 border-t border-dashed border-slate-400" />

            {/* Policy */}
            <div>
              <p className="mb-1 text-[9px] font-extrabold uppercase tracking-[0.08em]">
                Exchange / Return Policy
              </p>

              <p className="text-[8px] leading-4 text-slate-600">
                Exchange/return is subject to store policy.
                Original bill is required for exchange/return.
              </p>
            </div>

            <div className="mt-4 text-center">
              <p className="font-semibold">
                Thank you for shopping with Tazeen.
              </p>

              <p className="mt-1 text-[9px] text-slate-500">
                Visit Again!
              </p>
            </div>
          </div>

          {/* Mobile controls */}
          <div className="receipt-print-hide mt-3 flex gap-2 lg:hidden">
            <button
              type="button"
              onClick={() => window.print()}
              className="h-11 flex-1 rounded-xl bg-slate-900 text-sm font-semibold text-white"
            >
              Print Bill
            </button>

            <button
              type="button"
              onClick={onNewSale}
              className="h-11 flex-1 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700"
            >
              New Sale
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function PaymentScreen({
  total,
  customer,
  walletCashback,
  pointsCashback,
  onBack,
  onComplete,
}: {
  total: number
  customer: Customer | null
  walletCashback: number
  pointsCashback: number
  onBack: () => void
  onComplete: (
    payments: PaymentLine[],
    lastChange: number,
    lastPaymentMethod: PaymentMethod,
  ) => void
}) {
  const [payments, setPayments] = useState<PaymentLine[]>([])
  const [method, setMethod] = useState<PaymentMethod>('Cash')
  const [amount, setAmount] = useState('')
  const [lastChange, setLastChange] = useState(0)
  const [lastPaymentMethod, setLastPaymentMethod] =
    useState<PaymentMethod>('Cash')
  const [cardChargePercent, setCardChargePercent] =
    useState(2)
  const [upiChargePercent, setUpiChargePercent] =
    useState('0.04')
  const [paymentCompleted, setPaymentCompleted] =
    useState(false)

  const cardMethod =
    method === 'Credit Card' || method === 'Debit Card'

  const enteredAmount = Math.max(0, Number(amount) || 0)

  const paymentTotal = payments.reduce(
    (sum, payment) =>
      sum + payment.amount + payment.cardCharge,
    0,
  )

  const remaining = Math.max(0, total - paymentTotal)

  const addPayment = () => {
    if (!enteredAmount) return
    setLastChange(
      Math.max(0, enteredAmount - remaining),
    )

    const charge =
      cardMethod
        ? (enteredAmount * cardChargePercent) / 100
        : method === 'UPI' && enteredAmount > 2000
          ? (enteredAmount * (Number(upiChargePercent) || 0)) / 100
          : 0

    const payment = {
      id: `PAY-${Date.now()}`,
      method,
      amount: Math.min(enteredAmount, remaining),
      cardCharge: charge,
    }

    setPayments((current) => [...current, payment])
    setLastPaymentMethod(method)
    setAmount('')
  }

  const removePayment = (id: string) => {
    setPayments((current) =>
      current.filter((item) => item.id !== id),
    )
  }

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Payment
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Complete payment for the current POS bill.
          </p>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50"
        >
          ← Back to Cart
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_360px]">
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <SectionTitle
            title="Split Payment"
            action={
              customer ? (
                <span className="text-[10px] text-slate-400">
                  {customer.name}
                </span>
              ) : undefined
            }
          />

          <div className="p-5">
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {(
                [
                  'Cash',
                  'UPI',
                  'Wallet',
                  'Points',
                  'Gift Card',
                  'Coupon',
                  'Credit Card',
                  'Debit Card',
                ] as PaymentMethod[]
              ).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setMethod(item)}
                  className={`rounded-lg border px-3 py-3 text-left text-[10px] font-semibold transition ${
                    method === item
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {item}
                </button>
              ))}
            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto]">
                <label>
                  <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    {method === 'Cash'
                      ? 'Amount Received'
                      : `${method} Amount`}
                  </span>
                  <input
                    autoFocus
                    type="number"
                    min="0"
                    className={inputClass}
                    value={amount}
                    onChange={(event) => {
                      setAmount(event.target.value)
                      setLastChange(0)
                    }}
                    placeholder="Enter amount"
                  />
                </label>

                <button
                  type="button"
                  onClick={() =>
                    setAmount(String(remaining))
                  }
                  className="mt-auto h-10 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600"
                >
                  Full Remaining
                </button>
              </div>

              {remaining > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() =>
                      setAmount(String(remaining))
                    }
                    className="h-8 rounded-md border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Exact
                  </button>
                  {[10, 20, 50, 100, 500, 1000, 1500, 2000].map(
                    (step) => (
                      <button
                        key={step}
                        type="button"
                        onClick={() => {
                          setAmount(
                            String(enteredAmount + step),
                          )
                          setLastChange(0)
                        }}
                        className="h-8 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        +₹{step.toLocaleString('en-IN')}
                      </button>
                    ),
                  )}
                  <button
                    type="button"
                    onClick={() => setAmount('')}
                    className="h-8 rounded-md px-2 text-xs text-slate-400 hover:text-slate-600"
                  >
                    Clear
                  </button>
                </div>
              )}

              {(enteredAmount > 0 || lastChange > 0) && (
                <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-2 text-center">
                  <div>
                    <p className="text-[9px] font-bold uppercase text-slate-400">
                      Bill Due
                    </p>
                    <p className="text-lg font-bold tabular-nums text-slate-800">
                      {money(remaining)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-bold uppercase text-slate-400">
                      Received
                    </p>
                    <p className="text-lg font-bold tabular-nums text-slate-800">
                      {money(enteredAmount)}
                    </p>
                  </div>
                  <div>
                    {enteredAmount > 0 &&
                    enteredAmount < remaining ? (
                      <>
                        <p className="text-[9px] font-bold uppercase text-red-500">
                          Amount Due
                        </p>
                        <p className="text-lg font-bold tabular-nums text-red-600">
                          {money(remaining - enteredAmount)}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-[9px] font-bold uppercase text-emerald-600">
                          Change to Return
                        </p>
                        <p className="text-lg font-bold tabular-nums text-emerald-600">
                          {money(
                            enteredAmount > 0
                              ? enteredAmount - remaining
                              : lastChange,
                          )}
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {method === 'UPI' && enteredAmount > 2000 && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <label>
                      <span className="mb-1 block text-[10px] font-semibold text-amber-700">
                        Additional Charge % (Optional)
                      </span>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        className="h-9 w-full rounded-md border border-amber-200 bg-white px-2 text-xs outline-none"
                        value={upiChargePercent}
                        onChange={(event) =>
                          setUpiChargePercent(event.target.value)
                        }
                        placeholder="0.04"
                      />
                    </label>

                    <div>
                      <span className="mb-1 block text-[10px] font-semibold text-amber-700">
                        Additional Charge
                      </span>
                      <div className="flex h-9 items-center rounded-md border border-amber-200 bg-white px-2 text-xs font-semibold text-slate-700">
                        {money(
                          (enteredAmount *
                            (Number(upiChargePercent) || 0)) /
                            100,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {cardMethod && (
                <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3">
                  <div className="grid grid-cols-2 gap-3">
                    <label>
                      <span className="mb-1 block text-[10px] font-semibold text-amber-700">
                        Additional Charge %
                      </span>
                      <input
                        type="number"
                        min="0"
                        className="h-9 w-full rounded-md border border-amber-200 bg-white px-2 text-xs outline-none"
                        value={cardChargePercent}
                        onChange={(event) =>
                          setCardChargePercent(
                            Math.max(
                              0,
                              Number(event.target.value),
                            ),
                          )
                        }
                      />
                    </label>

                    <div>
                      <span className="mb-1 block text-[10px] font-semibold text-amber-700">
                        Additional Charge
                      </span>
                      <div className="flex h-9 items-center rounded-md border border-amber-200 bg-white px-2 text-xs font-semibold text-slate-700">
                        {money(
                          (enteredAmount *
                            cardChargePercent) /
                            100,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="button"
                onClick={addPayment}
                disabled={
                  !enteredAmount || remaining <= 0
                }
                className="mt-4 h-10 w-full rounded-lg bg-slate-900 text-xs font-semibold text-white disabled:opacity-40"
              >
                Add {method} Payment
              </button>
            </div>

            {payments.length > 0 && (
              <div className="mt-5 overflow-hidden rounded-lg border border-slate-200">
                <table className="w-full text-left">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50">
                      <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        Method
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        Amount
                      </th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        Charge
                      </th>
                      <th className="px-4 py-2.5" />
                    </tr>
                  </thead>

                  <tbody>
                    {payments.map((payment) => (
                      <tr
                        key={payment.id}
                        className="border-b border-slate-50 last:border-0"
                      >
                        <td className="px-4 py-3 text-xs font-semibold text-slate-700">
                          {payment.method}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-600">
                          {money(payment.amount)}
                        </td>
                        <td className="px-4 py-3 text-right text-xs text-slate-500">
                          {payment.cardCharge
                            ? money(payment.cardCharge)
                            : '—'}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button
                            type="button"
                            onClick={() =>
                              removePayment(payment.id)
                            }
                            className="text-[10px] font-semibold text-red-500"
                          >
                            Remove
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>

        <section className="h-fit overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="bg-slate-900 px-5 py-4 text-white">
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
              Payment Summary
            </p>
            <p className="mt-1 text-2xl font-bold">
              {money(total)}
            </p>
          </div>

          <div className="p-5">
            <div className="space-y-3">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Total Bill</span>
                <span>{money(total)}</span>
              </div>

              <div className="flex justify-between text-xs text-slate-500">
                <span>Paid</span>
                <span>{money(paymentTotal)}</span>
              </div>

              <div className="mt-3 rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  After Sale Rewards
                </p>

                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-slate-500">
                    Wallet Cashback
                  </span>
                  <span className="font-semibold text-emerald-600">
                    + {money(walletCashback)}
                  </span>
                </div>

                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-slate-500">
                    Points Cashback
                  </span>
                  <span className="font-semibold text-emerald-600">
                    + {pointsCashback} pts
                  </span>
                </div>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between">
                  <span className="text-sm font-semibold text-slate-700">
                    Remaining
                  </span>
                  <span
                    className={`text-lg font-bold ${
                      remaining === 0
                        ? 'text-emerald-600'
                        : 'text-red-600'
                    }`}
                  >
                    {money(remaining)}
                  </span>
                </div>
              </div>
            </div>

            {customer && (
              <div className="mt-5 rounded-lg bg-slate-50 p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Customer Benefits
                </p>
                <div className="mt-2 flex justify-between text-xs">
                  <span className="text-slate-500">
                    Wallet
                  </span>
                  <span className="font-semibold">
                    {money(customer.wallet)}
                  </span>
                </div>
                <div className="mt-1 flex justify-between text-xs">
                  <span className="text-slate-500">
                    Points
                  </span>
                  <span className="font-semibold">
                    {customer.points}
                  </span>
                </div>
              </div>
            )}

            {!paymentCompleted ? (
              <>
                <button
                  type="button"
                  disabled={remaining > 0}
                  onClick={() => {
                    onComplete(
                      payments,
                      lastChange,
                      lastPaymentMethod,
                    )
                    setPaymentCompleted(true)
                  }}
                  className="mt-5 h-11 w-full rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Complete Payment
                </button>

                {remaining > 0 && (
                  <p className="mt-2 text-center text-[10px] text-slate-400">
                    Payment must equal the final payable amount.
                  </p>
                )}
              </>
            ) : (
              <div className="mt-5 flex gap-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="h-11 flex-1 rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800"
                >
                  Print Bill
                </button>

                <button
                  type="button"
                  onClick={onBack}
                  className="h-11 flex-1 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  New Sale
                </button>
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  )
}


function createPOSCart(index: number): POSCart {
  return {
    id: `CART-${Date.now()}-${index}-${Math.random()
      .toString(36)
      .slice(2, 7)}`,
    name: `Cart ${index}`,
    cart: [],
    customer: null,
    cartDiscountType: 'amount',
    cartDiscountValue: 0,
    cashbackType: 'percent',
    cashbackValue: 2,
    pointsCashback: 0,
    note: '',
    status: 'active',
  }
}

export function POSDesktopPage() {
  const [carts, setCarts] = useState<POSCart[]>([
    createPOSCart(1),
  ])

  const [activeCartId, setActiveCartId] = useState(
    () => carts[0].id,
  )

  const [customers, setCustomers] =
    useState<Customer[]>(initialCustomers)

  const [paymentOpen, setPaymentOpen] = useState(false)
  const [receiptOpen, setReceiptOpen] = useState(false)
  const [receiptData, setReceiptData] =
    useState<ReceiptSnapshot | null>(null)

  const activeCart =
    carts.find((cart) => cart.id === activeCartId) ??
    carts[0]

  const cart = activeCart.cart
  const customer = activeCart.customer

  const updateActiveCart = (
    updater: (cart: POSCart) => POSCart,
  ) => {
    setCarts((current) =>
      current.map((item) =>
        item.id === activeCart.id
          ? updater(item)
          : item,
      ),
    )
  }

  const addToCart = (sku: PosSku) => {
    updateActiveCart((currentCart) => ({
      ...currentCart,
      cart: (() => {
        const existing = currentCart.cart.find(
          (item) => item.sku === sku.sku,
        )

        if (existing) {
          if (existing.quantity >= sku.stock) {
            return currentCart.cart
          }

          return currentCart.cart.map((item) =>
            item.sku === sku.sku
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          )
        }

        return [
          ...currentCart.cart,
          {
            ...sku,
            quantity: 1,
            discountType: 'percent',
            discountValue: 0,
          },
        ]
      })(),
      status: 'active',
    }))
  }

  const updateCartItem = (
    sku: string,
    changes: Partial<CartItem>,
  ) => {
    updateActiveCart((currentCart) => ({
      ...currentCart,
      cart: currentCart.cart.map((item) =>
        item.sku === sku
          ? { ...item, ...changes }
          : item,
      ),
    }))
  }

  const removeCartItem = (sku: string) => {
    updateActiveCart((currentCart) => ({
      ...currentCart,
      cart: currentCart.cart.filter(
        (item) => item.sku !== sku,
      ),
    }))
  }

  const setCustomerForCart = (
    nextCustomer: Customer | null,
  ) => {
    updateActiveCart((currentCart) => ({
      ...currentCart,
      customer: nextCustomer,
    }))
  }

  const createNewCart = () => {
    const nextNumber =
      carts.length > 0
        ? Math.max(
            ...carts.map((item) => {
              const match =
                item.name.match(/Cart (\\d+)/)
              return match
                ? Number(match[1])
                : 0
            }),
          ) + 1
        : 1

    const nextCart = createPOSCart(nextNumber)

    setCarts((current) => [
      ...current,
      nextCart,
    ])

    setActiveCartId(nextCart.id)
  }

  const closeCart = (id: string) => {
    const target = carts.find(
      (item) => item.id === id,
    )

    if (!target) return

    if (target.cart.length > 0) {
      const confirmed = window.confirm(
        `${target.name} has ${target.cart.length} item(s). Close this cart without completing the sale?`,
      )

      if (!confirmed) return
    }

    setCarts((current) => {
      const remaining = current.filter(
        (item) => item.id !== id,
      )

      if (remaining.length === 0) {
        const replacement = createPOSCart(1)
        setActiveCartId(replacement.id)
        return [replacement]
      }

      if (id === activeCartId) {
        const next =
          remaining[remaining.length - 1]
        setActiveCartId(next.id)
      }

      return remaining
    })
  }

  const subtotal = cart.reduce(
    (sum, item) =>
      sum + item.price * item.quantity,
    0,
  )

  const itemDiscount = cart.reduce(
    (sum, item) =>
      sum + discountAmount(item),
    0,
  )

  const afterItemDiscount =
    subtotal - itemDiscount

  const cartDiscount = Math.min(
    afterItemDiscount,
    activeCart.cartDiscountType === 'percent'
      ? (afterItemDiscount *
          activeCart.cartDiscountValue) /
          100
      : activeCart.cartDiscountValue,
  )

  const finalPayable = Math.max(
    0,
    afterItemDiscount - cartDiscount,
  )

  const walletCashback = customer
    ? Math.max(
        0,
        activeCart.cashbackType === 'percent'
          ? (finalPayable *
              activeCart.cashbackValue) /
              100
          : Math.min(
              finalPayable,
              activeCart.cashbackValue,
            ),
      )
    : 0

  const paymentOverlay = paymentOpen ? (
    <div className="fixed inset-0 z-[100] bg-slate-950/45 p-2 backdrop-blur-[1px] sm:p-4">
      <div className="flex h-full w-full items-center justify-center">
        <div className="max-h-full w-full max-w-6xl overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3 shadow-2xl sm:p-5">
          <PaymentScreen
            total={finalPayable}
            customer={customer}
            walletCashback={walletCashback}
            pointsCashback={
              customer
                ? activeCart.pointsCashback
                : 0
            }
            onBack={() => {
              setPaymentOpen(false)
              setReceiptData(null)
              setReceiptOpen(false)
            }}
            onComplete={(
              payments,
              lastChange,
              lastPaymentMethod,
            ) => {
              const snapshot: ReceiptSnapshot = {
                invoiceNo: `TZ-${Date.now()
                  .toString()
                  .slice(-8)}`,
                issuedAt: new Date().toLocaleString(
                  'en-IN',
                  {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                ),
                cart: activeCart.cart.map(
                  (item) => ({ ...item }),
                ),
                customer: activeCart.customer
                  ? { ...activeCart.customer }
                  : null,
                subtotal,
                itemDiscount,
                billDiscount: cartDiscount,
                finalPayable,
                walletCashback,
                pointsCashback:
                  activeCart.pointsCashback,
                payments: payments.map(
                  (payment) => ({ ...payment }),
                ),
                lastChange,
                lastPaymentMethod,
              }

              setReceiptData(snapshot)

              setCarts((current) => {
                const remaining =
                  current.filter(
                    (item) =>
                      item.id !== activeCart.id,
                  )

                if (remaining.length === 0) {
                  const replacement =
                    createPOSCart(1)
                  setActiveCartId(
                    replacement.id,
                  )
                  return [replacement]
                }

                const next =
                  remaining[
                    remaining.length - 1
                  ]

                setActiveCartId(next.id)
                return remaining
              })

              setReceiptOpen(false)
            }}
          />
        </div>
      </div>
    </div>
  ) : null

  const receiptOverlay =
    receiptData ? (
      <div
        aria-hidden="true"
        className="pointer-events-none fixed left-[-10000px] top-0 h-0 w-0 overflow-hidden"
      >
        <ReceiptPreview
          receipt={receiptData}
          onNewSale={() => {
            setReceiptData(null)
            setReceiptOpen(false)
          }}
        />
      </div>
    ) : null


  return (
    <div className="h-[calc(100vh-7.5rem)] min-h-[620px]">
      {/* Compact multi-cart bar */}
      <div className="mb-3 overflow-x-auto">
        <div className="flex min-w-max items-center gap-1.5 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          {carts.map((item) => {
            const itemCount = item.cart.reduce(
              (sum, line) => sum + line.quantity,
              0,
            )

            const { finalPayable } = getCartTotals(
              item.cart,
              item.cartDiscountType,
              item.cartDiscountValue,
            )

            const isActive = item.id === activeCart.id

            return (
              <div
                key={item.id}
                className={[
                  'flex items-center rounded-lg transition',
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-600 hover:bg-slate-50',
                ].join(' ')}
              >
                <button
                  type="button"
                  onClick={() => setActiveCartId(item.id)}
                  className="flex h-9 items-center gap-2 px-3 text-left"
                  aria-label={`Switch to ${item.name}`}
                >
                  <ShoppingCart
                    size={15}
                    weight={isActive ? 'fill' : 'regular'}
                  />

                  <span className="text-xs font-semibold">
                    {item.name}
                  </span>

                  <span
                    className={[
                      'rounded-full px-1.5 py-0.5 text-[9px] font-semibold',
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'bg-slate-100 text-slate-500',
                    ].join(' ')}
                  >
                    {itemCount}
                  </span>

                  <span
                    className={[
                      'text-[10px] font-semibold',
                      isActive
                        ? 'text-slate-300'
                        : 'text-slate-400',
                    ].join(' ')}
                  >
                    {money(finalPayable)}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => closeCart(item.id)}
                  className={[
                    'mr-1 flex h-6 w-6 items-center justify-center rounded-md text-xs',
                    isActive
                      ? 'text-slate-300 hover:bg-white/10 hover:text-white'
                      : 'text-slate-300 hover:bg-red-50 hover:text-red-500',
                  ].join(' ')}
                  aria-label={`Close ${item.name}`}
                  title="Close cart"
                >
                  ×
                </button>
              </div>
            )
          })}

          <button
            type="button"
            onClick={createNewCart}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-dashed border-slate-300 text-slate-500 transition hover:border-slate-400 hover:bg-slate-50 hover:text-slate-800"
            aria-label="Create new cart"
            title="New cart"
          >
            <Plus size={17} weight="bold" />
          </button>
        </div>
      </div>

      {/* POS workspace */}
      <div className="grid h-[calc(100%-3.5rem)] min-h-0 grid-cols-1 gap-3 xl:grid-cols-[minmax(0,3fr)_minmax(430px,2fr)]">
        <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex h-full min-h-0 flex-col">
            <div className="min-h-0 flex-1 overflow-hidden">
              <div className="grid h-full min-h-0 grid-rows-[minmax(0,1fr)_auto]">
                <div className="min-h-0 overflow-hidden">
                  <ProductSearchPanel
                    onAdd={addToCart}
                    scannerDisabled={receiptOpen}
                  />
                </div>

                <div className="shrink-0">
                  <TopSellingPanel
                    onAdd={addToCart}
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="min-h-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <CartPanel
            cart={cart}
            customer={customer}
            customers={customers}
            onAdd={addToCart}
            onUpdate={updateCartItem}
            onRemove={removeCartItem}
            onCustomer={setCustomerForCart}
            onNewCustomer={(newCustomer) => {
              setCustomers((current) => [
                newCustomer,
                ...current,
              ])
              setCustomerForCart(newCustomer)
            }}
            onProceed={() => setPaymentOpen(true)}
            cartDiscountType={
              activeCart.cartDiscountType
            }
            cartDiscountValue={
              activeCart.cartDiscountValue
            }
            onCartDiscountType={(type) =>
              updateActiveCart((current) => ({
                ...current,
                cartDiscountType: type,
              }))
            }
            onCartDiscountValue={(value) =>
              updateActiveCart((current) => ({
                ...current,
                cartDiscountValue: value,
              }))
            }
            cashbackType={activeCart.cashbackType}
            cashbackValue={activeCart.cashbackValue}
            walletCashback={walletCashback}
            pointsCashback={
              customer
                ? activeCart.pointsCashback
                : 0
            }
            onCashbackType={(type) =>
              updateActiveCart((current) => ({
                ...current,
                cashbackType: type,
              }))
            }
            onCashbackValue={(value) =>
              updateActiveCart((current) => ({
                ...current,
                cashbackValue: value,
              }))
            }
            onPointsCashback={(value) =>
              updateActiveCart((current) => ({
                ...current,
                pointsCashback: value,
              }))
            }
          />
        </section>
      </div>
      {paymentOverlay}
      {receiptOverlay}
    </div>
  )
}
