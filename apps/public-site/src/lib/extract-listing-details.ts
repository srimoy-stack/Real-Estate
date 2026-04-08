/**
 * Safe extractor for deep listing details.
 * Reads from BOTH rawData AND the listing object itself for maximum coverage.
 * All fields use optional chaining — never crashes on null/undefined.
 */

export interface PropertySummary {
  propertyType: string | null;
  buildingType: string | null;
  storeys: number | null;
  landSize: string | null;
  tax: string | null;
  parking: number | null;
  parkingType: string[] | null;
  ownershipType: string | null;
  yearBuilt: number | null;
  communityName: string | null;
  zoning: string | null;
  listingId: string | null;
  mlsBoard: string | null;
  status: string | null;
  view: string[] | null;
  inclusions: string | null;
  leaseType: string | null;
  crossStreets: string | null;
  directions: string | null;
  // Location
  city: string | null;
  province: string | null;
  postalCode: string | null;
  // Dates
  listedDate: string | null;
  updatedDate: string | null;
}

export interface BuildingInfo {
  bedrooms: number | null;
  bedroomsAboveGrade: number | null;
  bedroomsBelowGrade: number | null;
  bathrooms: number | null;
  bathroomsPartial: number | null;
  aboveGradeArea: string | null;
  belowGradeArea: string | null;
  livingArea: string | null;
  totalArea: string | null;
  architecturalStyle: string[] | null;
  constructionMaterials: string[] | null;
  foundationDetails: string[] | null;
  stories: number | null;
  fireplaces: number | null;
  fireplaceFeatures: string[] | null;
  buildingFeatures: string[] | null;
}

export interface InteriorInfo {
  appliances: string[] | null;
  flooring: string[] | null;
  basement: string[] | null;
  cooling: string[] | null;
  heating: string[] | null;
  securityFeatures: string[] | null;
}

export interface ExteriorInfo {
  exteriorFeatures: string[] | null;
  roofType: string[] | null;
  poolFeatures: string[] | null;
  fencing: string[] | null;
  roadSurface: string[] | null;
  propertyCondition: string[] | null;
}

export interface UtilitiesInfo {
  water: string[] | null;
  sewer: string[] | null;
  electric: string[] | null;
  utilities: string[] | null;
}

export interface RoomInfo {
  RoomType?: string;
  RoomLevel?: string;
  RoomDimensions?: string;
  RoomFeatures?: string[];
  [key: string]: any;
}

export interface LandInfo {
  lotSize: string | null;
  lotDimensions: string | null;
  frontage: string | null;
  zoning: string | null;
  zoningDescription: string | null;
  currentUse: string[] | null;
  possibleUse: string[] | null;
  lotFeatures: string[] | null;
  waterfront: string[] | null;
}

export interface ListingDetails {
  propertySummary: PropertySummary;
  building: BuildingInfo;
  interior: InteriorInfo;
  exterior: ExteriorInfo;
  utilities: UtilitiesInfo;
  rooms: RoomInfo[];
  land: LandInfo;
  association: {
    fee: string | null;
    name: string | null;
    feeIncludes: string[] | null;
  };
  hasAnyData: boolean;
}

function safeArray(val: unknown): string[] | null {
  if (!Array.isArray(val)) return null;
  const filtered = val.filter((v: any) => typeof v === 'string' && v.trim().length > 0);
  return filtered.length > 0 ? filtered : null;
}

function safeNum(val: unknown): number | null {
  if (val === null || val === undefined) return null;
  const n = Number(val);
  return isNaN(n) || n === 0 ? null : n;
}

function safeStr(val: unknown): string | null {
  if (typeof val !== 'string' || !val.trim()) return null;
  const t = val.trim();
  return t.toLowerCase() === 'null' ? null : t;
}

function formatArea(val: unknown, units: unknown): string | null {
  const n = safeNum(val);
  if (!n) return null;
  const u = safeStr(units) || 'sq ft';
  return `${n.toLocaleString()} ${u}`;
}

function formatCurrency(val: unknown): string | null {
  const n = safeNum(val);
  if (!n) return null;
  return `$${n.toLocaleString()}`;
}

export function extractListingDetails(listing: any): ListingDetails {
  const raw = (listing?.rawData ?? {}) as Record<string, any>;
  const l = listing || {};

  const propertySummary: PropertySummary = {
    propertyType: safeStr(raw.PropertySubType) ?? safeStr(l.propertySubType) ?? safeStr(l.propertyType) ?? safeStr(raw.CommonInterest),
    buildingType: safeStr(Array.isArray(raw.StructureType) ? raw.StructureType[0] : raw.StructureType),
    storeys: safeNum(raw.Stories),
    landSize: formatArea(raw.LotSizeArea, raw.LotSizeUnits),
    tax: raw.TaxAnnualAmount ? `${formatCurrency(raw.TaxAnnualAmount)}${raw.TaxYear ? ` (${raw.TaxYear})` : ''}` : null,
    parking: safeNum(raw.ParkingTotal),
    parkingType: safeArray(raw.ParkingFeatures),
    ownershipType: safeStr(raw.CommonInterest),
    yearBuilt: safeNum(raw.YearBuilt) ?? safeNum(l.yearBuilt),
    communityName: safeStr(raw.SubdivisionName) ?? safeStr(raw.CityRegion),
    zoning: safeStr(raw.Zoning),
    listingId: safeStr(raw.ListingId) ?? safeStr(l.listingId) ?? safeStr(l.mlsNumber),
    mlsBoard: safeStr(raw.OriginatingSystemName) ?? safeStr(raw.ListAOR),
    status: safeStr(raw.StandardStatus) ?? safeStr(l.standardStatus) ?? safeStr(l.status),
    view: safeArray(raw.View),
    inclusions: safeStr(raw.Inclusions),
    leaseType: safeStr(raw.LeaseType),
    crossStreets: safeStr(raw.CrossStreet),
    directions: safeStr(raw.Directions),
    // Location
    city: safeStr(l.city) ?? safeStr(raw.City),
    province: safeStr(l.province) ?? safeStr(raw.StateOrProvince),
    postalCode: safeStr(l.postalCode) ?? safeStr(raw.PostalCode),
    // Dates — format as human-readable if present
    listedDate: (() => {
      const d = l.createdAt || raw.ListingDate || raw.OriginalEntryTimestamp;
      if (!d) return null;
      try { return new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return null; }
    })(),
    updatedDate: (() => {
      const d = l.updatedAt || raw.ModificationTimestamp;
      if (!d) return null;
      try { return new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }); } catch { return null; }
    })(),
  };

  const building: BuildingInfo = {
    bedrooms: safeNum(raw.BedroomsTotal) ?? safeNum(l.bedrooms) ?? safeNum(l.bedroomsTotal),
    bedroomsAboveGrade: safeNum(raw.BedroomsAboveGrade),
    bedroomsBelowGrade: safeNum(raw.BedroomsBelowGrade),
    bathrooms: safeNum(raw.BathroomsTotalInteger) ?? safeNum(l.bathrooms) ?? safeNum(l.bathroomsTotal),
    bathroomsPartial: safeNum(raw.BathroomsPartial),
    aboveGradeArea: formatArea(raw.AboveGradeFinishedArea, raw.AboveGradeFinishedAreaUnits),
    belowGradeArea: formatArea(raw.BelowGradeFinishedArea, raw.BelowGradeFinishedAreaUnits),
    livingArea: formatArea(raw.LivingArea, raw.LivingAreaUnits) ?? (safeNum(l.squareFootage) ? `${Number(l.squareFootage).toLocaleString()} sq ft` : null) ?? (safeNum(l.livingArea) ? `${Number(l.livingArea).toLocaleString()} sq ft` : null),
    totalArea: formatArea(raw.BuildingAreaTotal, raw.BuildingAreaUnits),
    architecturalStyle: safeArray(raw.ArchitecturalStyle),
    constructionMaterials: safeArray(raw.ConstructionMaterials),
    foundationDetails: safeArray(raw.FoundationDetails),
    stories: safeNum(raw.Stories),
    fireplaces: safeNum(raw.FireplacesTotal),
    fireplaceFeatures: safeArray(raw.FireplaceFeatures),
    buildingFeatures: safeArray(raw.BuildingFeatures),
  };

  const interior: InteriorInfo = {
    appliances: safeArray(raw.Appliances),
    flooring: safeArray(raw.Flooring),
    basement: safeArray(raw.Basement),
    cooling: safeArray(raw.Cooling),
    heating: safeArray(raw.Heating),
    securityFeatures: safeArray(raw.SecurityFeatures),
  };

  const exterior: ExteriorInfo = {
    exteriorFeatures: safeArray(raw.ExteriorFeatures),
    roofType: safeArray(raw.Roof),
    poolFeatures: safeArray(raw.PoolFeatures),
    fencing: safeArray(raw.Fencing),
    roadSurface: safeArray(raw.RoadSurfaceType),
    propertyCondition: safeArray(raw.PropertyCondition),
  };

  const utilities: UtilitiesInfo = {
    water: safeArray(raw.WaterSource),
    sewer: safeArray(raw.Sewer),
    electric: safeArray(raw.Electric),
    utilities: safeArray(raw.Utilities),
  };

  const rooms: RoomInfo[] = Array.isArray(raw.Rooms)
    ? raw.Rooms.filter((r: any) => r && typeof r === 'object' && Object.keys(r).length > 0)
    : [];

  const land: LandInfo = {
    lotSize: formatArea(raw.LotSizeArea, raw.LotSizeUnits),
    lotDimensions: safeStr(raw.LotSizeDimensions),
    frontage: formatArea(raw.FrontageLengthNumeric, raw.FrontageLengthNumericUnits),
    zoning: safeStr(raw.Zoning),
    zoningDescription: safeStr(raw.ZoningDescription),
    currentUse: safeArray(raw.CurrentUse),
    possibleUse: safeArray(raw.PossibleUse),
    lotFeatures: safeArray(raw.LotFeatures),
    waterfront: safeArray(raw.WaterfrontFeatures),
  };

  const association = {
    fee: raw.AssociationFee ? `${formatCurrency(raw.AssociationFee)}/${safeStr(raw.AssociationFeeFrequency) || 'month'}` : null,
    name: safeStr(raw.AssociationName),
    feeIncludes: safeArray(raw.AssociationFeeIncludes),
  };

  // Check if we have ANY data worth showing
  const hasAnyData = !!(
    propertySummary.propertyType || propertySummary.yearBuilt || propertySummary.tax || propertySummary.parking ||
    building.bedrooms || building.bathrooms || building.livingArea ||
    interior.heating || interior.basement || interior.appliances ||
    exterior.exteriorFeatures || exterior.roofType ||
    utilities.water || utilities.sewer ||
    rooms.length > 0 ||
    land.lotSize || land.frontage
  );

  return { propertySummary, building, interior, exterior, utilities, rooms, land, association, hasAnyData };
}
