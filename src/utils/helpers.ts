import { Vehicle, FilterState } from "../types";

export const MUNICIPIOS_PR = [
  "Todos",
  "Dorado",
  "Vega Alta",
  "Bayamón",
  "San Juan",
  "Caguas",
  "Ponce",
  "Mayagüez",
  "Arecibo",
  "Guaynabo",
  "Carolina"
];

export const CARROCERIAS = [
  "Todos",
  "Sedán",
  "SUV",
  "Pickup",
  "Coupe",
  "Comercial",
  "Hatchback / Crossover"
];

export const MARCAS_POPULARES = [
  "Todas",
  "Toyota",
  "Hyundai",
  "Kia",
  "Ford",
  "Chevrolet",
  "Jeep",
  "Mitsubishi",
  "Nissan",
  "Mazda",
  "Land Rover",
  "BMW",
  "Audi",
  "Mercedez-Benz",
  "Lexus",
  "Infiniti",
  "Dodge",
  "RAM",
  "Honda",
  "Mini"
];

export const DEALERS_PR = [
  { 
    nombre: "GT Auto Imports", 
    municipio: "Dorado", 
    direccion: "Dorado, PR", 
    mapsUrl: "https://maps.app.goo.gl/CLQRo8UHmeU1W9Wx9" 
  },
  { 
    nombre: "Auto Exito Imports", 
    municipio: "Vega Alta", 
    direccion: "Vega Alta, PR", 
    mapsUrl: "https://maps.app.goo.gl/5QpKnbbCuvfA6Aju5?g_st=ac" 
  },
  { 
    nombre: "AutoVentasPR", 
    municipio: "Vega Alta", 
    direccion: "Puerto Rico", 
    mapsUrl: "https://maps.app.goo.gl/5QpKnbbCuvfA6Aju5" 
  }
];

export function parsePrice(priceStr: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^0-9.]/g, "");
  return parseFloat(cleaned) || 0;
}

export function parseMileage(mileageStr: string): number {
  if (!mileageStr) return 0;
  const cleaned = mileageStr.replace(/[^0-9]/g, "");
  return parseInt(cleaned, 10) || 0;
}

export function inferCarroceria(v: Vehicle): string {
  if (v.Carroceria) return v.Carroceria;
  const m = `${v.Marca} ${v.Modelo} ${v["Sub-Modelo/Trim Level"]}`.toLowerCase();
  
  if (m.includes("f-150") || m.includes("1500") || m.includes("ranger") || m.includes("tacoma") || m.includes("colorado") || m.includes("silverado") || m.includes("gladiator") || m.includes("tundra") || m.includes("ram") || m.includes("pickup") || m.includes("truck")) {
    return "Pickup";
  }
  if (m.includes("transit") || m.includes("van") || m.includes("cargo") || m.includes("promaster") || m.includes("express") || m.includes("nv200") || m.includes("comercial")) {
    return "Comercial";
  }
  if (m.includes("sportage") || m.includes("rogue") || m.includes("outlander") || m.includes("rav4") || m.includes("cr-v") || m.includes("tucson") || m.includes("wrangler") || m.includes("cherokee") || m.includes("explorer") || m.includes("durango") || m.includes("bronco") || m.includes("compass") || m.includes("suburban") || m.includes("tahoe") || m.includes("suv") || m.includes("highlander") || m.includes("4runner") || m.includes("pilot") || m.includes("trax") || m.includes("equinox") || m.includes("cx-5") || m.includes("cx-30") || m.includes("seltos") || m.includes("telluride") || m.includes("palisade") || m.includes("santa fe") || m.includes("kona") || m.includes("q3") || m.includes("x7") || m.includes("q5")) {
    return "SUV";
  }
  if (m.includes("soul") || m.includes("fit") || m.includes("rio 5") || m.includes("yaris") || m.includes("kicks") || m.includes("venue") || m.includes("hatchback")) {
    return "Hatchback / Crossover";
  }
  if (m.includes("coupe") || m.includes("230i") || m.includes("mustang") || m.includes("camaro")) {
    return "Coupe";
  }
  return "Sedán";
}

export function inferMunicipio(v: Vehicle, index: number): string {
  if (v.Municipio) return v.Municipio;
  const list = ["Dorado", "Vega Alta"];
  return list[index % list.length];
}

export function inferDealer(v: Vehicle, index: number): string {
  if (v.Dealer) return v.Dealer;
  const list = [
    "AutoVentasPR",
    "Auto Exito Imports",
    "GT Auto Imports"
  ];
  return list[index % list.length];
}

export function getEstimatedMonthlyPayment(priceStr: string, downPayment = 2000, termMonths = 72, apr = 0.0699): number {
  const price = parsePrice(priceStr);
  if (!price || price <= 0) return 0;
  
  const principal = Math.max(price - downPayment, 1000);
  const monthlyRate = apr / 12;
  const payment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, termMonths))) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  
  return Math.round(payment);
}

export function formatCurrency(num: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0
  }).format(num);
}

export function filterAndSortVehicles(inventory: Vehicle[], filters: Partial<FilterState>): Vehicle[] {
  return inventory.filter((v, idx) => {
    const carroceria = inferCarroceria(v);
    const municipio = inferMunicipio(v, idx);
    const priceNum = parsePrice(v.Precio);
    const monthlyEst = getEstimatedMonthlyPayment(v.Precio);
    const yearNum = parseInt(v["Año"], 10) || 2020;
    const mileageNum = parseMileage(v.Millaje);
    const mpgNum = parseInt(v.MPG?.split("/")[0] || "0", 10);

    // Search query
    if (filters.search) {
      const q = filters.search.toLowerCase().trim();
      const match = 
        v.Marca.toLowerCase().includes(q) ||
        v.Modelo.toLowerCase().includes(q) ||
        v["Año"].includes(q) ||
        (v["Sub-Modelo/Trim Level"] && v["Sub-Modelo/Trim Level"].toLowerCase().includes(q)) ||
        carroceria.toLowerCase().includes(q) ||
        municipio.toLowerCase().includes(q) ||
        v.Color.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Carrocería
    if (filters.carroceria && filters.carroceria !== "Todos") {
      if (carroceria.toLowerCase() !== filters.carroceria.toLowerCase()) {
        return false;
      }
    }

    // Marca
    if (filters.marca && filters.marca !== "Todas" && filters.marca !== "Todos") {
      if (v.Marca.toLowerCase() !== filters.marca.toLowerCase()) {
        return false;
      }
    }

    // Modelo
    if (filters.modelo && filters.modelo !== "Cualquiera" && filters.modelo !== "Todos") {
      if (!v.Modelo.toLowerCase().includes(filters.modelo.toLowerCase())) {
        return false;
      }
    }

    // Rango de año
    const rawAnoMin = filters.anoMin ?? filters.minYear;
    if (rawAnoMin !== undefined && rawAnoMin !== "") {
      const min = typeof rawAnoMin === "number" ? rawAnoMin : parseInt(String(rawAnoMin), 10);
      if (!isNaN(min) && yearNum < min) return false;
    }

    const rawAnoMax = filters.anoMax ?? filters.maxYear;
    if (rawAnoMax !== undefined && rawAnoMax !== "") {
      const max = typeof rawAnoMax === "number" ? rawAnoMax : parseInt(String(rawAnoMax), 10);
      if (!isNaN(max) && yearNum > max) return false;
    }

    // Presupuesto Máximo
    const rawPrecioMax = filters.precioMax ?? filters.maxPrice;
    if (rawPrecioMax !== undefined && rawPrecioMax !== "") {
      const maxPrice = typeof rawPrecioMax === "number" ? rawPrecioMax : parseFloat(String(rawPrecioMax));
      if (!isNaN(maxPrice) && maxPrice > 0 && priceNum > maxPrice) return false;
    }

    // Pago Mensual Máximo
    const rawPagoMax = filters.pagoMax ?? filters.maxPayment;
    if (rawPagoMax !== undefined && rawPagoMax !== "") {
      const maxMonthly = typeof rawPagoMax === "number" ? rawPagoMax : parseFloat(String(rawPagoMax));
      if (!isNaN(maxMonthly) && maxMonthly > 0 && monthlyEst > maxMonthly) return false;
    }

    // Millaje Máximo
    if (filters.maxMiles !== undefined && filters.maxMiles > 0) {
      if (mileageNum > filters.maxMiles) return false;
    }

    // MPG Mínimo
    if (filters.minMPG !== undefined && filters.minMPG > 0) {
      if (mpgNum > 0 && mpgNum < filters.minMPG) return false;
    }

    // Municipio
    if (filters.municipio && filters.municipio !== "Todos") {
      if (municipio.toLowerCase() !== filters.municipio.toLowerCase()) return false;
    }

    // Condición
    if (filters.condicion && filters.condicion !== "Todos") {
      if (filters.condicion === "Nuevo" && yearNum < 2024) return false;
    }

    // Cobertura
    if (filters.cobertura && filters.cobertura !== "Todos") {
      if (filters.cobertura === "Venta As-Is / Sin Garantía" && yearNum >= 2022) return false;
    }

    return true;
  }).sort((a, b) => {
    const pA = parsePrice(a.Precio);
    const pB = parsePrice(b.Precio);
    const yA = parseInt(a["Año"], 10) || 0;
    const yB = parseInt(b["Año"], 10) || 0;
    const mA = parseMileage(a.Millaje);
    const mB = parseMileage(b.Millaje);

    switch (filters.sortBy) {
      case "precio-asc":
      case "price_asc":
        return pA - pB;
      case "precio-desc":
      case "price_desc":
        return pB - pA;
      case "ano-desc":
      case "year_desc":
        return yB - yA;
      case "millaje-asc":
      case "mileage_asc":
        return mA - mB;
      default: {
        const isGTA = (a.Dealer || "").toLowerCase().includes("gt auto");
        const isGTB = (b.Dealer || "").toLowerCase().includes("gt auto");

        if (isGTA && !isGTB) return -1;
        if (!isGTA && isGTB) return 1;

        // Mix Truck and Eco Car after GT Auto
        const carA = inferCarroceria(a).toLowerCase();
        const carB = inferCarroceria(b).toLowerCase();
        
        const isTruckA = carA.includes("pickup") || carA.includes("comercial");
        const isEcoA = carA.includes("sedán") || carA.includes("sedan") || carA.includes("hatchback") || carA.includes("compacto");
        const isMixA = isTruckA || isEcoA;

        const isTruckB = carB.includes("pickup") || carB.includes("comercial");
        const isEcoB = carB.includes("sedán") || carB.includes("sedan") || carB.includes("hatchback") || carB.includes("compacto");
        const isMixB = isTruckB || isEcoB;

        if (isMixA && !isMixB) return -1;
        if (!isMixA && isMixB) return 1;

        if (isMixA && isMixB) {
           // Deterministic pseudo-random mix for trucks and eco cars based on properties
           const hashA = (a.Modelo.length + pA + yA) % 10;
           const hashB = (b.Modelo.length + pB + yB) % 10;
           if (hashA !== hashB) return hashA - hashB;
        }

        return yB !== yA ? yB - yA : pA - pB;
      }
    }
  });
}

export function getVehicleSlug(v: Vehicle): string {
  const parts = [
    v["Año"],
    v.Marca,
    v.Modelo,
    v["Sub-Modelo/Trim Level"]
  ].filter(Boolean).join(" ");
  return parts
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function findVehicleBySlug(inventory: Vehicle[], slug: string): Vehicle | undefined {
  if (!slug) return undefined;
  const cleanSlug = slug.toLowerCase().trim();
  return inventory.find(v => getVehicleSlug(v) === cleanSlug);
}
