import { useMemo, useState } from 'react'

type StaffStatus =
  | 'Present'
  | 'Paid Leave'
  | 'Unpaid Leave'
  | 'Absent'
  | 'Weekly Off'
  | 'Holiday'

type Employee = {
  id: string
  name: string
  phone: string
  joinDate: string
  designation: string
  salary: number
  weeklyOff: string
  bankName: string
  accountNumber: string
  ifsc: string
  branch: string
  status: 'Active' | 'Inactive'
}

type Payment = {
  id: string
  date: string
  amount: number
  method: 'Cash' | 'Bank' | 'UPI' | 'Other'
  note: string
}

const initialEmployees: Employee[] = [
  {
    id: 'EMP-0001',
    name: 'Kajali Masi',
    phone: '9876543210',
    joinDate: '2026-01-10',
    designation: 'Sales Staff',
    salary: 1500,
    weeklyOff: 'Friday',
    bankName: '',
    accountNumber: '',
    ifsc: '',
    branch: '',
    status: 'Active',
  },
  {
    id: 'EMP-0002',
    name: 'Susmita Chakraborty',
    phone: '9832123456',
    joinDate: '2025-08-15',
    designation: 'Store Manager',
    salary: 4000,
    weeklyOff: 'Sunday',
    bankName: 'State Bank of India',
    accountNumber: 'XXXXXX4521',
    ifsc: 'SBIN0001234',
    branch: 'Lalgola',
    status: 'Active',
  },
]

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

const getDaysInMonth = (month: string) => {
  const [year, monthNumber] = month.split('-').map(Number)
  return new Date(year, monthNumber, 0).getDate()
}

const getDayName = (date: string) =>
  new Date(`${date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'long',
  })

const getMonthDates = (month: string) => {
  const total = getDaysInMonth(month)
  return Array.from({ length: total }, (_, index) => {
    const [year, monthNumber] = month.split('-').map(Number)
    const day = String(index + 1).padStart(2, '0')
    const monthPart = String(monthNumber).padStart(2, '0')

    return `${year}-${monthPart}-${day}`
  })
}

const statusClass: Record<StaffStatus, string> = {
  Present: 'bg-emerald-50 text-emerald-700',
  'Paid Leave': 'bg-blue-50 text-blue-700',
  'Unpaid Leave': 'bg-amber-50 text-amber-700',
  Absent: 'bg-red-50 text-red-700',
  'Weekly Off': 'bg-slate-100 text-slate-600',
  Holiday: 'bg-violet-50 text-violet-700',
}

const attendanceOptions: StaffStatus[] = [
  'Present',
  'Paid Leave',
  'Unpaid Leave',
  'Absent',
  'Weekly Off',
  'Holiday',
]

const inputClass =
  'h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100'

function StaffPageHeader({
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

function EmployeeForm({
  employee,
  onSave,
  onCancel,
}: {
  employee?: Employee | null
  onSave: (employee: Employee) => void
  onCancel: () => void
}) {
  const [name, setName] = useState(employee?.name || '')
  const [phone, setPhone] = useState(employee?.phone || '')
  const [joinDate, setJoinDate] = useState(
    employee?.joinDate || '2026-09-01',
  )
  const [designation, setDesignation] = useState(
    employee?.designation || '',
  )
  const [salary, setSalary] = useState(
    employee ? String(employee.salary) : '',
  )
  const [weeklyOff, setWeeklyOff] = useState(
    employee?.weeklyOff || 'Sunday',
  )
  const [showBank, setShowBank] = useState(
    Boolean(
      employee?.bankName ||
        employee?.accountNumber ||
        employee?.ifsc ||
        employee?.branch,
    ),
  )
  const [bankName, setBankName] = useState(employee?.bankName || '')
  const [accountNumber, setAccountNumber] = useState(
    employee?.accountNumber || '',
  )
  const [ifsc, setIfsc] = useState(employee?.ifsc || '')
  const [branch, setBranch] = useState(employee?.branch || '')

  const submit = () => {
    if (!name.trim() || !phone.trim() || !joinDate || !designation.trim()) {
      window.alert('Please complete all required employee fields.')
      return
    }

    const numericSalary = Number(salary)

    if (!numericSalary || numericSalary <= 0) {
      window.alert('Please enter a valid monthly salary.')
      return
    }

    onSave({
      id: employee?.id || `EMP-${String(Date.now()).slice(-6)}`,
      name: name.trim(),
      phone: phone.trim(),
      joinDate,
      designation: designation.trim(),
      salary: numericSalary,
      weeklyOff,
      bankName: showBank ? bankName.trim() : '',
      accountNumber: showBank ? accountNumber.trim() : '',
      ifsc: showBank ? ifsc.trim() : '',
      branch: showBank ? branch.trim() : '',
      status: employee?.status || 'Active',
    })
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">
          {employee ? 'Edit Employee' : 'Register Employee'}
        </h2>
        <p className="mt-1 text-xs text-slate-400">
          Enter employee information and monthly salary details.
        </p>
      </div>

      <div className="p-5">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Employee Name <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Enter employee name"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Phone No. <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="Enter phone number"
              inputMode="numeric"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Date of Join <span className="text-red-500">*</span>
            </span>
            <input
              type="date"
              className={inputClass}
              value={joinDate}
              onChange={(event) => setJoinDate(event.target.value)}
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Designation <span className="text-red-500">*</span>
            </span>
            <input
              className={inputClass}
              value={designation}
              onChange={(event) => setDesignation(event.target.value)}
              placeholder="e.g. Sales Staff"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Monthly Salary <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              min="0"
              className={inputClass}
              value={salary}
              onChange={(event) => setSalary(event.target.value)}
              placeholder="0.00"
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Weekly Off <span className="text-red-500">*</span>
            </span>
            <select
              className={inputClass}
              value={weeklyOff}
              onChange={(event) => setWeeklyOff(event.target.value)}
            >
              {[
                'Monday',
                'Tuesday',
                'Wednesday',
                'Thursday',
                'Friday',
                'Saturday',
                'Sunday',
              ].map((day) => (
                <option key={day}>{day}</option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-6 overflow-hidden rounded-lg border border-slate-200">
          <button
            type="button"
            onClick={() => setShowBank((value) => !value)}
            className="flex w-full items-center justify-between bg-slate-50 px-4 py-3 text-left"
          >
            <div>
              <p className="text-xs font-semibold text-slate-700">
                Salary Account
                <span className="ml-2 font-normal text-slate-400">
                  Optional
                </span>
              </p>
              <p className="mt-0.5 text-[11px] text-slate-400">
                Bank details used for salary payments.
              </p>
            </div>

            <span className="text-xs font-semibold text-slate-500">
              {showBank ? 'Hide' : 'Add Details'}
            </span>
          </button>

          {showBank && (
            <div className="grid grid-cols-1 gap-4 border-t border-slate-200 p-4 md:grid-cols-2 xl:grid-cols-4">
              <label>
                <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
                  Bank Name
                </span>
                <input
                  className={inputClass}
                  value={bankName}
                  onChange={(event) => setBankName(event.target.value)}
                  placeholder="Bank name"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
                  Account Number
                </span>
                <input
                  className={inputClass}
                  value={accountNumber}
                  onChange={(event) =>
                    setAccountNumber(event.target.value)
                  }
                  placeholder="Account number"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
                  IFSC
                </span>
                <input
                  className={inputClass}
                  value={ifsc}
                  onChange={(event) => setIfsc(event.target.value)}
                  placeholder="IFSC code"
                />
              </label>

              <label>
                <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
                  Branch
                </span>
                <input
                  className={inputClass}
                  value={branch}
                  onChange={(event) => setBranch(event.target.value)}
                  placeholder="Branch"
                />
              </label>
            </div>
          )}
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
            {employee ? 'Save Changes' : 'Register Employee'}
          </button>
        </div>
      </div>
    </section>
  )
}

export function EmployeesPage() {
  const [employees, setEmployees] = useState(initialEmployees)
  const [sectionTab, setSectionTab] = useState<'employees' | 'attendance' | 'salary'>('employees')
  const [activeTab, setActiveTab] = useState<'list' | 'register'>('list')
  const [search, setSearch] = useState('')
  const [editing, setEditing] = useState<Employee | null>(null)

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase()

    if (!query) return employees

    return employees.filter(
      (employee) =>
        employee.name.toLowerCase().includes(query) ||
        employee.phone.includes(query) ||
        employee.designation.toLowerCase().includes(query),
    )
  }, [employees, search])

  const saveEmployee = (employee: Employee) => {
    setEmployees((current) => {
      const exists = current.some((item) => item.id === employee.id)

      return exists
        ? current.map((item) =>
            item.id === employee.id ? employee : item,
          )
        : [employee, ...current]
    })

    setEditing(null)
    setActiveTab('list')
  }

  const editEmployee = (employee: Employee) => {
    setEditing(employee)
    setActiveTab('register')
  }

  const deleteEmployee = (employee: Employee) => {
    const confirmed = window.confirm(
      `Delete ${employee.name}? This demo action will remove the employee from the local UI.`,
    )

    if (!confirmed) return

    setEmployees((current) =>
      current.filter((item) => item.id !== employee.id),
    )
  }

  return (
    <div>
      <StaffPageHeader
        title="Employees"
        description="Manage employees, attendance and salary information."
      />

      <div className="mb-5 flex overflow-x-auto border-b border-slate-200">
        {[
          { id: 'employees', label: 'Employee List' },
          { id: 'attendance', label: 'Attendance' },
          { id: 'salary', label: 'Salary' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() =>
              setSectionTab(
                tab.id as 'employees' | 'attendance' | 'salary',
              )
            }
            className={`border-b-2 px-5 py-3 text-xs font-semibold transition ${
              sectionTab === tab.id
                ? 'border-slate-900 text-slate-900'
                : 'border-transparent text-slate-400 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {sectionTab === 'attendance' ? (
        <AttendancePage />
      ) : sectionTab === 'salary' ? (
        <SalaryPage />
      ) : (
        <>
          <div className="mb-5 flex overflow-x-auto border-b border-slate-200">
            {[
              { id: 'list', label: 'Employee List' },
              { id: 'register', label: editing ? 'Edit Employee' : 'Register Employee' },
            ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => {
              if (tab.id === 'register') {
                setEditing(null)
              }

              setActiveTab(tab.id as 'list' | 'register')
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

          {activeTab === 'register' ? (
        <EmployeeForm
          employee={editing}
          onSave={saveEmployee}
          onCancel={() => {
            setEditing(null)
            setActiveTab('list')
          }}
        />
      ) : (
        <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Employee List
              </h2>
              <p className="mt-1 text-xs text-slate-400">
                {employees.length} employees registered
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                className={`${inputClass} sm:w-64`}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search employee..."
              />

              <button
                type="button"
                onClick={() => {
                  setEditing(null)
                  setActiveTab('register')
                }}
                className="h-10 rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800"
              >
                + Register Employee
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[950px] text-left">
              <thead>
                <tr className="border-b border-slate-100">
                  {[
                    'Employee',
                    'Phone',
                    'Designation',
                    'Date of Join',
                    'Monthly Salary',
                    'Weekly Off',
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
                {filteredEmployees.map((employee) => (
                  <tr
                    key={employee.id}
                    className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60"
                  >
                    <td className="px-5 py-3">
                      <p className="text-sm font-semibold text-slate-800">
                        {employee.name}
                      </p>
                      <p className="mt-0.5 text-[10px] text-slate-400">
                        {employee.id}
                      </p>
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-600">
                      {employee.phone}
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-600">
                      {employee.designation}
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-600">
                      {dateLabel(employee.joinDate)}
                    </td>

                    <td className="px-5 py-3 text-sm font-semibold text-slate-800">
                      {money(employee.salary)}
                    </td>

                    <td className="px-5 py-3 text-xs text-slate-600">
                      {employee.weeklyOff}
                    </td>

                    <td className="px-5 py-3">
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold text-emerald-700">
                        {employee.status}
                      </span>
                    </td>

                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => editEmployee(employee)}
                          className="rounded-md border border-slate-200 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => deleteEmployee(employee)}
                          className="rounded-md border border-red-100 px-2.5 py-1.5 text-[10px] font-semibold text-red-600 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredEmployees.length === 0 && (
                  <tr>
                    <td
                      colSpan={8}
                      className="px-6 py-14 text-center text-sm text-slate-400"
                    >
                      No employees found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
        </>
      )}
    </div>
  )
}

export function AttendancePage() {
  const [month, setMonth] = useState('2026-09')
  const [employeeId, setEmployeeId] = useState(initialEmployees[0].id)

  const employee =
    initialEmployees.find((item) => item.id === employeeId) ||
    initialEmployees[0]

  const dates = useMemo(() => getMonthDates(month), [month])

  const initialAttendance = useMemo(() => {
    const entries: Record<string, StaffStatus> = {}

    dates.forEach((date) => {
      const day = getDayName(date)
      entries[date] =
        day === employee.weeklyOff ? 'Weekly Off' : 'Present'
    })

    if (dates[2]) entries[dates[2]] = 'Unpaid Leave'
    if (dates[9]) entries[dates[9]] = 'Paid Leave'
    if (dates[16]) entries[dates[16]] = 'Absent'

    return entries
  }, [dates, employee.weeklyOff])

  const [attendanceByMonth, setAttendanceByMonth] = useState<
    Record<string, Record<string, StaffStatus>>
  >({})

  const attendance =
    attendanceByMonth[`${employee.id}-${month}`] || initialAttendance

  const updateStatus = (date: string, status: StaffStatus) => {
    setAttendanceByMonth((current) => ({
      ...current,
      [`${employee.id}-${month}`]: {
        ...attendance,
        [date]: status,
      },
    }))
  }

  const counts = attendanceOptions.reduce(
    (result, status) => {
      result[status] = dates.filter(
        (date) => attendance[date] === status,
      ).length

      return result
    },
    {} as Record<StaffStatus, number>,
  )

  return (
    <div>
      <StaffPageHeader
        title="Attendance"
        description="Record monthly attendance for each employee."
      />

      <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Month
            </span>
            <input
              type="month"
              className={inputClass}
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Employee
            </span>
            <select
              className={inputClass}
              value={employee.id}
              onChange={(event) => setEmployeeId(event.target.value)}
            >
              {initialEmployees.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-3 xl:grid-cols-6">
          {attendanceOptions.map((status) => (
            <div
              key={status}
              className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <p className="text-[10px] font-medium text-slate-400">
                {status}
              </p>
              <p className="mt-1 text-lg font-semibold text-slate-800">
                {counts[status]}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-100 px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
              {new Date(`${month}-01T00:00:00`).toLocaleDateString(
                'en-US',
                { month: 'long', year: 'numeric' },
              )}
            </p>
            <h2 className="mt-1 text-sm font-semibold text-slate-900">
              {employee.name}
            </h2>
            <p className="mt-0.5 text-xs text-slate-400">
              Weekly off: {employee.weeklyOff}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 px-4 py-2 text-right">
            <p className="text-lg font-semibold text-slate-900">
              {dates.length}
            </p>
            <p className="text-[10px] text-slate-400">calendar days</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[850px] text-left">
            <thead>
              <tr className="border-b border-slate-100">
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Day
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Date
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Current Status
                </th>
                <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
                  Attendance
                </th>
              </tr>
            </thead>

            <tbody>
              {dates.map((date) => {
                const status = attendance[date]
                const automaticWeeklyOff =
                  getDayName(date) === employee.weeklyOff

                return (
                  <tr
                    key={date}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {getDayName(date).slice(0, 3)}
                    </td>

                    <td className="px-5 py-3 text-xs font-medium text-slate-700">
                      {dateLabel(date)}
                    </td>

                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-[10px] font-semibold ${statusClass[status]}`}
                      >
                        {status}
                      </span>

                      {automaticWeeklyOff && (
                        <p className="mt-1 text-[9px] text-slate-400">
                          Automatic weekly off
                        </p>
                      )}
                    </td>

                    <td className="px-5 py-3">
                      <select
                        className={`${inputClass} max-w-[220px]`}
                        value={status}
                        onChange={(event) =>
                          updateStatus(
                            date,
                            event.target.value as StaffStatus,
                          )
                        }
                      >
                        {attendanceOptions.map((option) => (
                          <option key={option}>{option}</option>
                        ))}
                      </select>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  )
}

const initialPayments: Record<string, Payment[]> = {
  'EMP-0001-2026-09': [
    {
      id: 'PAY-0001',
      date: '2026-09-10',
      amount: 500,
      method: 'Cash',
      note: '1st Part of Sep 26 Salary',
    },
  ],
  'EMP-0002-2026-09': [],
}

export function SalaryPage() {
  const [month, setMonth] = useState('2026-09')
  const [employeeId, setEmployeeId] = useState(initialEmployees[0].id)
  const [paymentsByEmployee, setPaymentsByEmployee] =
    useState<Record<string, Payment[]>>(initialPayments)

  const employee =
    initialEmployees.find((item) => item.id === employeeId) ||
    initialEmployees[0]

  const daysInMonth = getDaysInMonth(month)
  const monthDates = getMonthDates(month)

  const employmentStart = new Date(`${employee.joinDate}T00:00:00`)
  const [selectedYear, selectedMonth] = month.split('-').map(Number)
  const monthEnd = new Date(
    selectedYear,
    selectedMonth - 1,
    daysInMonth,
  )

  const applicableDates = monthDates.filter((date) => {
    const current = new Date(`${date}T00:00:00`)
    return current >= employmentStart && current <= monthEnd
  })

  const paidLeaveDates = new Set(
    applicableDates.filter((date) => getDayName(date) === 'Tuesday'),
  )

  const unpaidLeaveDates = new Set(
    applicableDates.filter((date) => getDayName(date) === 'Thursday'),
  )

  const absentDates = new Set<string>()

  const weeklyOffDates = new Set(
    applicableDates.filter(
      (date) => getDayName(date) === employee.weeklyOff,
    ),
  )

  const holidayDates = new Set<string>()

  const paidDays =
    applicableDates.length -
    unpaidLeaveDates.size -
    absentDates.size

  const dailyRate = employee.salary / daysInMonth
  const deduction =
    (unpaidLeaveDates.size + absentDates.size) * dailyRate

  const calculatedSalary = Math.max(
    0,
    employee.salary - deduction,
  )

  const paymentKey = `${employee.id}-${month}`
  const payments = paymentsByEmployee[paymentKey] || []
  const totalPaid = payments.reduce(
    (sum, payment) => sum + payment.amount,
    0,
  )
  const remaining = Math.max(0, calculatedSalary - totalPaid)

  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState('2026-09-20')
  const [paymentMethod, setPaymentMethod] =
    useState<Payment['method']>('Bank')
  const [paymentNote, setPaymentNote] = useState('')

  const paymentStatus =
    totalPaid >= calculatedSalary
      ? 'Paid'
      : totalPaid > 0
        ? 'Partially Paid'
        : 'Unpaid'

  const addPayment = () => {
    const amount = Number(paymentAmount)

    if (!amount || amount <= 0) {
      window.alert('Enter a valid payment amount.')
      return
    }

    if (amount > remaining) {
      window.alert(
        `Payment cannot exceed the remaining salary of ${money(
          remaining,
        )}.`,
      )
      return
    }

    const payment: Payment = {
      id: `PAY-${String(Date.now()).slice(-6)}`,
      date: paymentDate,
      amount,
      method: paymentMethod,
      note: paymentNote.trim(),
    }

    setPaymentsByEmployee((current) => ({
      ...current,
      [paymentKey]: [...(current[paymentKey] || []), payment],
    }))

    setPaymentAmount('')
    setPaymentNote('')
  }

  return (
    <div>
      <StaffPageHeader
        title="Salary"
        description={`Salary calculation and payments for ${new Date(
          `${month}-01T00:00:00`,
        ).toLocaleDateString('en-US', {
          month: 'long',
          year: 'numeric',
        })}.`}
      />

      <section className="mb-5 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Month
            </span>
            <input
              type="month"
              className={inputClass}
              value={month}
              onChange={(event) => setMonth(event.target.value)}
            />
          </label>

          <label>
            <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
              Employee
            </span>
            <select
              className={inputClass}
              value={employee.id}
              onChange={(event) => setEmployeeId(event.target.value)}
            >
              {initialEmployees.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
              ))}
            </select>
          </label>
        </div>
      </section>

      <div className="mb-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {[
          ['Monthly Salary', money(employee.salary)],
          ['Calculated Salary', money(calculatedSalary)],
          ['Total Paid', money(totalPaid)],
          ['Remaining', money(remaining)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400">
              {label}
            </p>
            <p className="mt-2 text-xl font-semibold text-slate-900">
              {value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.6fr_0.8fr]">
        <div className="space-y-5">
          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-5 py-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Salary Calculation
                  </h2>
                  <p className="mt-1 text-xs text-slate-400">
                    Attendance-based monthly calculation for{' '}
                    {employee.name}.
                  </p>
                </div>

                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    paymentStatus === 'Paid'
                      ? 'bg-emerald-50 text-emerald-700'
                      : paymentStatus === 'Partially Paid'
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3">
              {[
                ['Calendar Days', daysInMonth],
                ['Applicable Days', applicableDates.length],
                ['Paid Days', paidDays],
                ['Weekly Off', weeklyOffDates.size],
                ['Paid Leave', paidLeaveDates.size],
                ['Unpaid Leave', unpaidLeaveDates.size],
                ['Absent', absentDates.size],
                ['Holidays', holidayDates.size],
                ['Daily Rate', money(dailyRate)],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="border-b border-r border-slate-100 px-5 py-4"
                >
                  <p className="text-[10px] text-slate-400">{label}</p>
                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-2 border-t border-slate-100 bg-slate-50 px-5 py-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[10px] text-slate-400">
                  Unpaid/Absent Deduction
                </p>
                <p className="text-sm font-semibold text-red-600">
                  - {money(deduction)}
                </p>
              </div>

              <div className="text-left md:text-right">
                <p className="text-[10px] text-slate-400">
                  Calculated Salary
                </p>
                <p className="text-lg font-semibold text-slate-900">
                  {money(calculatedSalary)}
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Payment History
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  All salary payments recorded for this month.
                </p>
              </div>

              <span className="text-xs text-slate-400">
                {payments.length} payment
                {payments.length === 1 ? '' : 's'}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left">
                <thead>
                  <tr className="border-b border-slate-100">
                    {['Date', 'Method', 'Note', 'Amount'].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-5 py-3 text-[10px] font-bold uppercase tracking-[0.08em] text-slate-400"
                        >
                          {heading}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>

                <tbody>
                  {payments.map((payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="px-5 py-3 text-xs text-slate-600">
                        {dateLabel(payment.date)}
                      </td>

                      <td className="px-5 py-3">
                        <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold text-slate-600">
                          {payment.method}
                        </span>
                      </td>

                      <td className="px-5 py-3 text-xs text-slate-500">
                        {payment.note || '—'}
                      </td>

                      <td className="px-5 py-3 text-sm font-semibold text-slate-800">
                        {money(payment.amount)}
                      </td>
                    </tr>
                  ))}

                  {payments.length === 0 && (
                    <tr>
                      <td
                        colSpan={4}
                        className="px-5 py-10 text-center text-xs text-slate-400"
                      >
                        No salary payments recorded for this month.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        <section className="h-fit rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">
              Record Payment
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Add a full or partial salary payment.
            </p>
          </div>

          <div className="space-y-4 p-5">
            <label>
              <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
                Salary Month
              </span>
              <input
                type="month"
                className={inputClass}
                value={month}
                onChange={(event) => setMonth(event.target.value)}
              />
            </label>

            <label>
              <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
                Payment Date
              </span>
              <input
                type="date"
                className={inputClass}
                value={paymentDate}
                onChange={(event) => setPaymentDate(event.target.value)}
              />
            </label>

            <label>
              <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
                Amount
              </span>
              <input
                type="number"
                min="0"
                max={remaining}
                className={inputClass}
                value={paymentAmount}
                onChange={(event) =>
                  setPaymentAmount(event.target.value)
                }
                placeholder="0.00"
              />
              <p className="mt-1 text-[10px] text-slate-400">
                Remaining: {money(remaining)}
              </p>
            </label>

            <label>
              <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
                Payment Method
              </span>
              <select
                className={inputClass}
                value={paymentMethod}
                onChange={(event) =>
                  setPaymentMethod(
                    event.target.value as Payment['method'],
                  )
                }
              >
                <option>Cash</option>
                <option>Bank</option>
                <option>UPI</option>
                <option>Other</option>
              </select>
            </label>

            <label>
              <span className="mb-1.5 block text-[11px] font-medium text-slate-600">
                Note
              </span>
              <textarea
                className="min-h-[90px] w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
                value={paymentNote}
                onChange={(event) => setPaymentNote(event.target.value)}
                placeholder="Optional note"
              />
            </label>

            <button
              type="button"
              disabled={remaining <= 0}
              onClick={addPayment}
              className="h-10 w-full rounded-lg bg-slate-900 px-4 text-xs font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Record Payment
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
