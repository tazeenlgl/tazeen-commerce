import { Fragment, useEffect, useState } from 'react'
import { POSDesktopPage } from './POSDesktopPage'
import { ExpensesPage } from './FinancePages'
import { EmployeesPage } from './StaffPages'
import { EngagementPage } from './engagement/EngagementPage'
import {
  ArrowLeft,
  ArrowRight,
  ArrowsClockwise,
  Bell,
  Barcode,
  CaretDown,
  CaretRight,
  ChartLineUp,
  CheckCircle,
  Cube,
  CurrencyInr,
  Eye,
  FloppyDisk,
  Gear,
  House,
  List,
  MagnifyingGlass,
  Package,
  Percent,
  PencilSimple,
  Plus,
  Receipt,
  ShoppingBag,
  SignOut,
  Storefront,
  Trash,
  Trophy,
  Truck,
  Users,
  Wallet,
  Printer,
  X,
} from '@phosphor-icons/react'
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  BrowserRouter,
  NavLink,
  Route,
  Routes,
} from 'react-router-dom'
import { AuthProvider, useAuth } from './auth/AuthContext'

const salesData = [
  { day: 'Mon', sales: 32000 },
  { day: 'Tue', sales: 41000 },
  { day: 'Wed', sales: 38000 },
  { day: 'Thu', sales: 52000 },
  { day: 'Fri', sales: 47000 },
  { day: 'Sat', sales: 68000 },
  { day: 'Sun', sales: 84250 },
]

const navItems = [
  {
    label: 'Dashboard',
    path: '/',
    icon: House,
  },
  {
    label: 'POS',
    icon: Storefront,
    children: [
      { label: 'Desktop', path: '/pos/desktop' },
      { label: 'Mobile', path: '/pos/mobile' },
    ],
  },
  {
    label: 'Sales',
    icon: Receipt,
    children: [
      { label: 'Invoices', path: '/sales/invoices' },
      { label: 'Exchanges', path: '/sales/exchanges' },
    ],
  },
  {
    label: 'Bill Discount',
    path: '/bill-discount',
    icon: Percent,
  },
  {
    label: 'Pricing',
    path: '/pricing',
    icon: CurrencyInr,
  },
  {
    label: 'Products',
    icon: Cube,
    children: [
      { label: 'Products', path: '/products' },
      { label: 'Category', path: '/products/categories' },
    ],
  },
  {
    label: 'Purchases',
    icon: ShoppingBag,
    children: [
      { label: 'Purchase Invoices', path: '/purchases/invoices' },
    ],
  },
  {
    label: 'Suppliers',
    path: '/suppliers',
    icon: Truck,
  },
  {
    label: 'Inventory',
    icon: Package,
    children: [
      { label: 'Stock', path: '/inventory/stock' },
      { label: 'Location Transfer', path: '/inventory/location-transfer' },
    ],
  },
  {
    label: 'Customers',
    icon: Users,
    children: [
      { label: 'Profile', path: '/customers/profile' },
      { label: 'Wallet', path: '/customers/wallet' },
      { label: 'Points', path: '/customers/points' },
      { label: 'Gift Vouchers', path: '/customers/gift-vouchers' },
      { label: 'Coupons', path: '/customers/coupons' },
    ],
  },
  {
    label: 'Engagement',
    path: '/engagement',
    icon: Trophy,
  },
  {
    label: 'Reports',
    path: '/reports',
    icon: ChartLineUp,
  },
  {
    label: 'GST',
    icon: CurrencyInr,
    children: [
      { label: 'GST Management', path: '/gst/management' },
      { label: 'GSTR-1', path: '/gst/gstr-1' },
      { label: 'GST Credit', path: '/gst/credit' },
    ],
  },
  {
    label: 'Staff',
    icon: Users,
    children: [
      { label: 'Employees', path: '/staff/employees' },
    ],
  },
  {
    label: 'Finance',
    icon: CurrencyInr,
    children: [
      { label: 'Expenses', path: '/finance/expenses' },
    ],
  },
  {
    label: 'Communication',
    icon: Bell,
    children: [
      { label: 'WhatsApp', path: '/communication/whatsapp' },
      { label: 'Telegram', path: '/communication/telegram' },
    ],
  },
  {
    label: 'Devices',
    icon: Printer,
    children: [
      { label: 'Barcode Scanner', path: '/devices/barcode-scanner' },
      { label: 'Camera Scanner', path: '/devices/camera-scanner' },
      { label: 'Bill Printer', path: '/devices/bill-printer' },
      { label: 'Label Printer', path: '/devices/label-printer' },
    ],
  },
  {
    label: 'Settings',
    path: '/settings',
    icon: Gear,
  },
] as const


function Login() {
  const { login, loginError } = useAuth()
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    await login(phone.trim(), password)
    setSubmitting(false)
  }

  return (
    <div className="min-h-screen bg-[#f5f6f8] p-4 md:p-6">
      <div className="mx-auto flex min-h-[calc(100vh-2rem)] max-w-[1440px] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_20px_60px_rgba(15,23,42,0.08)] md:min-h-[calc(100vh-3rem)]">

        <section className="relative hidden w-1/2 overflow-hidden bg-[#202936] p-12 text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 opacity-[0.06]">
            <div className="absolute -left-24 top-20 h-[420px] w-[420px] rounded-full border-[70px] border-white" />
            <div className="absolute -bottom-40 -right-20 h-[560px] w-[560px] rounded-full border-[80px] border-white" />
          </div>

          <div className="relative">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-sm font-bold text-slate-900">
                T
              </div>

              <div>
                <div className="text-sm font-bold tracking-[0.22em]">
                  TAZEEN
                </div>
                <div className="mt-0.5 text-xs text-slate-300">
                  Point of Sale
                </div>
              </div>
            </div>

            <div className="mt-24 max-w-xl">
              <span className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-slate-200">
                Retail Management Platform
              </span>

              <h1 className="mt-5 text-5xl font-semibold leading-[1.08] tracking-[-0.045em]">
                Run your showroom with clarity.
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-300">
                Fast billing, inventory control, customer management
                and business reporting in one connected POS system.
              </p>
            </div>
          </div>

          <div className="relative grid grid-cols-2 gap-3">
            {[
              'Fast billing',
              'Inventory control',
              'Customer history',
              'GST & reports',
            ].map((item) => (
              <div
                key={item}
                className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.06] px-4 py-3 text-sm text-slate-200"
              >
                <CheckCircle size={18} weight="fill" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="flex w-full items-center justify-center bg-white px-6 py-12 md:px-12 lg:w-1/2">
          <div className="w-full max-w-md">

            <div className="mb-10 lg:hidden">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-sm font-bold text-white">
                  T
                </div>
                <div className="text-sm font-bold tracking-[0.2em]">
                  TAZEEN POS
                </div>
              </div>
            </div>

            <div className="mb-8">
              <h2 className="text-3xl font-semibold tracking-[-0.03em] text-slate-900">
                Welcome back
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                Sign in to continue to Tazeen POS.
              </p>
            </div>

            <form onSubmit={submit} className="space-y-5">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Phone
                </label>

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter phone number"
                  autoComplete="username"
                  className="h-12 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Password
                </label>

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  autoComplete="current-password"
                  className="h-12 w-full rounded-lg border border-slate-200 px-4 text-sm outline-none transition focus:border-slate-400 focus:ring-4 focus:ring-slate-100"
                />
              </div>

              {loginError && (
                <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {loginError}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="h-12 w-full rounded-lg bg-slate-900 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
              >
                {submitting ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <p className="mt-8 text-center text-xs text-slate-400">
              Tazeen POS
            </p>
          </div>
        </section>
      </div>
    </div>
  )
}

function PageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-center">
      <div>
        <h1 className="text-2xl font-semibold tracking-[-0.025em] text-slate-900">
          {title}
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          {description}
        </p>
      </div>

      <button className="w-fit rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50">
        Today
        <CaretDown size={14} className="ml-2 inline" />
      </button>
    </div>
  )
}

function StatCard({
  label,
  value,
  note,
  Icon,
}: {
  label: string
  value: string
  note: string
  Icon: typeof CurrencyInr
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <div className="flex items-start justify-between">
        <div>
          <div className="text-sm text-slate-500">{label}</div>

          <div className="mt-2 text-2xl font-semibold tracking-[-0.03em] text-slate-900">
            {value}
          </div>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
          <Icon size={20} />
        </div>
      </div>

      <div className="mt-4 text-xs text-slate-400">
        {note}
      </div>
    </div>
  )
}

function Dashboard() {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Overview of your showroom performance."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Today's Sales"
          value="₹84,250"
          note="+12.8% compared with yesterday"
          Icon={CurrencyInr}
        />

        <StatCard
          label="Bills"
          value="126"
          note="+8.4% compared with yesterday"
          Icon={Receipt}
        />

        <StatCard
          label="Average Bill"
          value="₹668"
          note="Based on today's completed sales"
          Icon={Wallet}
        />

        <StatCard
          label="Returns"
          value="₹3,420"
          note="8 returned items today"
          Icon={ShoppingBag}
        />
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[1.6fr_1fr]">
        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Sales Overview
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Sales performance for the selected period
          </p>

          <div className="mt-6 h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient
                    id="salesFill"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#334155"
                      stopOpacity={0.18}
                    />
                    <stop
                      offset="100%"
                      stopColor="#334155"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <XAxis
                  dataKey="day"
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: '#94a3b8',
                  }}
                />

                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{
                    fontSize: 12,
                    fill: '#94a3b8',
                  }}
                  tickFormatter={(value) =>
                    `₹${value / 1000}k`
                  }
                />

                <Tooltip
                  formatter={(value) => [
                    `₹${Number(value).toLocaleString('en-IN')}`,
                    'Sales',
                  ]}
                />

                <Area
                  type="monotone"
                  dataKey="sales"
                  stroke="#334155"
                  strokeWidth={2}
                  fill="url(#salesFill)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-5">
          <h2 className="text-base font-semibold text-slate-900">
            Payment Summary
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            Today's payment collection
          </p>

          <div className="mt-6 space-y-5">
            {[
              ['Cash', '₹32,500', 38],
              ['UPI', '₹38,200', 45],
              ['Card', '₹11,450', 14],
              ['Wallet', '₹2,100', 3],
            ].map(([name, value, percent]) => (
              <div key={name}>
                <div className="mb-2 flex justify-between text-sm">
                  <span className="text-slate-500">
                    {name}
                  </span>

                  <span className="font-medium text-slate-800">
                    {value}
                  </span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-slate-700"
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <DashboardList
          title="Top Selling Products"
          items={[
            ['Premium Cotton Suit', '42 units', '₹37,758'],
            ['Printed Kurti', '38 units', '₹18,962'],
            ['Cotton Plazzo', '31 units', '₹15,469'],
            ['Embroidered Suit', '24 units', '₹21,576'],
          ]}
        />

        <DashboardList
          title="Low Stock"
          items={[
            ['Printed Kurti', 'SKU-1024', '3 pcs'],
            ['Cotton Suit XL', 'SKU-2041', '5 pcs'],
            ['Plazzo Black L', 'SKU-3018', '2 pcs'],
            ['Embroidered Suit', 'SKU-4120', '4 pcs'],
          ]}
          warning
        />
      </div>
    </>
  )
}

function DashboardList({
  title,
  items,
  warning = false,
}: {
  title: string
  items: string[][]
  warning?: boolean
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          {title}
        </h2>
      </div>

      <div className="divide-y divide-slate-100">
        {items.map((item) => (
          <div
            key={item[0]}
            className="flex items-center justify-between px-5 py-4"
          >
            <div>
              <div className="text-sm font-medium text-slate-800">
                {item[0]}
              </div>

              <div className="mt-1 text-xs text-slate-400">
                {item[1]}
              </div>
            </div>

            {warning ? (
              <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-medium text-amber-700">
                {item[2]}
              </span>
            ) : (
              <div className="text-sm font-semibold text-slate-700">
                {item[2]}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}

type SupplierAddress = {
  id: string
  type: string
  line1: string
  line2: string
  city: string
  state: string
  pinCode: string
}

type SupplierBank = {
  bankName: string
  accountNumber: string
  ifsc: string
  branch: string
  accountHolderName: string
}

type Supplier = {
  id: string
  code: string
  name: string
  type: string
  contactPerson: string
  mobile: string
  alternateMobile: string
  email: string
  gstin: string
  pan: string
  addresses: SupplierAddress[]
  bank?: SupplierBank
  notes: string
  status: 'Active' | 'Inactive'
  outstanding: number
  lastPurchase: string
}

const supplierStates = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Delhi',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Tamil Nadu',
  'Telangana',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
]

const supplierCities = [
  'Surat',
  'Kolkata',
  'Mumbai',
  'Delhi',
  'Jaipur',
  'Ahmedabad',
  'Bengaluru',
  'Hyderabad',
  'Ludhiana',
  'Varanasi',
]

const initialSuppliers: Supplier[] = [
  {
    id: 'supplier-1',
    code: 'SUP-0001',
    name: 'Sweety Fashion Pvt. Ltd.',
    type: 'Manufacturer',
    contactPerson: 'Hiren Bhai',
    mobile: '9376876166',
    alternateMobile: '9016664018',
    email: 'sweetyfashion.india@gmail.com',
    gstin: '24AAICS2384N1ZW',
    pan: 'AAICS2384N',
    addresses: [
      {
        id: 'address-1',
        type: 'Sale Office',
        line1: 'A-1029 TO 1035/1038 TO 1043, Radha Krishna Textile Market',
        line2: 'Ring Road',
        city: 'Surat',
        state: 'Gujarat',
        pinCode: '395002',
      },
      {
        id: 'address-2',
        type: 'Head Office',
        line1: '601 TO 628, Raghuvir Trade Center',
        line2: 'Opp. Landmark Empires',
        city: 'Surat',
        state: 'Gujarat',
        pinCode: '395010',
      },
    ],
    bank: {
      bankName: 'Kotak Mahindra Bank',
      accountNumber: '2311123904',
      ifsc: 'KKBK0000876',
      branch: 'Shanti Point, Surat',
      accountHolderName: 'Sweety Fashion Pvt. Ltd.',
    },
    notes: '',
    status: 'Active',
    outstanding: 0,
    lastPurchase: '16 Feb 2026',
  },
]

type SupplierForm = {
  name: string
  type: string
  contactPerson: string
  mobile: string
  alternateMobile: string
  email: string
  gstin: string
  pan: string
  status: 'Active' | 'Inactive'
  addressType: string
  addressLine1: string
  addressLine2: string
  cityMode: 'existing' | 'custom'
  city: string
  customCity: string
  state: string
  pinCode: string
  useExistingAddress: string
  bankName: string
  accountNumber: string
  ifsc: string
  branch: string
  accountHolderName: string
  notes: string
}

const emptySupplierForm: SupplierForm = {
  name: '',
  type: 'Manufacturer',
  contactPerson: '',
  mobile: '',
  alternateMobile: '',
  email: '',
  gstin: '',
  pan: '',
  status: 'Active',
  addressType: 'Office',
  addressLine1: '',
  addressLine2: '',
  cityMode: 'existing',
  city: '',
  customCity: '',
  state: '',
  pinCode: '',
  useExistingAddress: '',
  bankName: '',
  accountNumber: '',
  ifsc: '',
  branch: '',
  accountHolderName: '',
  notes: '',
}


type PurchaseInvoice = {
  id: string
  invoiceNo: string
  supplier: string
  supplierState: string
  purchaseDate: string
  items: number
  taxableValue: number
  gstRate: number
  gstAmount: number
  finalValue: number
  location: string
  documentName: string
}

const initialPurchaseInvoices: PurchaseInvoice[] = [
  {
    id: 'purchase-1',
    invoiceNo: '11882-R',
    supplier: 'Sweety Fashion Pvt. Ltd.',
    supplierState: 'Gujarat',
    purchaseDate: '16 Feb 2026',
    items: 24,
    taxableValue: 55341,
    gstRate: 5,
    gstAmount: 2767.05,
    finalValue: 58108.05,
    location: 'Lalgola Showroom',
    documentName: '11882-R.pdf',
  },
  {
    id: 'purchase-2',
    invoiceNo: 'SF-2451',
    supplier: 'Sweety Fashion Pvt. Ltd.',
    supplierState: 'Gujarat',
    purchaseDate: '04 Mar 2026',
    items: 18,
    taxableValue: 34200,
    gstRate: 5,
    gstAmount: 1710,
    finalValue: 35910,
    location: 'Lalgola Showroom',
    documentName: 'SF-2451.pdf',
  },
]

const purchaseLocations = [
  'Lalgola Showroom',
]


type ProductCategory = {
  id: string
  code: string
  name: string
  description: string
  status: 'Active' | 'Inactive'
  subCategories: ProductSubCategory[]
}

type ProductSubCategory = {
  id: string
  code: string
  name: string
  status: 'Active' | 'Inactive'
  products: number
}

const initialProductCategories: ProductCategory[] = [
  {
    id: 'cat-001',
    code: 'WEW-001',
    name: 'Women Ethnic Wear',
    description: 'Traditional and ethnic women wear.',
    status: 'Active',
    subCategories: [
      {
        id: 'sub-001',
        code: 'WEW-SUB-001',
        name: 'Suits',
        status: 'Active',
        products: 64,
      },
      {
        id: 'sub-002',
        code: 'WEW-SUB-002',
        name: 'Kurtis',
        status: 'Active',
        products: 38,
      },
      {
        id: 'sub-003',
        code: 'WEW-SUB-003',
        name: 'Churidar',
        status: 'Active',
        products: 18,
      },
      {
        id: 'sub-004',
        code: 'WEW-SUB-004',
        name: 'Dupatta',
        status: 'Active',
        products: 8,
      },
    ],
  },
  {
    id: 'cat-002',
    code: 'WW-001',
    name: 'Western Wear',
    description: 'Modern western clothing.',
    status: 'Active',
    subCategories: [
      {
        id: 'sub-005',
        code: 'WW-SUB-001',
        name: 'Tops',
        status: 'Active',
        products: 22,
      },
      {
        id: 'sub-006',
        code: 'WW-SUB-002',
        name: 'Dresses',
        status: 'Active',
        products: 16,
      },
      {
        id: 'sub-007',
        code: 'WW-SUB-003',
        name: 'Co-ords',
        status: 'Active',
        products: 8,
      },
    ],
  },
  {
    id: 'cat-003',
    code: 'BW-001',
    name: 'Bottom Wear',
    description: 'Women bottom wear collection.',
    status: 'Active',
    subCategories: [
      {
        id: 'sub-008',
        code: 'BW-SUB-001',
        name: 'Palazzo',
        status: 'Active',
        products: 15,
      },
      {
        id: 'sub-009',
        code: 'BW-SUB-002',
        name: 'Pants',
        status: 'Active',
        products: 12,
      },
      {
        id: 'sub-010',
        code: 'BW-SUB-003',
        name: 'Leggings',
        status: 'Active',
        products: 8,
      },
    ],
  },
  {
    id: 'cat-004',
    code: 'ACC-001',
    name: 'Accessories',
    description: 'Fashion accessories.',
    status: 'Active',
    subCategories: [
      {
        id: 'sub-011',
        code: 'ACC-SUB-001',
        name: 'Bags',
        status: 'Active',
        products: 5,
      },
      {
        id: 'sub-012',
        code: 'ACC-SUB-002',
        name: 'Scarves',
        status: 'Active',
        products: 4,
      },
      {
        id: 'sub-013',
        code: 'ACC-SUB-003',
        name: 'Fashion Jewellery',
        status: 'Active',
        products: 3,
      },
    ],
  },
]

function generateCategoryCode(name: string, categories: ProductCategory[]) {
  const words = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)

  const prefix =
    words.length === 1
      ? words[0].slice(0, 3)
      : words.map((word) => word[0]).join('').slice(0, 4)

  const base = prefix.toUpperCase() || 'CAT'

  let number = 1

  while (
    categories.some(
      (category) => category.code === `${base}-${String(number).padStart(3, '0')}`,
    )
  ) {
    number += 1
  }

  return `${base}-${String(number).padStart(3, '0')}`
}

function generateSubCategoryCode(
  category: ProductCategory,
  subCategories: ProductSubCategory[],
) {
  const prefix = category.code.split('-')[0]
  let number = 1

  while (
    subCategories.some(
      (subCategory) =>
        subCategory.code === `${prefix}-SUB-${String(number).padStart(3, '0')}`,
    )
  ) {
    number += 1
  }

  return `${prefix}-SUB-${String(number).padStart(3, '0')}`
}

function ProductCategoriesPage() {
  const [categories, setCategories] = useState<ProductCategory[]>(
    initialProductCategories,
  )
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list')
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [expandedIds, setExpandedIds] = useState<string[]>(['cat-001'])

  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] = useState('')
  const [categoryStatus, setCategoryStatus] =
    useState<ProductCategory['status']>('Active')

  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(
    null,
  )

  const [subCategoryParentId, setSubCategoryParentId] = useState<string | null>(
    null,
  )
  const [subCategoryName, setSubCategoryName] = useState('')
  const [subCategoryStatus, setSubCategoryStatus] =
    useState<ProductSubCategory['status']>('Active')
  const [editingSubCategoryId, setEditingSubCategoryId] = useState<string | null>(
    null,
  )

  const [message, setMessage] = useState('')

  const filteredCategories = categories.filter((category) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      category.name.toLowerCase().includes(query) ||
      category.code.toLowerCase().includes(query) ||
      category.subCategories.some(
        (subCategory) =>
          subCategory.name.toLowerCase().includes(query) ||
          subCategory.code.toLowerCase().includes(query),
      )

    const matchesStatus =
      statusFilter === 'All' || category.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const resetCategoryForm = () => {
    setCategoryName('')
    setCategoryDescription('')
    setCategoryStatus('Active')
    setEditingCategoryId(null)
  }

  const resetSubCategoryForm = () => {
    setSubCategoryName('')
    setSubCategoryStatus('Active')
    setEditingSubCategoryId(null)
    setSubCategoryParentId(null)
  }

  const toggleExpanded = (id: string) => {
    setExpandedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    )
  }

  const startAddCategory = () => {
    resetCategoryForm()
    resetSubCategoryForm()
    setActiveTab('add')
  }

  const startEditCategory = (category: ProductCategory) => {
    setCategoryName(category.name)
    setCategoryDescription(category.description)
    setCategoryStatus(category.status)
    setEditingCategoryId(category.id)
    resetSubCategoryForm()
    setActiveTab('add')
  }

  const startAddSubCategory = (categoryId: string) => {
    resetSubCategoryForm()
    setSubCategoryParentId(categoryId)
    setExpandedIds((current) =>
      current.includes(categoryId) ? current : [...current, categoryId],
    )
  }

  const startEditSubCategory = (
    categoryId: string,
    subCategory: ProductSubCategory,
  ) => {
    setSubCategoryParentId(categoryId)
    setSubCategoryName(subCategory.name)
    setSubCategoryStatus(subCategory.status)
    setEditingSubCategoryId(subCategory.id)
  }

  const saveCategory = (event: React.FormEvent) => {
    event.preventDefault()

    const name = categoryName.trim()

    if (!name) {
      setMessage('Category name is required.')
      return
    }

    const duplicate = categories.some(
      (category) =>
        category.id !== editingCategoryId &&
        category.name.toLowerCase() === name.toLowerCase(),
    )

    if (duplicate) {
      setMessage('Category name already exists.')
      return
    }

    if (editingCategoryId) {
      setCategories((current) =>
        current.map((category) =>
          category.id === editingCategoryId
            ? {
                ...category,
                name,
                description: categoryDescription.trim(),
                status: categoryStatus,
              }
            : category,
        ),
      )
      setMessage('Category updated successfully.')
    } else {
      const code = generateCategoryCode(name, categories)

      setCategories((current) => [
        ...current,
        {
          id: `cat-${Date.now()}`,
          code,
          name,
          description: categoryDescription.trim(),
          status: categoryStatus,
          subCategories: [],
        },
      ])

      setMessage(`Category created successfully. Code: ${code}`)
    }

    resetCategoryForm()
    setActiveTab('list')
  }

  const saveSubCategory = (event: React.FormEvent) => {
    event.preventDefault()

    const name = subCategoryName.trim()

    if (!subCategoryParentId) {
      setMessage('Select a category for the sub-category.')
      return
    }

    if (!name) {
      setMessage('Sub-category name is required.')
      return
    }

    const parent = categories.find(
      (category) => category.id === subCategoryParentId,
    )

    if (!parent) {
      setMessage('Parent category could not be found.')
      return
    }

    const duplicate = parent.subCategories.some(
      (subCategory) =>
        subCategory.id !== editingSubCategoryId &&
        subCategory.name.toLowerCase() === name.toLowerCase(),
    )

    if (duplicate) {
      setMessage('Sub-category name already exists in this category.')
      return
    }

    if (editingSubCategoryId) {
      setCategories((current) =>
        current.map((category) =>
          category.id === subCategoryParentId
            ? {
                ...category,
                subCategories: category.subCategories.map((subCategory) =>
                  subCategory.id === editingSubCategoryId
                    ? {
                        ...subCategory,
                        name,
                        status: subCategoryStatus,
                      }
                    : subCategory,
                ),
              }
            : category,
        ),
      )
      setMessage('Sub-category updated successfully.')
    } else {
      const code = generateSubCategoryCode(parent, parent.subCategories)

      setCategories((current) =>
        current.map((category) =>
          category.id === subCategoryParentId
            ? {
                ...category,
                subCategories: [
                  ...category.subCategories,
                  {
                    id: `sub-${Date.now()}`,
                    code,
                    name,
                    status: subCategoryStatus,
                    products: 0,
                  },
                ],
              }
            : category,
        ),
      )

      setMessage(`Sub-category created successfully. Code: ${code}`)
    }

    resetSubCategoryForm()
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Products</span>
            <CaretRight size={12} />
            <span>Category</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Category
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage product categories and their sub-categories.
          </p>
        </div>

        {activeTab === 'list' && (
          <button
            type="button"
            onClick={startAddCategory}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <Plus size={17} weight="bold" />
            Add Category
          </button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 pt-2">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => {
                resetCategoryForm()
                resetSubCategoryForm()
                setActiveTab('list')
                setMessage('')
              }}
              className={`relative px-1 py-3 text-sm font-semibold ${
                activeTab === 'list'
                  ? 'text-slate-900'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Category List
              {activeTab === 'list' && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-slate-900" />
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                resetCategoryForm()
                resetSubCategoryForm()
                setActiveTab('add')
                setMessage('')
              }}
              className={`relative px-1 py-3 text-sm font-semibold ${
                activeTab === 'add'
                  ? 'text-slate-900'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Add Category
              {activeTab === 'add' && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-slate-900" />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'list' ? (
          <>
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative w-full sm:max-w-sm">
                <MagnifyingGlass
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search category or sub-category..."
                  className={inputClass + ' pl-9'}
                />
              </div>

              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
                className={inputClass + ' sm:w-36'}
              >
                <option>All</option>
                <option>Active</option>
                <option>Inactive</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[920px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className={tableHead}>Category</th>
                    <th className={tableHead}>Code</th>
                    <th className={`${tableHead} text-center`}>
                      Sub-Categories
                    </th>
                    <th className={`${tableHead} text-right`}>Products</th>
                    <th className={tableHead}>Status</th>
                    <th className={`${tableHead} text-right`}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category) => {
                    const expanded = expandedIds.includes(category.id)

                    return (
                      <Fragment key={category.id}>
                        <tr className="border-b border-slate-100 hover:bg-slate-50/50">
                          <td className="px-5 py-4">
                            <button
                              type="button"
                              onClick={() => toggleExpanded(category.id)}
                              className="flex items-center gap-2 text-left"
                            >
                              {expanded ? (
                                <CaretDown
                                  size={16}
                                  weight="bold"
                                  className="text-slate-500"
                                />
                              ) : (
                                <CaretRight
                                  size={16}
                                  weight="bold"
                                  className="text-slate-500"
                                />
                              )}
                              <span className="text-sm font-semibold text-slate-800">
                                {category.name}
                              </span>
                            </button>
                            {category.description && (
                              <div className="ml-6 mt-1 text-xs text-slate-400">
                                {category.description}
                              </div>
                            )}
                          </td>
                          <td className="px-5 py-4 text-sm font-medium text-slate-600">
                            {category.code}
                          </td>
                          <td className="px-5 py-4 text-center text-sm text-slate-700">
                            {category.subCategories.length}
                          </td>
                          <td className="px-5 py-4 text-right text-sm text-slate-700">
                            {category.subCategories.reduce(
                              (total, item) => total + item.products,
                              0,
                            )}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                category.status === 'Active'
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-slate-100 text-slate-500'
                              }`}
                            >
                              {category.status}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right">
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => startAddSubCategory(category.id)}
                                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                              >
                                <Plus size={13} weight="bold" />
                                Sub-Category
                              </button>
                              <button
                                type="button"
                                onClick={() => startEditCategory(category)}
                                className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                              >
                                Edit
                              </button>
                            </div>
                          </td>
                        </tr>

                        {expanded && (
                          <tr className="border-b border-slate-100 bg-slate-50/40">
                            <td colSpan={6} className="px-5 py-3">
                              <div className="ml-6 overflow-hidden rounded-lg border border-slate-200 bg-white">
                                <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                                  <div>
                                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                                      Sub-Categories
                                    </div>
                                    <div className="mt-0.5 text-sm font-semibold text-slate-800">
                                      {category.name}
                                    </div>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      startAddSubCategory(category.id)
                                    }
                                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                                  >
                                    <Plus size={14} weight="bold" />
                                    Add Sub-Category
                                  </button>
                                </div>

                                {category.subCategories.length > 0 ? (
                                  <div className="divide-y divide-slate-100">
                                    {category.subCategories.map(
                                      (subCategory) => (
                                        <div
                                          key={subCategory.id}
                                          className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between"
                                        >
                                          <div className="flex min-w-0 items-center gap-3">
                                            <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-slate-300" />
                                            <div className="min-w-0">
                                              <div className="text-sm font-medium text-slate-800">
                                                {subCategory.name}
                                              </div>
                                              <div className="mt-0.5 text-xs text-slate-400">
                                                {subCategory.code}
                                              </div>
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-4 sm:shrink-0">
                                            <div className="text-xs text-slate-500">
                                              {subCategory.products} products
                                            </div>
                                            <span
                                              className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                                subCategory.status === 'Active'
                                                  ? 'bg-emerald-50 text-emerald-700'
                                                  : 'bg-slate-100 text-slate-500'
                                              }`}
                                            >
                                              {subCategory.status}
                                            </span>
                                            <button
                                              type="button"
                                              onClick={() =>
                                                startEditSubCategory(
                                                  category.id,
                                                  subCategory,
                                                )
                                              }
                                              className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                                            >
                                              Edit
                                            </button>
                                          </div>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                ) : (
                                  <div className="px-4 py-8 text-center text-sm text-slate-400">
                                    No sub-categories yet.
                                  </div>
                                )}

                                {subCategoryParentId === category.id && (
                                  <form
                                    onSubmit={saveSubCategory}
                                    className="border-t border-slate-100 bg-slate-50/70 p-4"
                                  >
                                    <div className="mb-3 flex items-center justify-between">
                                      <div className="text-sm font-semibold text-slate-800">
                                        {editingSubCategoryId
                                          ? 'Edit Sub-Category'
                                          : 'Add Sub-Category'}
                                      </div>
                                      <div className="text-xs text-slate-400">
                                        Code will be generated automatically
                                      </div>
                                    </div>

                                    <div className="grid gap-3 md:grid-cols-[1fr_180px_140px_auto] md:items-end">
                                      <FormField label="Sub-Category Name *">
                                        <input
                                          value={subCategoryName}
                                          onChange={(event) =>
                                            setSubCategoryName(
                                              event.target.value,
                                            )
                                          }
                                          placeholder="e.g. Suits"
                                          className={inputClass}
                                          autoFocus
                                        />
                                      </FormField>

                                      <FormField label="Sub-Category Code">
                                        <input
                                          value={
                                            editingSubCategoryId
                                              ? category.subCategories.find(
                                                  (item) =>
                                                    item.id ===
                                                    editingSubCategoryId,
                                                )?.code ?? ''
                                              : generateSubCategoryCode(
                                                  category,
                                                  category.subCategories,
                                                )
                                          }
                                          readOnly
                                          className={
                                            inputClass +
                                            ' bg-slate-50 text-slate-500'
                                          }
                                        />
                                      </FormField>

                                      <FormField label="Status">
                                        <select
                                          value={subCategoryStatus}
                                          onChange={(event) =>
                                            setSubCategoryStatus(
                                              event.target
                                                .value as ProductSubCategory['status'],
                                            )
                                          }
                                          className={inputClass}
                                        >
                                          <option>Active</option>
                                          <option>Inactive</option>
                                        </select>
                                      </FormField>

                                      <div className="flex gap-2">
                                        <button
                                          type="button"
                                          onClick={resetSubCategoryForm}
                                          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                        >
                                          Cancel
                                        </button>
                                        <button
                                          type="submit"
                                          className="rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                                        >
                                          Save
                                        </button>
                                      </div>
                                    </div>
                                  </form>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </Fragment>
                    )
                  })}

                  {filteredCategories.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-5 py-14 text-center">
                        <div className="text-sm font-medium text-slate-700">
                          No categories found
                        </div>
                        <div className="mt-1 text-xs text-slate-400">
                          Try changing your search or status filter.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
              Showing {filteredCategories.length} of {categories.length}{' '}
              categories
            </div>
          </>
        ) : (
          <form onSubmit={saveCategory}>
            <div className="border-b border-slate-100 p-5">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  {editingCategoryId ? 'Edit Category' : 'Add Category'}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Category code is generated automatically and cannot be
                  manually changed.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <FormField label="Category Name *">
                  <input
                    value={categoryName}
                    onChange={(event) => setCategoryName(event.target.value)}
                    placeholder="e.g. Women Ethnic Wear"
                    className={inputClass}
                    autoFocus
                  />
                </FormField>

                <FormField label="Category Code">
                  <input
                    value={
                      editingCategoryId
                        ? categories.find(
                            (category) => category.id === editingCategoryId,
                          )?.code ?? ''
                        : categoryName.trim()
                          ? generateCategoryCode(categoryName, categories)
                          : 'Auto-generated'
                    }
                    readOnly
                    className={inputClass + ' bg-slate-50 text-slate-500'}
                  />
                </FormField>

                <FormField label="Description">
                  <textarea
                    value={categoryDescription}
                    onChange={(event) =>
                      setCategoryDescription(event.target.value)
                    }
                    placeholder="Optional description"
                    rows={3}
                    className={inputClass + ' min-h-[96px] resize-none'}
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    value={categoryStatus}
                    onChange={(event) =>
                      setCategoryStatus(
                        event.target.value as ProductCategory['status'],
                      )
                    }
                    className={inputClass}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </FormField>
              </div>
            </div>

            <div className="border-b border-slate-100 bg-slate-50/50 p-5">
              <div className="mb-4">
                <h3 className="text-sm font-semibold text-slate-900">
                  Sub-Categories
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  You can add sub-categories after creating the category.
                </p>
              </div>

              {!editingCategoryId ? (
                <div className="rounded-lg border border-dashed border-slate-200 bg-white px-5 py-8 text-center">
                  <div className="text-sm font-medium text-slate-700">
                    Save the category first
                  </div>
                  <div className="mt-1 text-xs text-slate-400">
                    Sub-categories can then be added from Category List.
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-slate-200 bg-white">
                  {categories
                    .find((category) => category.id === editingCategoryId)
                    ?.subCategories.map((subCategory) => (
                      <div
                        key={subCategory.id}
                        className="flex items-center justify-between border-b border-slate-100 px-4 py-3 last:border-0"
                      >
                        <div>
                          <div className="text-sm font-medium text-slate-800">
                            {subCategory.name}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {subCategory.code}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            startEditSubCategory(
                              editingCategoryId,
                              subCategory,
                            )
                          }
                          className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                        >
                          Edit
                        </button>
                      </div>
                    ))}
                  {categories.find(
                    (category) => category.id === editingCategoryId,
                  )?.subCategories.length === 0 && (
                    <div className="px-4 py-8 text-center text-sm text-slate-400">
                      No sub-categories yet.
                    </div>
                  )}
                </div>
              )}
            </div>

            {message && (
              <div className="border-b border-slate-100 px-5 py-3 text-xs font-medium text-slate-600">
                {message}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 bg-white px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  resetCategoryForm()
                  resetSubCategoryForm()
                  setActiveTab('list')
                  setMessage('')
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <CheckCircle size={17} weight="bold" />
                {editingCategoryId ? 'Update Category' : 'Save Category'}
              </button>
            </div>
          </form>
        )}

        {activeTab === 'list' && message && (
          <div className="border-t border-slate-100 px-5 py-3 text-xs font-medium text-slate-600">
            {message}
          </div>
        )}
      </div>
    </div>
  )
}


type ProductVariantAttribute = {
  id: string
  heading: string
  values: string[]
}

type ProductVariant = {
  id: string
  sequence: number
  sku: string
  attributes: Record<string, string>
  price: number
  stock: number
  status: 'Active' | 'Inactive'
}

type ProductMaster = {
  id: string
  productId: string
  coreSku: string
  name: string
  category: string
  subCategory: string
  supplier: string
  purchaseInvoice: string
  brand: string
  hsn: string
  gstRate: number
  purchaseRate: number
  mrp: number | null
  productLocation: 'Warehouse' | 'Retail Store'
  createDate: string
  status: 'Active' | 'Inactive'
  variantAttributes: ProductVariantAttribute[]
  variants: ProductVariant[]
}

const initialProducts: ProductMaster[] = [
  {
    id: 'product-001',
    productId: 'TZP09268421',
    coreSku: '522684',
    name: 'Premium Cotton Suit',
    category: 'Women Ethnic Wear',
    subCategory: 'Suits',
    supplier: 'Sweety Fashion Pvt. Ltd.',
    purchaseInvoice: '11882-R',
    brand: 'Tazeen',
    hsn: '6204',
    gstRate: 5,
    purchaseRate: 1250,
    mrp: 2499,
    productLocation: 'Warehouse',
    createDate: '20 Sep 2026',
    status: 'Active',
    variantAttributes: [
      {
        id: 'attr-001',
        heading: 'Size',
        values: ['M 38', 'L 40', 'XL 42', '2XL 44'],
      },
      {
        id: 'attr-002',
        heading: 'Colour',
        values: ['Maroon', 'Navy Blue'],
      },
      {
        id: 'attr-003',
        heading: 'Fabric',
        values: ['Cotton'],
      },
    ],
    variants: [
      {
        id: 'variant-001',
        sequence: 1,
        sku: '522684000001',
        attributes: {
          Size: 'M 38',
          Colour: 'Maroon',
          Fabric: 'Cotton',
        },
        price: 2499,
        stock: 0,
        status: 'Active',
      },
      {
        id: 'variant-002',
        sequence: 2,
        sku: '522684000002',
        attributes: {
          Size: 'L 40',
          Colour: 'Maroon',
          Fabric: 'Cotton',
        },
        price: 2499,
        stock: 0,
        status: 'Active',
      },
      {
        id: 'variant-003',
        sequence: 3,
        sku: '522684000003',
        attributes: {
          Size: 'XL 42',
          Colour: 'Maroon',
          Fabric: 'Cotton',
        },
        price: 2499,
        stock: 0,
        status: 'Active',
      },
      {
        id: 'variant-004',
        sequence: 4,
        sku: '522684000004',
        attributes: {
          Size: '2XL 44',
          Colour: 'Maroon',
          Fabric: 'Cotton',
        },
        price: 2499,
        stock: 0,
        status: 'Active',
      },
    ],
  },
  {
    id: 'product-002',
    productId: 'TZP09263176',
    coreSku: '526317',
    name: 'Printed Cotton Kurti',
    category: 'Women Ethnic Wear',
    subCategory: 'Kurtis',
    supplier: 'Sweety Fashion Pvt. Ltd.',
    purchaseInvoice: 'SF-2451',
    brand: 'Tazeen',
    hsn: '6204',
    gstRate: 5,
    purchaseRate: 680,
    mrp: 1399,
    productLocation: 'Warehouse',
    createDate: '20 Sep 2026',
    status: 'Active',
    variantAttributes: [
      {
        id: 'attr-004',
        heading: 'Size',
        values: ['M 38', 'L 40', 'XL 42', '2XL 44'],
      },
      {
        id: 'attr-005',
        heading: 'Colour',
        values: ['Pink', 'Sky Blue'],
      },
    ],
    variants: [],
  },
]

const productBrands = ['Tazeen', 'STINER', 'ZASMIN']
const productHsnOptions = ['6204', '6206', '6211', '6104']
const productGstRates = [0, 5, 12, 18, 28]

function generateProductId(products: ProductMaster[]) {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const year = String(now.getFullYear()).slice(-2)
  const prefix = `TZP${month}${year}`

  let productId = ''

  do {
    productId = `${prefix}${Math.floor(1000 + Math.random() * 9000)}`
  } while (products.some((product) => product.productId === productId))

  return productId
}

function productFormatMoney(value: number) {
  return `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}

function generateCoreSku(products: ProductMaster[]) {
  let coreSku = ''

  do {
    coreSku = String(Math.floor(100000 + Math.random() * 900000))
  } while (products.some((product) => product.coreSku === coreSku))

  return coreSku
}

function generateVariantCombinations(
  attributes: ProductVariantAttribute[],
): Record<string, string>[] {
  if (attributes.length === 0) {
    return []
  }

  const validAttributes = attributes.filter(
    (attribute) => attribute.values.length > 0,
  )

  if (validAttributes.length === 0) {
    return []
  }

  return validAttributes.reduce<Record<string, string>[]>(
    (combinations, attribute) => {
      if (combinations.length === 0) {
        return attribute.values.map((value) => ({
          [attribute.heading]: value,
        }))
      }

      return combinations.flatMap((combination) =>
        attribute.values.map((value) => ({
          ...combination,
          [attribute.heading]: value,
        })),
      )
    },
    [],
  )
}

function ProductPage() {
  const [products, setProducts] = useState<ProductMaster[]>(initialProducts)
  const [activeTab, setActiveTab] = useState<'list' | 'add'>('list')

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [subCategoryFilter, setSubCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')

  const [productName, setProductName] = useState('')
  const [productLocation, setProductLocation] = useState<'Warehouse' | 'Retail Store'>('Warehouse')
  const [category, setCategory] = useState('')
  const [subCategory, setSubCategory] = useState('')
  const [supplier, setSupplier] = useState('')
  const [purchaseInvoice, setPurchaseInvoice] = useState('')
  const [brand, setBrand] = useState('')
  const [hsn, setHsn] = useState('')
  const [gstRate, setGstRate] = useState('5')
  const [purchaseRate, setPurchaseRate] = useState('')
  const [mrp, setMrp] = useState('')

  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    null,
  )

  const [attributeHeading, setAttributeHeading] = useState('')
  const [attributeValue, setAttributeValue] = useState('')
  const [showAttributeForm, setShowAttributeForm] = useState(false)
  const [editingAttributeId, setEditingAttributeId] = useState<string | null>(
    null,
  )

  const [message, setMessage] = useState('')

  const categoryOptions = Array.from(
    new Set([
      ...initialProductCategories.map((item) => item.name),
      ...products.map((item) => item.category),
    ]),
  )

  const selectedCategory = initialProductCategories.find(
    (item) => item.name === category,
  )

  const supplierOptions = Array.from(
    new Set([
      ...initialSuppliers.map((item) => item.name),
      ...products.map((item) => item.supplier),
    ]),
  )

  const purchaseInvoiceOptions = Array.from(
    new Set([
      ...initialPurchaseInvoices.map((item) => item.invoiceNo),
      ...products.map((item) => item.purchaseInvoice),
    ]),
  )

  const filteredProducts = products.filter((product) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      product.name.toLowerCase().includes(query) ||
      product.productId.toLowerCase().includes(query) ||
      product.category.toLowerCase().includes(query) ||
      product.subCategory.toLowerCase().includes(query) ||
      product.supplier.toLowerCase().includes(query)

    const matchesCategory =
      categoryFilter === 'All' || product.category === categoryFilter

    const matchesSubCategory =
      subCategoryFilter === 'All' ||
      product.subCategory === subCategoryFilter

    const matchesStatus =
      statusFilter === 'All' || product.status === statusFilter

    return (
      matchesSearch &&
      matchesCategory &&
      matchesSubCategory &&
      matchesStatus
    )
  })

  const resetProductForm = () => {
    setProductName('')
    setProductLocation('Warehouse')
    setCategory('')
    setSubCategory('')
    setSupplier('')
    setPurchaseInvoice('')
    setBrand('')
    setHsn('')
    setGstRate('5')
    setPurchaseRate('')
    setMrp('')
    setEditingProductId(null)
  }

  const startAddProduct = () => {
    resetProductForm()
    setSelectedProductId(null)
    setMessage('')
    setActiveTab('add')
  }

  const startEditProduct = (product: ProductMaster) => {
    setProductName(product.name)
    setProductLocation(product.productLocation)
    setCategory(product.category)
    setSubCategory(product.subCategory)
    setSupplier(product.supplier)
    setPurchaseInvoice(product.purchaseInvoice)
    setBrand(product.brand)
    setHsn(product.hsn)
    setGstRate(String(product.gstRate))
    setPurchaseRate(String(product.purchaseRate))
    setMrp(product.mrp != null ? String(product.mrp) : '')
    setEditingProductId(product.id)
    setSelectedProductId(product.id)
    setMessage('')
    setActiveTab('add')
  }

  const saveProduct = (event: React.FormEvent) => {
    event.preventDefault()

    const name = productName.trim()

    if (!name) {
      setMessage('Product name is required.')
      return
    }

    if (!category) {
      setMessage('Category is required.')
      return
    }

    if (!subCategory) {
      setMessage('Sub-category is required.')
      return
    }

    if (!supplier) {
      setMessage('Supplier is required.')
      return
    }

    if (!purchaseInvoice) {
      setMessage('Purchase invoice is required.')
      return
    }

    if (!purchaseRate || Number(purchaseRate) < 0) {
      setMessage('Enter a valid purchase rate.')
      return
    }

    if (editingProductId) {
      setProducts((current) =>
        current.map((product) =>
          product.id === editingProductId
            ? {
                ...product,
                name,
                productLocation,
                category,
                subCategory,
                supplier,
                purchaseInvoice,
                brand,
                hsn,
                gstRate: Number(gstRate),
                purchaseRate: Number(purchaseRate),
              }
            : product,
        ),
      )

      setSelectedProductId(editingProductId)
      setMessage('Product updated successfully.')
    } else {
      const productId = generateProductId(products)

      const newProduct: ProductMaster = {
        id: `product-${Date.now()}`,
        productId,
        name,
        productLocation,
        category,
        subCategory,
        supplier,
        purchaseInvoice,
        brand,
        hsn,
        gstRate: Number(gstRate),
        purchaseRate: Number(purchaseRate),
        mrp: mrp.trim() ? Number(mrp) : null,
        createDate: new Date().toLocaleDateString('en-IN', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        status: 'Active',
        variantAttributes: [],
        variants: [],
        coreSku: generateCoreSku(products),
      }

      setProducts((current) => [...current, newProduct])
      setSelectedProductId(newProduct.id)
      setMessage(`Product created successfully. ID: ${productId}`)
    }

    setActiveTab('list')
    resetProductForm()
  }

  const selectedProduct = products.find(
    (product) => product.id === selectedProductId,
  )



  const saveProductPriceChart = () => {
    if (!selectedProduct) {
      setMessage('Select a product first.')
      return
    }

    const value = Number(mrp)

    if (!Number.isFinite(value) || value <= 0) {
      setMessage('Enter a valid MRP greater than 0.')
      return
    }

    setProducts((currentProducts) =>
      currentProducts.map((product) =>
        product.id === selectedProduct.id
          ? { ...product, mrp: value }
          : product,
      ),
    )

    setMessage(`Price Chart saved. MRP set to ${productFormatMoney(value)}.`)
  }

  const createProductVariants = () => {
    if (!selectedProduct) {
      setMessage('Select a product first.')
      return
    }

    if (!selectedProduct.mrp || selectedProduct.mrp <= 0) {
      setMessage('Create and save the Price Chart with a valid MRP before creating variants.')
      return
    }

    if (selectedProduct.variantAttributes.length === 0) {
      setMessage('Create at least one variant attribute first.')
      return
    }

    const combinations = generateVariantCombinations(
      selectedProduct.variantAttributes,
    )

    if (combinations.length === 0) {
      setMessage('Add at least one value to a variant attribute.')
      return
    }

    const existingKeys = new Set(
      selectedProduct.variants.map((variant) =>
        JSON.stringify(variant.attributes),
      ),
    )

    const nextSequence =
      selectedProduct.variants.reduce(
        (maximum, variant) => Math.max(maximum, variant.sequence),
        0,
      ) + 1

    const newVariants: ProductVariant[] = []

    combinations.forEach((attributes, index) => {
      const key = JSON.stringify(attributes)

      if (existingKeys.has(key)) {
        return
      }

      const sequence = nextSequence + index

      newVariants.push({
        id: `variant-${Date.now()}-${index}`,
        sequence,
        sku: `${selectedProduct.coreSku}${String(sequence).padStart(6, '0')}`,
        attributes,
        price: selectedProduct.mrp ?? selectedProduct.purchaseRate,
        stock: 0,
        status: 'Active',
      })
    })

    if (newVariants.length === 0) {
      setMessage('All available variant combinations already exist.')
      return
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              variants: [...product.variants, ...newVariants],
            }
          : product,
      ),
    )

    setMessage(
      `${newVariants.length} variant${newVariants.length === 1 ? '' : 's'} created successfully.`,
    )
  }

  const printProductBarcode = (product: ProductMaster) => {
    const printWindow = window.open(
      '',
      '_blank',
      'width=600,height=500',
    )

    if (!printWindow) {
      setMessage('Please allow pop-ups to print the barcode.')
      return
    }

    printWindow.document.write(`
      <!doctype html>
      <html>
        <head>
          <title>Print Barcode - ${product.name}</title>
          <style>
            * {
              box-sizing: border-box;
            }

            body {
              margin: 0;
              padding: 30px;
              font-family: Arial, sans-serif;
              background: #ffffff;
              color: #111827;
            }

            .label {
              width: 320px;
              margin: 0 auto;
              border: 1px solid #d1d5db;
              padding: 20px;
              text-align: center;
            }

            .brand {
              font-size: 11px;
              letter-spacing: 2px;
              font-weight: 700;
              color: #64748b;
            }

            .product {
              margin-top: 10px;
              font-size: 18px;
              font-weight: 700;
            }

            .product-id {
              margin-top: 6px;
              font-size: 12px;
              color: #64748b;
            }

            .barcode-placeholder {
              margin: 22px 0 10px;
              padding: 18px 8px;
              border-top: 2px solid #111827;
              border-bottom: 2px solid #111827;
              font-family: monospace;
              font-size: 22px;
              letter-spacing: 2px;
              font-weight: 700;
            }

            .note {
              font-size: 10px;
              color: #94a3b8;
            }

            @media print {
              body {
                padding: 0;
              }

              .label {
                border: none;
              }
            }
          </style>
        </head>

        <body>
          <div class="label">
            <div class="brand">TAZEEN</div>
            <div class="product">${product.name}</div>
            <div class="product-id">
              Product ID: ${product.productId}
            </div>

            <div class="barcode-placeholder">
              ${product.productId}
            </div>

            <div class="note">
              Variant CODE128 barcode will be generated after variant SKU creation.
            </div>
          </div>

          <script>
            window.onload = function () {
              window.print();
            };
          </script>
        </body>
      </html>
    `)

    printWindow.document.close()
  }

  const createAttribute = () => {
    if (!selectedProduct) {
      setMessage('Select a product first.')
      return
    }

    const heading = attributeHeading.trim()

    if (!heading) {
      setMessage('Variant attribute heading is required.')
      return
    }

    const duplicate = selectedProduct.variantAttributes.some(
      (attribute) =>
        attribute.id !== editingAttributeId &&
        attribute.heading.toLowerCase() === heading.toLowerCase(),
    )

    if (duplicate) {
      setMessage('This variant attribute already exists.')
      return
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              variantAttributes: editingAttributeId
                ? product.variantAttributes.map((attribute) =>
                    attribute.id === editingAttributeId
                      ? { ...attribute, heading }
                      : attribute,
                  )
                : [
                    ...product.variantAttributes,
                    {
                      id: `attr-${Date.now()}`,
                      heading,
                      values: [],
                    },
                  ],
            }
          : product,
      ),
    )

    setAttributeHeading('')
    setEditingAttributeId(null)
    setShowAttributeForm(false)
    setMessage(
      editingAttributeId
        ? 'Variant attribute updated.'
        : 'Variant attribute created.',
    )
  }

  const addAttributeValue = (attributeId: string) => {
    if (!selectedProduct) return

    const value = attributeValue.trim()

    if (!value) {
      setMessage('Variant value is required.')
      return
    }

    const attribute = selectedProduct.variantAttributes.find(
      (item) => item.id === attributeId,
    )

    if (!attribute) return

    if (
      attribute.values.some(
        (existing) => existing.toLowerCase() === value.toLowerCase(),
      )
    ) {
      setMessage('This value already exists.')
      return
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === selectedProduct.id
          ? {
              ...product,
              variantAttributes: product.variantAttributes.map((item) =>
                item.id === attributeId
                  ? {
                      ...item,
                      values: [...item.values, value],
                    }
                  : item,
              ),
            }
          : product,
      ),
    )

    setAttributeValue('')
    setMessage(`Value "${value}" added.`)
  }

  const startEditAttribute = (attribute: ProductVariantAttribute) => {
    setAttributeHeading(attribute.heading)
    setEditingAttributeId(attribute.id)
    setShowAttributeForm(true)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Products</span>
            <CaretRight size={12} />
            <span>Product Master</span>
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Products
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage products, product information and variant attributes.
          </p>
        </div>

        {activeTab === 'list' && (
          <button
            type="button"
            onClick={startAddProduct}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
          >
            <Plus size={17} weight="bold" />
            Add Product
          </button>
        )}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 pt-2">
          <div className="flex gap-6">
            <button
              type="button"
              onClick={() => {
                setActiveTab('list')
                setMessage('')
                setSelectedProductId(null)
              }}
              className={`relative px-1 py-3 text-sm font-semibold ${
                activeTab === 'list'
                  ? 'text-slate-900'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Product List
              {activeTab === 'list' && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-slate-900" />
              )}
            </button>

            <button
              type="button"
              onClick={startAddProduct}
              className={`relative px-1 py-3 text-sm font-semibold ${
                activeTab === 'add'
                  ? 'text-slate-900'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Add Product
              {activeTab === 'add' && (
                <span className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-slate-900" />
              )}
            </button>
          </div>
        </div>

        {activeTab === 'list' ? (
          <>
            <div className="flex flex-col gap-3 border-b border-slate-100 p-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="relative w-full xl:max-w-sm">
                <MagnifyingGlass
                  size={17}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search product, ID, category..."
                  className={inputClass + ' pl-9'}
                />
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <select
                  value={categoryFilter}
                  onChange={(event) => {
                    setCategoryFilter(event.target.value)
                    setSubCategoryFilter('All')
                  }}
                  className={inputClass}
                >
                  <option>All</option>
                  {categoryOptions.map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                <select
                  value={subCategoryFilter}
                  onChange={(event) =>
                    setSubCategoryFilter(event.target.value)
                  }
                  className={inputClass}
                >
                  <option>All</option>
                  {Array.from(
                    new Set(
                      products
                        .filter(
                          (product) =>
                            categoryFilter === 'All' ||
                            product.category === categoryFilter,
                        )
                        .map((product) => product.subCategory),
                    ),
                  ).map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>

                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className={inputClass}
                >
                  <option>All</option>
                  <option>Active</option>
                  <option>Inactive</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[1120px] text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className={tableHead}>Product Name</th>
                    <th className={tableHead}>Category</th>
                    <th className={tableHead}>Supplier</th>
                    <th className={`${tableHead} text-center`}>
                      In Stock
                    </th>
                    <th className={tableHead}>Product SKU</th>
                    <th className={`${tableHead} text-right`}>MRP</th>
                    <th className={`${tableHead} text-right`}>Action</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.map((product) => {
                    const totalStock = product.variants.reduce(
                      (total, variant) => total + variant.stock,
                      0,
                    )

                    return (
                      <tr
                        key={product.id}
                        className="border-b border-slate-100 hover:bg-slate-50/50"
                      >
                        <td className="px-5 py-4">
                          <div className="text-sm font-semibold text-slate-800">
                            {product.name}
                          </div>

                          {product.brand && (
                            <div className="mt-0.5 text-xs text-slate-400">
                              {product.brand}
                            </div>
                          )}
                        </td>

                        <td className="px-5 py-4">
                          <div className="text-sm text-slate-600">
                            {product.category}
                          </div>

                          <div className="mt-0.5 text-xs text-slate-400">
                            {product.subCategory}
                          </div>
                        </td>

                        <td className="px-5 py-4 text-sm text-slate-600">
                          {product.supplier}
                        </td>

                        <td className="px-5 py-4 text-center">
                          <span
                            className={`text-sm font-semibold ${
                              totalStock > 0
                                ? 'text-slate-800'
                                : 'text-slate-400'
                            }`}
                          >
                            {totalStock}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <span className="font-mono text-sm font-semibold text-slate-700">
                            {product.coreSku}
                          </span>
                        </td>

                        <td className="px-5 py-4 text-right">
                          <span className="text-sm font-semibold text-slate-800">
                            {product.mrp != null
                              ? productFormatMoney(product.mrp)
                              : '—'}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              title="View Product"
                              onClick={() => {
                                setSelectedProductId(product.id)
                                setMessage('')
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            >
                              <Eye size={16} />
                            </button>

                            <button
                              type="button"
                              title="Update Product"
                              onClick={() => startEditProduct(product)}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-500 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            >
                              <PencilSimple size={16} />
                            </button>

                            <button
                              type="button"
                              title="Delete Product"
                              onClick={() => {
                                const confirmed = window.confirm(
                                  `Delete product "${product.name}"?`,
                                )

                                if (!confirmed) return

                                setProducts((current) =>
                                  current.filter(
                                    (item) => item.id !== product.id,
                                  ),
                                )

                                if (selectedProductId === product.id) {
                                  setSelectedProductId(null)
                                }

                                setMessage(
                                  'Product deleted successfully.',
                                )
                              }}
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 bg-white text-red-500 transition hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash size={16} />
                            </button>

                            <button
                              type="button"
                              title="Print Barcode"
                              onClick={() => printProductBarcode(product)}
                              className="ml-1 inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
                            >
                              <Barcode size={16} />
                              <span className="hidden xl:inline">
                                Barcode
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}

                  {filteredProducts.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-14 text-center">
                        <div className="text-sm font-medium text-slate-700">
                          No products found
                        </div>

                        <div className="mt-1 text-xs text-slate-400">
                          Try changing your search or filters.
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
              Showing {filteredProducts.length} of {products.length} products
            </div>

            {selectedProduct && (
              <div className="border-t border-slate-100 bg-slate-50/50 p-5">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Product Detail
                    </div>
                    <h2 className="mt-1 text-lg font-semibold text-slate-900">
                      {selectedProduct.name}
                    </h2>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {selectedProduct.productId}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedProductId(null)
                      setShowAttributeForm(false)
                      setEditingAttributeId(null)
                    }}
                    className="self-start rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                  >
                    Close
                  </button>
                </div>

                <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
                  <section className="rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-100 px-4 py-3">
                      <div className="text-sm font-semibold text-slate-900">
                        Basic Information
                      </div>
                    </div>

                    <div className="grid gap-x-5 gap-y-5 p-4 sm:grid-cols-2 xl:grid-cols-3">
                      <div>
                        <div className="text-xs text-slate-400">Product Name</div>
                        <div className="mt-1 text-sm font-semibold text-slate-800">
                          {selectedProduct.name}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">Product ID</div>
                        <div className="mt-1 font-mono text-sm font-medium text-slate-700">
                          {selectedProduct.productId}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">Category</div>
                        <div className="mt-1 text-sm font-medium text-slate-700">
                          {selectedProduct.category}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">Sub-Category</div>
                        <div className="mt-1 text-sm font-medium text-slate-700">
                          {selectedProduct.subCategory}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">Supplier</div>
                        <div className="mt-1 text-sm font-medium text-slate-700">
                          {selectedProduct.supplier}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">Purchase Invoice</div>
                        <div className="mt-1 text-sm font-medium text-slate-700">
                          {selectedProduct.purchaseInvoice}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">Brand</div>
                        <div className="mt-1 text-sm font-medium text-slate-700">
                          {selectedProduct.brand || '—'}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">HSN</div>
                        <div className="mt-1 font-mono text-sm font-medium text-slate-700">
                          {selectedProduct.hsn || '—'}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">GST Rate</div>
                        <div className="mt-1 text-sm font-medium text-slate-700">
                          {selectedProduct.gstRate}%
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">Purchase Rate</div>
                        <div className="mt-1 text-sm font-semibold text-slate-900">
                          {productFormatMoney(selectedProduct.purchaseRate)}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">Create Date</div>
                        <div className="mt-1 text-sm font-medium text-slate-700">
                          {selectedProduct.createDate}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">Product Location</div>
                        <div className="mt-1 text-sm font-medium text-slate-700">
                          {selectedProduct.productLocation}
                        </div>
                      </div>

                      <div>
                        <div className="text-xs text-slate-400">Status</div>
                        <div className="mt-1">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                              selectedProduct.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-slate-100 text-slate-500'
                            }`}
                          >
                            {selectedProduct.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section className="rounded-xl border border-slate-200 bg-white">
                    <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                      <div>
                        <div className="text-sm font-semibold text-slate-900">
                          Variant Attributes
                        </div>
                        <div className="mt-0.5 text-xs text-slate-400">
                          Create headings first, then add values.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAttributeHeading('')
                          setAttributeValue('')
                          setEditingAttributeId(null)
                          setShowAttributeForm(true)
                        }}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                      >
                        <Plus size={14} weight="bold" />
                        Create Attribute
                      </button>
                    </div>

                    <div className="p-4">
                      {showAttributeForm && (
                        <div className="mb-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
                          <div className="mb-3 text-sm font-semibold text-slate-800">
                            {editingAttributeId
                              ? 'Edit Attribute Heading'
                              : 'Create Attribute Heading'}
                          </div>

                          <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                            <div className="flex-1">
                              <FormField label="Heading *">
                                <input
                                  value={attributeHeading}
                                  onChange={(event) =>
                                    setAttributeHeading(event.target.value)
                                  }
                                  placeholder="e.g. Size, Colour, Fabric, Sleeve"
                                  className={inputClass}
                                  autoFocus
                                />
                              </FormField>
                            </div>

                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAttributeForm(false)
                                  setEditingAttributeId(null)
                                  setAttributeHeading('')
                                }}
                                className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-white"
                              >
                                Cancel
                              </button>

                              <button
                                type="button"
                                onClick={createAttribute}
                                className="rounded-lg bg-slate-900 px-3 py-2.5 text-xs font-semibold text-white hover:bg-slate-800"
                              >
                                {editingAttributeId
                                  ? 'Update Heading'
                                  : 'Create Heading'}
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {selectedProduct.variantAttributes.length === 0 ? (
                        <div className="rounded-lg border border-dashed border-slate-200 px-5 py-10 text-center">
                          <div className="text-sm font-medium text-slate-700">
                            No variant attributes yet
                          </div>
                          <div className="mt-1 text-xs text-slate-400">
                            Create a heading such as Size, Colour or Fabric.
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {selectedProduct.variantAttributes.map(
                            (attribute) => (
                              <div
                                key={attribute.id}
                                className="rounded-lg border border-slate-200"
                              >
                                <div className="flex flex-col gap-2 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                                  <div>
                                    <div className="text-sm font-semibold text-slate-800">
                                      {attribute.heading}
                                    </div>
                                    <div className="mt-0.5 text-xs text-slate-400">
                                      {attribute.values.length} value
                                      {attribute.values.length === 1 ? '' : 's'}
                                    </div>
                                  </div>

                                  <div className="flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        startEditAttribute(attribute)
                                      }
                                      className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                                    >
                                      Edit
                                    </button>
                                  </div>
                                </div>

                                <div className="p-4">
                                  <div className="flex flex-wrap gap-2">
                                    {attribute.values.map((value) => (
                                      <span
                                        key={value}
                                        className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700"
                                      >
                                        {value}
                                      </span>
                                    ))}
                                  </div>

                                  <div className="mt-3 flex flex-col gap-2 sm:flex-row">
                                    <input
                                      value={
                                        selectedProduct.id === selectedProductId
                                          ? attributeHeading ===
                                            `__value__${attribute.id}`
                                            ? attributeValue
                                            : ''
                                          : ''
                                      }
                                      onChange={(event) => {
                                        setAttributeHeading(
                                          `__value__${attribute.id}`,
                                        )
                                        setAttributeValue(event.target.value)
                                      }}
                                      onFocus={() =>
                                        setAttributeHeading(
                                          `__value__${attribute.id}`,
                                        )
                                      }
                                      placeholder={`Add ${attribute.heading} value...`}
                                      className={inputClass + ' sm:max-w-xs'}
                                    />

                                    <button
                                      type="button"
                                      onClick={() => {
                                        addAttributeValue(attribute.id)
                                        setAttributeHeading(
                                          `__value__${attribute.id}`,
                                        )
                                      }}
                                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                    >
                                      <Plus size={14} weight="bold" />
                                      Add Value
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ),
                          )}
                        </div>
                      )}
                    </div>
                  </section>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white">
                  <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <div className="text-sm font-semibold text-slate-900">
                        Product Variants
                      </div>
                      <div className="mt-0.5 text-xs text-slate-400">
                        {selectedProduct.variants.length} variant
                        {selectedProduct.variants.length === 1 ? '' : 's'} ·
                        Core SKU {selectedProduct.coreSku}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={createProductVariants}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      <Plus size={14} weight="bold" />
                      Create Variants
                    </button>
                  </div>

                  {selectedProduct.variants.length === 0 ? (
                    <div className="px-5 py-10 text-center">
                      <div className="text-sm font-medium text-slate-700">
                        No variants created yet
                      </div>
                      <div className="mt-1 text-xs text-slate-400">
                        Create your attributes and values first, then click
                        Create Variants.
                      </div>
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[980px] text-left">
                        <thead>
                          <tr className="border-b border-slate-100 bg-slate-50/70">
                            <th className={tableHead}>Variant</th>
                            <th className={tableHead}>SKU</th>
                            <th className={`${tableHead} text-right`}>
                              MRP
                            </th>
                            <th className={`${tableHead} text-center`}>
                              Stock
                            </th>
                            <th className={tableHead}>Status</th>
                            <th className={`${tableHead} text-right`}>
                              Action
                            </th>
                          </tr>
                        </thead>

                        <tbody>
                          {selectedProduct.variants.map((variant) => (
                            <tr
                              key={variant.id}
                              className="border-b border-slate-100 last:border-0"
                            >
                              <td className="px-4 py-3">
                                <div className="flex flex-wrap gap-1.5">
                                  {Object.entries(variant.attributes).map(
                                    ([heading, value]) => (
                                      <span
                                        key={heading}
                                        className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700"
                                      >
                                        <span className="font-semibold">
                                          {heading}:
                                        </span>{' '}
                                        {value}
                                      </span>
                                    ),
                                  )}
                                </div>
                              </td>

                              <td className="px-4 py-3">
                                <span className="font-mono text-sm font-semibold text-slate-700">
                                  {variant.sku}
                                </span>
                              </td>

                              <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                                {productFormatMoney(variant.price)}
                              </td>

                              <td className="px-4 py-3 text-center text-sm text-slate-600">
                                {variant.stock}
                              </td>

                              <td className="px-4 py-3">
                                <span
                                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                                    variant.status === 'Active'
                                      ? 'bg-emerald-50 text-emerald-700'
                                      : 'bg-slate-100 text-slate-500'
                                  }`}
                                >
                                  {variant.status}
                                </span>
                              </td>

                              <td className="px-4 py-3">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    type="button"
                                    title="View Variant"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50"
                                  >
                                    <Eye size={15} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Delete Variant"
                                    onClick={() => {
                                      setProducts((current) =>
                                        current.map((product) =>
                                          product.id === selectedProduct.id
                                            ? {
                                                ...product,
                                                variants:
                                                  product.variants.filter(
                                                    (item) =>
                                                      item.id !== variant.id,
                                                  ),
                                              }
                                            : product,
                                        ),
                                      )

                                      setMessage(
                                        `Variant ${variant.sku} deleted.`,
                                      )
                                    }}
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-red-100 text-red-500 hover:bg-red-50"
                                  >
                                    <Trash size={15} />
                                  </button>

                                  <button
                                    type="button"
                                    title="Print Barcode"
                                    onClick={() =>
                                      setMessage(
                                        `Barcode printing will use CODE128 for SKU ${variant.sku}.`,
                                      )
                                    }
                                    className="inline-flex h-8 items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                                  >
                                    <Barcode size={15} />
                                    <span>Print</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="border-t border-slate-100 bg-slate-50/50 px-4 py-3">
                    <div className="flex flex-col gap-1 text-xs text-slate-400 sm:flex-row sm:items-center sm:justify-between">
                      <span>
                        12-digit SKU = 6-digit Product Core + 6-digit Variant
                        Sequence
                      </span>
                      <span className="font-mono text-slate-500">
                        {selectedProduct.coreSku} + 000001
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-slate-200 bg-white">
                  <div className="border-b border-slate-100 px-4 py-3">
                    <div className="text-sm font-semibold text-slate-900">
                      Price Chart
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      Set the product MRP before creating variants.
                    </div>
                  </div>

                  <div className="grid gap-4 p-4 md:grid-cols-2">
                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        Purchase Rate
                      </label>
                      <div className="flex h-10 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-700">
                        {productFormatMoney(selectedProduct.purchaseRate)}
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        Procurement cost from Product Basic Information.
                      </p>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                        MRP *
                      </label>
                      <div className="flex h-10 overflow-hidden rounded-lg border border-slate-200 bg-white focus-within:border-slate-400">
                        <span className="flex items-center border-r border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-500">
                          ₹
                        </span>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={mrp}
                          onChange={(event) => setMrp(event.target.value)}
                          placeholder="Enter MRP"
                          className="min-w-0 flex-1 px-3 text-sm text-slate-800 outline-none"
                        />
                      </div>
                      <p className="mt-1.5 text-[11px] text-slate-400">
                        MRP becomes the default price for newly created variants.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col gap-3 border-t border-slate-100 bg-slate-50/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="text-xs text-slate-500">
                      Current MRP:{' '}
                      <span className="font-semibold text-slate-700">
                        {selectedProduct.mrp != null
                          ? productFormatMoney(selectedProduct.mrp)
                          : 'Not set'}
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={saveProductPriceChart}
                      className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      <Plus size={14} weight="bold" />
                      Save Price Chart
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={saveProduct}>
            <div className="border-b border-slate-100 p-5">
              <div className="mb-5">
                <h2 className="text-sm font-semibold text-slate-900">
                  {editingProductId ? 'Edit Product' : 'Basic Product Information'}
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Product ID and create date are generated automatically.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                <FormField label="Product Name *">
                  <input
                    value={productName}
                    onChange={(event) => setProductName(event.target.value)}
                    placeholder="e.g. Premium Cotton Suit"
                    className={inputClass}
                    autoFocus
                  />
                </FormField>

                <FormField label="Category *">
                  <select
                    value={category}
                    onChange={(event) => {
                      setCategory(event.target.value)
                      setSubCategory('')
                    }}
                    className={inputClass}
                  >
                    <option value="">Select category</option>
                    {categoryOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Sub-Category *">
                  <select
                    value={subCategory}
                    onChange={(event) => setSubCategory(event.target.value)}
                    className={inputClass}
                    disabled={!category}
                  >
                    <option value="">
                      {category
                        ? 'Select sub-category'
                        : 'Select category first'}
                    </option>
                    {(selectedCategory?.subCategories ?? []).map((item) => (
                      <option key={item.id}>{item.name}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Product ID">
                  <input
                    value={
                      editingProductId
                        ? products.find(
                            (product) => product.id === editingProductId,
                          )?.productId ?? ''
                        : productName.trim()
                          ? generateProductId(products)
                          : 'Auto-generated'
                    }
                    readOnly
                    className={inputClass + ' bg-slate-50 font-medium text-slate-500'}
                  />
                </FormField>

                <FormField label="Supplier *">
                  <select
                    value={supplier}
                    onChange={(event) => setSupplier(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select supplier</option>
                    {supplierOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Purchase Invoice *">
                  <select
                    value={purchaseInvoice}
                    onChange={(event) =>
                      setPurchaseInvoice(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select purchase invoice</option>
                    {purchaseInvoiceOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Brand">
                  <select
                    value={brand}
                    onChange={(event) => setBrand(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select brand</option>
                    {productBrands.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="HSN">
                  <select
                    value={hsn}
                    onChange={(event) => setHsn(event.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select HSN</option>
                    {productHsnOptions.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="GST Rate *">
                  <select
                    value={gstRate}
                    onChange={(event) => setGstRate(event.target.value)}
                    className={inputClass}
                  >
                    {productGstRates.map((rate) => (
                      <option key={rate} value={rate}>
                        {rate}%
                      </option>
                    ))}
                  </select>
                </FormField>

                <FormField label="Purchase Rate *">
                  <div className="relative">
                    <CurrencyInr
                      size={16}
                      className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      value={purchaseRate}
                      onChange={(event) =>
                        setPurchaseRate(event.target.value)
                      }
                      placeholder="0.00"
                      className={inputClass + ' pl-8'}
                    />
                  </div>
                </FormField>

                <FormField label="Product Location *">
                  <select
                    value={productLocation}
                    onChange={(event) =>
                      setProductLocation(
                        event.target.value as 'Warehouse' | 'Retail Store',
                      )
                    }
                    className={inputClass}
                  >
                    <option value="Warehouse">Warehouse</option>
                    <option value="Retail Store">Retail Store</option>
                  </select>
                </FormField>

                <FormField label="Create Date">
                  <input
                    value={new Date().toLocaleDateString('en-IN', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric',
                    })}
                    readOnly
                    className={inputClass + ' bg-slate-50 text-slate-500'}
                  />
                </FormField>
              </div>
            </div>

            {message && (
              <div className="border-b border-slate-100 px-5 py-3 text-xs font-medium text-slate-600">
                {message}
              </div>
            )}

            <div className="flex flex-col-reverse gap-2 bg-white px-5 py-4 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() => {
                  resetProductForm()
                  setActiveTab('list')
                  setMessage('')
                }}
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
              >
                <CheckCircle size={17} weight="bold" />
                {editingProductId ? 'Update Product' : 'Create Product'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}


type Customer = {
  phone: string
  customerId: string
  name: string
  email: string
  address: string
  whatsapp: 'Active' | 'Not Active'
  status: 'Active' | 'Inactive'
  totalPurchases: number
  walletBalance: number
  points: number
  giftCardValue: number
  couponCount: number
}

type CustomerPurchase = {
  invoiceNo: string
  value: number
  date: string
}

type CustomerReturnExchange = {
  invoiceNo: string
  type: 'Return' | 'Exchange'
  value: number
  date: string
}

type CustomerWalletEntry = {
  date: string
  type: string
  reference: string
  amount: number
  balance: number
}

type CustomerPointEntry = {
  date: string
  type: string
  reference: string
  points: number
  balance: number
}

type CustomerGiftCard = {
  cardNo: string
  issueDate: string
  amount: number
  status: 'Active' | 'Used' | 'Expired'
  usedDate: string
}

type CustomerCoupon = {
  code: string
  issueDate: string
  value: number
  status: 'Active' | 'Claimed' | 'Expired'
  claimedDate: string
  invoiceNo: string
}

const initialCustomers: Customer[] = [
  {
    phone: '9876543210',
    customerId: 'TZC000001',
    name: 'Riya Begum',
    email: 'riya@example.com',
    address: 'Lalgola, Murshidabad, West Bengal',
    whatsapp: 'Active',
    status: 'Active',
    totalPurchases: 18450,
    walletBalance: 750,
    points: 184,
    giftCardValue: 1000,
    couponCount: 2,
  },
  {
    phone: '9832123456',
    customerId: 'TZC000002',
    name: 'Sabiha Khatun',
    email: '',
    address: 'Jangipur, Murshidabad, West Bengal',
    whatsapp: 'Active',
    status: 'Active',
    totalPurchases: 12380,
    walletBalance: 250,
    points: 123,
    giftCardValue: 500,
    couponCount: 1,
  },
  {
    phone: '9007123456',
    customerId: 'TZC000003',
    name: 'Mousumi Das',
    email: 'mousumi@example.com',
    address: 'Berhampore, Murshidabad, West Bengal',
    whatsapp: 'Not Active',
    status: 'Inactive',
    totalPurchases: 6480,
    walletBalance: 0,
    points: 64,
    giftCardValue: 0,
    couponCount: 0,
  },
]

const customerPurchases: Record<string, CustomerPurchase[]> = {
  '9876543210': [
    { invoiceNo: 'INV-10025', value: 2499, date: '18 Sep 2026' },
    { invoiceNo: 'INV-10012', value: 1899, date: '12 Sep 2026' },
    { invoiceNo: 'INV-09984', value: 3250, date: '05 Sep 2026' },
  ],
  '9832123456': [
    { invoiceNo: 'INV-10018', value: 2399, date: '15 Sep 2026' },
    { invoiceNo: 'INV-09972', value: 1999, date: '02 Sep 2026' },
  ],
  '9007123456': [
    { invoiceNo: 'INV-09891', value: 1480, date: '24 Aug 2026' },
  ],
}

const customerReturns: Record<string, CustomerReturnExchange[]> = {
  '9876543210': [
    { invoiceNo: 'INV-10025', type: 'Return', value: 799, date: '19 Sep 2026' },
    { invoiceNo: 'INV-09984', type: 'Exchange', value: 450, date: '10 Sep 2026' },
  ],
  '9832123456': [
    { invoiceNo: 'INV-09972', type: 'Return', value: 399, date: '05 Sep 2026' },
  ],
  '9007123456': [],
}

const customerWalletHistory: Record<string, CustomerWalletEntry[]> = {
  '9876543210': [
    { date: '18 Sep 2026', type: 'Credit', reference: 'Return INV-10025', amount: 500, balance: 750 },
    { date: '15 Sep 2026', type: 'Debit', reference: 'Purchase INV-10012', amount: -250, balance: 250 },
    { date: '10 Sep 2026', type: 'Adjustment', reference: 'Admin Adjustment', amount: 500, balance: 500 },
  ],
  '9832123456': [
    { date: '15 Sep 2026', type: 'Credit', reference: 'Return INV-09972', amount: 250, balance: 250 },
  ],
  '9007123456': [],
}

const customerPointHistory: Record<string, CustomerPointEntry[]> = {
  '9876543210': [
    { date: '18 Sep 2026', type: 'Earned', reference: 'INV-10025', points: 25, balance: 184 },
    { date: '15 Sep 2026', type: 'Redeemed', reference: 'INV-10012', points: -50, balance: 159 },
    { date: '10 Sep 2026', type: 'Adjustment', reference: 'Admin Adjustment', points: 25, balance: 209 },
  ],
  '9832123456': [
    { date: '15 Sep 2026', type: 'Earned', reference: 'INV-10018', points: 24, balance: 123 },
  ],
  '9007123456': [],
}

const customerGiftCards: Record<string, CustomerGiftCard[]> = {
  '9876543210': [
    {
      cardNo: 'GC-000124',
      issueDate: '18 Sep 2026',
      amount: 500,
      status: 'Active',
      usedDate: '',
    },
    {
      cardNo: 'GC-000125',
      issueDate: '19 Sep 2026',
      amount: 500,
      status: 'Used',
      usedDate: '20 Sep 2026',
    },
  ],
  '9832123456': [
    {
      cardNo: 'GC-000118',
      issueDate: '10 Sep 2026',
      amount: 500,
      status: 'Active',
      usedDate: '',
    },
  ],
  '9007123456': [],
}

const customerCoupons: Record<string, CustomerCoupon[]> = {
  '9876543210': [
    {
      code: 'SAVE200',
      issueDate: '18 Sep 2026',
      value: 200,
      status: 'Active',
      claimedDate: '',
      invoiceNo: '',
    },
    {
      code: 'FEST100',
      issueDate: '10 Sep 2026',
      value: 100,
      status: 'Claimed',
      claimedDate: '15 Sep 2026',
      invoiceNo: 'INV-10012',
    },
  ],
  '9832123456': [
    {
      code: 'SAVE100',
      issueDate: '15 Sep 2026',
      value: 100,
      status: 'Active',
      claimedDate: '',
      invoiceNo: '',
    },
  ],
  '9007123456': [],
}

function generateCustomerId(customers: Customer[]) {
  let customerId = ''

  do {
    customerId = `TZC${String(
      Math.floor(100000 + Math.random() * 900000),
    )}`
  } while (customers.some((customer) => customer.customerId === customerId))

  return customerId
}

function CustomerProfilePage() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers)
  const [view, setView] = useState<'list' | 'profile' | 'add'>('list')
  const [profileTab, setProfileTab] = useState<
    'overview' | 'purchases' | 'returns' | 'wallet' | 'points' | 'giftcards' | 'coupons'
  >('overview')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All')
  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [editingPhone, setEditingPhone] = useState<string | null>(null)
  const [message, setMessage] = useState('')

  const [phone, setPhone] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [address, setAddress] = useState('')
  const [whatsapp, setWhatsapp] = useState<'Active' | 'Not Active'>('Not Active')
  const [status, setStatus] = useState<'Active' | 'Inactive'>('Active')

  const selectedCustomer = customers.find(
    (customer) => customer.phone === selectedPhone,
  )

  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      customer.phone.includes(query) ||
      customer.name.toLowerCase().includes(query) ||
      customer.customerId.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === 'All' || customer.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const resetForm = () => {
    setPhone('')
    setName('')
    setEmail('')
    setAddress('')
    setWhatsapp('Not Active')
    setStatus('Active')
    setEditingPhone(null)
  }

  const startAdd = () => {
    resetForm()
    setMessage('')
    setView('add')
  }

  const startEdit = (customer: Customer) => {
    setEditingPhone(customer.phone)
    setPhone(customer.phone)
    setName(customer.name)
    setEmail(customer.email)
    setAddress(customer.address)
    setWhatsapp(customer.whatsapp)
    setStatus(customer.status)
    setMessage('')
    setView('add')
  }

  const openProfile = (customer: Customer) => {
    setSelectedPhone(customer.phone)
    setProfileTab('overview')
    setMessage('')
    setView('profile')
  }

  const saveCustomer = (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')

    const cleanPhone = phone.replace(/\D/g, '')

    if (!/^\d{10}$/.test(cleanPhone)) {
      setMessage('Phone Number is required and must contain exactly 10 digits.')
      return
    }

    const duplicate = customers.some(
      (customer) =>
        customer.phone === cleanPhone &&
        customer.phone !== editingPhone,
    )

    if (duplicate) {
      setMessage('A customer with this Phone Number already exists.')
      return
    }

    if (editingPhone) {
      setCustomers((current) =>
        current.map((customer) =>
          customer.phone === editingPhone
            ? {
                ...customer,
                phone: cleanPhone,
                name: name.trim(),
                email: email.trim(),
                address: address.trim(),
                whatsapp,
                status,
              }
            : customer,
        ),
      )

      setSelectedPhone(cleanPhone)
      setMessage('Customer updated successfully.')
      setView('profile')
    } else {
      const newCustomer: Customer = {
        phone: cleanPhone,
        customerId: generateCustomerId(customers),
        name: name.trim(),
        email: email.trim(),
        address: address.trim(),
        whatsapp,
        status,
        totalPurchases: 0,
        walletBalance: 0,
        points: 0,
        giftCardValue: 0,
        couponCount: 0,
      }

      setCustomers((current) => [newCustomer, ...current])
      setSelectedPhone(cleanPhone)
      setMessage('Customer added successfully.')
      setView('profile')
    }

    resetForm()
  }

  const deleteCustomer = (customer: Customer) => {
    if (
      !window.confirm(
        `Delete customer ${customer.name || customer.phone}?`,
      )
    ) {
      return
    }

    setCustomers((current) =>
      current.filter((item) => item.phone !== customer.phone),
    )

    if (selectedPhone === customer.phone) {
      setSelectedPhone(null)
    }

    setMessage('Customer deleted successfully.')
  }

  const renderStatus = (value: string) => (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
        value === 'Active'
          ? 'bg-emerald-50 text-emerald-700'
          : value === 'Claimed' || value === 'Used'
            ? 'bg-slate-100 text-slate-600'
            : 'bg-slate-100 text-slate-500'
      }`}
    >
      {value}
    </span>
  )

  const profileTabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'purchases', label: 'Purchase History' },
    { id: 'returns', label: 'Returns & Exchanges' },
    { id: 'wallet', label: 'Wallet' },
    { id: 'points', label: 'Points' },
    { id: 'giftcards', label: 'Gift Cards' },
    { id: 'coupons', label: 'Coupons' },
  ] as const

  return (
    <div className="space-y-5">
      {view === 'list' && (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Customer Profile
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage customer profiles, purchases, wallet, points, gift cards and coupons.
              </p>
            </div>

            <button
              type="button"
              onClick={startAdd}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={16} weight="bold" />
              Add Customer
            </button>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_180px]">
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search name, phone number or customer ID..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as 'All' | 'Active' | 'Inactive',
                )
              }
              className={inputClass}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1180px] w-full table-fixed">
                <thead className={tableHead}>
                  <tr>
                    <th className="w-[220px] px-4 py-3 text-left">Name</th>
                    <th className="w-[145px] px-4 py-3 text-left">Phone No.</th>
                    <th className="w-[145px] px-4 py-3 text-right">Total Purchase</th>
                    <th className="w-[115px] px-4 py-3 text-right">Wallet</th>
                    <th className="w-[90px] px-4 py-3 text-right">Points</th>
                    <th className="w-[120px] px-4 py-3 text-right">Gift Card</th>
                    <th className="w-[95px] px-4 py-3 text-right">Coupons</th>
                    <th className="w-[105px] px-4 py-3 text-left">Status</th>
                    <th className="w-[130px] px-4 py-3 text-left">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.phone}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openProfile(customer)}
                          className="text-left"
                        >
                          <div className="font-semibold text-slate-800 hover:text-slate-900">
                            {customer.name || 'Unnamed Customer'}
                          </div>
                          <div className="mt-0.5 text-xs text-slate-400">
                            {customer.customerId}
                          </div>
                        </button>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {customer.phone}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                        {productFormatMoney(customer.totalPurchases)}
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        {productFormatMoney(customer.walletBalance)}
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        {customer.points}
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        {productFormatMoney(customer.giftCardValue)}
                      </td>

                      <td className="px-4 py-3 text-right text-sm text-slate-700">
                        {customer.couponCount}
                      </td>

                      <td className="px-4 py-3">
                        {renderStatus(customer.status)}
                      </td>

                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            title="Edit"
                            onClick={() => startEdit(customer)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                          >
                            <PencilSimple size={17} />
                          </button>

                          <button
                            type="button"
                            title="Delete"
                            onClick={() => deleteCustomer(customer)}
                            className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash size={17} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-14 text-center text-sm text-slate-500"
                      >
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {message && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}
        </>
      )}

      {view === 'add' && (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                {editingPhone ? 'Edit Customer' : 'Add Customer'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Phone Number is the only mandatory customer field.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm()
                setView('list')
              }}
              className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              Back to List
            </button>
          </div>

          {message && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          <form
            onSubmit={saveCustomer}
            className="rounded-xl border border-slate-200 bg-white shadow-sm"
          >
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Customer Information
              </h2>
            </div>

            <div className="grid gap-5 p-5 md:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  value={phone}
                  onChange={(event) =>
                    setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))
                  }
                  inputMode="numeric"
                  maxLength={10}
                  placeholder="10 digit mobile number"
                  className={inputClass}
                  required
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Customer ID
                </label>
                <input
                  value={
                    editingPhone
                      ? customers.find(
                          (customer) => customer.phone === editingPhone,
                        )?.customerId ?? ''
                      : 'Auto-generated after save'
                  }
                  readOnly
                  className={`${inputClass} bg-slate-50 text-slate-500`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Customer Name
                </label>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Customer name"
                  className={inputClass}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  placeholder="customer@example.com"
                  className={inputClass}
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Address
                </label>
                <textarea
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder="Customer address"
                  rows={3}
                  className={`${inputClass} resize-none`}
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  WhatsApp Status
                </label>
                <select
                  value={whatsapp}
                  onChange={(event) =>
                    setWhatsapp(event.target.value as 'Active' | 'Not Active')
                  }
                  className={inputClass}
                >
                  <option value="Active">Active</option>
                  <option value="Not Active">Not Active</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                  Status
                </label>
                <select
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as 'Active' | 'Inactive')
                  }
                  className={inputClass}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
              <button
                type="button"
                onClick={() => {
                  resetForm()
                  setView('list')
                }}
                className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="inline-flex h-10 items-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
              >
                <CheckCircle size={16} weight="bold" />
                {editingPhone ? 'Update Customer' : 'Save Customer'}
              </button>
            </div>
          </form>
        </>
      )}

      {view === 'profile' && selectedCustomer && (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => setView('list')}
                className="mb-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                ← Back to Customer List
              </button>

              <h1 className="text-2xl font-semibold text-slate-900">
                {selectedCustomer.name || 'Unnamed Customer'}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                Customer ID: {selectedCustomer.customerId}
              </p>
            </div>

            <button
              type="button"
              onClick={() => startEdit(selectedCustomer)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
            >
              <PencilSimple size={16} />
              Edit Customer
            </button>
          </div>

          <div className="grid gap-4 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Purchase
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {productFormatMoney(selectedCustomer.totalPurchases)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Wallet Balance
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {productFormatMoney(selectedCustomer.walletBalance)}
              </p>
              <button
                type="button"
                onClick={() => setProfileTab('wallet')}
                className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                View / Adjust Wallet →
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Points
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {selectedCustomer.points}
              </p>
              <button
                type="button"
                onClick={() => setProfileTab('points')}
                className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                View / Adjust Points →
              </button>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Gift Card Value
              </p>
              <p className="mt-2 text-xl font-semibold text-slate-900">
                {productFormatMoney(selectedCustomer.giftCardValue)}
              </p>
              <button
                type="button"
                onClick={() => setProfileTab('giftcards')}
                className="mt-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                View Gift Cards →
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-5 p-5 md:grid-cols-2 lg:grid-cols-5">
              <div>
                <p className="text-xs text-slate-400">Customer ID</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedCustomer.customerId}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Name</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedCustomer.name || '—'}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Phone No.</p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedCustomer.phone}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">WhatsApp</p>
                <div className="mt-1">{renderStatus(selectedCustomer.whatsapp)}</div>
              </div>

              <div>
                <p className="text-xs text-slate-400">Status</p>
                <div className="mt-1">{renderStatus(selectedCustomer.status)}</div>
              </div>
            </div>

            {(selectedCustomer.email || selectedCustomer.address) && (
              <div className="grid gap-5 border-t border-slate-100 p-5 md:grid-cols-2">
                {selectedCustomer.email && (
                  <div>
                    <p className="text-xs text-slate-400">Email</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {selectedCustomer.email}
                    </p>
                  </div>
                )}

                {selectedCustomer.address && (
                  <div>
                    <p className="text-xs text-slate-400">Address</p>
                    <p className="mt-1 text-sm text-slate-700">
                      {selectedCustomer.address}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto border-b border-slate-200">
              <div className="flex min-w-max">
                {profileTabs.map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setProfileTab(tab.id)}
                    className={`border-b-2 px-4 py-3 text-xs font-semibold ${
                      profileTab === tab.id
                        ? 'border-slate-900 text-slate-900'
                        : 'border-transparent text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="p-5">
              {profileTab === 'overview' && (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <button
                    type="button"
                    onClick={() => setProfileTab('purchases')}
                    className="rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                  >
                    <p className="text-xs text-slate-400">Purchase History</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {customerPurchases[selectedCustomer.phone]?.length ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Invoices →
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileTab('returns')}
                    className="rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                  >
                    <p className="text-xs text-slate-400">Returns & Exchanges</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {customerReturns[selectedCustomer.phone]?.length ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Transactions →
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileTab('wallet')}
                    className="rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                  >
                    <p className="text-xs text-slate-400">Wallet History</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {customerWalletHistory[selectedCustomer.phone]?.length ?? 0}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Ledger entries →
                    </p>
                  </button>

                  <button
                    type="button"
                    onClick={() => setProfileTab('coupons')}
                    className="rounded-xl border border-slate-200 p-4 text-left hover:bg-slate-50"
                  >
                    <p className="text-xs text-slate-400">Coupons</p>
                    <p className="mt-2 text-lg font-semibold text-slate-900">
                      {selectedCustomer.couponCount}
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Issued & claimed →
                    </p>
                  </button>
                </div>
              )}

              {profileTab === 'purchases' && (
                <div className="overflow-x-auto">
                  <h3 className="mb-4 text-base font-semibold text-slate-900">
                    Purchase History
                  </h3>
                  <table className="min-w-[650px] w-full">
                    <thead className={tableHead}>
                      <tr>
                        <th className="px-4 py-3 text-left">Invoice No.</th>
                        <th className="px-4 py-3 text-right">Invoice Value</th>
                        <th className="px-4 py-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(customerPurchases[selectedCustomer.phone] ?? []).map((item) => (
                        <tr key={item.invoiceNo}>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {item.invoiceNo}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-slate-700">
                            {productFormatMoney(item.value)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {item.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {profileTab === 'returns' && (
                <div className="overflow-x-auto">
                  <h3 className="mb-4 text-base font-semibold text-slate-900">
                    Return & Exchange History
                  </h3>
                  <table className="min-w-[700px] w-full">
                    <thead className={tableHead}>
                      <tr>
                        <th className="px-4 py-3 text-left">Invoice No.</th>
                        <th className="px-4 py-3 text-left">Type</th>
                        <th className="px-4 py-3 text-right">Value</th>
                        <th className="px-4 py-3 text-left">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(customerReturns[selectedCustomer.phone] ?? []).map((item, index) => (
                        <tr key={`${item.invoiceNo}-${index}`}>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {item.invoiceNo}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-700">
                            {item.type}
                          </td>
                          <td className="px-4 py-3 text-right text-sm text-slate-700">
                            {productFormatMoney(item.value)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {item.date}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {profileTab === 'wallet' && (
                <div>
                  <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Current Wallet Balance</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">
                        {productFormatMoney(selectedCustomer.walletBalance)}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Adjust Wallet
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-[850px] w-full">
                      <thead className={tableHead}>
                        <tr>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-left">Reference</th>
                          <th className="px-4 py-3 text-right">Amount</th>
                          <th className="px-4 py-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(customerWalletHistory[selectedCustomer.phone] ?? []).map((item, index) => (
                          <tr key={`${item.date}-${index}`}>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {item.date}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-700">
                              {item.type}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {item.reference}
                            </td>
                            <td className={`px-4 py-3 text-right text-sm font-semibold ${
                              item.amount >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {item.amount >= 0 ? '+' : ''}
                              {productFormatMoney(item.amount)}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                              {productFormatMoney(item.balance)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {profileTab === 'points' && (
                <div>
                  <div className="mb-5 flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 md:flex-row md:items-center md:justify-between">
                    <div>
                      <p className="text-xs text-slate-400">Current Points</p>
                      <p className="mt-1 text-xl font-semibold text-slate-900">
                        {selectedCustomer.points}
                      </p>
                    </div>
                    <button
                      type="button"
                      className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      Adjust Points
                    </button>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="min-w-[850px] w-full">
                      <thead className={tableHead}>
                        <tr>
                          <th className="px-4 py-3 text-left">Date</th>
                          <th className="px-4 py-3 text-left">Type</th>
                          <th className="px-4 py-3 text-left">Reference</th>
                          <th className="px-4 py-3 text-right">Points</th>
                          <th className="px-4 py-3 text-right">Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {(customerPointHistory[selectedCustomer.phone] ?? []).map((item, index) => (
                          <tr key={`${item.date}-${index}`}>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {item.date}
                            </td>
                            <td className="px-4 py-3 text-sm font-medium text-slate-700">
                              {item.type}
                            </td>
                            <td className="px-4 py-3 text-sm text-slate-600">
                              {item.reference}
                            </td>
                            <td className={`px-4 py-3 text-right text-sm font-semibold ${
                              item.points >= 0 ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {item.points >= 0 ? '+' : ''}
                              {item.points}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                              {item.balance}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {profileTab === 'giftcards' && (
                <div className="overflow-x-auto">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-base font-semibold text-slate-900">
                      Gift Card History
                    </h3>
                    <p className="text-sm font-semibold text-slate-700">
                      Total Value: {productFormatMoney(selectedCustomer.giftCardValue)}
                    </p>
                  </div>

                  <table className="min-w-[800px] w-full">
                    <thead className={tableHead}>
                      <tr>
                        <th className="px-4 py-3 text-left">Gift Card No.</th>
                        <th className="px-4 py-3 text-left">Issue Date</th>
                        <th className="px-4 py-3 text-right">Amount</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Used Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(customerGiftCards[selectedCustomer.phone] ?? []).map((item) => (
                        <tr key={item.cardNo}>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {item.cardNo}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {item.issueDate}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                            {productFormatMoney(item.amount)}
                          </td>
                          <td className="px-4 py-3">
                            {renderStatus(item.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {item.usedDate || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {profileTab === 'coupons' && (
                <div className="overflow-x-auto">
                  <div className="mb-4">
                    <h3 className="text-base font-semibold text-slate-900">
                      Coupon History
                    </h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Issued and claimed coupon history for this customer.
                    </p>
                  </div>

                  <table className="min-w-[950px] w-full">
                    <thead className={tableHead}>
                      <tr>
                        <th className="px-4 py-3 text-left">Coupon</th>
                        <th className="px-4 py-3 text-left">Issue Date</th>
                        <th className="px-4 py-3 text-right">Value</th>
                        <th className="px-4 py-3 text-left">Status</th>
                        <th className="px-4 py-3 text-left">Claimed Date</th>
                        <th className="px-4 py-3 text-left">Invoice No.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(customerCoupons[selectedCustomer.phone] ?? []).map((item) => (
                        <tr key={item.code}>
                          <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                            {item.code}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {item.issueDate}
                          </td>
                          <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                            {productFormatMoney(item.value)}
                          </td>
                          <td className="px-4 py-3">
                            {renderStatus(item.status)}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {item.claimedDate || '—'}
                          </td>
                          <td className="px-4 py-3 text-sm text-slate-600">
                            {item.invoiceNo || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}


function SalesInvoicesPage() {
  type InvoiceItem = {
    product: string
    sku: string
    quantity: number
    mrp: number
    discount: number
    netValue: number
    gstAmount: number
    total: number
  }

  type Invoice = {
    invoiceNo: string
    phone: string
    customerName: string
    customerId: string
    dateTime: string
    items: InvoiceItem[]
    subtotal: number
    discount: number
    taxableValue: number
    gst: number
    finalAmount: number
    payment: string
    paymentReference: string
    status: 'Completed' | 'Exchanged'
  }

  const [search, setSearch] = useState('')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)

  const invoices: Invoice[] = [
    {
      invoiceNo: 'TZN-00322-26-27',
      phone: '9876543210',
      customerName: 'Riya Begum',
      customerId: 'TZC000001',
      dateTime: '20 Sep 2026, 12:32 PM',
      items: [
        {
          product: 'Premium Cotton Suit',
          sku: '522684000001',
          quantity: 1,
          mrp: 2499,
          discount: 250,
          netValue: 2249,
          gstAmount: 269.88,
          total: 2518.88,
        },
        {
          product: 'Printed Cotton Kurti',
          sku: '526317000001',
          quantity: 1,
          mrp: 1399,
          discount: 100,
          netValue: 1299,
          gstAmount: 64.95,
          total: 1363.95,
        },
      ],
      subtotal: 3898,
      discount: 350,
      taxableValue: 3548,
      gst: 334.83,
      finalAmount: 3882.83,
      payment: 'UPI',
      paymentReference: 'UPI-982341',
      status: 'Completed',
    },
    {
      invoiceNo: 'TZN-00321-26-27',
      phone: '9832123456',
      customerName: 'Sabiha Khatun',
      customerId: 'TZC000002',
      dateTime: '20 Sep 2026, 11:48 AM',
      items: [
        {
          product: 'Cotton Churidar Set',
          sku: '621450000001',
          quantity: 2,
          mrp: 1199,
          discount: 150,
          netValue: 2248,
          gstAmount: 112.4,
          total: 2360.4,
        },
      ],
      subtotal: 2398,
      discount: 150,
      taxableValue: 2248,
      gst: 112.4,
      finalAmount: 2360.4,
      payment: 'Cash',
      paymentReference: '',
      status: 'Completed',
    },
    {
      invoiceNo: 'TZN-00320-26-27',
      phone: '9007123456',
      customerName: 'Mousumi Das',
      customerId: 'TZC000003',
      dateTime: '19 Sep 2026, 06:24 PM',
      items: [
        {
          product: 'Printed Cotton Kurti',
          sku: '526317000002',
          quantity: 1,
          mrp: 1399,
          discount: 140,
          netValue: 1259,
          gstAmount: 62.95,
          total: 1321.95,
        },
        {
          product: 'Cotton Dupatta',
          sku: '710220000001',
          quantity: 1,
          mrp: 499,
          discount: 50,
          netValue: 449,
          gstAmount: 22.45,
          total: 471.45,
        },
      ],
      subtotal: 1898,
      discount: 190,
      taxableValue: 1708,
      gst: 85.4,
      finalAmount: 1793.4,
      payment: 'Card',
      paymentReference: 'CARD-441820',
      status: 'Completed',
    },
    {
      invoiceNo: 'TZN-00319-26-27',
      phone: 'Walk-in',
      customerName: 'Walk-in Customer',
      customerId: '—',
      dateTime: '19 Sep 2026, 04:15 PM',
      items: [
        {
          product: 'Premium Cotton Suit',
          sku: '522684000004',
          quantity: 1,
          mrp: 2499,
          discount: 200,
          netValue: 2299,
          gstAmount: 275.88,
          total: 2574.88,
        },
      ],
      subtotal: 2499,
      discount: 200,
      taxableValue: 2299,
      gst: 275.88,
      finalAmount: 2574.88,
      payment: 'Cash',
      paymentReference: '',
      status: 'Completed',
    },
    {
      invoiceNo: 'TZN-00318-26-27',
      phone: '9876543210',
      customerName: 'Riya Begum',
      customerId: 'TZC000001',
      dateTime: '18 Sep 2026, 01:20 PM',
      items: [
        {
          product: 'Cotton Churidar Set',
          sku: '621450000002',
          quantity: 1,
          mrp: 1199,
          discount: 100,
          netValue: 1099,
          gstAmount: 54.95,
          total: 1153.95,
        },
      ],
      subtotal: 1199,
      discount: 100,
      taxableValue: 1099,
      gst: 54.95,
      finalAmount: 1153.95,
      payment: 'Wallet',
      paymentReference: 'WALLET-00044',
      status: 'Completed',
    },
  ]

  const money = (value: number) =>
    `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const filteredInvoices = invoices.filter((invoice) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      invoice.invoiceNo.toLowerCase().includes(query) ||
      invoice.phone.toLowerCase().includes(query) ||
      invoice.customerName.toLowerCase().includes(query)

    const matchesPayment =
      paymentFilter === 'All' || invoice.payment === paymentFilter

    const matchesStatus =
      statusFilter === 'All' || invoice.status === statusFilter

    return matchesSearch && matchesPayment && matchesStatus
  })

  const itemCount = (invoice: Invoice) =>
    invoice.items.reduce((sum, item) => sum + item.quantity, 0)

  if (selectedInvoice) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => setSelectedInvoice(null)}
              className="mb-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Back to Invoices
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {selectedInvoice.invoiceNo}
              </h1>

              <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                {selectedInvoice.status}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {selectedInvoice.dateTime}
            </p>
          </div>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              Print
            </button>

            <button
              type="button"
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-800"
            >
              Exchange
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Customer
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              {selectedInvoice.customerName}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {selectedInvoice.phone}
            </p>
            <p className="mt-1 text-xs text-slate-400">
              Customer ID: {selectedInvoice.customerId}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Invoice
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              {selectedInvoice.invoiceNo}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {selectedInvoice.dateTime}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Payment
            </p>
            <p className="mt-2 font-semibold text-slate-900">
              {selectedInvoice.payment}
            </p>
            <p className="mt-1 text-xs text-slate-500">
              {selectedInvoice.paymentReference
                ? `Ref: ${selectedInvoice.paymentReference}`
                : 'No reference'}
            </p>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Invoice Items</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[1050px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-4 py-3">SKU</th>
                  <th className="px-4 py-3 text-right">Qty</th>
                  <th className="px-4 py-3 text-right">MRP</th>
                  <th className="px-4 py-3 text-right">Discount</th>
                  <th className="px-4 py-3 text-right">Net Item Value</th>
                  <th className="px-4 py-3 text-right">GST</th>
                  <th className="px-5 py-3 text-right">Item Total</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {selectedInvoice.items.map((item) => (
                  <tr key={item.sku}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {item.product}
                    </td>
                    <td className="px-4 py-4 text-slate-500">{item.sku}</td>
                    <td className="px-4 py-4 text-right text-slate-700">
                      {item.quantity}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-700">
                      {money(item.mrp)}
                    </td>
                    <td className="px-4 py-4 text-right text-rose-600">
                      -{money(item.discount)}
                    </td>
                    <td className="px-4 py-4 text-right font-medium text-slate-900">
                      {money(item.netValue)}
                    </td>
                    <td className="px-4 py-4 text-right text-slate-600">
                      {money(item.gstAmount)}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      {money(item.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_380px]">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Payment Details</h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs text-slate-400">Payment Method</p>
                <p className="mt-1 font-medium text-slate-900">
                  {selectedInvoice.payment}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Payment Status</p>
                <p className="mt-1 font-medium text-emerald-600">Paid</p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Amount Paid</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {money(selectedInvoice.finalAmount)}
                </p>
              </div>

              <div>
                <p className="text-xs text-slate-400">Reference</p>
                <p className="mt-1 font-medium text-slate-700">
                  {selectedInvoice.paymentReference || '—'}
                </p>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-slate-900">Invoice Summary</h2>

            <div className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Subtotal</span>
                <span className="font-medium text-slate-900">
                  {money(selectedInvoice.subtotal)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Discount</span>
                <span className="font-medium text-rose-600">
                  -{money(selectedInvoice.discount)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">Taxable Value</span>
                <span className="font-medium text-slate-900">
                  {money(selectedInvoice.taxableValue)}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-slate-500">GST</span>
                <span className="font-medium text-slate-900">
                  {money(selectedInvoice.gst)}
                </span>
              </div>

              <div className="border-t border-slate-100 pt-3">
                <div className="flex justify-between text-base">
                  <span className="font-semibold text-slate-900">
                    Final Amount
                  </span>
                  <span className="font-bold text-slate-900">
                    {money(selectedInvoice.finalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Sales Invoices
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Invoice register for completed POS bills.
        </p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Total Invoices
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {filteredInvoices.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Sales Value
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {money(
              filteredInvoices.reduce(
                (sum, invoice) => sum + invoice.finalAmount,
                0
              )
            )}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Discounts
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {money(
              filteredInvoices.reduce(
                (sum, invoice) => sum + invoice.discount,
                0
              )
            )}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            GST
          </p>
          <p className="mt-2 text-2xl font-bold text-slate-900">
            {money(
              filteredInvoices.reduce((sum, invoice) => sum + invoice.gst, 0)
            )}
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[1fr_180px_180px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search invoice no., customer or phone..."
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />

          <select
            value={paymentFilter}
            onChange={(event) => setPaymentFilter(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
          >
            <option>All</option>
            <option>Cash</option>
            <option>UPI</option>
            <option>Card</option>
            <option>Wallet</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
          >
            <option>All</option>
            <option>Completed</option>
            <option>Exchanged</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1500px] w-full table-fixed text-left text-sm">
            <colgroup>
              <col className="w-[160px]" />
              <col className="w-[135px]" />
              <col className="w-[165px]" />
              <col className="w-[75px]" />
              <col className="w-[120px]" />
              <col className="w-[110px]" />
              <col className="w-[130px]" />
              <col className="w-[110px]" />
              <col className="w-[125px]" />
              <col className="w-[100px]" />
              <col className="w-[105px]" />
              <col className="w-[70px]" />
              <col className="w-[70px]" />
            </colgroup>

            <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Invoice No.</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Date & Time</th>
                <th className="px-3 py-3 text-center">Items</th>
                <th className="px-3 py-3 text-right">Subtotal</th>
                <th className="px-3 py-3 text-right">Discount</th>
                <th className="px-3 py-3 text-right">Taxable Value</th>
                <th className="px-3 py-3 text-right">GST</th>
                <th className="px-3 py-3 text-right">Final Amount</th>
                <th className="px-3 py-3">Payment</th>
                <th className="px-3 py-3">Status</th>
                <th className="px-2 py-3 text-center">View</th>
                <th className="px-2 py-3 text-center">Exchange</th>
                <th className="px-2 py-3 text-center">Print</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((invoice) => (
                <tr key={invoice.invoiceNo} className="hover:bg-slate-50/70">
                  <td className="px-4 py-4 font-semibold text-slate-900">
                    {invoice.invoiceNo}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {invoice.phone}
                  </td>

                  <td className="px-4 py-4 text-slate-600">
                    {invoice.dateTime}
                  </td>

                  <td className="px-3 py-4 text-center font-medium text-slate-700">
                    {itemCount(invoice)}
                  </td>

                  <td className="px-3 py-4 text-right text-slate-700">
                    {money(invoice.subtotal)}
                  </td>

                  <td className="px-3 py-4 text-right text-rose-600">
                    -{money(invoice.discount)}
                  </td>

                  <td className="px-3 py-4 text-right text-slate-700">
                    {money(invoice.taxableValue)}
                  </td>

                  <td className="px-3 py-4 text-right text-slate-700">
                    {money(invoice.gst)}
                  </td>

                  <td className="px-3 py-4 text-right font-semibold text-slate-900">
                    {money(invoice.finalAmount)}
                  </td>

                  <td className="px-3 py-4 text-slate-700">
                    {invoice.payment}
                  </td>

                  <td className="px-3 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
                      {invoice.status}
                    </span>
                  </td>

                  <td className="px-2 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedInvoice(invoice)}
                      className="inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700 hover:text-slate-950"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </td>

                  <td className="px-2 py-4 text-center">
                    <button
                      type="button"
                      title="Exchange"
                      onClick={() => {
                        window.history.pushState(
                          {},
                          '',
                          `/sales/exchanges?invoice=${encodeURIComponent(
                            invoice.invoiceNo,
                          )}`,
                        )
                        window.dispatchEvent(new PopStateEvent('popstate'))
                      }}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800"
                    >
                      <ArrowsClockwise size={14} />
                      Exchange
                    </button>
                  </td>

                  <td className="px-2 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="text-sm font-semibold text-slate-700 hover:text-slate-950"
                    >
                      Print
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredInvoices.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-slate-700">No invoices found</p>
            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}



function SalesExchangesPage() {
  type ExchangeItem = {
    product: string
    sku: string
    quantity: number
    mrp: number
    discount: number
    netValue: number
  }

  type ExchangeRecord = {
    exchangeNo: string
    invoiceNo: string
    customerName: string
    phone: string
    dateTime: string
    oldItems: ExchangeItem[]
    newItems: ExchangeItem[]
    originalValue: number
    replacementValue: number
    difference: number
    status: 'Completed' | 'Draft'
  }

  const demoInvoices = [
    {
      invoiceNo: 'TZN-00322-26-27',
      customerName: 'Riya Begum',
      phone: '9876543210',
      customerId: 'TZC000001',
      items: [
        {
          product: 'Premium Cotton Suit',
          sku: '522684000001',
          quantity: 1,
          mrp: 2499,
          discount: 200,
          netValue: 2299,
        },
        {
          product: 'Printed Cotton Kurti',
          sku: '526317000001',
          quantity: 1,
          mrp: 1399,
          discount: 100,
          netValue: 1299,
        },
      ],
    },
    {
      invoiceNo: 'TZN-00321-26-27',
      customerName: 'Sabiha Khatun',
      phone: '9832123456',
      customerId: 'TZC000002',
      items: [
        {
          product: 'Cotton Churidar Set',
          sku: '531248000001',
          quantity: 2,
          mrp: 1199,
          discount: 100,
          netValue: 1099,
        },
      ],
    },
    {
      invoiceNo: 'TZN-00320-26-27',
      customerName: 'Mousumi Das',
      phone: '9007123456',
      customerId: 'TZC000003',
      items: [
        {
          product: 'Printed Cotton Kurti',
          sku: '526317000002',
          quantity: 1,
          mrp: 1399,
          discount: 150,
          netValue: 1249,
        },
        {
          product: 'Cotton Dupatta',
          sku: '541782000001',
          quantity: 1,
          mrp: 699,
          discount: 50,
          netValue: 649,
        },
      ],
    },
  ]

  const initialExchanges: ExchangeRecord[] = [
    {
      exchangeNo: 'EXC-00003',
      invoiceNo: 'TZN-00318-26-27',
      customerName: 'Riya Begum',
      phone: '9876543210',
      dateTime: '20 Sep 2026 11:18 AM',
      oldItems: [
        {
          product: 'Cotton Churidar Set',
          sku: '531248000001',
          quantity: 1,
          mrp: 1199,
          discount: 100,
          netValue: 1099,
        },
      ],
      newItems: [
        {
          product: 'Printed Cotton Kurti',
          sku: '526317000001',
          quantity: 1,
          mrp: 1399,
          discount: 100,
          netValue: 1299,
        },
      ],
      originalValue: 1099,
      replacementValue: 1299,
      difference: 200,
      status: 'Completed',
    },
    {
      exchangeNo: 'EXC-00002',
      invoiceNo: 'TZN-00317-26-27',
      customerName: 'Sabiha Khatun',
      phone: '9832123456',
      dateTime: '18 Sep 2026 04:42 PM',
      oldItems: [
        {
          product: 'Premium Cotton Suit',
          sku: '522684000002',
          quantity: 1,
          mrp: 2499,
          discount: 200,
          netValue: 2299,
        },
      ],
      newItems: [
        {
          product: 'Premium Cotton Suit',
          sku: '522684000003',
          quantity: 1,
          mrp: 2499,
          discount: 200,
          netValue: 2299,
        },
      ],
      originalValue: 2299,
      replacementValue: 2299,
      difference: 0,
      status: 'Completed',
    },
    {
      exchangeNo: 'EXC-00001',
      invoiceNo: 'TZN-00315-26-27',
      customerName: 'Mousumi Das',
      phone: '9007123456',
      dateTime: '15 Sep 2026 01:26 PM',
      oldItems: [
        {
          product: 'Premium Cotton Suit',
          sku: '522684000004',
          quantity: 1,
          mrp: 2499,
          discount: 200,
          netValue: 2299,
        },
      ],
      newItems: [
        {
          product: 'Printed Cotton Kurti',
          sku: '526317000002',
          quantity: 1,
          mrp: 1399,
          discount: 150,
          netValue: 1249,
        },
      ],
      originalValue: 2299,
      replacementValue: 1249,
      difference: -1050,
      status: 'Completed',
    },
  ]

  const [exchanges, setExchanges] =
    useState<ExchangeRecord[]>(initialExchanges)
  const [selectedExchange, setSelectedExchange] =
    useState<ExchangeRecord | null>(null)
  const [showNewExchange, setShowNewExchange] = useState(false)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<'All' | ExchangeRecord['status']>('All')

  const [selectedInvoiceNo, setSelectedInvoiceNo] = useState('')
  const [selectedOldItems, setSelectedOldItems] = useState<string[]>([])
  const [replacementItems, setReplacementItems] = useState<ExchangeItem[]>([])

  useEffect(() => {
    const invoiceFromUrl = new URLSearchParams(window.location.search).get(
      'invoice',
    )

    if (!invoiceFromUrl) {
      return
    }

    const matchedInvoice = demoInvoices.find(
      (invoice) => invoice.invoiceNo === invoiceFromUrl,
    )

    if (matchedInvoice) {
      setSelectedInvoiceNo(matchedInvoice.invoiceNo)
      setShowNewExchange(true)
    }
  }, [])
  const [invoiceSearch, setInvoiceSearch] = useState('')
  const [invoiceFromDate, setInvoiceFromDate] = useState('')
  const [invoiceToDate, setInvoiceToDate] = useState('')
  const [replacementSearch, setReplacementSearch] = useState('')

  const filteredExchanges = exchanges.filter((exchange) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      exchange.exchangeNo.toLowerCase().includes(query) ||
      exchange.invoiceNo.toLowerCase().includes(query) ||
      exchange.customerName.toLowerCase().includes(query) ||
      exchange.phone.includes(query)

    const matchesStatus =
      statusFilter === 'All' || exchange.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const selectedInvoice =
    demoInvoices.find((invoice) => invoice.invoiceNo === selectedInvoiceNo) ??
    null

  const exchangeInvoiceResults = demoInvoices.filter((invoice) => {
    const query = invoiceSearch.trim().toLowerCase()

    const matchesSearch =
      !query ||
      invoice.invoiceNo.toLowerCase().includes(query) ||
      invoice.phone.includes(query)

    const invoiceDate = invoice.invoiceNo === 'TZN-00322-26-27'
      ? '2026-09-20'
      : invoice.invoiceNo === 'TZN-00321-26-27'
        ? '2026-09-20'
        : '2026-09-19'

    const matchesFrom =
      !invoiceFromDate || invoiceDate >= invoiceFromDate

    const matchesTo =
      !invoiceToDate || invoiceDate <= invoiceToDate

    return matchesSearch && matchesFrom && matchesTo
  })

  const oldItems = selectedInvoice
    ? selectedInvoice.items.filter((item) =>
        selectedOldItems.includes(item.sku),
      )
    : []

  const originalValue = oldItems.reduce(
    (sum, item) => sum + item.netValue * item.quantity,
    0,
  )

  const replacementValue = replacementItems.reduce(
    (sum, item) => sum + item.netValue * item.quantity,
    0,
  )

  const difference = replacementValue - originalValue

  const resetNewExchange = () => {
    setSelectedInvoiceNo('')
    setSelectedOldItems([])
    setReplacementItems([])
    setInvoiceSearch('')
    setInvoiceFromDate('')
    setInvoiceToDate('')
    setReplacementSearch('')

    window.history.replaceState({}, '', '/sales/exchanges')
  }

  const replacementProducts: ExchangeItem[] = [
    {
      product: 'Premium Cotton Suit',
      sku: '522684000001',
      quantity: 1,
      mrp: 2499,
      discount: 200,
      netValue: 2299,
    },
    {
      product: 'Premium Cotton Suit',
      sku: '522684000002',
      quantity: 1,
      mrp: 2499,
      discount: 200,
      netValue: 2299,
    },
    {
      product: 'Premium Cotton Suit',
      sku: '522684000003',
      quantity: 1,
      mrp: 2499,
      discount: 200,
      netValue: 2299,
    },
    {
      product: 'Premium Cotton Suit',
      sku: '522684000004',
      quantity: 1,
      mrp: 2499,
      discount: 200,
      netValue: 2299,
    },
    {
      product: 'Printed Cotton Kurti',
      sku: '526317000001',
      quantity: 1,
      mrp: 1399,
      discount: 100,
      netValue: 1299,
    },
    {
      product: 'Printed Cotton Kurti',
      sku: '526317000002',
      quantity: 1,
      mrp: 1399,
      discount: 150,
      netValue: 1249,
    },
    {
      product: 'Cotton Churidar Set',
      sku: '531248000001',
      quantity: 1,
      mrp: 1199,
      discount: 100,
      netValue: 1099,
    },
    {
      product: 'Cotton Dupatta',
      sku: '541782000001',
      quantity: 1,
      mrp: 699,
      discount: 50,
      netValue: 649,
    },
  ]

  const replacementSearchResults = replacementProducts.filter((item) => {
    const query = replacementSearch.trim().toLowerCase()

    if (!query) return false

    const coreSku = item.sku.slice(0, 6)

    return (
      item.product.toLowerCase().includes(query) ||
      item.sku.toLowerCase().includes(query) ||
      coreSku === query
    )
  })

  const addReplacementProduct = (item: ExchangeItem) => {
    setReplacementItems((current) => {
      const existing = current.findIndex(
        (replacement) => replacement.sku === item.sku,
      )

      if (existing >= 0) {
        return current.map((replacement, index) =>
          index === existing
            ? {
                ...replacement,
                quantity: replacement.quantity + 1,
              }
            : replacement,
        )
      }

      return [
        ...current,
        {
          ...item,
          quantity: 1,
        },
      ]
    })
  }

  const saveExchange = () => {
    if (!selectedInvoice || oldItems.length === 0 || replacementItems.length === 0) {
      return
    }

    const nextNumber =
      exchanges.length +
      1 +
      Math.max(
        0,
        ...exchanges.map((exchange) => {
          const number = Number(exchange.exchangeNo.replace('EXC-', ''))
          return Number.isFinite(number) ? number : 0
        }),
      )

    const newExchange: ExchangeRecord = {
      exchangeNo: `EXC-${String(nextNumber).padStart(5, '0')}`,
      invoiceNo: selectedInvoice.invoiceNo,
      customerName: selectedInvoice.customerName,
      phone: selectedInvoice.phone,
      dateTime: new Date().toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      oldItems,
      newItems: replacementItems,
      originalValue,
      replacementValue,
      difference,
      status: 'Completed',
    }

    setExchanges((current) => [newExchange, ...current])
    setSelectedExchange(newExchange)
    setShowNewExchange(false)
    resetNewExchange()
  }

  const formatMoney = (value: number) =>
    `₹${Math.abs(value).toLocaleString('en-IN')}`

  const renderItemNames = (items: ExchangeItem[]) =>
    items
      .map((item) => `${item.product}${item.quantity > 1 ? ` × ${item.quantity}` : ''}`)
      .join(', ')

  if (selectedExchange) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setSelectedExchange(null)}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <ArrowLeft size={16} />
            Back to Exchanges
          </button>

          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            <Printer size={16} />
            Print
          </button>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Exchange
              </p>
              <h1 className="mt-1 text-xl font-semibold text-slate-900">
                {selectedExchange.exchangeNo}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Original Invoice: {selectedExchange.invoiceNo}
              </p>
            </div>

            <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              {selectedExchange.status}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Customer</p>
            <p className="mt-1 font-semibold text-slate-900">
              {selectedExchange.customerName}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {selectedExchange.phone}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Exchange Date & Time</p>
            <p className="mt-1 font-semibold text-slate-900">
              {selectedExchange.dateTime}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <p className="text-xs text-slate-400">Difference</p>
            <p
              className={`mt-1 text-xl font-bold ${
                selectedExchange.difference > 0
                  ? 'text-amber-600'
                  : selectedExchange.difference < 0
                    ? 'text-blue-600'
                    : 'text-emerald-600'
              }`}
            >
              {selectedExchange.difference > 0
                ? `${formatMoney(selectedExchange.difference)} Payable`
                : selectedExchange.difference < 0
                  ? `${formatMoney(selectedExchange.difference)} Difference`
                  : '₹0'}
            </p>
          </div>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Original Items</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Item</th>
                    <th className="px-3 py-3 text-left">SKU</th>
                    <th className="px-3 py-3 text-right">Qty</th>
                    <th className="px-3 py-3 text-right">Net Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedExchange.oldItems.map((item) => (
                    <tr key={item.sku}>
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {item.product}
                      </td>
                      <td className="px-3 py-3 text-slate-500">{item.sku}</td>
                      <td className="px-3 py-3 text-right">{item.quantity}</td>
                      <td className="px-3 py-3 text-right font-medium">
                        {formatMoney(item.netValue * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="font-semibold text-slate-900">Replacement Items</h2>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Item</th>
                    <th className="px-3 py-3 text-left">SKU</th>
                    <th className="px-3 py-3 text-right">Qty</th>
                    <th className="px-3 py-3 text-right">Net Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {selectedExchange.newItems.map((item) => (
                    <tr key={item.sku}>
                      <td className="px-5 py-3 font-medium text-slate-800">
                        {item.product}
                      </td>
                      <td className="px-3 py-3 text-slate-500">{item.sku}</td>
                      <td className="px-3 py-3 text-right">{item.quantity}</td>
                      <td className="px-3 py-3 text-right font-medium">
                        {formatMoney(item.netValue * item.quantity)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Original Value</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatMoney(selectedExchange.originalValue)}
              </p>
            </div>

            <div className="text-slate-300">−</div>

            <div>
              <p className="text-sm text-slate-500">Replacement Value</p>
              <p className="text-lg font-semibold text-slate-900">
                {formatMoney(selectedExchange.replacementValue)}
              </p>
            </div>

            <div className="text-slate-300">=</div>

            <div>
              <p className="text-sm text-slate-500">Difference</p>
              <p className="text-lg font-bold text-slate-900">
                {selectedExchange.difference === 0
                  ? '₹0'
                  : selectedExchange.difference > 0
                    ? `${formatMoney(selectedExchange.difference)} Payable`
                    : `${formatMoney(selectedExchange.difference)} Difference`}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (showNewExchange) {
    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              onClick={() => {
                setShowNewExchange(false)
                resetNewExchange()
              }}
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={16} />
              Back to Exchanges
            </button>

            <h1 className="text-xl font-semibold text-slate-900">
              New Exchange
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Record an exchange against an existing completed invoice.
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Find Original Invoice
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Search using customer phone number or invoice number, and optionally
              filter by invoice date.
            </p>
          </div>

          <div className="grid gap-3 p-5 md:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
            <div className="relative">
              <MagnifyingGlass
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={invoiceSearch}
                onChange={(event) => setInvoiceSearch(event.target.value)}
                placeholder="Search phone number or invoice number..."
                className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <input
              type="date"
              value={invoiceFromDate}
              onChange={(event) => setInvoiceFromDate(event.target.value)}
              title="From date"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            />

            <input
              type="date"
              value={invoiceToDate}
              onChange={(event) => setInvoiceToDate(event.target.value)}
              title="To date"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-400"
            />

            <button
              onClick={() => {
                setInvoiceSearch('')
                setInvoiceFromDate('')
                setInvoiceToDate('')
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Clear
            </button>
          </div>

          <div className="border-t border-slate-100">
            <div className="overflow-x-auto">
              <table className="min-w-[950px] w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 text-left">Invoice No.</th>
                    <th className="px-3 py-3 text-left">Date & Time</th>
                    <th className="px-3 py-3 text-left">Customer</th>
                    <th className="px-3 py-3 text-left">Phone</th>
                    <th className="px-3 py-3 text-right">Items</th>
                    <th className="px-3 py-3 text-right">Final Amount</th>
                    <th className="px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {exchangeInvoiceResults.map((invoice) => {
                    const invoiceDateTime =
                      invoice.invoiceNo === 'TZN-00322-26-27'
                        ? '20 Sep 2026 12:32 PM'
                        : invoice.invoiceNo === 'TZN-00321-26-27'
                          ? '20 Sep 2026 11:15 AM'
                          : '19 Sep 2026 03:42 PM'

                    const itemCount = invoice.items.reduce(
                      (sum, item) => sum + item.quantity,
                      0,
                    )

                    const finalAmount = invoice.items.reduce(
                      (sum, item) => sum + item.netValue * item.quantity,
                      0,
                    )

                    const isSelected =
                      selectedInvoiceNo === invoice.invoiceNo

                    return (
                      <tr
                        key={invoice.invoiceNo}
                        className={
                          isSelected
                            ? 'bg-slate-50'
                            : 'hover:bg-slate-50/70'
                        }
                      >
                        <td className="px-5 py-3 font-semibold text-slate-900">
                          {invoice.invoiceNo}
                        </td>

                        <td className="px-3 py-3 whitespace-nowrap text-slate-500">
                          {invoiceDateTime}
                        </td>

                        <td className="px-3 py-3 font-medium text-slate-700">
                          {invoice.customerName}
                        </td>

                        <td className="px-3 py-3 text-slate-500">
                          {invoice.phone}
                        </td>

                        <td className="px-3 py-3 text-right">
                          {itemCount}
                        </td>

                        <td className="px-3 py-3 text-right font-semibold">
                          {formatMoney(finalAmount)}
                        </td>

                        <td className="px-5 py-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedInvoiceNo(invoice.invoiceNo)
                              setSelectedOldItems([])
                              setReplacementItems([])
                            }}
                            className={
                              isSelected
                                ? 'rounded-lg bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white'
                                : 'rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50'
                            }
                          >
                            {isSelected ? 'Selected' : 'Select'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}

                  {exchangeInvoiceResults.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-5 py-10 text-center">
                        <p className="font-medium text-slate-700">
                          No invoices found
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Try another phone number, invoice number or date range.
                        </p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {selectedInvoice && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-400">Customer</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedInvoice.customerName}
                </p>
                <p className="text-sm text-slate-500">
                  {selectedInvoice.phone}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-400">Customer ID</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedInvoice.customerId}
                </p>
              </div>

              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-xs text-slate-400">Original Invoice</p>
                <p className="mt-1 font-semibold text-slate-900">
                  {selectedInvoice.invoiceNo}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Select Original Item(s)
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Select the item(s) being exchanged from the original invoice.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="w-12 px-5 py-3"></th>
                      <th className="px-3 py-3 text-left">Product</th>
                      <th className="px-3 py-3 text-left">SKU</th>
                      <th className="px-3 py-3 text-right">Qty</th>
                      <th className="px-3 py-3 text-right">MRP</th>
                      <th className="px-3 py-3 text-right">Discount</th>
                      <th className="px-3 py-3 text-right">Net Value</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedInvoice.items.map((item) => {
                      const checked = selectedOldItems.includes(item.sku)

                      return (
                        <tr key={item.sku} className={checked ? 'bg-slate-50' : ''}>
                          <td className="px-5 py-3">
                            <input
                              type="checkbox"
                              checked={checked}
                              onChange={() =>
                                setSelectedOldItems((current) =>
                                  current.includes(item.sku)
                                    ? current.filter((sku) => sku !== item.sku)
                                    : [...current, item.sku],
                                )
                              }
                              className="h-4 w-4 rounded border-slate-300"
                            />
                          </td>
                          <td className="px-3 py-3 font-medium text-slate-800">
                            {item.product}
                          </td>
                          <td className="px-3 py-3 text-slate-500">
                            {item.sku}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {formatMoney(item.mrp)}
                          </td>
                          <td className="px-3 py-3 text-right text-slate-500">
                            {formatMoney(item.discount)}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold">
                            {formatMoney(item.netValue * item.quantity)}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Replacement Item(s)
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Search by product name, 6-digit Core SKU or full 12-digit SKU.
                </p>
              </div>

              <div className="border-b border-slate-100 p-5">
                <div className="relative">
                  <MagnifyingGlass
                    size={17}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                  />
                  <input
                    value={replacementSearch}
                    onChange={(event) =>
                      setReplacementSearch(event.target.value)
                    }
                    placeholder="Search product, 6-digit Core SKU or 12-digit SKU..."
                    className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
                  />
                </div>

                <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-slate-500">
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    6-digit SKU → all variants
                  </span>
                  <span className="rounded-full bg-slate-100 px-2.5 py-1">
                    12-digit SKU → exact variant
                  </span>
                </div>

                {replacementSearch.trim() && (
                  <div className="mt-3 overflow-hidden rounded-lg border border-slate-200">
                    {replacementSearchResults.length > 0 ? (
                      <div className="divide-y divide-slate-100">
                        {replacementSearchResults.map((item) => {
                          const isAdded = replacementItems.some(
                            (replacement) => replacement.sku === item.sku,
                          )

                          return (
                            <div
                              key={item.sku}
                              className="flex flex-wrap items-center justify-between gap-3 bg-white px-4 py-3 hover:bg-slate-50"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-slate-800">
                                  {item.product}
                                </p>
                                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                                  <span>SKU: {item.sku}</span>
                                  <span className="text-slate-300">•</span>
                                  <span>
                                    Core SKU: {item.sku.slice(0, 6)}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-xs text-slate-400">
                                    MRP
                                  </p>
                                  <p className="font-semibold text-slate-800">
                                    {formatMoney(item.mrp)}
                                  </p>
                                </div>

                                <button
                                  onClick={() =>
                                    addReplacementProduct(item)
                                  }
                                  className={
                                    isAdded
                                      ? 'rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700'
                                      : 'rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800'
                                  }
                                >
                                  {isAdded ? 'Added' : 'Select'}
                                </button>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    ) : (
                      <div className="px-4 py-8 text-center">
                        <p className="font-medium text-slate-700">
                          No matching product or SKU
                        </p>
                        <p className="mt-1 text-xs text-slate-500">
                          Try a product name, 6-digit Core SKU or full 12-digit
                          SKU.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {replacementItems.length === 0 ? (
                <div className="px-5 py-10 text-center text-sm text-slate-500">
                  No replacement item added yet.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3 text-left">Product</th>
                        <th className="px-3 py-3 text-left">SKU</th>
                        <th className="px-3 py-3 text-right">Qty</th>
                        <th className="px-3 py-3 text-right">MRP</th>
                        <th className="px-3 py-3 text-right">Discount</th>
                        <th className="px-3 py-3 text-right">Net Value</th>
                        <th className="px-3 py-3 text-right"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {replacementItems.map((item, index) => (
                        <tr key={`${item.sku}-${index}`}>
                          <td className="px-5 py-3 font-medium text-slate-800">
                            {item.product}
                          </td>
                          <td className="px-3 py-3 text-slate-500">
                            {item.sku}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {item.quantity}
                          </td>
                          <td className="px-3 py-3 text-right">
                            {formatMoney(item.mrp)}
                          </td>
                          <td className="px-3 py-3 text-right text-slate-500">
                            {formatMoney(item.discount)}
                          </td>
                          <td className="px-3 py-3 text-right font-semibold">
                            {formatMoney(item.netValue * item.quantity)}
                          </td>
                          <td className="px-3 py-3 text-right">
                            <button
                              onClick={() =>
                                setReplacementItems((current) =>
                                  current.filter((_, itemIndex) => itemIndex !== index),
                                )
                              }
                              className="rounded-md p-1.5 text-slate-400 hover:bg-red-50 hover:text-red-600"
                              title="Remove"
                            >
                              <Trash size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-semibold text-slate-900">
                Exchange Summary
              </h2>

              <div className="mt-4 grid gap-4 sm:grid-cols-3">
                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Original Value</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatMoney(originalValue)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Replacement Value</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {formatMoney(replacementValue)}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 p-4">
                  <p className="text-xs text-slate-500">Difference</p>
                  <p
                    className={`mt-1 text-lg font-bold ${
                      difference > 0
                        ? 'text-amber-600'
                        : difference < 0
                          ? 'text-blue-600'
                          : 'text-emerald-600'
                    }`}
                  >
                    {difference === 0
                      ? '₹0'
                      : difference > 0
                        ? `${formatMoney(difference)} Payable`
                        : `${formatMoney(difference)} Difference`}
                  </p>
                </div>
              </div>

              <div className="mt-4 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-800">
                GST, credit/debit note treatment, wallet adjustment and inventory
                movement will be implemented later. This screen currently records
                the exchange UI/demo calculation only.
              </div>

              <div className="mt-5 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowNewExchange(false)
                    resetNewExchange()
                  }}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  onClick={saveExchange}
                  disabled={
                    !selectedInvoice ||
                    oldItems.length === 0 ||
                    replacementItems.length === 0
                  }
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Save Exchange
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  const totalValue = exchanges.reduce(
    (sum, exchange) => sum + exchange.replacementValue,
    0,
  )

  const completedCount = exchanges.filter(
    (exchange) => exchange.status === 'Completed',
  ).length

  const higherValueCount = exchanges.filter(
    (exchange) => exchange.difference > 0,
  ).length

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Sales Exchanges
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Exchange history recorded against completed POS invoices.
          </p>
        </div>

        <button
          onClick={() => {
            resetNewExchange()
            setShowNewExchange(true)
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
        >
          <Plus size={17} />
          New Exchange
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          {
            label: 'Total Exchanges',
            value: exchanges.length.toLocaleString('en-IN'),
          },
          {
            label: 'Replacement Value',
            value: formatMoney(totalValue),
          },
          {
            label: 'Completed',
            value: completedCount.toLocaleString('en-IN'),
          },
          {
            label: 'Higher Value',
            value: higherValueCount.toLocaleString('en-IN'),
          },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              {card.label}
            </p>
            <p className="mt-2 text-xl font-bold text-slate-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 p-4 md:flex-row md:items-center">
          <div className="relative flex-1">
            <MagnifyingGlass
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search exchange, invoice, customer or phone..."
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-400"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value as 'All' | ExchangeRecord['status'],
              )
            }
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option value="All">All Status</option>
            <option value="Completed">Completed</option>
            <option value="Draft">Draft</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[1450px] w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3 text-left">Exchange No.</th>
                <th className="px-3 py-3 text-left">Original Invoice</th>
                <th className="px-3 py-3 text-left">Customer</th>
                <th className="px-3 py-3 text-left">Phone</th>
                <th className="px-3 py-3 text-left">Date & Time</th>
                <th className="px-3 py-3 text-left">Old Items</th>
                <th className="px-3 py-3 text-left">New Items</th>
                <th className="px-3 py-3 text-right">Original Value</th>
                <th className="px-3 py-3 text-right">Replacement Value</th>
                <th className="px-3 py-3 text-right">Difference</th>
                <th className="px-3 py-3 text-left">Status</th>
                <th className="px-5 py-3 text-right">View</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredExchanges.map((exchange) => (
                <tr key={exchange.exchangeNo} className="hover:bg-slate-50/70">
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {exchange.exchangeNo}
                  </td>

                  <td className="px-3 py-4 font-medium text-slate-700">
                    {exchange.invoiceNo}
                  </td>

                  <td className="px-3 py-4 text-slate-700">
                    {exchange.customerName}
                  </td>

                  <td className="px-3 py-4 text-slate-500">
                    {exchange.phone}
                  </td>

                  <td className="px-3 py-4 whitespace-nowrap text-slate-500">
                    {exchange.dateTime}
                  </td>

                  <td className="max-w-[190px] px-3 py-4 text-slate-600">
                    {renderItemNames(exchange.oldItems)}
                  </td>

                  <td className="max-w-[190px] px-3 py-4 text-slate-600">
                    {renderItemNames(exchange.newItems)}
                  </td>

                  <td className="px-3 py-4 text-right font-medium">
                    {formatMoney(exchange.originalValue)}
                  </td>

                  <td className="px-3 py-4 text-right font-medium">
                    {formatMoney(exchange.replacementValue)}
                  </td>

                  <td className="px-3 py-4 text-right font-semibold">
                    {exchange.difference === 0
                      ? '₹0'
                      : exchange.difference > 0
                        ? `+${formatMoney(exchange.difference)}`
                        : `-${formatMoney(exchange.difference)}`}
                  </td>

                  <td className="px-3 py-4">
                    <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {exchange.status}
                    </span>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      onClick={() => setSelectedExchange(exchange)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={14} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredExchanges.length === 0 && (
                <tr>
                  <td colSpan={12} className="px-5 py-14 text-center">
                    <div className="mx-auto max-w-sm">
                      <p className="font-semibold text-slate-800">
                        No exchanges found
                      </p>
                      <p className="mt-1 text-sm text-slate-500">
                        Try changing your search or status filter.
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}


function InventoryStockPage() {
  type StockLocation = {
    location: 'Warehouse' | 'Retail Store'
    quantity: number
  }

  type StockMovement = {
    date: string
    movement: string
    reference: string
    location: string
    quantity: number
    balance: number
  }

  type StockRecord = {
    id: string
    product: string
    category: string
    subCategory: string
    variant: string
    sku: string
    locations: StockLocation[]
    movements: StockMovement[]
  }

  const initialStock: StockRecord[] = [
    {
      id: 'stock-522684000001',
      product: 'Premium Cotton Suit',
      category: 'Women Ethnic Wear',
      subCategory: 'Suits',
      variant: 'M 38 / Maroon',
      sku: '522684000001',
      locations: [
        { location: 'Warehouse', quantity: 20 },
        { location: 'Retail Store', quantity: 5 },
      ],
      movements: [
        {
          date: '20 Sep 2026 10:15 AM',
          movement: 'Purchase',
          reference: 'PINV-00125',
          location: 'Warehouse',
          quantity: 20,
          balance: 20,
        },
        {
          date: '21 Sep 2026 02:30 PM',
          movement: 'Transfer In',
          reference: 'TRF-00011',
          location: 'Retail Store',
          quantity: 5,
          balance: 5,
        },
      ],
    },
    {
      id: 'stock-522684000002',
      product: 'Premium Cotton Suit',
      category: 'Women Ethnic Wear',
      subCategory: 'Suits',
      variant: 'L 40 / Maroon',
      sku: '522684000002',
      locations: [
        { location: 'Warehouse', quantity: 12 },
        { location: 'Retail Store', quantity: 8 },
      ],
      movements: [
        {
          date: '20 Sep 2026 10:15 AM',
          movement: 'Purchase',
          reference: 'PINV-00125',
          location: 'Warehouse',
          quantity: 15,
          balance: 15,
        },
        {
          date: '21 Sep 2026 02:30 PM',
          movement: 'Sale',
          reference: 'TZN-00322-26-27',
          location: 'Warehouse',
          quantity: -3,
          balance: 12,
        },
        {
          date: '21 Sep 2026 04:10 PM',
          movement: 'Transfer In',
          reference: 'TRF-00011',
          location: 'Retail Store',
          quantity: 8,
          balance: 8,
        },
      ],
    },
    {
      id: 'stock-522684000003',
      product: 'Premium Cotton Suit',
      category: 'Women Ethnic Wear',
      subCategory: 'Suits',
      variant: 'XL 42 / Navy Blue',
      sku: '522684000003',
      locations: [
        { location: 'Warehouse', quantity: 8 },
        { location: 'Retail Store', quantity: 4 },
      ],
      movements: [
        {
          date: '20 Sep 2026 10:15 AM',
          movement: 'Purchase',
          reference: 'PINV-00125',
          location: 'Warehouse',
          quantity: 8,
          balance: 8,
        },
        {
          date: '21 Sep 2026 04:10 PM',
          movement: 'Transfer In',
          reference: 'TRF-00012',
          location: 'Retail Store',
          quantity: 4,
          balance: 4,
        },
      ],
    },
    {
      id: 'stock-522684000004',
      product: 'Premium Cotton Suit',
      category: 'Women Ethnic Wear',
      subCategory: 'Suits',
      variant: '2XL 44 / Navy Blue',
      sku: '522684000004',
      locations: [
        { location: 'Warehouse', quantity: 3 },
        { location: 'Retail Store', quantity: 2 },
      ],
      movements: [
        {
          date: '20 Sep 2026 10:15 AM',
          movement: 'Purchase',
          reference: 'PINV-00125',
          location: 'Warehouse',
          quantity: 5,
          balance: 5,
        },
        {
          date: '21 Sep 2026 05:20 PM',
          movement: 'Sale',
          reference: 'TZN-00320-26-27',
          location: 'Warehouse',
          quantity: -2,
          balance: 3,
        },
        {
          date: '21 Sep 2026 06:00 PM',
          movement: 'Transfer In',
          reference: 'TRF-00012',
          location: 'Retail Store',
          quantity: 2,
          balance: 2,
        },
      ],
    },
    {
      id: 'stock-526317000001',
      product: 'Printed Cotton Kurti',
      category: 'Women Ethnic Wear',
      subCategory: 'Kurtis',
      variant: 'M 38 / Pink',
      sku: '526317000001',
      locations: [
        { location: 'Warehouse', quantity: 12 },
        { location: 'Retail Store', quantity: 6 },
      ],
      movements: [
        {
          date: '19 Sep 2026 11:20 AM',
          movement: 'Purchase',
          reference: 'PINV-00124',
          location: 'Warehouse',
          quantity: 12,
          balance: 12,
        },
        {
          date: '20 Sep 2026 01:40 PM',
          movement: 'Transfer In',
          reference: 'TRF-00010',
          location: 'Retail Store',
          quantity: 6,
          balance: 6,
        },
      ],
    },
    {
      id: 'stock-526317000002',
      product: 'Printed Cotton Kurti',
      category: 'Women Ethnic Wear',
      subCategory: 'Kurtis',
      variant: 'L 40 / Sky Blue',
      sku: '526317000002',
      locations: [
        { location: 'Warehouse', quantity: 4 },
        { location: 'Retail Store', quantity: 3 },
      ],
      movements: [
        {
          date: '19 Sep 2026 11:20 AM',
          movement: 'Purchase',
          reference: 'PINV-00124',
          location: 'Warehouse',
          quantity: 6,
          balance: 6,
        },
        {
          date: '20 Sep 2026 03:15 PM',
          movement: 'Sale',
          reference: 'TZN-00320-26-27',
          location: 'Warehouse',
          quantity: -2,
          balance: 4,
        },
        {
          date: '20 Sep 2026 04:00 PM',
          movement: 'Transfer In',
          reference: 'TRF-00010',
          location: 'Retail Store',
          quantity: 3,
          balance: 3,
        },
      ],
    },
    {
      id: 'stock-531248000001',
      product: 'Cotton Churidar Set',
      category: 'Women Ethnic Wear',
      subCategory: 'Churidar',
      variant: 'L 40 / Black',
      sku: '531248000001',
      locations: [
        { location: 'Warehouse', quantity: 0 },
        { location: 'Retail Store', quantity: 0 },
      ],
      movements: [
        {
          date: '18 Sep 2026 12:10 PM',
          movement: 'Sale',
          reference: 'TZN-00321-26-27',
          location: 'Retail Store',
          quantity: -2,
          balance: 0,
        },
      ],
    },
    {
      id: 'stock-541782000001',
      product: 'Cotton Dupatta',
      category: 'Women Ethnic Wear',
      subCategory: 'Dupatta',
      variant: 'Free Size / White',
      sku: '541782000001',
      locations: [
        { location: 'Warehouse', quantity: 2 },
        { location: 'Retail Store', quantity: 1 },
      ],
      movements: [
        {
          date: '19 Sep 2026 09:30 AM',
          movement: 'Purchase',
          reference: 'PINV-00123',
          location: 'Warehouse',
          quantity: 5,
          balance: 5,
        },
        {
          date: '20 Sep 2026 12:45 PM',
          movement: 'Sale',
          reference: 'TZN-00320-26-27',
          location: 'Warehouse',
          quantity: -3,
          balance: 2,
        },
        {
          date: '20 Sep 2026 02:00 PM',
          movement: 'Transfer In',
          reference: 'TRF-00009',
          location: 'Retail Store',
          quantity: 1,
          balance: 1,
        },
      ],
    },
  ]

  const [stock] = useState<StockRecord[]>(initialStock)
  const [search, setSearch] = useState('')
  const [locationFilter, setLocationFilter] = useState('All')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [selectedStock, setSelectedStock] = useState<StockRecord | null>(null)

  const getTotalQuantity = (record: StockRecord) =>
    record.locations.reduce((sum, location) => sum + location.quantity, 0)

  const getLocationQuantity = (
    record: StockRecord,
    location: 'Warehouse' | 'Retail Store',
  ) =>
    record.locations.find((item) => item.location === location)?.quantity ?? 0

  const getStatus = (quantity: number) => {
    if (quantity === 0) return 'Out of Stock'
    if (quantity <= 5) return 'Low Stock'
    return 'In Stock'
  }

  const filteredStock = stock.filter((record) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      record.product.toLowerCase().includes(query) ||
      record.variant.toLowerCase().includes(query) ||
      record.sku.toLowerCase().includes(query) ||
      record.sku.slice(0, 6).includes(query)

    const matchesLocation =
      locationFilter === 'All' ||
      record.locations.some(
        (location) =>
          location.location === locationFilter && location.quantity > 0,
      )

    const matchesCategory =
      categoryFilter === 'All' || record.category === categoryFilter

    const status = getStatus(getTotalQuantity(record))
    const matchesStatus = statusFilter === 'All' || status === statusFilter

    return matchesSearch && matchesLocation && matchesCategory && matchesStatus
  })

  const totalStock = stock.reduce(
    (sum, record) => sum + getTotalQuantity(record),
    0,
  )

  const warehouseStock = stock.reduce(
    (sum, record) => sum + getLocationQuantity(record, 'Warehouse'),
    0,
  )

  const retailStock = stock.reduce(
    (sum, record) => sum + getLocationQuantity(record, 'Retail Store'),
    0,
  )

  const lowStock = stock.filter((record) => {
    const quantity = getTotalQuantity(record)
    return quantity > 0 && quantity <= 5
  }).length

  if (selectedStock) {
    const totalQuantity = getTotalQuantity(selectedStock)

    return (
      <div className="space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => setSelectedStock(null)}
              className="mb-2 text-sm font-medium text-slate-500 hover:text-slate-900"
            >
              ← Back to Stock
            </button>

            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                {selectedStock.product}
              </h1>
              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-700">
                {selectedStock.sku}
              </span>
              <span
                className={
                  getStatus(totalQuantity) === 'In Stock'
                    ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700'
                    : getStatus(totalQuantity) === 'Low Stock'
                      ? 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700'
                      : 'rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700'
                }
              >
                {getStatus(totalQuantity)}
              </span>
            </div>

            <p className="mt-1 text-sm text-slate-500">
              {selectedStock.variant} · {selectedStock.category} /{' '}
              {selectedStock.subCategory}
            </p>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {[
            ['Total Stock', totalQuantity],
            [
              'Warehouse',
              getLocationQuantity(selectedStock, 'Warehouse'),
            ],
            [
              'Retail Store',
              getLocationQuantity(selectedStock, 'Retail Store'),
            ],
          ].map(([label, value]) => (
            <div
              key={String(label)}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                {label}
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {value}
              </p>
              <p className="mt-1 text-sm text-slate-500">Units</p>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">Location Stock</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3 text-right">Quantity</th>
                  <th className="px-5 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedStock.locations.map((location) => (
                  <tr key={location.location}>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {location.location}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      {location.quantity}
                    </td>
                    <td className="px-5 py-4">
                      <span
                        className={
                          location.quantity === 0
                            ? 'rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700'
                            : location.quantity <= 5
                              ? 'rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700'
                              : 'rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700'
                        }
                      >
                        {location.quantity === 0
                          ? 'Out of Stock'
                          : location.quantity <= 5
                            ? 'Low Stock'
                            : 'In Stock'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Stock Movement History
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full text-sm">
              <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3">Movement</th>
                  <th className="px-5 py-3">Reference</th>
                  <th className="px-5 py-3">Location</th>
                  <th className="px-5 py-3 text-right">Qty</th>
                  <th className="px-5 py-3 text-right">Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedStock.movements.map((movement, index) => (
                  <tr key={`${movement.reference}-${index}`}>
                    <td className="px-5 py-4 text-slate-600">
                      {movement.date}
                    </td>
                    <td className="px-5 py-4 font-medium text-slate-800">
                      {movement.movement}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {movement.reference}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {movement.location}
                    </td>
                    <td
                      className={
                        movement.quantity >= 0
                          ? 'px-5 py-4 text-right font-semibold text-emerald-700'
                          : 'px-5 py-4 text-right font-semibold text-rose-700'
                      }
                    >
                      {movement.quantity > 0 ? '+' : ''}
                      {movement.quantity}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      {movement.balance}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Stock
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          SKU-level inventory across your business locations.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total Stock', totalStock, 'Units across all locations'],
          ['Warehouse Stock', warehouseStock, 'Units in warehouse'],
          ['Retail Store', retailStock, 'Units in retail store'],
          ['Low Stock', lowStock, 'SKUs requiring attention'],
        ].map(([label, value, note]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-2xl font-semibold text-slate-900">
              {value}
            </p>
            <p className="mt-1 text-sm text-slate-500">{note}</p>
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="grid gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_180px_180px]">
          <div className="relative">
            <MagnifyingGlass
              size={18}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search product, variant or SKU"
              className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-3 text-sm outline-none transition focus:border-slate-400"
            />
          </div>

          <select
            value={locationFilter}
            onChange={(event) => setLocationFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option>All</option>
            <option>Warehouse</option>
            <option>Retail Store</option>
          </select>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option>All</option>
            <option>Women Ethnic Wear</option>
          </select>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option>All</option>
            <option>In Stock</option>
            <option>Low Stock</option>
            <option>Out of Stock</option>
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="min-w-[1200px] w-full text-sm">
            <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Variant</th>
                <th className="px-4 py-3">SKU</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3 text-right">Warehouse</th>
                <th className="px-4 py-3 text-right">Retail Store</th>
                <th className="px-4 py-3 text-right">Total</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredStock.map((record) => {
                const total = getTotalQuantity(record)
                const status = getStatus(total)

                return (
                  <tr
                    key={record.id}
                    className="transition hover:bg-slate-50/70"
                  >
                    <td className="px-4 py-4">
                      <button
                        type="button"
                        onClick={() => setSelectedStock(record)}
                        className="text-left font-semibold text-slate-900 hover:text-slate-600"
                      >
                        {record.product}
                      </button>
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {record.variant}
                    </td>
                    <td className="px-4 py-4 font-mono text-xs font-semibold text-slate-700">
                      {record.sku}
                    </td>
                    <td className="px-4 py-4 text-slate-600">
                      {record.category}
                      <span className="block text-xs text-slate-400">
                        {record.subCategory}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-900">
                      {getLocationQuantity(record, 'Warehouse')}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-900">
                      {getLocationQuantity(record, 'Retail Store')}
                    </td>
                    <td className="px-4 py-4 text-right text-base font-semibold text-slate-900">
                      {total}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={
                          status === 'In Stock'
                            ? 'rounded-full bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700'
                            : status === 'Low Stock'
                              ? 'rounded-full bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700'
                              : 'rounded-full bg-rose-50 px-2 py-1 text-xs font-semibold text-rose-700'
                        }
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedStock(record)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        <Eye size={14} />
                        View
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {filteredStock.length === 0 && (
          <div className="px-6 py-12 text-center">
            <p className="font-medium text-slate-700">No stock found</p>
            <p className="mt-1 text-sm text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


function InventoryLocationTransferPage() {
  type TransferLocation = 'Warehouse' | 'Retail Store'

  type TransferSku = {
    product: string
    variant: string
    sku: string
    coreSku: string
    category: string
    available: number
  }

  type SelectedTransferItem = TransferSku & {
    quantity: number
  }

  type TransferRecord = {
    id: string
    dateTime: string
    from: TransferLocation
    to: TransferLocation
    items: SelectedTransferItem[]
    totalUnits: number
    status: 'Completed'
  }

  const transferSkuData: TransferSku[] = [
    {
      product: 'Premium Cotton Suit',
      variant: 'M 38 / Maroon',
      sku: '522684000001',
      coreSku: '522684',
      category: 'Women Ethnic Wear / Suits',
      available: 20,
    },
    {
      product: 'Premium Cotton Suit',
      variant: 'L 40 / Maroon',
      sku: '522684000002',
      coreSku: '522684',
      category: 'Women Ethnic Wear / Suits',
      available: 12,
    },
    {
      product: 'Premium Cotton Suit',
      variant: 'XL 42 / Navy Blue',
      sku: '522684000003',
      coreSku: '522684',
      category: 'Women Ethnic Wear / Suits',
      available: 8,
    },
    {
      product: 'Premium Cotton Suit',
      variant: '2XL 44 / Navy Blue',
      sku: '522684000004',
      coreSku: '522684',
      category: 'Women Ethnic Wear / Suits',
      available: 3,
    },
    {
      product: 'Printed Cotton Kurti',
      variant: 'M 38 / Pink',
      sku: '526317000001',
      coreSku: '526317',
      category: 'Women Ethnic Wear / Kurtis',
      available: 12,
    },
    {
      product: 'Printed Cotton Kurti',
      variant: 'L 40 / Sky Blue',
      sku: '526317000002',
      coreSku: '526317',
      category: 'Women Ethnic Wear / Kurtis',
      available: 4,
    },
    {
      product: 'Cotton Churidar Set',
      variant: 'L 40 / Black',
      sku: '531248000001',
      coreSku: '531248',
      category: 'Women Ethnic Wear / Churidar',
      available: 0,
    },
    {
      product: 'Cotton Dupatta',
      variant: 'Free Size / White',
      sku: '541782000001',
      coreSku: '541782',
      category: 'Women Ethnic Wear / Dupatta',
      available: 2,
    },
  ]

  const initialTransfers: TransferRecord[] = [
    {
      id: 'TRF-000008',
      dateTime: '20 Sep 2026, 11:42 AM',
      from: 'Warehouse',
      to: 'Retail Store',
      items: [
        {
          ...transferSkuData[0],
          quantity: 2,
        },
        {
          ...transferSkuData[4],
          quantity: 3,
        },
      ],
      totalUnits: 5,
      status: 'Completed',
    },
    {
      id: 'TRF-000007',
      dateTime: '19 Sep 2026, 04:18 PM',
      from: 'Retail Store',
      to: 'Warehouse',
      items: [
        {
          ...transferSkuData[1],
          quantity: 2,
        },
      ],
      totalUnits: 2,
      status: 'Completed',
    },
    {
      id: 'TRF-000006',
      dateTime: '18 Sep 2026, 01:05 PM',
      from: 'Warehouse',
      to: 'Retail Store',
      items: [
        {
          ...transferSkuData[5],
          quantity: 1,
        },
      ],
      totalUnits: 1,
      status: 'Completed',
    },
  ]

  const [transfers, setTransfers] = useState<TransferRecord[]>(initialTransfers)
  const [showNewTransfer, setShowNewTransfer] = useState(false)
  const [fromLocation, setFromLocation] =
    useState<TransferLocation>('Warehouse')
  const [toLocation, setToLocation] =
    useState<TransferLocation>('Retail Store')
  const [scanQuery, setScanQuery] = useState('')
  const [selectedItems, setSelectedItems] = useState<SelectedTransferItem[]>([])
  const [expandedCoreSku, setExpandedCoreSku] = useState('')
  const [search, setSearch] = useState('')
  const [directionFilter, setDirectionFilter] = useState('All')
  const [selectedTransfer, setSelectedTransfer] =
    useState<TransferRecord | null>(null)
  const [reviewing, setReviewing] = useState(false)
  const [successTransfer, setSuccessTransfer] =
    useState<TransferRecord | null>(null)

  const filteredTransfers = transfers.filter((transfer) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      transfer.id.toLowerCase().includes(query) ||
      transfer.items.some(
        (item) =>
          item.product.toLowerCase().includes(query) ||
          item.variant.toLowerCase().includes(query) ||
          item.sku.toLowerCase().includes(query) ||
          item.coreSku === query,
      )

    const direction =
      `${transfer.from} → ${transfer.to}`

    const matchesDirection =
      directionFilter === 'All' || direction === directionFilter

    return matchesSearch && matchesDirection
  })

  const coreSkuMatches = scanQuery.trim()
    ? transferSkuData.filter(
        (item) =>
          item.product.toLowerCase().includes(scanQuery.trim().toLowerCase()) ||
          item.coreSku === scanQuery.trim(),
      )
    : []

  const exactSkuMatch = scanQuery.trim()
    ? transferSkuData.find(
        (item) => item.sku === scanQuery.trim(),
      )
    : undefined

  const totalUnits = selectedItems.reduce(
    (sum, item) => sum + item.quantity,
    0,
  )

  const updateDirection = (from: TransferLocation) => {
    setFromLocation(from)
    setToLocation(
      from === 'Warehouse' ? 'Retail Store' : 'Warehouse',
    )
  }

  const resetTransfer = () => {
    setFromLocation('Warehouse')
    setToLocation('Retail Store')
    setScanQuery('')
    setSelectedItems([])
    setExpandedCoreSku('')
    setReviewing(false)
    setShowNewTransfer(false)
    setSuccessTransfer(null)
  }

  const addSku = (item: TransferSku) => {
    const existing = selectedItems.find(
      (selected) => selected.sku === item.sku,
    )

    if (existing) {
      if (existing.quantity < item.available) {
        setSelectedItems((current) =>
          current.map((selected) =>
            selected.sku === item.sku
              ? {
                  ...selected,
                  quantity: selected.quantity + 1,
                }
              : selected,
          ),
        )
      }
      return
    }

    if (item.available <= 0) {
      return
    }

    setSelectedItems((current) => [
      ...current,
      {
        ...item,
        quantity: 1,
      },
    ])

    setScanQuery('')
    setExpandedCoreSku('')
  }

  const removeSku = (sku: string) => {
    setSelectedItems((current) =>
      current.filter((item) => item.sku !== sku),
    )
  }

  const updateQuantity = (sku: string, quantity: number) => {
    const item = selectedItems.find(
      (selected) => selected.sku === sku,
    )

    if (!item) {
      return
    }

    const safeQuantity = Math.max(
      1,
      Math.min(quantity, item.available),
    )

    setSelectedItems((current) =>
      current.map((selected) =>
        selected.sku === sku
          ? {
              ...selected,
              quantity: safeQuantity,
            }
          : selected,
      ),
    )
  }

  const startNewTransfer = () => {
    resetTransfer()
    setShowNewTransfer(true)
  }

  const reviewTransfer = () => {
    if (selectedItems.length === 0) {
      return
    }

    setReviewing(true)
  }

  const approveTransfer = () => {
    const nextNumber =
      transfers.reduce((max, transfer) => {
        const value = Number(
          transfer.id.replace('TRF-', ''),
        )
        return Number.isFinite(value) ? Math.max(max, value) : max
      }, 0) + 1

    const now = new Date()

    const record: TransferRecord = {
      id: `TRF-${String(nextNumber).padStart(6, '0')}`,
      dateTime: now.toLocaleString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      from: fromLocation,
      to: toLocation,
      items: selectedItems,
      totalUnits,
      status: 'Completed',
    }

    setTransfers((current) => [record, ...current])
    setSuccessTransfer(record)
    setReviewing(false)
  }

  const openExistingTransfer = (transfer: TransferRecord) => {
    setSelectedTransfer(transfer)
  }

  if (successTransfer) {
    return (
      <div className="space-y-6">
        <PageHeader
          title="Location Transfer"
          description="Stock transfer completed successfully."
        />

        <div className="mx-auto max-w-2xl rounded-2xl border border-emerald-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle
              size={36}
              weight="fill"
              className="text-emerald-600"
            />
          </div>

          <h2 className="mt-5 text-2xl font-semibold text-slate-900">
            Transfer Successful
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Stock transfer has been approved and recorded.
          </p>

          <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Transfer ID
            </p>
            <p className="mt-1 text-xl font-semibold text-slate-900">
              {successTransfer.id}
            </p>

            <div className="mt-5 flex items-center justify-center gap-4 text-sm font-medium text-slate-700">
              <span>{successTransfer.from}</span>
              <ArrowRight size={18} />
              <span>{successTransfer.to}</span>
            </div>

            <div className="mt-4 text-sm text-slate-600">
              {successTransfer.items.length} SKUs ·{' '}
              {successTransfer.totalUnits} Units
            </div>
          </div>

          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setSuccessTransfer(null)
                setSelectedTransfer(successTransfer)
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              <Eye size={18} />
              View Transfer
            </button>

            <button
              type="button"
              onClick={() => {
                setSuccessTransfer(null)
                startNewTransfer()
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={18} />
              New Transfer
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (selectedTransfer) {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => setSelectedTransfer(null)}
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Back to Transfer History
            </button>

            <h1 className="text-2xl font-semibold text-slate-900">
              {selectedTransfer.id}
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              {selectedTransfer.dateTime}
            </p>
          </div>

          <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700">
            Completed
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              From
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {selectedTransfer.from}
            </p>
          </div>

          <div className="flex items-center justify-center rounded-xl border border-slate-200 bg-white p-5">
            <ArrowRight size={24} className="text-slate-400" />
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              To
            </p>
            <p className="mt-2 text-lg font-semibold text-slate-900">
              {selectedTransfer.to}
            </p>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              Transferred Items
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {selectedTransfer.items.length} SKUs ·{' '}
              {selectedTransfer.totalUnits} Units
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-[850px] w-full text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3">Product</th>
                  <th className="px-5 py-3">Variant</th>
                  <th className="px-5 py-3">Core SKU</th>
                  <th className="px-5 py-3">12-Digit SKU</th>
                  <th className="px-5 py-3 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {selectedTransfer.items.map((item) => (
                  <tr key={item.sku}>
                    <td className="px-5 py-4 font-medium text-slate-900">
                      {item.product}
                    </td>
                    <td className="px-5 py-4 text-slate-600">
                      {item.variant}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">
                      {item.coreSku}
                    </td>
                    <td className="px-5 py-4 font-mono text-slate-600">
                      {item.sku}
                    </td>
                    <td className="px-5 py-4 text-right font-semibold text-slate-900">
                      {item.quantity}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    )
  }

  if (showNewTransfer) {
    const displayedVariants = expandedCoreSku
      ? transferSkuData.filter(
          (item) => item.coreSku === expandedCoreSku,
        )
      : []

    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={resetTransfer}
              className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              <ArrowLeft size={17} />
              Back to Transfer History
            </button>

            <h1 className="text-2xl font-semibold text-slate-900">
              New Location Transfer
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Scan a Core SKU or 12-digit SKU, select variants, and approve the transfer.
            </p>
          </div>
        </div>

        {reviewing ? (
          <div className="space-y-5">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    From
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {fromLocation}
                  </p>
                </div>

                <ArrowRight size={24} className="text-slate-400" />

                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    To
                  </p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {toLocation}
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-4 py-3 text-right">
                  <p className="text-xs text-slate-500">Transfer</p>
                  <p className="font-semibold text-slate-900">
                    {selectedItems.length} SKUs · {totalUnits} Units
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-200 px-5 py-4">
                <h2 className="font-semibold text-slate-900">
                  Review Transfer
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Check the selected variants and quantities before approval.
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-[850px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-5 py-3">Product</th>
                      <th className="px-5 py-3">Variant</th>
                      <th className="px-5 py-3">SKU</th>
                      <th className="px-5 py-3 text-right">Available</th>
                      <th className="px-5 py-3 text-right">Transfer Qty</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedItems.map((item) => (
                      <tr key={item.sku}>
                        <td className="px-5 py-4 font-medium text-slate-900">
                          {item.product}
                        </td>
                        <td className="px-5 py-4 text-slate-600">
                          {item.variant}
                        </td>
                        <td className="px-5 py-4 font-mono text-slate-600">
                          {item.sku}
                        </td>
                        <td className="px-5 py-4 text-right text-slate-600">
                          {item.available}
                        </td>
                        <td className="px-5 py-4 text-right font-semibold text-slate-900">
                          {item.quantity}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setReviewing(false)}
                className="rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Revise
              </button>

              <button
                type="button"
                onClick={approveTransfer}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                <CheckCircle size={18} />
                Approve Transfer
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    From Location
                  </label>
                  <select
                    value={fromLocation}
                    onChange={(event) =>
                      updateDirection(
                        event.target.value as TransferLocation,
                      )
                    }
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
                  >
                    <option value="Warehouse">Warehouse</option>
                    <option value="Retail Store">Retail Store</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    To Location
                  </label>
                  <div className="flex h-[42px] items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-700">
                    {toLocation}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Barcode size={22} className="text-slate-700" />
                </div>
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Scan / Search SKU
                  </h2>
                  <p className="text-sm text-slate-500">
                    Scan a 12-digit SKU or enter a 6-digit Core SKU.
                  </p>
                </div>
              </div>

              <div className="relative mt-5">
                <MagnifyingGlass
                  size={19}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={scanQuery}
                  onChange={(event) => {
                    const value = event.target.value.trimStart()
                    setScanQuery(value)

                    if (value.length === 6) {
                      setExpandedCoreSku(value)
                    } else {
                      setExpandedCoreSku('')
                    }
                  }}
                  placeholder="Scan barcode or enter Core SKU / 12-digit SKU"
                  className="w-full rounded-lg border border-slate-300 py-3 pl-10 pr-3 text-sm outline-none focus:border-slate-500"
                  autoFocus
                />
              </div>

              {exactSkuMatch && (
                <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="font-semibold text-slate-900">
                        {exactSkuMatch.product}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        {exactSkuMatch.variant}
                      </p>
                      <p className="mt-1 font-mono text-xs text-slate-500">
                        {exactSkuMatch.sku}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="text-xs text-slate-500">
                        Available
                      </p>
                      <p className="font-semibold text-slate-900">
                        {exactSkuMatch.available}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => addSku(exactSkuMatch)}
                      disabled={exactSkuMatch.available <= 0}
                      className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {exactSkuMatch.available > 0
                        ? 'Select SKU'
                        : 'Out of Stock'}
                    </button>
                  </div>
                </div>
              )}

              {scanQuery.trim().length === 6 &&
                coreSkuMatches.length > 0 && (
                  <div className="mt-4 rounded-xl border border-slate-200 bg-white">
                    <div className="border-b border-slate-200 px-4 py-3">
                      <p className="font-semibold text-slate-900">
                        {coreSkuMatches[0].product}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Core SKU {coreSkuMatches[0].coreSku} · Select individual variants
                      </p>
                    </div>

                    <div className="divide-y divide-slate-100">
                      {displayedVariants.map((item) => {
                        const selected = selectedItems.find(
                          (selectedItem) =>
                            selectedItem.sku === item.sku,
                        )

                        return (
                          <div
                            key={item.sku}
                            className="flex flex-wrap items-center justify-between gap-4 px-4 py-4"
                          >
                            <div className="min-w-0">
                              <p className="font-medium text-slate-900">
                                {item.variant}
                              </p>
                              <p className="mt-1 font-mono text-xs text-slate-500">
                                {item.sku}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs text-slate-500">
                                Available
                              </p>
                              <p className="font-semibold text-slate-900">
                                {item.available}
                              </p>
                            </div>

                            <button
                              type="button"
                              onClick={() => addSku(item)}
                              disabled={
                                item.available <= 0 ||
                                Boolean(selected)
                              }
                              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                              {selected ? 'Selected' : item.available > 0 ? 'Select' : 'Out of Stock'}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}

              {scanQuery.trim() &&
                !exactSkuMatch &&
                scanQuery.trim().length !== 6 &&
                coreSkuMatches.length === 0 && (
                  <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
                    No matching SKU found.
                  </div>
                )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 px-5 py-4">
                <div>
                  <h2 className="font-semibold text-slate-900">
                    Selected Items
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Select individual 12-digit SKUs to transfer.
                  </p>
                </div>

                <div className="rounded-lg bg-slate-50 px-4 py-2 text-right">
                  <p className="text-xs text-slate-500">
                    Transfer
                  </p>
                  <p className="font-semibold text-slate-900">
                    {selectedItems.length} SKUs · {totalUnits} Units
                  </p>
                </div>
              </div>

              {selectedItems.length === 0 ? (
                <div className="px-5 py-12 text-center">
                  <Barcode
                    size={34}
                    className="mx-auto text-slate-300"
                  />
                  <p className="mt-3 font-medium text-slate-700">
                    No SKUs selected
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Scan a Core SKU or 12-digit SKU above to begin.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-[900px] w-full text-left text-sm">
                    <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                      <tr>
                        <th className="px-5 py-3">Product</th>
                        <th className="px-5 py-3">Variant</th>
                        <th className="px-5 py-3">SKU</th>
                        <th className="px-5 py-3 text-right">Available</th>
                        <th className="px-5 py-3 text-right">Quantity</th>
                        <th className="px-5 py-3 text-right">Action</th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-slate-100">
                      {selectedItems.map((item) => (
                        <tr key={item.sku}>
                          <td className="px-5 py-4 font-medium text-slate-900">
                            {item.product}
                          </td>
                          <td className="px-5 py-4 text-slate-600">
                            {item.variant}
                          </td>
                          <td className="px-5 py-4 font-mono text-xs text-slate-600">
                            {item.sku}
                          </td>
                          <td className="px-5 py-4 text-right text-slate-600">
                            {item.available}
                          </td>
                          <td className="px-5 py-4 text-right">
                            <input
                              type="number"
                              min={1}
                              max={item.available}
                              value={item.quantity}
                              onChange={(event) =>
                                updateQuantity(
                                  item.sku,
                                  Number(event.target.value),
                                )
                              }
                              className="w-20 rounded-lg border border-slate-300 px-2 py-1.5 text-right text-sm"
                            />
                          </td>
                          <td className="px-5 py-4 text-right">
                            <button
                              type="button"
                              onClick={() => removeSku(item.sku)}
                              className="text-sm font-medium text-red-600 hover:text-red-700"
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={reviewTransfer}
                disabled={selectedItems.length === 0}
                className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Review Transfer
                <ArrowRight size={18} />
              </button>
            </div>
          </>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            Location Transfer
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Transfer stock between Warehouse and Retail Store.
          </p>
        </div>

        <button
          type="button"
          onClick={startNewTransfer}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          New Transfer
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total Transfers
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {transfers.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Warehouse → Retail
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {
              transfers.filter(
                (item) =>
                  item.from === 'Warehouse' &&
                  item.to === 'Retail Store',
              ).length
            }
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Retail → Warehouse
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {
              transfers.filter(
                (item) =>
                  item.from === 'Retail Store' &&
                  item.to === 'Warehouse',
              ).length
            }
          </p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative min-w-[260px] flex-1">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search transfer ID, product or SKU"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <select
            value={directionFilter}
            onChange={(event) =>
              setDirectionFilter(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option value="All">All Directions</option>
            <option value="Warehouse → Retail Store">
              Warehouse → Retail Store
            </option>
            <option value="Retail Store → Warehouse">
              Retail Store → Warehouse
            </option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[950px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">Transfer ID</th>
                <th className="px-5 py-3">Date &amp; Time</th>
                <th className="px-5 py-3">From</th>
                <th className="px-5 py-3">To</th>
                <th className="px-5 py-3 text-center">SKUs</th>
                <th className="px-5 py-3 text-center">Units</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.map((transfer) => (
                <tr
                  key={transfer.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {transfer.id}
                  </td>
                  <td className="px-5 py-4 text-slate-600">
                    {transfer.dateTime}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {transfer.from}
                  </td>
                  <td className="px-5 py-4 text-slate-700">
                    {transfer.to}
                  </td>
                  <td className="px-5 py-4 text-center font-medium text-slate-700">
                    {transfer.items.length}
                  </td>
                  <td className="px-5 py-4 text-center font-medium text-slate-700">
                    {transfer.totalUnits}
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      Completed
                    </span>
                  </td>
                  <td className="px-5 py-4 text-center">
                    <button
                      type="button"
                      onClick={() => openExistingTransfer(transfer)}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredTransfers.length === 0 && (
                <tr>
                  <td
                    colSpan={8}
                    className="px-5 py-12 text-center"
                  >
                    <p className="font-medium text-slate-700">
                      No transfers found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}



function Gstr1Page() {
  type HsnSummary = {
    hsn: string
    description: string
    totalSale: number
    taxableValue: number
    gstAmount: number
    quantity: number
  }

  type GstRateSummary = {
    rate: number
    taxableValue: number
    cgst: number
    sgst: number
    igst: number
    totalGst: number
  }

  type Gstr1MonthData = {
    invoiceFrom: string
    invoiceTo: string
    invoiceCount: number
    totalProductQty: number
    totalTaxableValue: number
    totalInvoiceValue: number
    totalGst: number
    hsnSummary: HsnSummary[]
    gstSummary: GstRateSummary[]
  }

  const monthNames = [
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
    'January',
    'February',
    'March',
  ]

  const monthKeys = [
    '2026-04',
    '2026-05',
    '2026-06',
    '2026-07',
    '2026-08',
    '2026-09',
    '2026-10',
    '2026-11',
    '2026-12',
    '2027-01',
    '2027-02',
    '2027-03',
  ]

  const [selectedMonth, setSelectedMonth] = useState('2026-09')
  const [generated, setGenerated] = useState(true)
  const [selectedHsn, setSelectedHsn] = useState<HsnSummary | null>(null)

  const formatMoney = (value: number) =>
    `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const demoData: Record<string, Gstr1MonthData> = {
    '2026-09': {
      invoiceFrom: 'TZN-00318-26-27',
      invoiceTo: 'TZN-00322-26-27',
      invoiceCount: 5,
      totalProductQty: 7,
      totalTaxableValue: 8348,
      totalInvoiceValue: 9850.64,
      totalGst: 1502.64,
      hsnSummary: [
        {
          hsn: '6204',
          description: "Women's Garments",
          totalSale: 4700,
          taxableValue: 4476.19,
          gstAmount: 223.81,
          quantity: 3,
        },
        {
          hsn: '6104',
          description: 'Knitted Garments',
          totalSale: 2860,
          taxableValue: 2723.81,
          gstAmount: 136.19,
          quantity: 2,
        },
        {
          hsn: '6211',
          description: 'Other Apparel',
          totalSale: 1590,
          taxableValue: 1419.64,
          gstAmount: 170.36,
          quantity: 1,
        },
        {
          hsn: '6307',
          description: 'Other Made-up Textile Articles',
          totalSale: 700.64,
          taxableValue: 628.36,
          gstAmount: 72.28,
          quantity: 1,
        },
      ],
      gstSummary: [
        {
          rate: 5,
          taxableValue: 7200,
          cgst: 180,
          sgst: 180,
          igst: 0,
          totalGst: 360,
        },
        {
          rate: 12,
          taxableValue: 1419.64,
          cgst: 85.18,
          sgst: 85.18,
          igst: 0,
          totalGst: 170.36,
        },
        {
          rate: 18,
          taxableValue: 628.36,
          cgst: 56.55,
          sgst: 56.55,
          igst: 0,
          totalGst: 113.1,
        },
      ],
    },
  }

  const data = demoData[selectedMonth]

  const currentIndex = monthKeys.indexOf(selectedMonth)

  const moveMonth = (direction: number) => {
    const nextIndex = Math.max(
      0,
      Math.min(monthKeys.length - 1, currentIndex + direction),
    )

    const nextMonth = monthKeys[nextIndex]
    setSelectedMonth(nextMonth)
    setGenerated(Boolean(demoData[nextMonth]))
    setSelectedHsn(null)
  }

  const monthLabel = (() => {
    const index = monthKeys.indexOf(selectedMonth)
    if (index === -1) return selectedMonth

    const year = selectedMonth.slice(0, 4)
    return `${monthNames[index]} ${year}`
  })()

  const exportCsv = () => {
    if (!data) return

    const rows = [
      [
        'HSN Code',
        'Category',
        'Total Sale',
        'Taxable Value',
        'GST Amount',
        'Product Quantity',
      ],
      ...data.hsnSummary.map((item) => [
        item.hsn,
        item.description,
        item.totalSale.toFixed(2),
        item.taxableValue.toFixed(2),
        item.gstAmount.toFixed(2),
        item.quantity.toString(),
      ]),
    ]

    const csv = rows
      .map((row) =>
        row
          .map((cell) => `"${String(cell).replace(/"/g, '""')}"`)
          .join(','),
      )
      .join('\n')

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = `GSTR-1-${selectedMonth}.csv`
    anchor.click()
    URL.revokeObjectURL(url)
  }

  const exportPdf = () => {
    window.print()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          GSTR-1
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Monthly GST sales summary and HSN-wise outward supply register.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Financial Year
                </label>
                <select
                  className="h-10 min-w-[170px] rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary-500"
                  defaultValue="2026-27"
                >
                  <option>2026-27</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reporting Month
                </label>
                <select
                  value={selectedMonth}
                  onChange={(event) => {
                    setSelectedMonth(event.target.value)
                    setGenerated(Boolean(demoData[event.target.value]))
                    setSelectedHsn(null)
                  }}
                  className="h-10 min-w-[190px] rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 outline-none focus:border-primary-500"
                >
                  {monthKeys.map((key, index) => (
                    <option key={key} value={key}>
                      {monthNames[index]} {key.slice(0, 4)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => moveMonth(-1)}
                disabled={currentIndex <= 0}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <ArrowLeft size={16} />
                Previous
              </button>

              <button
                type="button"
                onClick={() => moveMonth(1)}
                disabled={currentIndex >= monthKeys.length - 1}
                className="inline-flex h-10 items-center gap-2 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <ArrowRight size={16} />
              </button>

              <button
                type="button"
                onClick={() => setGenerated(Boolean(demoData[selectedMonth]))}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Generate Data
              </button>
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
            <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Reporting Period
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {monthLabel}
                </p>
              </div>

              <span
                className={`inline-flex w-fit items-center rounded-full px-3 py-1 text-xs font-semibold ${
                  generated && data
                    ? 'bg-emerald-50 text-emerald-700'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {generated && data ? 'Data Generated' : 'Not Generated'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {!generated || !data ? (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex min-h-[300px] flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
              <span className="text-lg font-semibold text-slate-500">GST</span>
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              No GSTR-1 data generated
            </h3>
            <p className="mt-1 max-w-md text-sm text-slate-500">
              Select a reporting month and generate the monthly GSTR-1 dataset.
            </p>
            <div className="mt-5">
              <button
                type="button"
                onClick={() => setGenerated(Boolean(demoData[selectedMonth]))}
                className="inline-flex h-10 items-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                Generate Data
              </button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Invoice Number
              </p>
              <div className="mt-3">
                <p className="text-sm font-semibold text-slate-900">
                  {data.invoiceFrom}
                </p>
                <p className="my-1 text-xs text-slate-400">to</p>
                <p className="text-sm font-semibold text-slate-900">
                  {data.invoiceTo}
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total No. of Invoice
              </p>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {data.invoiceCount}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Product Qty
              </p>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {data.totalProductQty}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Total Taxable Value
              </p>
              <p className="mt-4 text-2xl font-bold text-slate-900">
                {formatMoney(data.totalTaxableValue)}
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  HSN Code-wise Summary
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Monthly outward sales grouped by HSN code.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={exportCsv}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Export CSV
                </button>
                <button
                  type="button"
                  onClick={exportPdf}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  Export PDF
                </button>
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[900px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">HSN Code</th>
                    <th className="px-4 py-3 font-semibold">Category</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Total Sale
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Taxable Value
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      GST Amount
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Product Qty
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.hsnSummary.map((item) => (
                    <tr
                      key={item.hsn}
                      className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {item.hsn}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {item.description}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-900">
                        {formatMoney(item.totalSale)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatMoney(item.taxableValue)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatMoney(item.gstAmount)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {item.quantity}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedHsn(item)}
                          className="inline-flex h-8 items-center rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  <tr className="bg-slate-50 font-semibold">
                    <td className="px-4 py-3 text-slate-900" colSpan={2}>
                      Total
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {formatMoney(
                        data.hsnSummary.reduce(
                          (sum, item) => sum + item.totalSale,
                          0,
                        ),
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {formatMoney(
                        data.hsnSummary.reduce(
                          (sum, item) => sum + item.taxableValue,
                          0,
                        ),
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {formatMoney(
                        data.hsnSummary.reduce(
                          (sum, item) => sum + item.gstAmount,
                          0,
                        ),
                      )}
                    </td>
                    <td className="px-4 py-3 text-right text-slate-900">
                      {data.hsnSummary.reduce(
                        (sum, item) => sum + item.quantity,
                        0,
                      )}
                    </td>
                    <td />
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="border-b border-slate-200 pb-4">
              <h2 className="text-base font-semibold text-slate-900">
                GST Summary
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                GST rate-wise breakup for the selected month.
              </p>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full min-w-[800px] text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
                    <th className="px-4 py-3 font-semibold">GST Rate</th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Taxable Value
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      CGST
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      SGST
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      IGST
                    </th>
                    <th className="px-4 py-3 text-right font-semibold">
                      Total GST
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {data.gstSummary.map((item) => (
                    <tr
                      key={item.rate}
                      className="border-b border-slate-100 last:border-0"
                    >
                      <td className="px-4 py-3 font-semibold text-slate-900">
                        {item.rate}%
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatMoney(item.taxableValue)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatMoney(item.cgst)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatMoney(item.sgst)}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-700">
                        {formatMoney(item.igst)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-900">
                        {formatMoney(item.totalGst)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 border-t border-slate-200 pt-5 sm:grid-cols-2 xl:grid-cols-4">
              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Taxable Value
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {formatMoney(data.totalTaxableValue)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total GST
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {formatMoney(data.totalGst)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Total Invoice Value
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {formatMoney(data.totalInvoiceValue)}
                </p>
              </div>

              <div className="rounded-lg bg-slate-50 p-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  CGST + SGST
                </p>
                <p className="mt-2 text-lg font-bold text-slate-900">
                  {formatMoney(
                    data.gstSummary.reduce(
                      (sum, item) => sum + item.cgst + item.sgst,
                      0,
                    ),
                  )}
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {selectedHsn && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                HSN Detail
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {selectedHsn.hsn} — {selectedHsn.description}
              </h2>
            </div>

            <button
              type="button"
              onClick={() => setSelectedHsn(null)}
              className="inline-flex h-9 items-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Total Sale</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(selectedHsn.totalSale)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Taxable Value</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(selectedHsn.taxableValue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">GST Amount</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(selectedHsn.gstAmount)}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500">Product Quantity</p>
              <p className="mt-1 font-semibold text-slate-900">
                {selectedHsn.quantity}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


function GstCreditPage() {
  type CreditSource = 'Product Purchase' | 'Other Purchase'

  type GstCredit = {
    id: string
    date: string
    source: CreditSource
    purchaseFrom: string
    invoiceNo: string
    billAmount: number
    taxableValue: number
    gstRate: number
    gstAmount: number
    finalPayable: number
    attachment: string
    notes: string
    status: 'Added' | 'Generated'
  }

  const [credits, setCredits] = useState<GstCredit[]>([
    {
      id: 'GSTC-000001',
      date: '20 Sep 2026',
      source: 'Product Purchase',
      purchaseFrom: 'Sweety Fashion Pvt. Ltd.',
      invoiceNo: 'PI-125',
      billAmount: 52500,
      taxableValue: 50000,
      gstRate: 5,
      gstAmount: 2500,
      finalPayable: 52500,
      attachment: 'PI-125.pdf',
      notes: 'Product purchase GST credit generated from Purchase Invoice.',
      status: 'Generated',
    },
    {
      id: 'GSTC-000002',
      date: '18 Sep 2026',
      source: 'Other Purchase',
      purchaseFrom: 'ABC Computers',
      invoiceNo: 'ABC/INV/4582',
      billAmount: 23600,
      taxableValue: 20000,
      gstRate: 18,
      gstAmount: 3600,
      finalPayable: 23600,
      attachment: 'ABC-4582.pdf',
      notes: 'POS printer purchase.',
      status: 'Added',
    },
    {
      id: 'GSTC-000003',
      date: '15 Sep 2026',
      source: 'Other Purchase',
      purchaseFrom: 'Print World',
      invoiceNo: 'PW-882',
      billAmount: 11800,
      taxableValue: 10000,
      gstRate: 18,
      gstAmount: 1800,
      finalPayable: 11800,
      attachment: 'PW-882.jpg',
      notes: 'Office printing equipment.',
      status: 'Added',
    },
  ])

  const [search, setSearch] = useState('')
  const [month, setMonth] = useState('2026-09')
  const [sourceFilter, setSourceFilter] = useState<'All' | CreditSource>('All')
  const [gstFilter, setGstFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [selectedCredit, setSelectedCredit] = useState<GstCredit | null>(null)

  const [purchaseFrom, setPurchaseFrom] = useState('')
  const [invoiceNo, setInvoiceNo] = useState('')
  const [billDate, setBillDate] = useState('2026-09-20')
  const [billAmount, setBillAmount] = useState('')
  const [gstRate, setGstRate] = useState('18')
  const [attachment, setAttachment] = useState('')
  const [notes, setNotes] = useState('')

  const formatMoney = (value: number) =>
    `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  const parsedBillAmount = Number(billAmount) || 0
  const parsedGstRate = Number(gstRate) || 0
  const taxableValue =
    parsedBillAmount > 0 && parsedGstRate > 0
      ? parsedBillAmount / (1 + parsedGstRate / 100)
      : parsedBillAmount
  const gstAmount = parsedBillAmount - taxableValue

  const filteredCredits = credits.filter((item) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      item.id.toLowerCase().includes(query) ||
      item.purchaseFrom.toLowerCase().includes(query) ||
      item.invoiceNo.toLowerCase().includes(query)

    const matchesSource =
      sourceFilter === 'All' || item.source === sourceFilter

    const matchesGst =
      gstFilter === 'All' || item.gstRate === Number(gstFilter)

    return matchesSearch && matchesSource && matchesGst
  })

  const totalCredit = filteredCredits.reduce(
    (sum, item) => sum + item.gstAmount,
    0,
  )

  const productPurchaseCredit = filteredCredits
    .filter((item) => item.source === 'Product Purchase')
    .reduce((sum, item) => sum + item.gstAmount, 0)

  const otherPurchaseCredit = filteredCredits
    .filter((item) => item.source === 'Other Purchase')
    .reduce((sum, item) => sum + item.gstAmount, 0)

  const resetForm = () => {
    setPurchaseFrom('')
    setInvoiceNo('')
    setBillDate('2026-09-20')
    setBillAmount('')
    setGstRate('18')
    setAttachment('')
    setNotes('')
  }

  const saveCredit = () => {
    if (!purchaseFrom.trim() || !invoiceNo.trim() || parsedBillAmount <= 0) {
      return
    }

    const id = `GSTC-${String(credits.length + 1).padStart(6, '0')}`

    const newCredit: GstCredit = {
      id,
      date: new Date(`${billDate}T00:00:00`).toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      }),
      source: 'Other Purchase',
      purchaseFrom: purchaseFrom.trim(),
      invoiceNo: invoiceNo.trim(),
      billAmount: parsedBillAmount,
      taxableValue,
      gstRate: parsedGstRate,
      gstAmount,
      finalPayable: parsedBillAmount,
      attachment: attachment || 'No attachment',
      notes: notes.trim(),
      status: 'Added',
    }

    setCredits((current) => [newCredit, ...current])
    setSelectedCredit(newCredit)
    setShowForm(false)
    resetForm()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          GST Credit
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Track GST paid on product purchases and other eligible business bills.
        </p>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Month
              </label>
              <input
                type="month"
                value={month}
                onChange={(event) => setMonth(event.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Source
              </label>
              <select
                value={sourceFilter}
                onChange={(event) =>
                  setSourceFilter(event.target.value as 'All' | CreditSource)
                }
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              >
                <option>All</option>
                <option>Product Purchase</option>
                <option>Other Purchase</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                GST Rate
              </label>
              <select
                value={gstFilter}
                onChange={(event) => setGstFilter(event.target.value)}
                className="h-10 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400"
              >
                <option value="All">All</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlass
                  size={16}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Invoice / supplier"
                  className="h-10 w-full rounded-md border border-slate-200 bg-white pl-9 pr-3 text-sm text-slate-700 outline-none focus:border-slate-400"
                />
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => {
              setShowForm(true)
              setSelectedCredit(null)
            }}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-slate-900 px-4 text-sm font-semibold text-white transition hover:bg-slate-800"
          >
            <Plus size={17} />
            Add GST Credit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Total GST Credit', totalCredit],
          ['Product Purchase GST', productPurchaseCredit],
          ['Other Purchase GST', otherPurchaseCredit],
          ['Total Bills', filteredCredits.length],
        ].map(([label, value]) => (
          <div
            key={String(label)}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              {label}
            </p>
            <p className="mt-3 text-2xl font-bold text-slate-900">
              {label === 'Total Bills'
                ? String(value)
                : formatMoney(Number(value))}
            </p>
          </div>
        ))}
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between border-b border-slate-200 pb-4">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Add GST Credit
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Add GST paid on a purchase or business bill other than core
                product purchases.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              className="rounded-md p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={18} />
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Purchase From *
              </label>
              <input
                value={purchaseFrom}
                onChange={(event) => setPurchaseFrom(event.target.value)}
                placeholder="Supplier / vendor name"
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Invoice No. *
              </label>
              <input
                value={invoiceNo}
                onChange={(event) => setInvoiceNo(event.target.value)}
                placeholder="Bill / invoice number"
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Bill Date *
              </label>
              <input
                type="date"
                value={billDate}
                onChange={(event) => setBillDate(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Bill Amount *
              </label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={billAmount}
                onChange={(event) => setBillAmount(event.target.value)}
                placeholder="0.00"
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Bill Amount Includes GST
              </label>
              <select
                defaultValue="Yes"
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              >
                <option>Yes</option>
                <option>No</option>
              </select>
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                GST Rate *
              </label>
              <select
                value={gstRate}
                onChange={(event) => setGstRate(event.target.value)}
                className="h-10 w-full rounded-md border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Taxable Value</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(taxableValue)}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">GST Amount / Credit</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(gstAmount)}
              </p>
            </div>

            <div className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs text-slate-500">Final Payable Amount</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(parsedBillAmount)}
              </p>
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Invoice / Bill
              </label>
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg"
                onChange={(event) =>
                  setAttachment(event.target.files?.[0]?.name ?? '')
                }
                className="block w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-slate-100 file:px-3 file:py-1.5 file:text-xs file:font-semibold"
              />
              <p className="mt-1 text-xs text-slate-400">
                PDF, JPG or JPEG
              </p>
            </div>

            <div className="md:col-span-2 xl:col-span-3">
              <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Optional note"
                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm outline-none focus:border-slate-400"
              />
            </div>
          </div>

          <div className="mt-5 flex justify-end gap-2 border-t border-slate-200 pt-4">
            <button
              type="button"
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              className="h-10 rounded-md border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveCredit}
              disabled={
                !purchaseFrom.trim() ||
                !invoiceNo.trim() ||
                parsedBillAmount <= 0
              }
              className="h-10 rounded-md bg-slate-900 px-5 text-sm font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save GST Credit
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            GST Credit Register
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Product purchase GST is represented from Purchase Invoices. Other
            business bills are added separately.
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1200px] text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Source</th>
                <th className="px-5 py-3 font-semibold">Purchase From</th>
                <th className="px-5 py-3 font-semibold">Invoice No.</th>
                <th className="px-5 py-3 text-right font-semibold">
                  Bill Amount
                </th>
                <th className="px-5 py-3 text-right font-semibold">GST %</th>
                <th className="px-5 py-3 text-right font-semibold">
                  GST Credit
                </th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredCredits.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50"
                >
                  <td className="px-5 py-3 text-slate-600">{item.date}</td>
                  <td className="px-5 py-3">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        item.source === 'Product Purchase'
                          ? 'bg-blue-50 text-blue-700'
                          : 'bg-amber-50 text-amber-700'
                      }`}
                    >
                      {item.source}
                    </span>
                  </td>
                  <td className="px-5 py-3 font-medium text-slate-900">
                    {item.purchaseFrom}
                  </td>
                  <td className="px-5 py-3 text-slate-700">
                    {item.invoiceNo}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">
                    {formatMoney(item.billAmount)}
                  </td>
                  <td className="px-5 py-3 text-right text-slate-700">
                    {item.gstRate}%
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900">
                    {formatMoney(item.gstAmount)}
                  </td>
                  <td className="px-5 py-3">
                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedCredit(item)}
                      className="inline-flex h-8 items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Eye size={15} />
                      View
                    </button>
                  </td>
                </tr>
              ))}

              {filteredCredits.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center">
                    <p className="font-medium text-slate-700">
                      No GST credit records found
                    </p>
                    <p className="mt-1 text-sm text-slate-400">
                      Try changing the filters or add a GST credit.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedCredit && (
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-200 pb-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                GST Credit Detail
              </p>
              <h2 className="mt-1 text-lg font-semibold text-slate-900">
                {selectedCredit.invoiceNo}
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Reference {selectedCredit.id}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setSelectedCredit(null)}
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Close
            </button>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-slate-500">Purchase From</p>
              <p className="mt-1 font-semibold text-slate-900">
                {selectedCredit.purchaseFrom}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Bill Date</p>
              <p className="mt-1 font-semibold text-slate-900">
                {selectedCredit.date}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Source</p>
              <p className="mt-1 font-semibold text-slate-900">
                {selectedCredit.source}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">GST Rate</p>
              <p className="mt-1 font-semibold text-slate-900">
                {selectedCredit.gstRate}%
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Bill Amount</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(selectedCredit.billAmount)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Taxable Value</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(selectedCredit.taxableValue)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">GST Credit</p>
              <p className="mt-1 font-semibold text-emerald-700">
                {formatMoney(selectedCredit.gstAmount)}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">Final Payable</p>
              <p className="mt-1 font-semibold text-slate-900">
                {formatMoney(selectedCredit.finalPayable)}
              </p>
            </div>
          </div>

          <div className="mt-5 grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Invoice / Bill
              </p>
              <p className="mt-2 text-sm font-medium text-slate-900">
                {selectedCredit.attachment}
              </p>
              <button
                type="button"
                className="mt-3 inline-flex h-9 items-center gap-2 rounded-md border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <Eye size={16} />
                View Invoice
              </button>
            </div>

            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Notes
              </p>
              <p className="mt-2 text-sm text-slate-600">
                {selectedCredit.notes || 'No notes added.'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function GstManagementPage() {
  type GstStatus = 'Active' | 'Inactive'

  type GstRule = {
    id: string
    hsnCode: string
    category: string
    gstRate: number
    status: GstStatus
  }

  const initialGstRules: GstRule[] = [
    {
      id: 'GST-001',
      hsnCode: '6204',
      category: "Women's Garments",
      gstRate: 5,
      status: 'Active',
    },
    {
      id: 'GST-002',
      hsnCode: '6104',
      category: 'Knitted Garments',
      gstRate: 5,
      status: 'Active',
    },
    {
      id: 'GST-003',
      hsnCode: '6211',
      category: 'Other Apparel',
      gstRate: 12,
      status: 'Active',
    },
    {
      id: 'GST-004',
      hsnCode: '6307',
      category: 'Other Made-up Textile Articles',
      gstRate: 18,
      status: 'Active',
    },
  ]

  const [rules, setRules] = useState<GstRule[]>(initialGstRules)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [showForm, setShowForm] = useState(false)
  const [editingRule, setEditingRule] = useState<GstRule | null>(null)
  const [viewingRule, setViewingRule] = useState<GstRule | null>(null)
  const [deleteRule, setDeleteRule] = useState<GstRule | null>(null)

  const [hsnCode, setHsnCode] = useState('')
  const [category, setCategory] = useState('')
  const [gstRate, setGstRate] = useState('5')
  const [status, setStatus] = useState<GstStatus>('Active')

  const filteredRules = rules.filter((rule) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      rule.hsnCode.toLowerCase().includes(query) ||
      rule.category.toLowerCase().includes(query)

    const matchesStatus =
      statusFilter === 'All' || rule.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const resetForm = () => {
    setHsnCode('')
    setCategory('')
    setGstRate('5')
    setStatus('Active')
    setEditingRule(null)
  }

  const openAddForm = () => {
    resetForm()
    setShowForm(true)
  }

  const openEditForm = (rule: GstRule) => {
    setEditingRule(rule)
    setHsnCode(rule.hsnCode)
    setCategory(rule.category)
    setGstRate(String(rule.gstRate))
    setStatus(rule.status)
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
    resetForm()
  }

  const saveRule = () => {
    const cleanHsn = hsnCode.trim()
    const cleanCategory = category.trim()

    if (!cleanHsn || !cleanCategory || !gstRate) {
      return
    }

    const numericRate = Number(gstRate)

    if (editingRule) {
      setRules((current) =>
        current.map((rule) =>
          rule.id === editingRule.id
            ? {
                ...rule,
                hsnCode: cleanHsn,
                category: cleanCategory,
                gstRate: numericRate,
                status,
              }
            : rule,
        ),
      )
    } else {
      const nextNumber =
        rules.reduce((max, rule) => {
          const number = Number(
            rule.id.replace('GST-', ''),
          )
          return Number.isFinite(number)
            ? Math.max(max, number)
            : max
        }, 0) + 1

      setRules((current) => [
        {
          id: `GST-${String(nextNumber).padStart(3, '0')}`,
          hsnCode: cleanHsn,
          category: cleanCategory,
          gstRate: numericRate,
          status,
        },
        ...current,
      ])
    }

    closeForm()
  }

  const confirmDelete = () => {
    if (!deleteRule) {
      return
    }

    setRules((current) =>
      current.filter((rule) => rule.id !== deleteRule.id),
    )
    setDeleteRule(null)
  }

  if (viewingRule) {
    return (
      <div className="space-y-6">
        <div>
          <button
            type="button"
            onClick={() => setViewingRule(null)}
            className="mb-2 inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900"
          >
            <ArrowLeft size={17} />
            Back to GST Management
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                GST Rule
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                HSN and GST rate configuration details.
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                setViewingRule(null)
                openEditForm(viewingRule)
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <PencilSimple size={17} />
              Update
            </button>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              HSN Code
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {viewingRule.hsnCode}
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              GST Rate
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {viewingRule.gstRate}%
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Status
            </p>
            <span
              className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                viewingRule.status === 'Active'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-slate-100 text-slate-600'
              }`}
            >
              {viewingRule.status}
            </span>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-4">
            <h2 className="font-semibold text-slate-900">
              GST Classification
            </h2>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">
            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                HSN Code
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {viewingRule.hsnCode}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Category of HSN
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {viewingRule.category}
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                GST Slab
              </p>
              <p className="mt-1 text-sm font-medium text-slate-900">
                {viewingRule.gstRate}%
              </p>
            </div>

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                Rule ID
              </p>
              <p className="mt-1 font-mono text-sm font-medium text-slate-900">
                {viewingRule.id}
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">
            GST Management
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage HSN classifications and GST slab mappings.
          </p>
        </div>

        <button
          type="button"
          onClick={openAddForm}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
        >
          <Plus size={18} />
          Add GST Rule
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total GST Rules
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {rules.length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Active Rules
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {rules.filter((rule) => rule.status === 'Active').length}
          </p>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            GST Slabs Used
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {new Set(rules.map((rule) => rule.gstRate)).size}
          </p>
        </div>
      </div>

      {showForm && (
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
            <div>
              <h2 className="font-semibold text-slate-900">
                {editingRule ? 'Update GST Rule' : 'Add GST Rule'}
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Configure the HSN classification and applicable GST slab.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            >
              <X size={19} />
            </button>
          </div>

          <div className="grid gap-5 p-5 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                HSN Code <span className="text-red-500">*</span>
              </label>
              <input
                value={hsnCode}
                onChange={(event) => setHsnCode(event.target.value)}
                placeholder="Enter HSN code"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Category of HSN <span className="text-red-500">*</span>
              </label>
              <input
                value={category}
                onChange={(event) => setCategory(event.target.value)}
                placeholder="Enter HSN category"
                className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                GST Slab <span className="text-red-500">*</span>
              </label>
              <select
                value={gstRate}
                onChange={(event) => setGstRate(event.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
              >
                <option value="0">0%</option>
                <option value="5">5%</option>
                <option value="12">12%</option>
                <option value="18">18%</option>
                <option value="28">28%</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Status
              </label>
              <select
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as GstStatus)
                }
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-500"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={saveRule}
              disabled={!hsnCode.trim() || !category.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <FloppyDisk size={18} />
              {editingRule ? 'Update GST Rule' : 'Save GST Rule'}
            </button>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-3 border-b border-slate-200 p-4">
          <div className="relative min-w-[280px] flex-1">
            <MagnifyingGlass
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search HSN code or category"
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none focus:border-slate-500"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none"
          >
            <option value="All">All Status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-[800px] w-full text-left text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-5 py-3">HSN Code</th>
                <th className="px-5 py-3">Category of HSN</th>
                <th className="px-5 py-3">GST %</th>
                <th className="px-5 py-3">Status</th>
                <th className="px-5 py-3 text-center">Action</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100">
              {filteredRules.map((rule) => (
                <tr
                  key={rule.id}
                  className="hover:bg-slate-50"
                >
                  <td className="px-5 py-4 font-mono font-semibold text-slate-900">
                    {rule.hsnCode}
                  </td>

                  <td className="px-5 py-4 font-medium text-slate-700">
                    {rule.category}
                  </td>

                  <td className="px-5 py-4 font-semibold text-slate-900">
                    {rule.gstRate}%
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        rule.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rule.status}
                    </span>
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewingRule(rule)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <Eye size={15} />
                        View
                      </button>

                      <button
                        type="button"
                        onClick={() => openEditForm(rule)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                      >
                        <PencilSimple size={15} />
                        Update
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeleteRule(rule)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-red-200 bg-white px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <Trash size={15} />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredRules.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-5 py-12 text-center"
                  >
                    <p className="font-medium text-slate-700">
                      No GST rules found
                    </p>
                    <p className="mt-1 text-sm text-slate-500">
                      Try changing your search or status filter.
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteRule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white shadow-xl">
            <div className="p-6">
              <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
                <Trash size={21} className="text-red-600" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-900">
                Delete GST Rule?
              </h2>

              <p className="mt-2 text-sm leading-6 text-slate-500">
                This will remove the rule from the current GST Management list.
              </p>

              <div className="mt-4 rounded-lg bg-slate-50 p-4 text-sm">
                <p className="font-semibold text-slate-900">
                  HSN: {deleteRule.hsnCode}
                </p>
                <p className="mt-1 text-slate-600">
                  {deleteRule.category}
                </p>
                <p className="mt-1 text-slate-600">
                  GST: {deleteRule.gstRate}%
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={() => setDeleteRule(null)}
                className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={confirmDelete}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function PurchaseInvoicesPage() {
  const [invoices, setInvoices] = useState<PurchaseInvoice[]>(
    initialPurchaseInvoices,
  )
  const [showForm, setShowForm] = useState(false)
  const [search, setSearch] = useState('')
  const [supplierFilter, setSupplierFilter] = useState('All')
  const [stateFilter, setStateFilter] = useState('All')
  const [dateFilter, setDateFilter] = useState('')

  const [supplierSearch, setSupplierSearch] = useState('')
  const [selectedSupplier, setSelectedSupplier] =
    useState<Supplier | null>(null)
  const [invoiceNo, setInvoiceNo] = useState('')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [location, setLocation] = useState(purchaseLocations[0])
  const [itemCount, setItemCount] = useState('')
  const [taxableValue, setTaxableValue] = useState('')
  const [gstRate, setGstRate] = useState('5')
  const [invoiceFile, setInvoiceFile] = useState<File | null>(null)
  const [formError, setFormError] = useState('')

  const suppliers = initialSuppliers

  const gstAmount =
    taxableValue && Number.isFinite(Number(taxableValue))
      ? (Number(taxableValue) * Number(gstRate || 0)) / 100
      : 0

  const finalValue =
    taxableValue && Number.isFinite(Number(taxableValue))
      ? Number(taxableValue) + gstAmount
      : 0

  const resetForm = () => {
    setSupplierSearch('')
    setSelectedSupplier(null)
    setInvoiceNo('')
    setPurchaseDate('')
    setLocation(purchaseLocations[0])
    setItemCount('')
    setTaxableValue('')
    setGstRate('5')
    setInvoiceFile(null)
    setFormError('')
  }

  const closeForm = () => {
    resetForm()
    setShowForm(false)
  }

  const savePurchase = (event: React.FormEvent) => {
    event.preventDefault()
    setFormError('')

    if (!selectedSupplier) {
      setFormError('Please select a supplier.')
      return
    }

    if (!invoiceNo.trim()) {
      setFormError('Invoice number is required.')
      return
    }

    if (!purchaseDate) {
      setFormError('Purchase date is required.')
      return
    }

    if (!itemCount || Number(itemCount) <= 0) {
      setFormError('No. of items is required.')
      return
    }

    if (!taxableValue || Number(taxableValue) <= 0) {
      setFormError('Taxable value is required.')
      return
    }

    if (!invoiceFile) {
      setFormError('Invoice upload is mandatory.')
      return
    }

    const formattedDate = new Date(
      `${purchaseDate}T00:00:00`,
    ).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })

    const newInvoice: PurchaseInvoice = {
      id: `purchase-${Date.now()}`,
      invoiceNo: invoiceNo.trim(),
      supplier: selectedSupplier.name,
      supplierState:
        selectedSupplier.addresses[0]?.state || '—',
      purchaseDate: formattedDate,
      items: Number(itemCount),
      taxableValue: Number(taxableValue),
      gstRate: Number(gstRate),
      gstAmount,
      finalValue,
      location,
      documentName: invoiceFile.name,
    }

    setInvoices((current) => [newInvoice, ...current])
    closeForm()
  }

  const filteredSuppliers = suppliers.filter((supplier) => {
    const query = supplierSearch.trim().toLowerCase()

    if (!query) return true

    return (
      supplier.name.toLowerCase().includes(query) ||
      supplier.code.toLowerCase().includes(query) ||
      supplier.gstin.toLowerCase().includes(query)
    )
  })

  const supplierNames = Array.from(
    new Set(invoices.map((invoice) => invoice.supplier)),
  )

  const supplierStates = Array.from(
    new Set(invoices.map((invoice) => invoice.supplierState)),
  )

  const filteredInvoices = invoices.filter((invoice) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      invoice.invoiceNo.toLowerCase().includes(query) ||
      invoice.supplier.toLowerCase().includes(query)

    const matchesSupplier =
      supplierFilter === 'All' ||
      invoice.supplier === supplierFilter

    const matchesState =
      stateFilter === 'All' ||
      invoice.supplierState === stateFilter

    const matchesDate =
      !dateFilter ||
      invoice.purchaseDate.toLowerCase().includes(
        new Date(`${dateFilter}T00:00:00`)
          .toLocaleDateString('en-IN', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
          })
          .toLowerCase(),
      )

    return (
      matchesSearch &&
      matchesSupplier &&
      matchesState &&
      matchesDate
    )
  })

  const formatMoney = (value: number) =>
    `₹${value.toLocaleString('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <ShoppingBag
              size={20}
              weight="duotone"
              className="text-slate-700"
            />
            <h1 className="text-xl font-semibold text-slate-900">
              Purchase Invoices
            </h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Record and manage supplier purchase invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              closeForm()
            } else {
              setShowForm(true)
            }
          }}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800"
        >
          {showForm ? (
            <X size={17} weight="bold" />
          ) : (
            <Plus size={17} weight="bold" />
          )}
          {showForm ? 'Close' : 'Add Purchase Invoice'}
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={savePurchase}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
        >
          <div className="border-b border-slate-100 bg-slate-50/60 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Add Purchase Invoice
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Enter the purchase invoice summary and upload the supplier invoice.
            </p>
          </div>

          <div className="space-y-6 p-5">
            <section>
              <SectionTitle
                title="Invoice Details"
                description="Supplier and purchase invoice information."
              />

              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="relative lg:col-span-2">
                  <FormField label="Supplier" required>
                    <input
                      value={
                        selectedSupplier
                          ? selectedSupplier.name
                          : supplierSearch
                      }
                      onChange={(event) => {
                        setSelectedSupplier(null)
                        setSupplierSearch(event.target.value)
                      }}
                      placeholder="Search supplier..."
                      className={inputClass}
                    />
                  </FormField>

                  {!selectedSupplier &&
                    supplierSearch.trim() &&
                    filteredSuppliers.length > 0 && (
                      <div className="absolute left-0 right-0 top-[58px] z-20 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-lg">
                        {filteredSuppliers.map((supplier) => (
                          <button
                            key={supplier.id}
                            type="button"
                            onClick={() => {
                              setSelectedSupplier(supplier)
                              setSupplierSearch('')
                            }}
                            className="flex w-full items-center justify-between border-b border-slate-100 px-3 py-2.5 text-left last:border-0 hover:bg-slate-50"
                          >
                            <div>
                              <div className="text-sm font-medium text-slate-800">
                                {supplier.name}
                              </div>
                              <div className="mt-0.5 text-[11px] text-slate-400">
                                {supplier.code} · {supplier.gstin || 'No GSTIN'}
                              </div>
                            </div>
                            <div className="text-xs text-slate-500">
                              {supplier.addresses[0]?.state || '—'}
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                  {selectedSupplier && (
                    <div className="mt-1.5 flex items-center justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <div className="text-xs text-slate-500">
                        GSTIN:{' '}
                        <span className="font-medium text-slate-700">
                          {selectedSupplier.gstin || '—'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setSelectedSupplier(null)}
                        className="text-xs font-semibold text-slate-500 hover:text-slate-900"
                      >
                        Change
                      </button>
                    </div>
                  )}
                </div>

                <FormField label="Supplier State" required>
                  <input
                    value={
                      selectedSupplier?.addresses[0]?.state || ''
                    }
                    readOnly
                    placeholder="Auto-filled from supplier"
                    className={`${inputClass} bg-slate-50 text-slate-600`}
                  />
                </FormField>

                <FormField label="Invoice No." required>
                  <input
                    value={invoiceNo}
                    onChange={(event) =>
                      setInvoiceNo(event.target.value)
                    }
                    placeholder="e.g. 11882-R"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Date of Purchase" required>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(event) =>
                      setPurchaseDate(event.target.value)
                    }
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Purchase Location" required>
                  <select
                    value={location}
                    onChange={(event) =>
                      setLocation(event.target.value)
                    }
                    className={inputClass}
                  >
                    {purchaseLocations.map((item) => (
                      <option key={item}>{item}</option>
                    ))}
                  </select>
                </FormField>
              </div>
            </section>

            <section>
              <SectionTitle
                title="Purchase Summary"
                description="Record the totals shown on the supplier invoice."
              />

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <FormField label="No. of Items" required>
                  <input
                    type="number"
                    min="1"
                    value={itemCount}
                    onChange={(event) =>
                      setItemCount(event.target.value)
                    }
                    placeholder="e.g. 24"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Taxable Value" required>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={taxableValue}
                    onChange={(event) =>
                      setTaxableValue(event.target.value)
                    }
                    placeholder="₹ 0.00"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="GST %" required>
                  <select
                    value={gstRate}
                    onChange={(event) =>
                      setGstRate(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="0">0%</option>
                    <option value="5">5%</option>
                    <option value="12">12%</option>
                    <option value="18">18%</option>
                    <option value="28">28%</option>
                  </select>
                </FormField>

                <div className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
                  <div className="text-[11px] font-medium text-slate-500">
                    GST Amount
                  </div>
                  <div className="mt-1 text-sm font-semibold text-slate-800">
                    {formatMoney(gstAmount)}
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-col gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-[0.08em] text-slate-400">
                    Final Purchase Value
                  </div>
                  <div className="mt-1 text-xs text-slate-500">
                    Taxable Value + GST
                  </div>
                </div>
                <div className="text-xl font-bold text-slate-900">
                  {formatMoney(finalValue)}
                </div>
              </div>
            </section>

            <section>
              <SectionTitle
                title="Invoice Document"
                description="Upload the supplier invoice. This document is mandatory."
              />

              <label className="flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-8 text-center transition hover:border-slate-400 hover:bg-slate-50">
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,application/pdf,image/jpeg"
                  className="hidden"
                  onChange={(event) => {
                    const file = event.target.files?.[0] || null
                    setInvoiceFile(file)
                  }}
                />

                {invoiceFile ? (
                  <>
                    <CheckCircle
                      size={30}
                      weight="duotone"
                      className="text-emerald-600"
                    />
                    <div className="mt-2 text-sm font-semibold text-slate-800">
                      {invoiceFile.name}
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Click to replace the uploaded invoice
                    </div>
                  </>
                ) : (
                  <>
                    <Receipt
                      size={30}
                      weight="duotone"
                      className="text-slate-400"
                    />
                    <div className="mt-2 text-sm font-semibold text-slate-700">
                      Upload Invoice
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      PDF, JPG or JPEG · Mandatory
                    </div>
                  </>
                )}
              </label>
            </section>

            {formError && (
              <div className="rounded-lg border border-red-100 bg-red-50 px-3 py-2.5 text-sm text-red-600">
                {formError}
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeForm}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <CheckCircle size={17} weight="bold" />
              Save Purchase Invoice
            </button>
          </div>
        </form>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Purchase Invoice List
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Search and review recorded supplier purchase invoices.
            </p>
          </div>

          <div className="grid gap-2 sm:grid-cols-2 lg:flex">
            <div className="relative">
              <MagnifyingGlass
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search invoice or supplier..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 lg:w-64"
              />
            </div>

            <select
              value={supplierFilter}
              onChange={(event) =>
                setSupplierFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
            >
              <option>All</option>
              {supplierNames.map((supplier) => (
                <option key={supplier}>{supplier}</option>
              ))}
            </select>

            <select
              value={stateFilter}
              onChange={(event) =>
                setStateFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
            >
              <option>All</option>
              {supplierStates.map((state) => (
                <option key={state}>{state}</option>
              ))}
            </select>

            <input
              type="date"
              value={dateFilter}
              onChange={(event) =>
                setDateFilter(event.target.value)
              }
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[1080px] table-fixed text-left">
            <colgroup>
              <col className="w-[120px]" />
              <col className="w-[105px]" />
              <col className="w-[185px]" />
              <col className="w-[105px]" />
              <col className="w-[90px]" />
              <col className="w-[125px]" />
              <col className="w-[110px]" />
              <col className="w-[145px]" />
              <col className="w-[95px]" />
              <col className="w-[90px]" />
            </colgroup>
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className={tableHead}>Invoice No.</th>
                <th className={tableHead}>Purchase Date</th>
                <th className={tableHead}>Supplier</th>
                <th className={tableHead}>Supplier State</th>
                <th className={`${tableHead} text-right`}>
                  No. of Items
                </th>
                <th className={`${tableHead} text-right`}>
                  Taxable Value
                </th>
                <th className={`${tableHead} text-right`}>
                  GST
                </th>
                <th className={`${tableHead} text-right`}>
                  Final Purchase Value
                </th>
                <th className={tableHead}>Invoice</th>
                <th className={`${tableHead} text-right`}>
                  Action
                </th>
              </tr>
            </thead>

            <tbody>
              {filteredInvoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                >
                  <td className="px-5 py-4 text-sm font-semibold text-slate-800">
                    {invoice.invoiceNo}
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {invoice.purchaseDate}
                  </td>

                  <td className="px-5 py-4">
                    <div className="text-sm font-medium text-slate-800">
                      {invoice.supplier}
                    </div>
                    <div className="mt-0.5 text-xs text-slate-400">
                      {invoice.location}
                    </div>
                  </td>

                  <td className="px-5 py-4 text-sm text-slate-600">
                    {invoice.supplierState}
                  </td>

                  <td className="px-5 py-4 text-right text-sm text-slate-700">
                    {invoice.items}
                  </td>

                  <td className="px-5 py-4 text-right text-sm text-slate-700">
                    {formatMoney(invoice.taxableValue)}
                  </td>

                  <td className="px-5 py-4 text-right">
                    <div className="text-sm font-medium text-slate-700">
                      {formatMoney(invoice.gstAmount)}
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {invoice.gstRate}%
                    </div>
                  </td>

                  <td className="px-5 py-4 text-right text-sm font-bold text-slate-900">
                    {formatMoney(invoice.finalValue)}
                  </td>

                  <td className="px-5 py-4">
                    <button
                      type="button"
                      title={invoice.documentName}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      <Receipt size={15} />
                      View
                    </button>
                  </td>

                  <td className="px-5 py-4 text-right">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    >
                      Details
                      <CaretRight size={13} weight="bold" />
                    </button>
                  </td>
                </tr>
              ))}

              {filteredInvoices.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-5 py-14 text-center"
                  >
                    <div className="text-sm font-medium text-slate-700">
                      No purchase invoices found
                    </div>
                    <div className="mt-1 text-xs text-slate-400">
                      Try changing your search or filters.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          Showing {filteredInvoices.length} of {invoices.length} purchase invoices
        </div>
      </section>
    </div>
  )
}

function SupplierPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>(initialSuppliers)
  const [form, setForm] = useState<SupplierForm>(emptySupplierForm)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')
  const [message, setMessage] = useState('')

  const updateForm = <K extends keyof SupplierForm>(
    key: K,
    value: SupplierForm[K],
  ) => {
    setForm((current) => ({
      ...current,
      [key]: value,
    }))
  }

  const resetForm = () => {
    setForm(emptySupplierForm)
    setEditingId(null)
    setMessage('')
  }

  const useExistingAddress = (addressId: string) => {
    const supplier = suppliers.find((item) =>
      item.addresses.some((address) => address.id === addressId),
    )

    const address = supplier?.addresses.find(
      (item) => item.id === addressId,
    )

    if (!address) return

    setForm((current) => ({
      ...current,
      useExistingAddress: addressId,
      addressType: address.type,
      addressLine1: address.line1,
      addressLine2: address.line2,
      cityMode: 'existing',
      city: address.city,
      customCity: '',
      state: address.state,
      pinCode: address.pinCode,
    }))
  }

  const saveSupplier = (event: React.FormEvent) => {
    event.preventDefault()
    setMessage('')

    if (!form.name.trim()) {
      setMessage('Supplier name is required.')
      return
    }

    if (!form.mobile.trim()) {
      setMessage('Mobile number is required.')
      return
    }

    const city =
      form.cityMode === 'custom'
        ? form.customCity.trim()
        : form.city.trim()

    const address: SupplierAddress = {
      id:
        editingId
          ? `${editingId}-address`
          : `address-${Date.now()}`,
      type: form.addressType,
      line1: form.addressLine1.trim(),
      line2: form.addressLine2.trim(),
      city,
      state: form.state,
      pinCode: form.pinCode.trim(),
    }

    const hasBank =
      form.bankName.trim() ||
      form.accountNumber.trim() ||
      form.ifsc.trim() ||
      form.branch.trim() ||
      form.accountHolderName.trim()

    const bank: SupplierBank | undefined = hasBank
      ? {
          bankName: form.bankName.trim(),
          accountNumber: form.accountNumber.trim(),
          ifsc: form.ifsc.trim(),
          branch: form.branch.trim(),
          accountHolderName: form.accountHolderName.trim(),
        }
      : undefined

    if (editingId) {
      setSuppliers((current) =>
        current.map((supplier) =>
          supplier.id === editingId
            ? {
                ...supplier,
                name: form.name.trim(),
                type: form.type,
                contactPerson: form.contactPerson.trim(),
                mobile: form.mobile.trim(),
                alternateMobile: form.alternateMobile.trim(),
                email: form.email.trim(),
                gstin: form.gstin.trim().toUpperCase(),
                pan: form.pan.trim().toUpperCase(),
                status: form.status,
                addresses: [address],
                bank,
                notes: form.notes.trim(),
              }
            : supplier,
        ),
      )

      setMessage('Supplier updated successfully.')
    } else {
      const nextNumber =
        suppliers.reduce((highest, supplier) => {
          const number = Number(supplier.code.replace('SUP-', ''))
          return Number.isFinite(number)
            ? Math.max(highest, number)
            : highest
        }, 0) + 1

      const newSupplier: Supplier = {
        id: `supplier-${Date.now()}`,
        code: `SUP-${String(nextNumber).padStart(4, '0')}`,
        name: form.name.trim(),
        type: form.type,
        contactPerson: form.contactPerson.trim(),
        mobile: form.mobile.trim(),
        alternateMobile: form.alternateMobile.trim(),
        email: form.email.trim(),
        gstin: form.gstin.trim().toUpperCase(),
        pan: form.pan.trim().toUpperCase(),
        addresses: [address],
        bank,
        notes: form.notes.trim(),
        status: form.status,
        outstanding: 0,
        lastPurchase: '—',
      }

      setSuppliers((current) => [newSupplier, ...current])
      setMessage('Supplier created successfully.')
    }

    setForm(emptySupplierForm)
    setEditingId(null)
    setShowForm(false)
  }

  const editSupplier = (supplier: Supplier) => {
    const address = supplier.addresses[0]

    setEditingId(supplier.id)
    setForm({
      name: supplier.name,
      type: supplier.type,
      contactPerson: supplier.contactPerson,
      mobile: supplier.mobile,
      alternateMobile: supplier.alternateMobile,
      email: supplier.email,
      gstin: supplier.gstin,
      pan: supplier.pan,
      status: supplier.status,
      addressType: address?.type ?? 'Office',
      addressLine1: address?.line1 ?? '',
      addressLine2: address?.line2 ?? '',
      cityMode: 'existing',
      city: address?.city ?? '',
      customCity: '',
      state: address?.state ?? '',
      pinCode: address?.pinCode ?? '',
      useExistingAddress: '',
      bankName: supplier.bank?.bankName ?? '',
      accountNumber: supplier.bank?.accountNumber ?? '',
      ifsc: supplier.bank?.ifsc ?? '',
      branch: supplier.bank?.branch ?? '',
      accountHolderName: supplier.bank?.accountHolderName ?? '',
      notes: supplier.notes,
    })

    setShowForm(true)
    setMessage('')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const filteredSuppliers = suppliers.filter((supplier) => {
    const matchesSearch =
      supplier.name.toLowerCase().includes(search.toLowerCase()) ||
      supplier.code.toLowerCase().includes(search.toLowerCase()) ||
      supplier.mobile.includes(search) ||
      supplier.gstin.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === 'All' ||
      supplier.status === statusFilter

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-5">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold text-slate-900">
              Suppliers
            </h1>

            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {suppliers.length}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage supplier information, addresses and banking details.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            if (showForm) {
              resetForm()
              setShowForm(false)
            } else {
              resetForm()
              setShowForm(true)
            }
          }}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-slate-800"
        >
          {showForm ? (
            <>
              <CaretDown size={16} />
              Close
            </>
          ) : (
            <>
              <Plus size={17} weight="bold" />
              Add Supplier
            </>
          )}
        </button>
      </div>

      {message && (
        <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700">
          {message}
        </div>
      )}

      {showForm && (
        <form
          onSubmit={saveSupplier}
          className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200"
        >
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 sm:px-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                {editingId ? 'Edit Supplier' : 'Add Supplier'}
              </h2>
              <p className="mt-0.5 text-xs text-slate-400">
                Supplier master information
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="text-xs font-medium text-slate-500 hover:text-slate-900"
            >
              Close
            </button>
          </div>

          <div className="space-y-5 p-4 sm:p-5">
            <section>
              <SectionTitle
                title="Basic Information"
                description="Primary supplier identity and contact information."
              />

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <FormField
                  label="Supplier Name"
                  required
                  className="xl:col-span-2"
                >
                  <input
                    value={form.name}
                    onChange={(event) =>
                      updateForm('name', event.target.value)
                    }
                    placeholder="Enter supplier name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Supplier Code">
                  <input
                    value={
                      editingId
                        ? suppliers.find((item) => item.id === editingId)?.code ?? ''
                        : 'Auto generated'
                    }
                    disabled
                    className={`${inputClass} bg-slate-50 text-slate-400`}
                  />
                </FormField>

                <FormField label="Supplier Type">
                  <select
                    value={form.type}
                    onChange={(event) =>
                      updateForm('type', event.target.value)
                    }
                    className={inputClass}
                  >
                    <option>Manufacturer</option>
                    <option>Wholesaler</option>
                    <option>Distributor</option>
                    <option>Brand</option>
                    <option>Other</option>
                  </select>
                </FormField>

                <FormField label="Contact Person">
                  <input
                    value={form.contactPerson}
                    onChange={(event) =>
                      updateForm('contactPerson', event.target.value)
                    }
                    placeholder="Contact person"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Mobile" required>
                  <input
                    value={form.mobile}
                    onChange={(event) =>
                      updateForm('mobile', event.target.value)
                    }
                    placeholder="10 digit mobile number"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Alternate Mobile">
                  <input
                    value={form.alternateMobile}
                    onChange={(event) =>
                      updateForm('alternateMobile', event.target.value)
                    }
                    placeholder="Optional"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Email" className="xl:col-span-2">
                  <input
                    type="email"
                    value={form.email}
                    onChange={(event) =>
                      updateForm('email', event.target.value)
                    }
                    placeholder="supplier@example.com"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Status">
                  <select
                    value={form.status}
                    onChange={(event) =>
                      updateForm(
                        'status',
                        event.target.value as SupplierForm['status'],
                      )
                    }
                    className={inputClass}
                  >
                    <option>Active</option>
                    <option>Inactive</option>
                  </select>
                </FormField>
              </div>
            </section>

            <section>
              <SectionTitle
                title="GST & Legal"
                description="Tax and legal identifiers for the supplier."
              />

              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="GSTIN">
                  <input
                    value={form.gstin}
                    onChange={(event) =>
                      updateForm('gstin', event.target.value)
                    }
                    placeholder="e.g. 24AAICS2384N1ZW"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="PAN">
                  <input
                    value={form.pan}
                    onChange={(event) =>
                      updateForm('pan', event.target.value)
                    }
                    placeholder="e.g. AAICS2384N"
                    className={inputClass}
                  />
                </FormField>
              </div>
            </section>

            <section>
              <SectionTitle
                title="Addresses"
                description="Store supplier office, billing or dispatch addresses."
              />

              <div className="mb-4 grid gap-4 md:grid-cols-2">
                <FormField label="Use Existing Address">
                  <select
                    value={form.useExistingAddress}
                    onChange={(event) => {
                      const value = event.target.value
                      updateForm('useExistingAddress', value)

                      if (value) {
                        useExistingAddress(value)
                      }
                    }}
                    className={inputClass}
                  >
                    <option value="">Select existing address</option>
                    {suppliers.flatMap((supplier) =>
                      supplier.addresses.map((address) => (
                        <option
                          key={`${supplier.id}-${address.id}`}
                          value={address.id}
                        >
                          {supplier.name} — {address.type} — {address.city}
                        </option>
                      )),
                    )}
                  </select>
                </FormField>

                <FormField label="Address Type">
                  <select
                    value={form.addressType}
                    onChange={(event) =>
                      updateForm('addressType', event.target.value)
                    }
                    className={inputClass}
                  >
                    <option>Office</option>
                    <option>Sale Office</option>
                    <option>Head Office</option>
                    <option>Billing Address</option>
                    <option>Shipping Address</option>
                    <option>Other</option>
                  </select>
                </FormField>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <FormField label="Address Line 1">
                  <input
                    value={form.addressLine1}
                    onChange={(event) =>
                      updateForm('addressLine1', event.target.value)
                    }
                    placeholder="Building, street, market"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Address Line 2">
                  <input
                    value={form.addressLine2}
                    onChange={(event) =>
                      updateForm('addressLine2', event.target.value)
                    }
                    placeholder="Area, landmark, road"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="City">
                  <div className="flex gap-2">
                    <select
                      value={form.cityMode}
                      onChange={(event) => {
                        const mode =
                          event.target.value as SupplierForm['cityMode']
                        updateForm('cityMode', mode)
                      }}
                      className={`${inputClass} max-w-[120px]`}
                    >
                      <option value="existing">Select</option>
                      <option value="custom">Custom</option>
                    </select>

                    {form.cityMode === 'custom' ? (
                      <input
                        value={form.customCity}
                        onChange={(event) =>
                          updateForm('customCity', event.target.value)
                        }
                        placeholder="Enter city"
                        className={inputClass}
                      />
                    ) : (
                      <select
                        value={form.city}
                        onChange={(event) =>
                          updateForm('city', event.target.value)
                        }
                        className={inputClass}
                      >
                        <option value="">Select city</option>
                        {supplierCities.map((city) => (
                          <option key={city}>{city}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </FormField>

                <FormField label="State">
                  <select
                    value={form.state}
                    onChange={(event) =>
                      updateForm('state', event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select state</option>
                    {supplierStates.map((state) => (
                      <option key={state}>{state}</option>
                    ))}
                  </select>
                </FormField>

                <FormField label="PIN Code">
                  <input
                    value={form.pinCode}
                    onChange={(event) =>
                      updateForm('pinCode', event.target.value)
                    }
                    placeholder="6 digit PIN"
                    inputMode="numeric"
                    className={inputClass}
                  />
                </FormField>
              </div>
            </section>

            <section>
              <SectionTitle
                title="Bank Details"
                description="Optional supplier payment account information."
              />

              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                <FormField label="Bank Name">
                  <input
                    value={form.bankName}
                    onChange={(event) =>
                      updateForm('bankName', event.target.value)
                    }
                    placeholder="Bank name"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Account Number">
                  <input
                    value={form.accountNumber}
                    onChange={(event) =>
                      updateForm('accountNumber', event.target.value)
                    }
                    placeholder="Account number"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="IFSC">
                  <input
                    value={form.ifsc}
                    onChange={(event) =>
                      updateForm('ifsc', event.target.value)
                    }
                    placeholder="IFSC code"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Branch">
                  <input
                    value={form.branch}
                    onChange={(event) =>
                      updateForm('branch', event.target.value)
                    }
                    placeholder="Branch"
                    className={inputClass}
                  />
                </FormField>

                <FormField label="Account Holder Name">
                  <input
                    value={form.accountHolderName}
                    onChange={(event) =>
                      updateForm('accountHolderName', event.target.value)
                    }
                    placeholder="Account holder"
                    className={inputClass}
                  />
                </FormField>
              </div>
            </section>

            <section>
              <SectionTitle
                title="Internal Notes"
                description="Private notes for Tazeen staff."
              />

              <textarea
                value={form.notes}
                onChange={(event) =>
                  updateForm('notes', event.target.value)
                }
                rows={3}
                placeholder="Add internal supplier notes..."
                className={`${inputClass} resize-none`}
              />
            </section>
          </div>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-100 bg-slate-50/60 px-4 py-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => {
                resetForm()
                setShowForm(false)
              }}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
            >
              <Plus size={17} weight="bold" />
              {editingId ? 'Update Supplier' : 'Create Supplier'}
            </button>
          </div>
        </form>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-slate-100 p-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Supplier List
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Search and manage supplier master records.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <MagnifyingGlass
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search supplier, GSTIN, phone..."
                className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition focus:border-slate-400 sm:w-72"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-600 outline-none"
            >
              <option>All</option>
              <option>Active</option>
              <option>Inactive</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[950px] text-left">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50/70">
                <th className={tableHead}>Supplier</th>
                <th className={tableHead}>Code</th>
                <th className={tableHead}>Contact</th>
                <th className={tableHead}>GSTIN</th>
                <th className={tableHead}>Location</th>
                <th className={`${tableHead} text-right`}>Outstanding</th>
                <th className={tableHead}>Last Purchase</th>
                <th className={tableHead}>Status</th>
                <th className={`${tableHead} text-right`}>Action</th>
              </tr>
            </thead>

            <tbody>
              {filteredSuppliers.map((supplier) => {
                const address = supplier.addresses[0]

                return (
                  <tr
                    key={supplier.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">
                        {supplier.name}
                      </div>

                      <div className="mt-0.5 text-xs text-slate-400">
                        {supplier.type}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-sm font-medium text-slate-600">
                      {supplier.code}
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-sm text-slate-700">
                        {supplier.mobile}
                      </div>

                      {supplier.contactPerson && (
                        <div className="mt-0.5 text-xs text-slate-400">
                          {supplier.contactPerson}
                        </div>
                      )}
                    </td>

                    <td className="px-5 py-4 text-xs font-medium text-slate-600">
                      {supplier.gstin || '—'}
                    </td>

                    <td className="px-5 py-4">
                      <div className="text-sm text-slate-700">
                        {address?.city || '—'}
                      </div>

                      <div className="text-xs text-slate-400">
                        {address?.state || ''}
                      </div>
                    </td>

                    <td className="px-5 py-4 text-right text-sm font-medium text-slate-800">
                      ₹{supplier.outstanding.toLocaleString('en-IN')}
                    </td>

                    <td className="px-5 py-4 text-sm text-slate-500">
                      {supplier.lastPurchase}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                          supplier.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {supplier.status}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-right">
                      <button
                        type="button"
                        onClick={() => editSupplier(supplier)}
                        className="rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                )
              })}

              {filteredSuppliers.length === 0 && (
                <tr>
                  <td
                    colSpan={9}
                    className="px-5 py-12 text-center"
                  >
                    <div className="text-sm font-medium text-slate-700">
                      No suppliers found
                    </div>

                    <div className="mt-1 text-xs text-slate-400">
                      Try changing your search or filter.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
          Showing {filteredSuppliers.length} of {suppliers.length} suppliers
        </div>
      </section>
    </div>
  )
}

const inputClass =
  'h-9 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'

const tableHead =
  'px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400'

function SectionTitle({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-3">
      <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-700">
        {title}
      </h3>

      <p className="mt-1 text-xs text-slate-400">
        {description}
      </p>
    </div>
  )
}

function FormField({
  label,
  required = false,
  children,
  className = '',
}: {
  label: string
  required?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-[11px] font-medium text-slate-600">
        {label}
        {required && (
          <span className="ml-0.5 text-red-500">*</span>
        )}
      </span>

      {children}
    </label>
  )
}


type WalletCustomer = {
  phone: string
  customerId: string
  name: string
  balance: number
  lastTransaction: string
  lastTransactionDate: string
  status: 'Active' | 'Inactive'
}

type WalletHistoryEntry = {
  date: string
  type: 'Credit' | 'Debit' | 'Adjustment'
  reference: string
  credit: number
  debit: number
  balance: number
}

const initialWalletCustomers: WalletCustomer[] = [
  {
    phone: '9876543210',
    customerId: 'TZC000001',
    name: 'Riya Begum',
    balance: 750,
    lastTransaction: 'Credit ₹500',
    lastTransactionDate: '18 Sep 2026',
    status: 'Active',
  },
  {
    phone: '9832123456',
    customerId: 'TZC000002',
    name: 'Sabiha Khatun',
    balance: 250,
    lastTransaction: 'Credit ₹250',
    lastTransactionDate: '15 Sep 2026',
    status: 'Active',
  },
  {
    phone: '9007123456',
    customerId: 'TZC000003',
    name: 'Mousumi Das',
    balance: 0,
    lastTransaction: 'No transaction',
    lastTransactionDate: '—',
    status: 'Inactive',
  },
]

const initialWalletHistory: Record<string, WalletHistoryEntry[]> = {
  '9876543210': [
    {
      date: '18 Sep 2026',
      type: 'Credit',
      reference: 'Return INV-10025',
      credit: 500,
      debit: 0,
      balance: 750,
    },
    {
      date: '15 Sep 2026',
      type: 'Debit',
      reference: 'Purchase INV-10012',
      credit: 0,
      debit: 250,
      balance: 250,
    },
    {
      date: '10 Sep 2026',
      type: 'Adjustment',
      reference: 'Admin Adjustment',
      credit: 500,
      debit: 0,
      balance: 500,
    },
  ],
  '9832123456': [
    {
      date: '15 Sep 2026',
      type: 'Credit',
      reference: 'Return INV-09972',
      credit: 250,
      debit: 0,
      balance: 250,
    },
  ],
  '9007123456': [],
}

function CustomerWalletPage() {
  const [customers, setCustomers] = useState<WalletCustomer[]>(
    initialWalletCustomers,
  )
  const [history, setHistory] =
    useState<Record<string, WalletHistoryEntry[]>>(initialWalletHistory)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<
    'All' | 'Credit' | 'Debit' | 'Adjustment'
  >('All')
  const [dateFilter, setDateFilter] = useState('')

  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [showAdjustment, setShowAdjustment] = useState(false)

  const [adjustmentAmount, setAdjustmentAmount] = useState('')
  const [adjustmentType, setAdjustmentType] =
    useState<'Credit' | 'Debit'>('Credit')
  const [adjustmentReason, setAdjustmentReason] = useState('')

  const [message, setMessage] = useState('')

  const selectedCustomer = customers.find(
    (customer) => customer.phone === selectedPhone,
  )

  const totalWalletBalance = customers.reduce(
    (sum, customer) => sum + customer.balance,
    0,
  )

  const activeCustomers = customers.filter(
    (customer) => customer.status === 'Active',
  ).length

  const totalTransactions = Object.values(history).reduce(
    (sum, entries) => sum + entries.length,
    0,
  )

  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase()

    return (
      !query ||
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.customerId.toLowerCase().includes(query)
    )
  })

  const selectedHistory = selectedPhone
    ? (history[selectedPhone] ?? []).filter((entry) => {
        const matchesType =
          typeFilter === 'All' || entry.type === typeFilter

        const matchesDate =
          !dateFilter ||
          entry.date.toLowerCase().includes(dateFilter.toLowerCase())

        return matchesType && matchesDate
      })
    : []

  const openWallet = (customer: WalletCustomer) => {
    setSelectedPhone(customer.phone)
    setShowAdjustment(false)
    setMessage('')
  }

  const openAdjustment = () => {
    setAdjustmentAmount('')
    setAdjustmentType('Credit')
    setAdjustmentReason('')
    setMessage('')
    setShowAdjustment(true)
  }

  const saveAdjustment = (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedCustomer) {
      return
    }

    const amount = Number(adjustmentAmount)

    if (!amount || amount <= 0) {
      setMessage('Enter a valid adjustment amount.')
      return
    }

    if (!adjustmentReason.trim()) {
      setMessage('Please enter an adjustment reason.')
      return
    }

    const previousBalance = selectedCustomer.balance

    const newBalance =
      adjustmentType === 'Credit'
        ? previousBalance + amount
        : Math.max(0, previousBalance - amount)

    const today = '20 Sep 2026'

    const newEntry: WalletHistoryEntry = {
      date: today,
      type: 'Adjustment',
      reference: adjustmentReason.trim(),
      credit: adjustmentType === 'Credit' ? amount : 0,
      debit: adjustmentType === 'Debit' ? amount : 0,
      balance: newBalance,
    }

    setCustomers((current) =>
      current.map((customer) =>
        customer.phone === selectedCustomer.phone
          ? {
              ...customer,
              balance: newBalance,
              lastTransaction:
                adjustmentType === 'Credit'
                  ? `Credit ${productFormatMoney(amount)}`
                  : `Debit ${productFormatMoney(amount)}`,
              lastTransactionDate: today,
            }
          : customer,
      ),
    )

    setHistory((current) => ({
      ...current,
      [selectedCustomer.phone]: [
        newEntry,
        ...(current[selectedCustomer.phone] ?? []),
      ],
    }))

    setMessage('Wallet adjustment recorded successfully.')
    setShowAdjustment(false)
  }

  return (
    <div className="space-y-5">
      {!selectedCustomer ? (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Wallet
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage customer wallet balances and wallet transactions.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-300 px-4 text-xs font-semibold text-white"
              title="Select a customer first"
            >
              <Plus size={16} weight="bold" />
              Wallet Adjustment
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Wallet Balance
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {productFormatMoney(totalWalletBalance)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active Customers
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {activeCustomers}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Transactions
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalTransactions}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, phone or customer ID..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as
                    | 'All'
                    | 'Credit'
                    | 'Debit'
                    | 'Adjustment',
                )
              }
              className={inputClass}
            >
              <option value="All">All Transactions</option>
              <option value="Credit">Credit</option>
              <option value="Debit">Debit</option>
              <option value="Adjustment">Adjustment</option>
            </select>

            <input
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              placeholder="Filter date..."
              className={inputClass}
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full table-fixed">
                <thead className={tableHead}>
                  <tr>
                    <th className="w-[220px] px-4 py-3 text-left">
                      Customer
                    </th>
                    <th className="w-[145px] px-4 py-3 text-left">
                      Phone No.
                    </th>
                    <th className="w-[140px] px-4 py-3 text-left">
                      Customer ID
                    </th>
                    <th className="w-[150px] px-4 py-3 text-right">
                      Current Balance
                    </th>
                    <th className="w-[180px] px-4 py-3 text-left">
                      Last Transaction
                    </th>
                    <th className="w-[130px] px-4 py-3 text-left">
                      Date
                    </th>
                    <th className="w-[110px] px-4 py-3 text-left">
                      Status
                    </th>
                    <th className="w-[100px] px-4 py-3 text-left">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.phone}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">
                          {customer.name}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {customer.phone}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {customer.customerId}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                        {productFormatMoney(customer.balance)}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {customer.lastTransaction}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {customer.lastTransactionDate}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            customer.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openWallet(customer)}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-14 text-center text-sm text-slate-500"
                      >
                        No wallet customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPhone(null)
                  setShowAdjustment(false)
                  setMessage('')
                }}
                className="mb-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                ← Back to Wallet
              </button>

              <h1 className="text-2xl font-semibold text-slate-900">
                {selectedCustomer.name}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {selectedCustomer.phone} · {selectedCustomer.customerId}
              </p>
            </div>

            <button
              type="button"
              onClick={openAdjustment}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={16} weight="bold" />
              Adjust Wallet
            </button>
          </div>

          {message && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          {showAdjustment && (
            <form
              onSubmit={saveAdjustment}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Adjust Wallet
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Record a wallet credit or debit with a reason.
                </p>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Amount
                  </label>
                  <input
                    value={adjustmentAmount}
                    onChange={(event) =>
                      setAdjustmentAmount(
                        event.target.value.replace(/[^\d.]/g, ''),
                      )
                    }
                    inputMode="decimal"
                    placeholder="0.00"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Adjustment Type
                  </label>
                  <select
                    value={adjustmentType}
                    onChange={(event) =>
                      setAdjustmentType(
                        event.target.value as 'Credit' | 'Debit',
                      )
                    }
                    className={inputClass}
                  >
                    <option value="Credit">Credit</option>
                    <option value="Debit">Debit</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Reason
                  </label>
                  <input
                    value={adjustmentReason}
                    onChange={(event) =>
                      setAdjustmentReason(event.target.value)
                    }
                    placeholder="Enter adjustment reason"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setShowAdjustment(false)}
                  className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-10 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Current Wallet Balance
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {productFormatMoney(selectedCustomer.balance)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Transactions
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {history[selectedCustomer.phone]?.length ?? 0}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Customer Status
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    selectedCustomer.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedCustomer.status}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Wallet History
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Complete wallet transaction ledger for this customer.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead className={tableHead}>
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Reference</th>
                    <th className="px-4 py-3 text-right">Credit</th>
                    <th className="px-4 py-3 text-right">Debit</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {selectedHistory.map((entry, index) => (
                    <tr key={`${entry.date}-${entry.reference}-${index}`}>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {entry.date}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {entry.type}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {entry.reference}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">
                        {entry.credit
                          ? `+${productFormatMoney(entry.credit)}`
                          : '—'}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                        {entry.debit
                          ? `-${productFormatMoney(entry.debit)}`
                          : '—'}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                        {productFormatMoney(entry.balance)}
                      </td>
                    </tr>
                  ))}

                  {selectedHistory.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-14 text-center text-sm text-slate-500"
                      >
                        No wallet transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


type PointsCustomer = {
  phone: string
  customerId: string
  name: string
  points: number
  lastTransaction: string
  lastTransactionDate: string
  status: 'Active' | 'Inactive'
}

type PointsHistoryEntry = {
  date: string
  type: 'Earned' | 'Redeemed' | 'Adjustment'
  reference: string
  earned: number
  redeemed: number
  balance: number
}

const initialPointsCustomers: PointsCustomer[] = [
  {
    phone: '9876543210',
    customerId: 'TZC000001',
    name: 'Riya Begum',
    points: 184,
    lastTransaction: 'Earned +25',
    lastTransactionDate: '18 Sep 2026',
    status: 'Active',
  },
  {
    phone: '9832123456',
    customerId: 'TZC000002',
    name: 'Sabiha Khatun',
    points: 123,
    lastTransaction: 'Earned +24',
    lastTransactionDate: '15 Sep 2026',
    status: 'Active',
  },
  {
    phone: '9007123456',
    customerId: 'TZC000003',
    name: 'Mousumi Das',
    points: 64,
    lastTransaction: 'No transaction',
    lastTransactionDate: '—',
    status: 'Inactive',
  },
]

const initialPointsHistory: Record<string, PointsHistoryEntry[]> = {
  '9876543210': [
    {
      date: '18 Sep 2026',
      type: 'Earned',
      reference: 'INV-10025',
      earned: 25,
      redeemed: 0,
      balance: 184,
    },
    {
      date: '15 Sep 2026',
      type: 'Redeemed',
      reference: 'INV-10012',
      earned: 0,
      redeemed: 50,
      balance: 159,
    },
    {
      date: '10 Sep 2026',
      type: 'Adjustment',
      reference: 'Admin Adjustment',
      earned: 25,
      redeemed: 0,
      balance: 209,
    },
  ],
  '9832123456': [
    {
      date: '15 Sep 2026',
      type: 'Earned',
      reference: 'INV-10018',
      earned: 24,
      redeemed: 0,
      balance: 123,
    },
  ],
  '9007123456': [],
}

function CustomerPointsPage() {
  const [customers, setCustomers] = useState<PointsCustomer[]>(
    initialPointsCustomers,
  )

  const [history, setHistory] =
    useState<Record<string, PointsHistoryEntry[]>>(initialPointsHistory)

  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<
    'All' | 'Earned' | 'Redeemed' | 'Adjustment'
  >('All')
  const [dateFilter, setDateFilter] = useState('')

  const [selectedPhone, setSelectedPhone] = useState<string | null>(null)
  const [showAdjustment, setShowAdjustment] = useState(false)

  const [adjustmentPoints, setAdjustmentPoints] = useState('')
  const [adjustmentType, setAdjustmentType] =
    useState<'Credit' | 'Debit'>('Credit')
  const [adjustmentReason, setAdjustmentReason] = useState('')

  const [message, setMessage] = useState('')

  const selectedCustomer = customers.find(
    (customer) => customer.phone === selectedPhone,
  )

  const totalPoints = customers.reduce(
    (sum, customer) => sum + customer.points,
    0,
  )

  const activeCustomers = customers.filter(
    (customer) => customer.status === 'Active',
  ).length

  const totalTransactions = Object.values(history).reduce(
    (sum, entries) => sum + entries.length,
    0,
  )

  const filteredCustomers = customers.filter((customer) => {
    const query = search.trim().toLowerCase()

    return (
      !query ||
      customer.name.toLowerCase().includes(query) ||
      customer.phone.includes(query) ||
      customer.customerId.toLowerCase().includes(query)
    )
  })

  const selectedHistory = selectedPhone
    ? (history[selectedPhone] ?? []).filter((entry) => {
        const matchesType =
          typeFilter === 'All' || entry.type === typeFilter

        const matchesDate =
          !dateFilter ||
          entry.date.toLowerCase().includes(dateFilter.toLowerCase())

        return matchesType && matchesDate
      })
    : []

  const openPoints = (customer: PointsCustomer) => {
    setSelectedPhone(customer.phone)
    setShowAdjustment(false)
    setMessage('')
  }

  const openAdjustment = () => {
    setAdjustmentPoints('')
    setAdjustmentType('Credit')
    setAdjustmentReason('')
    setMessage('')
    setShowAdjustment(true)
  }

  const saveAdjustment = (event: React.FormEvent) => {
    event.preventDefault()

    if (!selectedCustomer) {
      return
    }

    const points = Number(adjustmentPoints)

    if (!points || points <= 0 || !Number.isInteger(points)) {
      setMessage('Enter a valid whole number of points.')
      return
    }

    if (!adjustmentReason.trim()) {
      setMessage('Please enter an adjustment reason.')
      return
    }

    const previousBalance = selectedCustomer.points

    if (adjustmentType === 'Debit' && points > previousBalance) {
      setMessage('Points cannot be reduced below zero.')
      return
    }

    const newBalance =
      adjustmentType === 'Credit'
        ? previousBalance + points
        : previousBalance - points

    const today = '20 Sep 2026'

    const newEntry: PointsHistoryEntry = {
      date: today,
      type: 'Adjustment',
      reference: adjustmentReason.trim(),
      earned: adjustmentType === 'Credit' ? points : 0,
      redeemed: adjustmentType === 'Debit' ? points : 0,
      balance: newBalance,
    }

    setCustomers((current) =>
      current.map((customer) =>
        customer.phone === selectedCustomer.phone
          ? {
              ...customer,
              points: newBalance,
              lastTransaction:
                adjustmentType === 'Credit'
                  ? `Adjustment +${points}`
                  : `Adjustment -${points}`,
              lastTransactionDate: today,
            }
          : customer,
      ),
    )

    setHistory((current) => ({
      ...current,
      [selectedCustomer.phone]: [
        newEntry,
        ...(current[selectedCustomer.phone] ?? []),
      ],
    }))

    setMessage('Points adjustment recorded successfully.')
    setShowAdjustment(false)
  }

  return (
    <div className="space-y-5">
      {!selectedCustomer ? (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Points
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Manage customer points balances and point transactions.
              </p>
            </div>

            <button
              type="button"
              disabled
              className="inline-flex h-10 cursor-not-allowed items-center justify-center gap-2 rounded-lg bg-slate-300 px-4 text-xs font-semibold text-white"
              title="Select a customer first"
            >
              <Plus size={16} weight="bold" />
              Points Adjustment
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Points
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalPoints.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active Customers
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {activeCustomers}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Point Transactions
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalTransactions}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search customer, phone or customer ID..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <select
              value={typeFilter}
              onChange={(event) =>
                setTypeFilter(
                  event.target.value as
                    | 'All'
                    | 'Earned'
                    | 'Redeemed'
                    | 'Adjustment',
                )
              }
              className={inputClass}
            >
              <option value="All">All Transactions</option>
              <option value="Earned">Earned</option>
              <option value="Redeemed">Redeemed</option>
              <option value="Adjustment">Adjustment</option>
            </select>

            <input
              value={dateFilter}
              onChange={(event) => setDateFilter(event.target.value)}
              placeholder="Filter date..."
              className={inputClass}
            />
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1000px] w-full table-fixed">
                <thead className={tableHead}>
                  <tr>
                    <th className="w-[220px] px-4 py-3 text-left">
                      Customer
                    </th>
                    <th className="w-[145px] px-4 py-3 text-left">
                      Phone No.
                    </th>
                    <th className="w-[140px] px-4 py-3 text-left">
                      Customer ID
                    </th>
                    <th className="w-[140px] px-4 py-3 text-right">
                      Current Points
                    </th>
                    <th className="w-[180px] px-4 py-3 text-left">
                      Last Activity
                    </th>
                    <th className="w-[130px] px-4 py-3 text-left">
                      Date
                    </th>
                    <th className="w-[110px] px-4 py-3 text-left">
                      Status
                    </th>
                    <th className="w-[100px] px-4 py-3 text-left">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCustomers.map((customer) => (
                    <tr
                      key={customer.phone}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-800">
                          {customer.name}
                        </div>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {customer.phone}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {customer.customerId}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                        {customer.points.toLocaleString('en-IN')}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {customer.lastTransaction}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {customer.lastTransactionDate}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            customer.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {customer.status}
                        </span>
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openPoints(customer)}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredCustomers.length === 0 && (
                    <tr>
                      <td
                        colSpan={8}
                        className="px-6 py-14 text-center text-sm text-slate-500"
                      >
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPhone(null)
                  setShowAdjustment(false)
                  setMessage('')
                }}
                className="mb-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                ← Back to Points
              </button>

              <h1 className="text-2xl font-semibold text-slate-900">
                {selectedCustomer.name}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {selectedCustomer.phone} · {selectedCustomer.customerId}
              </p>
            </div>

            <button
              type="button"
              onClick={openAdjustment}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={16} weight="bold" />
              Adjust Points
            </button>
          </div>

          {message && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          {showAdjustment && (
            <form
              onSubmit={saveAdjustment}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Adjust Points
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Record a points credit or debit with a reason.
                </p>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Points
                  </label>
                  <input
                    value={adjustmentPoints}
                    onChange={(event) =>
                      setAdjustmentPoints(
                        event.target.value.replace(/\D/g, ''),
                      )
                    }
                    inputMode="numeric"
                    placeholder="0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Adjustment Type
                  </label>
                  <select
                    value={adjustmentType}
                    onChange={(event) =>
                      setAdjustmentType(
                        event.target.value as 'Credit' | 'Debit',
                      )
                    }
                    className={inputClass}
                  >
                    <option value="Credit">Credit</option>
                    <option value="Debit">Debit</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Reason
                  </label>
                  <input
                    value={adjustmentReason}
                    onChange={(event) =>
                      setAdjustmentReason(event.target.value)
                    }
                    placeholder="Enter adjustment reason"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setShowAdjustment(false)}
                  className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-10 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Save Adjustment
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Current Points
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {selectedCustomer.points.toLocaleString('en-IN')}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Transactions
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {history[selectedCustomer.phone]?.length ?? 0}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Customer Status
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    selectedCustomer.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedCustomer.status}
                </span>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Points History
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Complete points transaction ledger for this customer.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[900px] w-full">
                <thead className={tableHead}>
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Reference</th>
                    <th className="px-4 py-3 text-right">Earned</th>
                    <th className="px-4 py-3 text-right">Redeemed</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {selectedHistory.map((entry, index) => (
                    <tr key={`${entry.date}-${entry.reference}-${index}`}>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {entry.date}
                      </td>

                      <td className="px-4 py-3">
                        <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                          {entry.type}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {entry.reference}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-emerald-600">
                        {entry.earned ? `+${entry.earned}` : '—'}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-red-600">
                        {entry.redeemed ? `-${entry.redeemed}` : '—'}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                        {entry.balance}
                      </td>
                    </tr>
                  ))}

                  {selectedHistory.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-14 text-center text-sm text-slate-500"
                      >
                        No point transactions found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


type GiftVoucher = {
  id: string
  voucherNo: string
  customer: string
  phone: string
  issueDate: string
  amount: number
  usedAmount: number
  balance: number
  status: 'Active' | 'Redeemed' | 'Expired' | 'Cancelled'
  expiryDate: string
}

type GiftVoucherHistoryEntry = {
  date: string
  type: 'Issued' | 'Redeemed' | 'Adjustment'
  reference: string
  amount: number
  balance: number
}

const initialGiftVouchers: GiftVoucher[] = [
  {
    id: 'GV001',
    voucherNo: 'TZGV-000001',
    customer: 'Riya Begum',
    phone: '9876543210',
    issueDate: '10 Sep 2026',
    amount: 2500,
    usedAmount: 500,
    balance: 2000,
    status: 'Active',
    expiryDate: '10 Mar 2027',
  },
  {
    id: 'GV002',
    voucherNo: 'TZGV-000002',
    customer: 'Sabiha Khatun',
    phone: '9832123456',
    issueDate: '05 Sep 2026',
    amount: 1500,
    usedAmount: 1500,
    balance: 0,
    status: 'Redeemed',
    expiryDate: '05 Mar 2027',
  },
  {
    id: 'GV003',
    voucherNo: 'TZGV-000003',
    customer: 'Mousumi Das',
    phone: '9007123456',
    issueDate: '01 Apr 2026',
    amount: 1000,
    usedAmount: 0,
    balance: 1000,
    status: 'Expired',
    expiryDate: '01 Sep 2026',
  },
]

const initialGiftVoucherHistory: Record<
  string,
  GiftVoucherHistoryEntry[]
> = {
  GV001: [
    {
      date: '10 Sep 2026',
      type: 'Issued',
      reference: 'Gift Voucher Issue',
      amount: 2500,
      balance: 2500,
    },
    {
      date: '18 Sep 2026',
      type: 'Redeemed',
      reference: 'INV-10025',
      amount: -500,
      balance: 2000,
    },
  ],
  GV002: [
    {
      date: '05 Sep 2026',
      type: 'Issued',
      reference: 'Gift Voucher Issue',
      amount: 1500,
      balance: 1500,
    },
    {
      date: '12 Sep 2026',
      type: 'Redeemed',
      reference: 'INV-10019',
      amount: -1500,
      balance: 0,
    },
  ],
  GV003: [
    {
      date: '01 Apr 2026',
      type: 'Issued',
      reference: 'Gift Voucher Issue',
      amount: 1000,
      balance: 1000,
    },
  ],
}

function CustomerGiftVouchersPage() {
  const [vouchers, setVouchers] =
    useState<GiftVoucher[]>(initialGiftVouchers)

  const [voucherHistory, setVoucherHistory] =
    useState<Record<string, GiftVoucherHistoryEntry[]>>(
      initialGiftVoucherHistory,
    )

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<'All' | GiftVoucher['status']>('All')

  const [selectedVoucherId, setSelectedVoucherId] =
    useState<string | null>(null)

  const [showIssueForm, setShowIssueForm] = useState(false)
  const [message, setMessage] = useState('')

  const [customer, setCustomer] = useState('')
  const [phone, setPhone] = useState('')
  const [amount, setAmount] = useState('')
  const [issueDate, setIssueDate] = useState('20 Sep 2026')
  const [expiryDate, setExpiryDate] = useState('20 Mar 2027')

  const selectedVoucher = vouchers.find(
    (voucher) => voucher.id === selectedVoucherId,
  )

  const totalVoucherValue = vouchers.reduce(
    (sum, voucher) => sum + voucher.amount,
    0,
  )

  const activeVouchers = vouchers.filter(
    (voucher) => voucher.status === 'Active',
  )

  const activeVoucherValue = activeVouchers.reduce(
    (sum, voucher) => sum + voucher.balance,
    0,
  )

  const redeemedValue = vouchers.reduce(
    (sum, voucher) => sum + voucher.usedAmount,
    0,
  )

  const expiredVouchers = vouchers.filter(
    (voucher) => voucher.status === 'Expired',
  ).length

  const filteredVouchers = vouchers.filter((voucher) => {
    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      voucher.voucherNo.toLowerCase().includes(query) ||
      voucher.customer.toLowerCase().includes(query) ||
      voucher.phone.includes(query)

    const matchesStatus =
      statusFilter === 'All' || voucher.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const resetIssueForm = () => {
    setCustomer('')
    setPhone('')
    setAmount('')
    setIssueDate('20 Sep 2026')
    setExpiryDate('20 Mar 2027')
    setMessage('')
  }

  const openIssueForm = () => {
    resetIssueForm()
    setSelectedVoucherId(null)
    setShowIssueForm(true)
  }

  const saveVoucher = (event: React.FormEvent) => {
    event.preventDefault()

    const numericAmount = Number(amount)

    if (!customer.trim()) {
      setMessage('Customer name is required.')
      return
    }

    if (!phone.trim()) {
      setMessage('Customer phone number is required.')
      return
    }

    if (!numericAmount || numericAmount <= 0) {
      setMessage('Enter a valid voucher amount.')
      return
    }

    if (!issueDate.trim() || !expiryDate.trim()) {
      setMessage('Issue date and expiry date are required.')
      return
    }

    const nextNumber = vouchers.length + 1
    const id = `GV${String(nextNumber).padStart(3, '0')}`
    const voucherNo = `TZGV-${String(
      vouchers.length + 1,
    ).padStart(6, '0')}`

    const newVoucher: GiftVoucher = {
      id,
      voucherNo,
      customer: customer.trim(),
      phone: phone.trim(),
      issueDate: issueDate.trim(),
      amount: numericAmount,
      usedAmount: 0,
      balance: numericAmount,
      status: 'Active',
      expiryDate: expiryDate.trim(),
    }

    setVouchers((current) => [newVoucher, ...current])

    setVoucherHistory((current) => ({
      ...current,
      [id]: [
        {
          date: issueDate.trim(),
          type: 'Issued',
          reference: 'Gift Voucher Issue',
          amount: numericAmount,
          balance: numericAmount,
        },
      ],
    }))

    setMessage('Gift voucher issued successfully.')
    setShowIssueForm(false)
  }

  const openVoucher = (voucher: GiftVoucher) => {
    setSelectedVoucherId(voucher.id)
    setShowIssueForm(false)
    setMessage('')
  }

  return (
    <div className="space-y-5">
      {!selectedVoucher ? (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Gift Vouchers
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Issue, manage and track customer gift vouchers.
              </p>
            </div>

            <button
              type="button"
              onClick={openIssueForm}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={16} weight="bold" />
              Issue Gift Voucher
            </button>
          </div>

          {message && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          {showIssueForm && (
            <form
              onSubmit={saveVoucher}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Issue Gift Voucher
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Create a new customer gift voucher.
                </p>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Customer
                  </label>
                  <input
                    value={customer}
                    onChange={(event) =>
                      setCustomer(event.target.value)
                    }
                    placeholder="Customer name"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Phone No.
                  </label>
                  <input
                    value={phone}
                    onChange={(event) =>
                      setPhone(
                        event.target.value.replace(/\D/g, ''),
                      )
                    }
                    inputMode="numeric"
                    placeholder="Customer phone number"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Amount
                  </label>
                  <input
                    value={amount}
                    onChange={(event) =>
                      setAmount(
                        event.target.value.replace(/[^\d.]/g, ''),
                      )
                    }
                    inputMode="decimal"
                    placeholder="₹ 0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Issue Date
                  </label>
                  <input
                    value={issueDate}
                    onChange={(event) =>
                      setIssueDate(event.target.value)
                    }
                    placeholder="DD MMM YYYY"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Expiry Date
                  </label>
                  <input
                    value={expiryDate}
                    onChange={(event) =>
                      setExpiryDate(event.target.value)
                    }
                    placeholder="DD MMM YYYY"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Status
                  </label>
                  <input
                    value="Active"
                    readOnly
                    className={`${inputClass} bg-slate-50 text-slate-500`}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setShowIssueForm(false)}
                  className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-10 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Issue Voucher
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Voucher Value
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {productFormatMoney(totalVoucherValue)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active Voucher Balance
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {productFormatMoney(activeVoucherValue)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Redeemed Value
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {productFormatMoney(redeemedValue)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Expired Vouchers
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {expiredVouchers}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_200px]">
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search voucher, customer or phone..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | 'All'
                    | GiftVoucher['status'],
                )
              }
              className={inputClass}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Redeemed">Redeemed</option>
              <option value="Expired">Expired</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1200px] w-full table-fixed">
                <thead className={tableHead}>
                  <tr>
                    <th className="w-[170px] px-4 py-3 text-left">
                      Gift Voucher No.
                    </th>
                    <th className="w-[180px] px-4 py-3 text-left">
                      Customer
                    </th>
                    <th className="w-[135px] px-4 py-3 text-left">
                      Phone No.
                    </th>
                    <th className="w-[125px] px-4 py-3 text-left">
                      Issue Date
                    </th>
                    <th className="w-[120px] px-4 py-3 text-right">
                      Amount
                    </th>
                    <th className="w-[120px] px-4 py-3 text-right">
                      Balance
                    </th>
                    <th className="w-[110px] px-4 py-3 text-left">
                      Status
                    </th>
                    <th className="w-[135px] px-4 py-3 text-left">
                      Expiry Date
                    </th>
                    <th className="w-[90px] px-4 py-3 text-left">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredVouchers.map((voucher) => (
                    <tr
                      key={voucher.id}
                      className="hover:bg-slate-50"
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                        {voucher.voucherNo}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-700">
                        {voucher.customer}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {voucher.phone}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {voucher.issueDate}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                        {productFormatMoney(voucher.amount)}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                        {productFormatMoney(voucher.balance)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            voucher.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : voucher.status === 'Redeemed'
                                ? 'bg-blue-50 text-blue-700'
                                : voucher.status === 'Expired'
                                  ? 'bg-amber-50 text-amber-700'
                                  : 'bg-slate-100 text-slate-500'
                          }`}
                        >
                          {voucher.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {voucher.expiryDate}
                      </td>

                      <td className="px-4 py-3">
                        <button
                          type="button"
                          onClick={() => openVoucher(voucher)}
                          className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredVouchers.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-14 text-center text-sm text-slate-500"
                      >
                        No gift vouchers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedVoucherId(null)
                  setMessage('')
                }}
                className="mb-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                ← Back to Gift Vouchers
              </button>

              <h1 className="text-2xl font-semibold text-slate-900">
                {selectedVoucher.voucherNo}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {selectedVoucher.customer} · {selectedVoucher.phone}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Original Amount
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {productFormatMoney(selectedVoucher.amount)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Used Amount
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {productFormatMoney(selectedVoucher.usedAmount)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Available Balance
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {productFormatMoney(selectedVoucher.balance)}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Status
              </p>
              <div className="mt-2">
                <span
                  className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                    selectedVoucher.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : selectedVoucher.status === 'Redeemed'
                        ? 'bg-blue-50 text-blue-700'
                        : selectedVoucher.status === 'Expired'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {selectedVoucher.status}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="grid gap-5 p-5 md:grid-cols-4">
              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Customer
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedVoucher.customer}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Phone No.
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedVoucher.phone}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Issue Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedVoucher.issueDate}
                </p>
              </div>

              <div>
                <p className="text-xs font-semibold text-slate-400">
                  Expiry Date
                </p>
                <p className="mt-1 text-sm font-semibold text-slate-800">
                  {selectedVoucher.expiryDate}
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Voucher History
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Issuance and redemption history for this voucher.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[760px] w-full">
                <thead className={tableHead}>
                  <tr>
                    <th className="px-4 py-3 text-left">Date</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Reference</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-right">Balance</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {(voucherHistory[selectedVoucher.id] ?? []).map(
                    (entry, index) => (
                      <tr
                        key={`${entry.date}-${entry.reference}-${index}`}
                      >
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {entry.date}
                        </td>

                        <td className="px-4 py-3">
                          <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                            {entry.type}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-700">
                          {entry.reference}
                        </td>

                        <td
                          className={`px-4 py-3 text-right text-sm font-semibold ${
                            entry.amount >= 0
                              ? 'text-emerald-600'
                              : 'text-red-600'
                          }`}
                        >
                          {entry.amount >= 0 ? '+' : ''}
                          {productFormatMoney(entry.amount)}
                        </td>

                        <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                          {productFormatMoney(entry.balance)}
                        </td>
                      </tr>
                    ),
                  )}

                  {(voucherHistory[selectedVoucher.id] ?? []).length ===
                    0 && (
                    <tr>
                      <td
                        colSpan={5}
                        className="px-6 py-14 text-center text-sm text-slate-500"
                      >
                        No voucher history found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}



function CustomerCouponsPage() {
  const [customers, setCustomers] =
    useState<Customer[]>(initialCustomers)

  const [couponData, setCouponData] =
    useState<Record<string, CustomerCoupon[]>>(customerCoupons)

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] =
    useState<'All' | CustomerCoupon['status']>('All')

  const [selectedPhone, setSelectedPhone] =
    useState<string | null>(null)

  const [showIssueForm, setShowIssueForm] = useState(false)
  const [message, setMessage] = useState('')

  const [customerPhone, setCustomerPhone] = useState('')
  const [couponValue, setCouponValue] = useState('')
  const [issueDate, setIssueDate] = useState('20 Sep 2026')

  const selectedCustomer = customers.find(
    (customer) => customer.phone === selectedPhone,
  )

  const allCoupons = Object.entries(couponData).flatMap(
    ([phone, coupons]) =>
      coupons.map((coupon) => ({
        ...coupon,
        customerPhone: phone,
      })),
  )

  const totalCoupons = allCoupons.length

  const activeCoupons = allCoupons.filter(
    (coupon) => coupon.status === 'Active',
  ).length

  const claimedCoupons = allCoupons.filter(
    (coupon) => coupon.status === 'Claimed',
  ).length

  const expiredCoupons = allCoupons.filter(
    (coupon) => coupon.status === 'Expired',
  ).length

  const filteredCoupons = allCoupons.filter((coupon) => {
    const customer = customers.find(
      (item) => item.phone === coupon.customerPhone,
    )

    const query = search.trim().toLowerCase()

    const matchesSearch =
      !query ||
      coupon.code.toLowerCase().includes(query) ||
      customer?.name.toLowerCase().includes(query) ||
      coupon.customerPhone.includes(query)

    const matchesStatus =
      statusFilter === 'All' || coupon.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const selectedCoupons = selectedPhone
    ? (couponData[selectedPhone] ?? [])
    : []

  const resetIssueForm = () => {
    setCustomerPhone('')
    setCouponValue('')
    setIssueDate('20 Sep 2026')
    setMessage('')
  }

  const openIssueForm = () => {
    resetIssueForm()
    setSelectedPhone(null)
    setShowIssueForm(true)
  }

  const saveCoupon = (event: React.FormEvent) => {
    event.preventDefault()

    const numericValue = Number(couponValue)

    if (!customerPhone) {
      setMessage('Please select a customer.')
      return
    }

    if (!numericValue || numericValue <= 0) {
      setMessage('Enter a valid coupon value.')
      return
    }

    const existingCount = Object.values(couponData).reduce(
      (sum, items) => sum + items.length,
      0,
    )

    const newCoupon: CustomerCoupon = {
      code: `TZCP-${String(existingCount + 1).padStart(6, '0')}`,
      issueDate: issueDate.trim() || '20 Sep 2026',
      value: numericValue,
      status: 'Active',
      claimedDate: '',
      invoiceNo: '',
    }

    setCouponData((current) => ({
      ...current,
      [customerPhone]: [
        ...(current[customerPhone] ?? []),
        newCoupon,
      ],
    }))

    setCustomers((current) =>
      current.map((customer) =>
        customer.phone === customerPhone
          ? {
              ...customer,
              couponCount: customer.couponCount + 1,
            }
          : customer,
      ),
    )

    setMessage('Coupon issued successfully.')
    setShowIssueForm(false)
  }

  const openCustomerCoupons = (phone: string) => {
    setSelectedPhone(phone)
    setShowIssueForm(false)
    setMessage('')
  }

  return (
    <div className="space-y-5">
      {!selectedPhone ? (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">
                Coupons
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Issue and manage customer coupons.
              </p>
            </div>

            <button
              type="button"
              onClick={openIssueForm}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={16} weight="bold" />
              Issue Coupon
            </button>
          </div>

          {message && (
            <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700">
              {message}
            </div>
          )}

          {showIssueForm && (
            <form
              onSubmit={saveCoupon}
              className="rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-base font-semibold text-slate-900">
                  Issue Coupon
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Create a coupon for an existing customer.
                </p>
              </div>

              <div className="grid gap-5 p-5 md:grid-cols-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Customer
                  </label>

                  <select
                    value={customerPhone}
                    onChange={(event) =>
                      setCustomerPhone(event.target.value)
                    }
                    className={inputClass}
                  >
                    <option value="">Select customer</option>
                    {customers
                      .filter((customer) => customer.status === 'Active')
                      .map((customer) => (
                        <option
                          key={customer.phone}
                          value={customer.phone}
                        >
                          {customer.name} — {customer.phone}
                        </option>
                      ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Coupon Value
                  </label>

                  <input
                    value={couponValue}
                    onChange={(event) =>
                      setCouponValue(
                        event.target.value.replace(/[^\d.]/g, ''),
                      )
                    }
                    inputMode="decimal"
                    placeholder="₹ 0"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Issue Date
                  </label>

                  <input
                    value={issueDate}
                    onChange={(event) =>
                      setIssueDate(event.target.value)
                    }
                    placeholder="DD MMM YYYY"
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 px-5 py-4">
                <button
                  type="button"
                  onClick={() => setShowIssueForm(false)}
                  className="h-10 rounded-lg border border-slate-200 px-4 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="h-10 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
                >
                  Issue Coupon
                </button>
              </div>
            </form>
          )}

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Coupons
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {totalCoupons}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active Coupons
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {activeCoupons}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Claimed Coupons
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {claimedCoupons}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Expired Coupons
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {expiredCoupons}
              </p>
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-[1fr_200px]">
            <div className="relative">
              <MagnifyingGlass
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search coupon, customer or phone..."
                className={`${inputClass} pl-10`}
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(
                  event.target.value as
                    | 'All'
                    | CustomerCoupon['status'],
                )
              }
              className={inputClass}
            >
              <option value="All">All Status</option>
              <option value="Active">Active</option>
              <option value="Claimed">Claimed</option>
              <option value="Expired">Expired</option>
            </select>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-[1050px] w-full table-fixed">
                <thead className={tableHead}>
                  <tr>
                    <th className="w-[150px] px-4 py-3 text-left">
                      Coupon
                    </th>
                    <th className="w-[190px] px-4 py-3 text-left">
                      Customer
                    </th>
                    <th className="w-[145px] px-4 py-3 text-left">
                      Phone No.
                    </th>
                    <th className="w-[125px] px-4 py-3 text-left">
                      Issue Date
                    </th>
                    <th className="w-[120px] px-4 py-3 text-right">
                      Value
                    </th>
                    <th className="w-[120px] px-4 py-3 text-left">
                      Status
                    </th>
                    <th className="w-[135px] px-4 py-3 text-left">
                      Claimed Date
                    </th>
                    <th className="w-[130px] px-4 py-3 text-left">
                      Invoice No.
                    </th>
                    <th className="w-[90px] px-4 py-3 text-left">
                      Action
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {filteredCoupons.map((coupon, index) => {
                    const customer = customers.find(
                      (item) => item.phone === coupon.customerPhone,
                    )

                    return (
                      <tr
                        key={`${coupon.customerPhone}-${coupon.code}-${index}`}
                        className="hover:bg-slate-50"
                      >
                        <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                          {coupon.code}
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-700">
                          {customer?.name ?? 'Unknown'}
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-600">
                          {coupon.customerPhone}
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-600">
                          {coupon.issueDate}
                        </td>

                        <td className="px-4 py-3 text-right text-sm font-semibold text-slate-800">
                          {productFormatMoney(coupon.value)}
                        </td>

                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                              coupon.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : coupon.status === 'Claimed'
                                  ? 'bg-blue-50 text-blue-700'
                                  : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {coupon.status}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-600">
                          {coupon.claimedDate || '—'}
                        </td>

                        <td className="px-4 py-3 text-sm text-slate-600">
                          {coupon.invoiceNo || '—'}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() =>
                              openCustomerCoupons(coupon.customerPhone)
                            }
                            className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            View
                          </button>
                        </td>
                      </tr>
                    )
                  })}

                  {filteredCoupons.length === 0 && (
                    <tr>
                      <td
                        colSpan={9}
                        className="px-6 py-14 text-center text-sm text-slate-500"
                      >
                        No coupons found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <button
                type="button"
                onClick={() => {
                  setSelectedPhone(null)
                  setMessage('')
                }}
                className="mb-2 text-xs font-semibold text-slate-500 hover:text-slate-900"
              >
                ← Back to Coupons
              </button>

              <h1 className="text-2xl font-semibold text-slate-900">
                {selectedCustomer?.name ?? 'Customer'}
              </h1>

              <p className="mt-1 text-sm text-slate-500">
                {selectedPhone} · {selectedCustomer?.customerId ?? '—'}
              </p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Total Coupons
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {selectedCoupons.length}
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Active Coupons
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {
                  selectedCoupons.filter(
                    (coupon) => coupon.status === 'Active',
                  ).length
                }
              </p>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Coupon Value
              </p>
              <p className="mt-2 text-2xl font-semibold text-slate-900">
                {productFormatMoney(
                  selectedCoupons.reduce(
                    (sum, coupon) => sum + coupon.value,
                    0,
                  ),
                )}
              </p>
            </div>
          </div>

          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-base font-semibold text-slate-900">
                Coupon History
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Coupons issued to this customer.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[850px] w-full">
                <thead className={tableHead}>
                  <tr>
                    <th className="px-4 py-3 text-left">Coupon</th>
                    <th className="px-4 py-3 text-left">Issue Date</th>
                    <th className="px-4 py-3 text-right">Value</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Claimed Date</th>
                    <th className="px-4 py-3 text-left">Invoice No.</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {selectedCoupons.map((coupon) => (
                    <tr key={coupon.code}>
                      <td className="px-4 py-3 text-sm font-semibold text-slate-800">
                        {coupon.code}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {coupon.issueDate}
                      </td>

                      <td className="px-4 py-3 text-right text-sm font-semibold text-slate-900">
                        {productFormatMoney(coupon.value)}
                      </td>

                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                            coupon.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700'
                              : coupon.status === 'Claimed'
                                ? 'bg-blue-50 text-blue-700'
                                : 'bg-amber-50 text-amber-700'
                          }`}
                        >
                          {coupon.status}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {coupon.claimedDate || '—'}
                      </td>

                      <td className="px-4 py-3 text-sm text-slate-600">
                        {coupon.invoiceNo || '—'}
                      </td>
                    </tr>
                  ))}

                  {selectedCoupons.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="px-6 py-14 text-center text-sm text-slate-500"
                      >
                        No coupons found for this customer.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}


function BillDiscountPage() {
  type DiscountMode = 'auto' | '10' | '15' | 'custom'

  type CalculatorItem = {
    id: number
    name: string
    mrp: string
    quantity: string
    discountMode: DiscountMode
    customDiscount: string
  }

  const [items, setItems] = useState<CalculatorItem[]>([
    {
      id: 1,
      name: 'Product 1',
      mrp: '',
      quantity: '1',
      discountMode: 'auto',
      customDiscount: '10',
    },
  ])

  const addItem = () => {
    setItems((current) => [
      ...current,
      {
        id: Date.now(),
        name: `Product ${current.length + 1}`,
        mrp: '',
        quantity: '1',
        discountMode: 'auto',
        customDiscount: '10',
      },
    ])
  }

  const removeItem = (id: number) => {
    setItems((current) =>
      current.length === 1
        ? current
        : current.filter((item) => item.id !== id),
    )
  }

  const updateItem = (
    id: number,
    patch: Partial<CalculatorItem>,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.id === id
          ? { ...item, ...patch }
          : item,
      ),
    )
  }

  const getDiscountRate = (item: CalculatorItem) => {
    const mrp = Math.max(0, Number(item.mrp) || 0)

    switch (item.discountMode) {
      case '10':
        return 10
      case '15':
        return 15
      case 'custom':
        return Math.min(
          100,
          Math.max(
            0,
            Number(item.customDiscount) || 0,
          ),
        )
      default:
        return mrp < 1000 ? 10 : 15
    }
  }

  const calculateItem = (item: CalculatorItem) => {
    const mrp = Math.max(0, Number(item.mrp) || 0)
    const quantity = Math.max(
      0,
      Math.floor(Number(item.quantity) || 0),
    )

    const gross = mrp * quantity
    const discountRate = getDiscountRate(item)
    const discount = (gross * discountRate) / 100
    const afterDiscount = Math.round(
      Math.max(0, gross - discount),
    )

    return {
      gross,
      discountRate,
      discount,
      afterDiscount,
    }
  }

  const totals = items.reduce(
    (summary, item) => {
      const result = calculateItem(item)

      return {
        totalMrp:
          summary.totalMrp + result.gross,
        discount:
          summary.discount +
          Math.max(
            0,
            result.gross - result.afterDiscount,
          ),
        finalBill:
          summary.finalBill +
          result.afterDiscount,
      }
    },
    {
      totalMrp: 0,
      discount: 0,
      finalBill: 0,
    },
  )

  const youSave = Math.max(
    0,
    totals.totalMrp - totals.finalBill,
  )

  return (
    <section className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Discount Calculator
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Quickly calculate the selling price of one or more
          products after applying the applicable discount.
        </p>
      </div>

      <div className="grid items-start gap-5 xl:grid-cols-[1fr_320px]">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-4 md:px-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Items
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Auto: below ₹1,000 = 10% · ₹1,000 and above = 15%
              </p>
            </div>

            <button
              type="button"
              onClick={addItem}
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white hover:bg-slate-800"
            >
              <Plus size={15} />
              Add Item
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {items.map((item, index) => {
              const result = calculateItem(item)

              return (
                <div
                  key={item.id}
                  className="p-4 md:p-5"
                >
                  <div className="mb-3 flex items-center justify-between gap-3">
                    <div className="text-xs font-semibold text-slate-500">
                      Item {index + 1}
                    </div>

                    {items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="text-xs font-medium text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 sm:justify-end md:ml-auto md:max-w-[440px]">
                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                        MRP
                      </label>

                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                          ₹
                        </span>

                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={item.mrp}
                          onChange={(event) =>
                            updateItem(item.id, {
                              mrp: event.target.value,
                            })
                          }
                          className="h-10 w-full rounded-lg border border-slate-200 pl-7 pr-3 text-sm outline-none focus:border-slate-400"
                          placeholder="0"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                        Quantity
                      </label>

                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={item.quantity}
                        onChange={(event) =>
                          updateItem(item.id, {
                            quantity: event.target.value,
                          })
                        }
                        className="h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-400"
                      />
                    </div>

                    <div>
                      <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                        Discount
                      </label>

                      <select
                        value={item.discountMode}
                        onChange={(event) =>
                          updateItem(item.id, {
                            discountMode:
                              event.target.value as DiscountMode,
                          })
                        }
                        className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-400"
                      >
                        <option value="auto">
                          Auto
                        </option>
                        <option value="10">
                          10%
                        </option>
                        <option value="15">
                          15%
                        </option>
                        <option value="custom">
                          Custom
                        </option>
                      </select>

                      {item.discountMode === 'custom' && (
                        <div className="relative mt-2">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={item.customDiscount}
                            onChange={(event) =>
                              updateItem(item.id, {
                                customDiscount:
                                  event.target.value,
                              })
                            }
                            className="h-9 w-full rounded-lg border border-slate-200 px-3 pr-8 text-sm outline-none focus:border-slate-400"
                            placeholder="Discount %"
                          />

                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                            %
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-3 gap-2 rounded-lg bg-slate-50 p-3">
                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Gross Amount
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums text-slate-700">
                        {productFormatMoney(result.gross)}
                      </div>
                    </div>

                    <div>
                      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        Discount
                      </div>
                      <div className="mt-1 text-sm font-semibold tabular-nums text-emerald-600">
                        -{productFormatMoney(
                          Math.max(
                            0,
                            result.gross -
                              result.afterDiscount,
                          ),
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        {result.discountRate}%
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] font-medium uppercase tracking-wide text-slate-400">
                        After Discount
                      </div>
                      <div className="mt-1 text-lg font-bold tabular-nums text-slate-900">
                        {productFormatMoney(
                          result.afterDiscount,
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        <div className="h-fit rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Bill Summary
            </h2>
          </div>

          <div className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Total MRP
              </span>
              <span className="text-sm font-semibold tabular-nums text-slate-900">
                {productFormatMoney(totals.totalMrp)}
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-500">
                Discount Amount
              </span>
              <span className="text-sm font-semibold tabular-nums text-emerald-600">
                -{productFormatMoney(totals.discount)}
              </span>
            </div>

            <div className="border-t border-slate-100 pt-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
                  Final Bill
                </span>
                <span className="text-xl font-bold tabular-nums text-slate-900">
                  {productFormatMoney(totals.finalBill)}
                </span>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-50 px-4 py-3">
              <div className="text-xs font-medium text-emerald-700">
                You Save
              </div>
              <div className="mt-1 text-lg font-bold tabular-nums text-emerald-700">
                {productFormatMoney(youSave)}
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-5 text-slate-500">
              <div className="font-semibold text-slate-700">
                Automatic discount
              </div>
              <div className="mt-1">
                Below ₹1,000 → 10%
              </div>
              <div>
                ₹1,000 and above → 15%
              </div>
              <div className="mt-1 text-[11px] text-slate-400">
                Each item's final amount is rounded to the nearest rupee.
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function PricingPage() {
  const [pricingMode, setPricingMode] = useState<'mrp' | 'selling'>('mrp')

  return (
    <section className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Pricing
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage the pricing rules used by products and the POS.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Pricing Configuration
            </h2>
            <p className="mt-1 text-xs text-slate-500">
              Configure how product prices are represented in the system.
            </p>
          </div>

          <div className="space-y-6 p-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-slate-700">
                Primary POS Price
              </label>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPricingMode('mrp')}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                    pricingMode === 'mrp'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  MRP
                </button>

                <button
                  type="button"
                  onClick={() => setPricingMode('selling')}
                  className={`rounded-lg border px-4 py-3 text-sm font-medium ${
                    pricingMode === 'selling'
                      ? 'border-slate-900 bg-slate-900 text-white'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  Selling Price
                </button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Default GST Included
                </label>
                <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                  <option>Yes</option>
                  <option>No</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-slate-700">
                  Price Rounding
                </label>
                <select className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm outline-none focus:border-slate-400">
                  <option>Nearest ₹1</option>
                  <option>Nearest ₹5</option>
                  <option>Nearest ₹10</option>
                  <option>No Rounding</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <CurrencyInr size={20} className="mt-0.5 text-slate-600" />
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    POS pricing
                  </div>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Product-level price and MRP remain controlled from the
                    product master. This page defines the pricing behavior
                    used by the POS.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end border-t border-slate-100 pt-5">
              <button
                type="button"
                className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
              >
                Save Pricing
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6">
          <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-slate-100">
            <CurrencyInr size={22} className="text-slate-700" />
          </div>

          <h2 className="text-base font-semibold text-slate-900">
            Pricing Summary
          </h2>

          <div className="mt-5 space-y-4">
            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">POS Price</span>
              <span className="text-sm font-semibold text-slate-900">
                {pricingMode === 'mrp' ? 'MRP' : 'Selling Price'}
              </span>
            </div>

            <div className="flex justify-between border-b border-slate-100 pb-3">
              <span className="text-sm text-slate-500">GST</span>
              <span className="text-sm font-semibold text-slate-900">
                Included
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-sm text-slate-500">Rounding</span>
              <span className="text-sm font-semibold text-slate-900">
                ₹1
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

function Placeholder({ title }: { title: string }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-8">
      <h1 className="text-xl font-semibold text-slate-900">
        {title}
      </h1>

      <p className="mt-2 text-sm text-slate-500">
        This module is ready for the next implementation phase.
      </p>
    </section>
  )
}

function Shell({ onLogout }: { onLogout: () => void }) {
  const { user } = useAuth()
  const [mobileMenu, setMobileMenu] = useState(false)
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    POS: true,
  })

  const toggleMenu = (label: string) => {
    setExpandedMenus((current) => ({
      ...current,
      [label]: !current[label],
    }))
  }

  return (
    <div className="min-h-screen bg-[#f7f8fa]">
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-[250px] border-r border-slate-200 bg-white transition-transform ${
          mobileMenu
            ? 'translate-x-0'
            : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex h-16 items-center border-b border-slate-100 px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-900 text-sm font-bold text-white">
              T
            </div>

            <div>
              <div className="text-sm font-bold tracking-[0.16em]">
                TAZEEN
              </div>

              <div className="text-[10px] text-slate-400">
                POS SYSTEM
              </div>
            </div>
          </div>

          <button
            onClick={() => setMobileMenu(false)}
            className="ml-auto p-2 text-slate-400 lg:hidden"
          >
            <X size={18} />
          </button>
        </div>

        <div className="h-[calc(100vh-64px)] overflow-y-auto px-3 py-5">
          <div className="mb-3 px-3 text-[10px] font-bold uppercase tracking-[0.14em] text-slate-400">
            Main Menu
          </div>

          <nav className="space-y-1">
            {navItems.map((item) => {
              if ('children' in item) {
                const isExpanded = expandedMenus[item.label] ?? false

                return (
                  <div key={item.label}>
                    <button
                      type="button"
                      onClick={() => toggleMenu(item.label)}
                      className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    >
                      <item.icon size={19} />
                      <span className="flex-1 text-left">
                        {item.label}
                      </span>

                      {isExpanded ? (
                        <CaretDown size={15} />
                      ) : (
                        <CaretRight size={15} />
                      )}
                    </button>

                    {isExpanded && (
                      <div className="ml-5 mt-1 space-y-0.5 border-l border-slate-100 pl-3">
                        {item.children.map((child) => (
                          <NavLink
                            key={child.path}
                            to={child.path}
                            onClick={() => setMobileMenu(false)}
                            className={({ isActive }) =>
                              `block rounded-md px-3 py-2 text-[13px] transition ${
                                isActive
                                  ? 'bg-slate-100 font-semibold text-slate-900'
                                  : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
                              }`
                            }
                          >
                            {child.label}
                          </NavLink>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === '/'}
                  onClick={() => setMobileMenu(false)}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                      isActive
                        ? 'bg-slate-900 font-medium text-white'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <item.icon size={19} />
                  {item.label}
                </NavLink>
              )
            })}
          </nav>

          <div className="my-6 border-t border-slate-100" />

          <button
            onClick={onLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-slate-500 hover:bg-red-50 hover:text-red-600"
          >
            <SignOut size={19} />
            Sign out
          </button>
        </div>
      </aside>

      {mobileMenu && (
        <button
          aria-label="Close menu"
          onClick={() => setMobileMenu(false)}
          className="fixed inset-0 z-40 bg-slate-900/20 lg:hidden"
        />
      )}

      <div className="lg:pl-[250px]">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur md:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileMenu(true)}
              className="rounded-lg p-2 text-slate-500 lg:hidden"
            >
              <List size={21} />
            </button>

            <div className="hidden h-9 w-[260px] items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 md:flex">
              <MagnifyingGlass size={17} className="text-slate-400" />

              <input
                placeholder="Search..."
                className="w-full bg-transparent text-sm outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <button className="relative rounded-lg p-2.5 text-slate-500 hover:bg-slate-50">
              <Bell size={20} />

              <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-red-500" />
            </button>

            <div className="hidden h-7 w-px bg-slate-200 sm:block" />

            <button className="flex items-center gap-2 rounded-lg p-1.5 hover:bg-slate-50">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                {(user?.full_name ?? '?').charAt(0).toUpperCase()}
              </div>

              <div className="hidden text-left sm:block">
                <div className="text-xs font-semibold">
                  {user?.full_name ?? ''}
                </div>

                <div className="text-[10px] text-slate-400">
                  {user?.phone ?? ''}
                </div>
              </div>

              <CaretDown
                size={14}
                className="hidden text-slate-400 sm:block"
              />
            </button>
          </div>
        </header>

        <main className="p-4 md:p-6">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/bill-discount" element={<BillDiscountPage />} />
            <Route path="/pricing" element={<PricingPage />} />
            <Route path="/engagement/*" element={<EngagementPage />} />

            {navItems.flatMap((item) => {
              if ('children' in item) {
                return item.children.map((child) => (
                  <Route
                    key={child.path}
                    path={child.path}
                    element={
                      child.path === '/pos/desktop' ? (
                        <POSDesktopPage />
                      ) : child.path === '/gst/credit' ? (
                        <GstCreditPage />
                      ) : child.path === '/gst/gstr-1' ? (
                        <Gstr1Page />
                      ) : child.path === '/gst/management' ? (
                        <GstManagementPage />
                      ) : child.path === '/inventory/location-transfer' ? (
                        <InventoryLocationTransferPage />
                      ) : child.path === '/inventory/stock' ? (
                        <InventoryStockPage />
                      ) : child.path === '/purchases/invoices' ? (
                        <PurchaseInvoicesPage />
                      ) : child.path === '/sales/invoices' ? (
                        <SalesInvoicesPage />
                      ) : child.path === '/sales/exchanges' ? (
                        <SalesExchangesPage />
                      ) : child.path === '/products/categories' ? (
                        <ProductCategoriesPage />
                      ) : child.path === '/products' ? (
                        <ProductPage />
                      ) : child.path === '/customers/profile' ? (
                        <CustomerProfilePage />
                      ) : child.path === '/customers/wallet' ? (
                        <CustomerWalletPage />
                      ) : child.path === '/customers/points' ? (
                        <CustomerPointsPage />
                      ) : child.path === '/customers/gift-vouchers' ? (
                        <CustomerGiftVouchersPage />
                      ) : child.path === '/customers/coupons' ? (
                        <CustomerCouponsPage />
                      ) : child.path === '/staff/employees' ? (
                        <EmployeesPage />
                      ) : child.path === '/finance/expenses' ? (
                        <ExpensesPage />
                      ) : (
                        <Placeholder title={child.label} />
                      )
                    }
                  />
                ))
              }

              if (item.path === '/' || item.path === '/engagement') {
                return []
              }

              if (item.path === '/suppliers') {
                return [
                  <Route
                    key={item.path}
                    path={item.path}
                    element={<SupplierPage />}
                  />,
                ]
              }

              return [
                <Route
                  key={item.path}
                  path={item.path}
                  element={<Placeholder title={item.label} />}
                />,
              ]
            })}
          </Routes>
        </main>
      </div>
    </div>
  )
}

function App() {
  const { user, loading, logout } = useAuth()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f5f6f8] text-sm text-slate-400">
        Loading...
      </div>
    )
  }

  if (!user) {
    return <Login />
  }

  return <Shell onLogout={() => void logout()} />
}

export default function Root() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  )
}
