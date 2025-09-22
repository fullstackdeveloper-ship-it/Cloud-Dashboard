export function calcEnergyWithDuration(rows) {
  if (!rows || rows.length === 0) return null;

  // Step 1: Time window (kept as-is)
  const start = new Date(rows[0].time);
  const end = new Date(rows[rows.length - 1].time);

  const diffMs = end - start;
  const minutes = diffMs / (1000 * 60);
  const hours = minutes / 60;

  // --- CHANGE: instead of averaging across rows, sum per-row energy (1 minute each) ---
  // Step 2: Per-row energy for PV, Gen, Grid (assume values are in W)
  const dtHours = 1 / 60; // 1 minute in hours
  let kWh_PV = 0;
  let kWh_Gen = 0;
  let kWh_Grid = 0;

  for (const r of rows) {
    const pv_kW = (r.W_PV || 0) / 1000;
    const gen_kW = (r.W_Gen || 0) / 1000;
    const grid_kW = (r.W_Grid || 0) / 1000;

    kWh_PV += pv_kW * dtHours;
    kWh_Gen += gen_kW * dtHours;
    kWh_Grid += grid_kW * dtHours;
  }

  // Step 3: kWh_Load is sum of the three integrated kWh values
  const result = {
    kWh_PV: +kWh_PV.toFixed(3),
    kWh_Gen: +kWh_Gen.toFixed(3),
    kWh_Grid: +kWh_Grid.toFixed(3),
  };

  result["kWh_Load"] = +(
    result.kWh_PV + result.kWh_Gen + result.kWh_Grid
  ).toFixed(3);

  // Step 4: Import / Export for Grid (row-by-row energy sign)
  let kWhImport = 0, kWhExport = 0;
  for (const r of rows) {
    const grid_kW = (r.W_Grid || 0) / 1000;
    const e = grid_kW * dtHours;
    if (e > 0) kWhImport += e;
    else if (e < 0) kWhExport += Math.abs(e);
  }

  result["kWh_Grid_Import"] = +kWhImport.toFixed(3);
  result["kWh_Grid_Export"] = +kWhExport.toFixed(3);

  return {
    range: {
      start: start.toISOString(),
      end: end.toISOString(),
      minutes: Math.round(minutes),
      hours: +hours.toFixed(3)
    },
    totals: result,
    samples: rows.length
  };
}


