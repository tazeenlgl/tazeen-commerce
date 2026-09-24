import { useMemo, useState } from 'react'

type ExpenseStatus = 'Active' | 'Cancelled'

type ExpenseCategory = {
  id: string
  name: string
  code: string
  description: string
  status: 'Active' | 'Inactive'
  subCategories: ExpenseSubCategory[]
}

type ExpenseSubCategory = {
  id: string
  name: string
  code: string
  status: 'Active' | 'Inactive'
}

type Expense = {
  id: string
  date: string
  category: string
  subCategory: string
  description: string
  amount: number
  paymentMethod: 'Cash' | 'Bank' | 'UPI' | 'Card' | 'Other'
  reference: string
  paidTo: string
  notes: string
  status: ExpenseStatus
}

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'

const money = (value: number) =>
  `₹${value.toLocaleString('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`

const dateLabel = (value: string) =>
  new Date(`${value}T00:00:00`).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })

const initialCategories: ExpenseCategory[] = [
  {
    id: 'EXC-001',
    name: 'Rent & Lease',
    code: 'RENT',
    description: 'Showroom, warehouse and office rent.',
    status: 'Active',
    subCategories: [
      {
        id: 'EXSC-001',
        name: 'Showroom Rent',
        code: 'RENT-SHOW',
        status: 'Active',
      },
      {
        id: 'EXSC-002',
        name: 'Warehouse Rent',
        code: 'RENT-WARE',
        status: 'Active',
      },
      {
        id: 'EXSC-003',
        name: 'Office Rent',
        code: 'RENT-OFF',
        status: 'Active',
      },
    ],
  },
  {
    id: 'EXC-002',
    name: 'Utilities',
    code: 'UTIL',
    description: 'Electricity, internet and telephone.',
    status: 'Active',
    subCategories: [
      {
        id: 'EXSC-004',
        name: 'Electricity',
        code: 'UTIL-ELEC',
        status: 'Active',
      },
      {
        id: 'EXSC-005',
        name: 'Internet',
        code: 'UTIL-NET',
        status: 'Active',
      },
      {
        id: 'EXSC-006',
        name: 'Telephone',
        code: 'UTIL-TEL',
        status: 'Active',
      },
    ],
  },
  {
    id: 'EXC-003',
    name: 'Staff & Salary',
    code: 'STAFF',
    description: 'Employee-related expenses.',
    status: 'Active',
    subCategories: [
      {
        id: 'EXSC-007',
        name: 'Salary',
        code: 'STAFF-SAL',
        status: 'Active',
      },
      {
        id: 'EXSC-008',
        name: 'Staff Welfare',
        code: 'STAFF-WEL',
        status: 'Active',
      },
    ],
  },
  {
    id: 'EXC-004',
    name: 'Transport',
    code: 'TRANS',
    description: 'Local transport, delivery and fuel.',
    status: 'Active',
    subCategories: [
      {
        id: 'EXSC-009',
        name: 'Local Transport',
        code: 'TRANS-LOCAL',
        status: 'Active',
      },
      {
        id: 'EXSC-010',
        name: 'Delivery',
        code: 'TRANS-DEL',
        status: 'Active',
      },
      {
        id: 'EXSC-011',
        name: 'Fuel',
        code: 'TRANS-FUEL',
        status: 'Active',
      },
    ],
  },
  {
    id: 'EXC-005',
    name: 'Office Expenses',
    code: 'OFFICE',
    description: 'General office operating expenses.',
    status: 'Active',
    subCategories: [
      {
        id: 'EXSC-012',
        name: 'Stationery',
        code: 'OFF-STAT',
        status: 'Active',
      },
      {
        id: 'EXSC-013',
        name: 'Printing',
        code: 'OFF-PRINT',
        status: 'Active',
      },
    ],
  },
  {
    id: 'EXC-006',
    name: 'Repairs & Maintenance',
    code: 'REPAIR',
    description: 'Repairs and maintenance expenses.',
    status: 'Active',
    subCategories: [
      {
        id: 'EXSC-014',
        name: 'Equipment Repair',
        code: 'REPAIR-EQ',
        status: 'Active',
      },
      {
        id: 'EXSC-015',
        name: 'Electrical Repair',
        code: 'REPAIR-EL',
        status: 'Active',
      },
    ],
  },
  {
    id: 'EXC-007',
    name: 'Marketing',
    code: 'MKT',
    description: 'Advertising and promotional expenses.',
    status: 'Active',
    subCategories: [
      {
        id: 'EXSC-016',
        name: 'Advertising',
        code: 'MKT-ADV',
        status: 'Active',
      },
      {
        id: 'EXSC-017',
        name: 'Promotion',
        code: 'MKT-PROMO',
        status: 'Active',
      },
    ],
  },
  {
    id: 'EXC-008',
    name: 'Other Expenses',
    code: 'OTHER',
    description: 'Other business operating expenses.',
    status: 'Active',
    subCategories: [
      {
        id: 'EXSC-018',
        name: 'Miscellaneous',
        code: 'OTHER-MISC',
        status: 'Active',
      },
    ],
  },
]

const initialExpenses: Expense[] = [
  {
    id: 'EXP-000001',
    date: '2026-09-02',
    category: 'Utilities',
    subCategory: 'Electricity',
    description: 'September showroom electricity bill',
    amount: 4850,
    paymentMethod: 'Bank',
    reference: 'WBSEDCL-SEP-26',
    paidTo: 'WBSEDCL',
    notes: '',
    status: 'Active',
  },
  {
    id: 'EXP-000002',
    date: '2026-09-05',
    category: 'Transport',
    subCategory: 'Local Transport',
    description: 'Local goods transportation',
    amount: 1250,
    paymentMethod: 'Cash',
    reference: '',
    paidTo: 'Local Transport',
    notes: '',
    status: 'Active',
  },
  {
    id: 'EXP-000003',
    date: '2026-09-08',
    category: 'Office Expenses',
    subCategory: 'Printing',
    description: 'Bill book and office printing',
    amount: 900,
    paymentMethod: 'UPI',
    reference: 'PW-901',
    paidTo: 'Print World',
    notes: '',
    status: 'Active',
  },
]

function PageHeader({
  title,
  description,
}: {
  title: string
  description: string
}) {
  return (
    <div className="mb-5">
      <h1 className="text-xl font-semibold text-slate-900">{title}</h1>
      <p className="mt-1 text-sm text-slate-500">{description}</p>
    </div>
  )
}

function ExpenseForm({
  categories,
  expense,
  onSave,
  onCancel,
}: {
  categories: ExpenseCategory[]
  expense?: Expense | null
  onSave: (expense: Expense) => void
  onCancel: () => void
}) {
  const [date, setDate] = useState(expense?.date || '2026-09-20')
  const [category, setCategory] = useState(
    expense?.category || categories[0]?.name || '',
  )
  const selectedCategory = categories.find(
    (item) => item.name === category,
  )

  const [subCategory, setSubCategory] = useState(
    expense?.subCategory ||
      selectedCategory?.subCategories[0]?.name ||
      '',
  )
  const [description, setDescription] = useState(
    expense?.description || '',
  )
  const [amount, setAmount] = useState(
    expense ? String(expense.amount) : '',
  )
  const [paymentMethod, setPaymentMethod] =
    useState<Expense['paymentMethod']>(
      expense?.paymentMethod || 'Cash',
    )
  const [reference, setReference] = useState(
    expense?.reference || '',
  )
  const [paidTo, setPaidTo] = useState(expense?.paidTo || '')
  const [notes, setNotes] = useState(expense?.notes || '')
  const [attachment, setAttachment] = useState('')

  const changeCategory = (value: string) => {
    setCategory(value)

    const nextCategory = categories.find(
      (item) => item.name === value,
    )

    setSubCategory(
      nextCategory?.subCategories[0]?.name || '',
    )
  }

  const submit = () => {
    const numericAmount = Number(amount)

    if (!date || !category || !subCategory || !numericAmount) {
      window.alert(
        'Please complete Expense Date, Category, Sub-Category and Amount.',
      )
      return
    }

    onSave({
      id: expense?.id || `EXP-${String(Date.now()).slice(-6)}`,
      date,
      category,
      subCategory,
      description: description.trim(),
      amount: numericAmount,
      paymentMethod,
      reference: reference.trim(),
      paidTo: paidTo.trim(),
      notes: notes.trim(),
      status: expense?.status || 'Active',
    })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          {expense ? 'Edit Expense' : 'Add Expense'}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Record a business expense and its payment details.
        </p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Expense Date <span className="text-red-500">*</span>
            </span>
            <input
              type="date"
              className={inputClass}
              value={date}
              onChange={(event) => setDate(event.target.value)}
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Category <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClass}
              value={category}
              onChange={(event) =>
                changeCategory(event.target.value)
              }
            >
              {categories
                .filter((item) => item.status === 'Active')
                .map((item) => (
                  <option key={item.id}>{item.name}</option>
                ))}
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Sub-Category <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClass}
              value={subCategory}
              onChange={(event) =>
                setSubCategory(event.target.value)
              }
            >
              {(selectedCategory?.subCategories || [])
                .filter((item) => item.status === 'Active')
                .map((item) => (
                  <option key={item.id}>{item.name}</option>
                ))}
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Amount <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              min="0"
              className={inputClass}
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              placeholder="0.00"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Payment Method <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClass}
              value={paymentMethod}
              onChange={(event) =>
                setPaymentMethod(
                  event.target.value as Expense['paymentMethod'],
                )
              }
            >
              <option>Cash</option>
              <option>Bank</option>
              <option>UPI</option>
              <option>Card</option>
              <option>Other</option>
            </select>
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Paid To
            </span>
            <input
              className={inputClass}
              value={paidTo}
              onChange={(event) => setPaidTo(event.target.value)}
              placeholder="Person / company"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Reference / Bill No.
            </span>
            <input
              className={inputClass}
              value={reference}
              onChange={(event) =>
                setReference(event.target.value)
              }
              placeholder="Optional reference"
            />
          </label>

          <label className="md:col-span-2">
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Description
            </span>
            <input
              className={inputClass}
              value={description}
              onChange={(event) =>
                setDescription(event.target.value)
              }
              placeholder="What was this expense for?"
            />
          </label>

          <label className="md:col-span-2 xl:col-span-3">
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Notes
            </span>
            <textarea
              className="min-h-[90px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional notes"
            />
          </label>

          <label className="md:col-span-2 xl:col-span-3">
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Attachment
            </span>

            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="block w-full rounded-lg border border-dashed border-slate-300 bg-slate-50 px-3 py-3 text-xs text-slate-500"
              onChange={(event) =>
                setAttachment(event.target.files?.[0]?.name || '')
              }
            />

            {attachment && (
              <p className="mt-1.5 text-[10px] text-slate-400">
                Selected: {attachment}
              </p>
            )}
          </label>
        </div>

        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={submit}
            className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
          >
            {expense ? 'Save Changes' : 'Save Expense'}
          </button>
        </div>
      </div>
    </section>
  )
}

function CategoryManager({
  categories,
  onChange,
}: {
  categories: ExpenseCategory[]
  onChange: (categories: ExpenseCategory[]) => void
}) {
  const [expanded, setExpanded] = useState<string | null>(
    categories[0]?.id || null,
  )
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [showSubCategoryForm, setShowSubCategoryForm] =
    useState<string | null>(null)

  const [categoryName, setCategoryName] = useState('')
  const [categoryDescription, setCategoryDescription] =
    useState('')

  const [subCategoryName, setSubCategoryName] = useState('')

  const addCategory = () => {
    if (!categoryName.trim()) {
      window.alert('Enter a category name.')
      return
    }

    const category: ExpenseCategory = {
      id: `EXC-${String(Date.now()).slice(-5)}`,
      name: categoryName.trim(),
      code: `EXP-${String(Date.now()).slice(-4)}`,
      description: categoryDescription.trim(),
      status: 'Active',
      subCategories: [],
    }

    onChange([...categories, category])
    setCategoryName('')
    setCategoryDescription('')
    setShowCategoryForm(false)
    setExpanded(category.id)
  }

  const addSubCategory = (categoryId: string) => {
    if (!subCategoryName.trim()) {
      window.alert('Enter a sub-category name.')
      return
    }

    onChange(
      categories.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              subCategories: [
                ...category.subCategories,
                {
                  id: `EXSC-${String(Date.now()).slice(-6)}`,
                  name: subCategoryName.trim(),
                  code: `${category.code}-SUB${category.subCategories.length + 1}`,
                  status: 'Active',
                },
              ],
            }
          : category,
      ),
    )

    setSubCategoryName('')
    setShowSubCategoryForm(null)
  }

  const deleteCategory = (category: ExpenseCategory) => {
    if (category.subCategories.length > 0) {
      window.alert(
        'Remove or deactivate the sub-categories before deleting this category.',
      )
      return
    }

    if (!window.confirm(`Delete ${category.name}?`)) return

    onChange(
      categories.filter((item) => item.id !== category.id),
    )
  }

  const toggleCategory = (id: string) => {
    onChange(
      categories.map((category) =>
        category.id === id
          ? {
              ...category,
              status:
                category.status === 'Active'
                  ? 'Inactive'
                  : 'Active',
            }
          : category,
      ),
    )
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Expense Categories
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Manage expense categories and their sub-categories.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowCategoryForm((value) => !value)}
          className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
        >
          + Create Category
        </button>
      </div>

      {showCategoryForm && (
        <div className="border-b border-slate-100 bg-slate-50 p-5">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <label>
              <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
                Category Name
              </span>
              <input
                className={inputClass}
                value={categoryName}
                onChange={(event) =>
                  setCategoryName(event.target.value)
                }
                placeholder="e.g. Insurance"
              />
            </label>

            <label>
              <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
                Description
              </span>
              <input
                className={inputClass}
                value={categoryDescription}
                onChange={(event) =>
                  setCategoryDescription(event.target.value)
                }
                placeholder="Optional description"
              />
            </label>
          </div>

          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowCategoryForm(false)}
              className="h-9 rounded-lg border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-600"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={addCategory}
              className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white"
            >
              Save Category
            </button>
          </div>
        </div>
      )}

      <div className="divide-y divide-slate-100">
        {categories.map((category) => {
          const isOpen = expanded === category.id

          return (
            <div key={category.id}>
              <div className="flex items-center gap-3 px-5 py-4">
                <button
                  type="button"
                  onClick={() =>
                    setExpanded(isOpen ? null : category.id)
                  }
                  className="flex min-w-0 flex-1 items-center gap-3 text-left"
                >
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-xs font-semibold text-slate-500">
                    {isOpen ? '−' : '+'}
                  </span>

                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-slate-800">
                      {category.name}
                    </span>

                    <span className="mt-0.5 block text-[10px] text-slate-400">
                      {category.code} ·{' '}
                      {category.subCategories.length} sub-categories
                    </span>
                  </span>
                </button>

                <span
                  className={`hidden rounded-full px-2 py-1 text-[10px] font-semibold sm:inline-flex ${
                    category.status === 'Active'
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'bg-slate-100 text-slate-500'
                  }`}
                >
                  {category.status}
                </span>

                <button
                  type="button"
                  onClick={() => toggleCategory(category.id)}
                  className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600"
                >
                  {category.status === 'Active'
                    ? 'Deactivate'
                    : 'Activate'}
                </button>

                <button
                  type="button"
                  onClick={() => deleteCategory(category)}
                  className="rounded-md border border-red-100 px-2.5 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                >
                  Delete
                </button>
              </div>

              {isOpen && (
                <div className="border-t border-slate-100 bg-slate-50/60 px-5 py-4 pl-14">
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                        Sub-Categories
                      </p>
                      {category.description && (
                        <p className="mt-1 text-xs text-slate-400">
                          {category.description}
                        </p>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setShowSubCategoryForm(
                          showSubCategoryForm === category.id
                            ? null
                            : category.id,
                        )
                      }
                      className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-[10px] font-semibold text-slate-600"
                    >
                      + Add Sub-Category
                    </button>
                  </div>

                  {showSubCategoryForm === category.id && (
                    <div className="mb-3 flex gap-2">
                      <input
                        className={inputClass}
                        value={subCategoryName}
                        onChange={(event) =>
                          setSubCategoryName(event.target.value)
                        }
                        placeholder="Sub-category name"
                      />

                      <button
                        type="button"
                        onClick={() =>
                          addSubCategory(category.id)
                        }
                        className="h-10 shrink-0 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white"
                      >
                        Save
                      </button>
                    </div>
                  )}

                  <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100">
                          <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                            Sub-Category
                          </th>
                          <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                            Code
                          </th>
                          <th className="px-4 py-2.5 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                            Status
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {category.subCategories.map((sub) => (
                          <tr
                            key={sub.id}
                            className="border-b border-slate-50 last:border-0"
                          >
                            <td className="px-4 py-3 text-xs font-medium text-slate-700">
                              {sub.name}
                            </td>
                            <td className="px-4 py-3 text-xs text-slate-500">
                              {sub.code}
                            </td>
                            <td className="px-4 py-3">
                              <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                                {sub.status}
                              </span>
                            </td>
                          </tr>
                        ))}

                        {category.subCategories.length === 0 && (
                          <tr>
                            <td
                              colSpan={3}
                              className="px-4 py-8 text-center text-xs text-slate-400"
                            >
                              No sub-categories created yet.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </section>
  )
}

export function ExpensesPage() {
  const [activeTab, setActiveTab] = useState<
    'list' | 'categories' | 'add'
  >('list')

  const [categories, setCategories] =
    useState<ExpenseCategory[]>(initialCategories)

  const [expenses, setExpenses] =
    useState<Expense[]>(initialExpenses)

  const [search, setSearch] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('All')
  const [paymentFilter, setPaymentFilter] = useState('All')
  const [editing, setEditing] = useState<Expense | null>(null)

  const filteredExpenses = useMemo(() => {
    const query = search.trim().toLowerCase()

    return expenses.filter((expense) => {
      const matchesSearch =
        !query ||
        expense.id.toLowerCase().includes(query) ||
        expense.category.toLowerCase().includes(query) ||
        expense.subCategory.toLowerCase().includes(query) ||
        expense.description.toLowerCase().includes(query) ||
        expense.paidTo.toLowerCase().includes(query)

      const matchesCategory =
        categoryFilter === 'All' ||
        expense.category === categoryFilter

      const matchesPayment =
        paymentFilter === 'All' ||
        expense.paymentMethod === paymentFilter

      return (
        matchesSearch &&
        matchesCategory &&
        matchesPayment
      )
    })
  }, [expenses, search, categoryFilter, paymentFilter])

  const totalExpense = filteredExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0,
  )

  const saveExpense = (expense: Expense) => {
    setExpenses((current) => {
      const exists = current.some(
        (item) => item.id === expense.id,
      )

      return exists
        ? current.map((item) =>
            item.id === expense.id ? expense : item,
          )
        : [expense, ...current]
    })

    setEditing(null)
    setActiveTab('list')
  }

  const editExpense = (expense: Expense) => {
    setEditing(expense)
    setActiveTab('add')
  }

  const deleteExpense = (expense: Expense) => {
    if (!window.confirm(`Delete expense ${expense.id}?`)) return

    setExpenses((current) =>
      current.filter((item) => item.id !== expense.id),
    )
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Record, organize and review business expenses."
      />

      <div className="mb-5 flex overflow-x-auto border-b border-slate-200">
        {[
          { id: 'list', label: 'Expense View List' },
          { id: 'categories', label: 'Expense Categories' },
          { id: 'add', label: editing ? 'Edit Expense' : 'Add Expense' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (tab.id === 'add' && !editing) {
                setEditing(null)
              }

              setActiveTab(
                tab.id as 'list' | 'categories' | 'add',
              )
            }}
            className={`border-b-2 px-5 py-3 text-xs font-semibold transition ${
              activeTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'categories' ? (
        <CategoryManager
          categories={categories}
          onChange={setCategories}
        />
      ) : activeTab === 'add' ? (
        <ExpenseForm
          categories={categories}
          expense={editing}
          onSave={saveExpense}
          onCancel={() => {
            setEditing(null)
            setActiveTab('list')
          }}
        />
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-4 border-b border-slate-100 px-5 py-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Expense View List
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {filteredExpenses.length} expenses shown
                </p>
              </div>

              <button
                type="button"
                onClick={() => {
                  setEditing(null)
                  setActiveTab('add')
                }}
                className="h-9 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
              >
                + Add Expense
              </button>
            </div>

            <div className="grid grid-cols-1 gap-2 md:grid-cols-3">
              <input
                className={inputClass}
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search expense, category, paid to..."
              />

              <select
                className={inputClass}
                value={categoryFilter}
                onChange={(event) =>
                  setCategoryFilter(event.target.value)
                }
              >
                <option>All</option>
                {categories.map((category) => (
                  <option key={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>

              <select
                className={inputClass}
                value={paymentFilter}
                onChange={(event) =>
                  setPaymentFilter(event.target.value)
                }
              >
                <option>All</option>
                <option>Cash</option>
                <option>Bank</option>
                <option>UPI</option>
                <option>Card</option>
                <option>Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 border-b border-slate-100 md:grid-cols-3">
            <div className="border-b border-slate-100 px-5 py-4 md:border-b-0 md:border-r">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Total Expenses
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {money(totalExpense)}
              </p>
            </div>

            <div className="border-b border-slate-100 px-5 py-4 md:border-b-0 md:border-r">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Expense Records
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {filteredExpenses.length}
              </p>
            </div>

            <div className="px-5 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                Average Expense
              </p>
              <p className="mt-1 text-xl font-semibold text-slate-900">
                {money(
                  filteredExpenses.length
                    ? totalExpense / filteredExpenses.length
                    : 0,
                )}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[1050px] text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    'Expense ID',
                    'Expense Date',
                    'Category',
                    'Sub-Category',
                    'Description',
                    'Amount',
                    'Payment',
                    'Status',
                    'Action',
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {filteredExpenses.map((expense) => (
                  <tr
                    key={expense.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3">
                      <p className="text-xs font-semibold text-slate-800">
                        {expense.id}
                      </p>
                      {expense.reference && (
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          {expense.reference}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-600">
                      {dateLabel(expense.date)}
                    </td>

                    <td className="px-5 py-3 text-xs font-medium text-slate-700">
                      {expense.category}
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-600">
                      {expense.subCategory}
                    </td>

                    <td className="max-w-[220px] px-5 py-3 text-xs text-slate-500">
                      <p className="truncate">
                        {expense.description || '—'}
                      </p>
                      {expense.paidTo && (
                        <p className="mt-0.5 text-[10px] text-slate-400">
                          Paid to: {expense.paidTo}
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3 text-sm font-semibold text-slate-800">
                      {money(expense.amount)}
                    </td>

                    <td className="px-5 py-3">
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                        {expense.paymentMethod}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        {expense.status}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => editExpense(expense)}
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteExpense(expense)}
                          className="rounded-md border border-red-100 px-2.5 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredExpenses.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-6 py-14 text-center text-sm text-slate-400"
                    >
                      No expenses found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="border-t border-slate-100 px-5 py-3 text-xs text-slate-400">
            Showing {filteredExpenses.length} of {expenses.length}{' '}
            expenses
          </div>
        </section>
      )}
    </div>
  )
}
