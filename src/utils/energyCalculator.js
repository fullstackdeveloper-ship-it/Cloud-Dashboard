export function calcEnergyWithDuration(rows) {
  if (!rows || rows.length === 0) {
    return null;
  }

  // Step 1: Time window (kept as-is)
  const start = new Date(rows[0].time);
  const end = new Date(rows[rows.length - 1].time);

  const diffMs = end - start;
  const minutes = diffMs / (1000 * 60);
  const hours = minutes / 60;


  // Step 2: Calculate energy properly (Power * Time)
  // Each data point represents 1 minute
  let kWh_PV = 0;
  let kWh_Gen = 0;
  let kWh_Grid = 0;
  let kWh_Load = 0;

  
  for (const r of rows) {
    // Direct calculation: W_PV / 60, W_Grid / 60, W_Gen / 60
    const pv_energy = (r.W_PV || 0) / 60;
    const gen_energy = (r.W_Gen || 0) / 60;
    const grid_energy = (r.W_Grid || 0) / 60;
    const load_energy = (r.W_Load || 0) / 60;

    kWh_PV += pv_energy;
    kWh_Gen += gen_energy;
    kWh_Grid += grid_energy;
    kWh_Load += load_energy;
  }


  // Step 3: Create result object with energy values
  const result = {
    kWh_PV: +kWh_PV.toFixed(3),
    kWh_Gen: +kWh_Gen.toFixed(3),
    kWh_Grid: +kWh_Grid.toFixed(3),
  };

  result["kWh_Load"] = +kWh_Load.toFixed(3);


  // Step 4: Import / Export for Grid (row-by-row energy sign)
  let kWhImport = 0, kWhExport = 0;
  
  
  for (const r of rows) {
    const e = (r.W_Grid || 0) / 60;
    if (e > 0) kWhImport += e;
    else if (e < 0) kWhExport += Math.abs(e);
  }

  result["kWh_Grid_Import"] = +kWhImport.toFixed(3);
  result["kWh_Grid_Export"] = +kWhExport.toFixed(3);


  const finalResult = {
    range: {
      start: start.toISOString(),
      end: end.toISOString(),
      minutes: Math.round(minutes),
      hours: +hours.toFixed(3)
    },
    totals: result,
    samples: rows.length
  };


  return finalResult;
}


