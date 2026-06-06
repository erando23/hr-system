# Attendance Override System Implementation

## Overview
Implemented new attendance override rules to support the payroll calculation requirements as specified.

## Changes Made

### 1. Override Types Updated (HRApp.js)
**File:** [src/components/HRApp.js](src/components/HRApp.js#L1542)

**Previous types:**
- `terlambat` - Late (without permission)
- `terlambat_izin` - Late with permission
- `pulang_cepat` - Early leave (without permission)
- `pulang_cepat_izin` - Early leave with permission
- `lembur` - Overtime (+1×, 60min)
- `izin` - Full day excused absence
- `alpa` - Absent

**New types:**
1. **`terlambat_izin`** - Terlambat (memberikan izin)
   - Sets `status: "hadir"` with `lateWithPermission: true`
   - Payroll counts as "hadir" (max 3x/month)
   - Beyond 3x occurrences count as penalty ("terlambat")

2. **`ganti_shift`** - Gantikan Shift Teman (Lembur +1×)
   - Adds 60 minutes to `overtimeMins`
   - Paid at overtime rate per department

3. **`izin`** - Tidak Masuk dengan Izin (Alpa)
   - Sets `status: "alpa"`
   - Treated as absence for payroll calculation

4. **`alpa`** - Tanpa Keterangan (Alpa)
   - Sets `status: "alpa"`
   - Treated as absence for payroll calculation

5. **`pulang_cepat`** - Pulang Lebih Cepat (potong sesuai tarif lembur)
   - Sets `earlyLeaveCount: 1` (per incident)
   - Deducted at overtime rate (same as lembur rate)
   - Requires duration (menit) input

6. **`lembur`** - Lembur (+1×, 60mnt)
   - Adds 60 minutes to `overtimeMins`
   - Paid at overtime rate per department

### 2. Database Schema Changes
**File:** [src/lib/schema.js](src/lib/schema.js#L73-L75)

**Added columns to `attendances` table:**
```sql
late_with_permission INTEGER DEFAULT 0  -- Tracks late days with manager permission
early_leave_count INTEGER DEFAULT 0     -- Tracks early leave incidents
```

**Migration script:** [scripts/migrate-attendance-override-types.js](scripts/migrate-attendance-override-types.js)

### 3. Payroll Calculation Logic
**File:** [src/lib/utils.js](src/lib/utils.js#L70-L138)

**Key changes:**

**Late with permission logic:**
```javascript
const lateWithPermission = hadirRows.filter((a) => a.lateWithPermission === true);
const lateWithPermissionCount = lateWithPermission.length;
const effectiveLate = lateWithPermissionCount > 3 ? lateWithPermissionCount - 3 : 0;
```
- First 3 late-with-permission days count as "hadir" (paid)
- 4th and beyond count as "terlambat" (penalty)

**Early leave deduction:**
```javascript
const earlyLeaveCount = hadirRows.reduce((s, a) => s + (a.earlyLeaveCount || 0), 0);
const tarifOT = getTarifLembur(dept);
const potEarlyLeave = earlyLeaveCount * tarifOT;
```
- Deduction uses overtime rate (not per-minute rate)
- Counted per incident, not per minute

**Base salary proration:**
```javascript
const totalDaysPaid = totalHadir + (lateWithPermissionCount > 3 ? 3 : lateWithPermissionCount) - effectiveLate;
```
- Accounts for late-with-permission (max 3x counted as paid days)

### 4. Override Logic Updated
**File:** [src/components/HRApp.js](src/components/HRApp.js#L1549-L1555)

**Updated override handling:**
```javascript
if (form.type === "terlambat_izin") {
  updates.lateMins = 0;
  updates.status = "hadir";
  updates.lateWithPermission = true;
}
if (form.type === "ganti_shift") {
  updates.overtimeMins = (existing.overtimeMins || 0) + 60;
}
if (form.type === "izin") {
  updates.status = "alpa";
  updates.checkIn = null;
  updates.checkOut = null;
}
if (form.type === "alpa") {
  updates.status = "alpa";
  updates.checkIn = null;
  updates.checkOut = null;
}
if (form.type === "pulang_cepat") {
  updates.earlyMins = parseInt(form.menit) || 0;
  updates.earlyLeaveCount = 1;
}
if (form.type === "lembur") {
  updates.overtimeMins = (existing.overtimeMins || 0) + 60;
}
```

### 5. Form UI Updated
**File:** [src/components/HRApp.js](src/components/HRApp.js#L1623)

**Duration input now only shows for:**
- `pulang_cepat` - requires duration (menit) input

**Previously showed for:** `terlambat`, `pulang_cepat`, `pulang_cepat_izin`

### 6. Auto-Fill Updated
**Files updated:**
- [src/lib/autoFill.js](src/lib/autoFill.js#L107-L152)
- [src/app/api/attendance/route.js](src/app/api/attendance/route.js#L66-L156)

**Added default values for new columns:**
```javascript
lateWithPermission: false,
earlyLeaveCount: 0,
```

## Testing Checklist

- [ ] Test "Terlambat (memberikan izin)" override
- [ ] Test "Gantikan Shift Teman" override
- [ ] Test "Tidak Masuk dengan Izin" override
- [ ] Test "Tanpa Keterangan" override
- [ ] Test "Pulang Lebih Cepat" override with duration
- [ ] Test "Lembur" override
- [ ] Verify payroll calculation respects 3x late limit
- [ ] Verify early leave deducted at overtime rate
- [ ] Verify override updates work via PATCH /api/attendance
- [ ] Verify check-in/check-out still works normally

## Migration Status

✅ Migration completed successfully
✅ New columns added to attendances table
✅ Schema files updated
✅ API routes updated
✅ Payroll calculation logic updated

## Next Steps

1. Test the override functionality in the UI
2. Verify payroll calculations with various override scenarios
3. Update documentation if needed
