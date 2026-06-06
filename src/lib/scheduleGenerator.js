// Helper function untuk generate jadwal dengan pairing rotation yang lebih baik
// Untuk 2-shift outlet: pasangan shift harus bergilir, tidak A&C terus
// Untuk single-shift outlet: semua karyawan off di hari yang sama (sesuai outlet offDay)

export function generateSmartSchedule(employees, outlets, outletId, month, year) {
  const outletObj = outlets.find(o => o.id === outletId) || {};
  const isSingleShift = !!outletObj.isSingleShift;
  const outletOffDay = outletObj.offDay !== null && outletObj.offDay !== undefined ? outletObj.offDay : 0; // 0=Mon, 6=Sun

  const outletEmps = employees.filter(e => e.outletId === outletId && e.role === "karyawan");
  const daysInMonth = new Date(year, month, 0).getDate();

  const schedule = {};
  const warnings = [];

  // Group by department
  const deptGroups = {};
  outletEmps.forEach(emp => {
    if (!deptGroups[emp.dept]) deptGroups[emp.dept] = [];
    deptGroups[emp.dept].push(emp);
  });

  Object.entries(deptGroups).forEach(([dept, emps]) => {
    const n = emps.length;

    if (isSingleShift) {
      // ═══ SINGLE-SHIFT LOGIC ═══
      // Semua karyawan FULL setiap hari KECUALI hari off outlet (berlaku untuk SEMUA)
      emps.forEach(emp => {
        schedule[emp.id] = {};
        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month - 1, day);
          const jsDay = date.getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
          const dayIdx = jsDay === 0 ? 6 : jsDay - 1; // Convert to Mon=0..Sun=6

          // Semua karyawan off di hari yang sama (outlet offDay)
          schedule[emp.id][day] = (dayIdx === outletOffDay) ? "L" : "FULL";
        }
      });

    } else {
      // ═══ 2-SHIFT LOGIC dengan PAIRING ROTATION ═══
      if (n < 2) {
        warnings.push(`${dept}: hanya ${n} orang (minimal 2 untuk 2-shift)`);
      }

      // Buat pairing pool: setiap karyawan akan dipasangkan dengan karyawan lain secara bergilir
      // Contoh: 4 orang (A,B,C,D) → pasangan: (A,B), (A,C), (A,D), (B,C), (B,D), (C,D)
      const pairings = [];
      for (let i = 0; i < n; i++) {
        for (let j = i + 1; j < n; j++) {
          pairings.push([i, j]);
        }
      }

      emps.forEach((emp, empIdx) => {
        schedule[emp.id] = {};

        for (let day = 1; day <= daysInMonth; day++) {
          const date = new Date(year, month - 1, day);
          const jsDay = date.getDay();
          const dayIdx = jsDay === 0 ? 6 : jsDay - 1;

          // Weekday (Mon-Fri): rotasi P/S dengan pairing yang bergilir
          if (dayIdx < 5) {
            // Gunakan pairing rotation: setiap minggu ganti pasangan
            const weekNum = Math.floor((day - 1) / 7);
            const pairIdx = (weekNum + empIdx) % pairings.length;
            const pair = pairings[pairIdx] || [0, 1];

            // Tentukan shift berdasarkan apakah empIdx ada di pair hari ini
            const isInPair = pair.includes(empIdx);
            const posInPair = pair.indexOf(empIdx);

            if (isInPair) {
              // Jika dalam pair hari ini, tentukan P atau S
              schedule[emp.id][day] = posInPair === 0 ? "P" : "S";
            } else {
              // Jika tidak dalam pair, libur atau shift lain
              const rotation = (empIdx + day) % 3;
              schedule[emp.id][day] = rotation === 0 ? "L" : (rotation === 1 ? "P" : "S");
            }
          } else {
            // Weekend (Sat-Sun): rotasi sederhana P/S
            schedule[emp.id][day] = ((empIdx + day) % 2 === 0) ? "P" : "S";
          }
        }
      });
    }
  });

  return { schedule, warnings };
}
