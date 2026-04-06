import type {
  PropertySummary,
  BuildingInfo,
  InteriorInfo,
  ExteriorInfo,
  UtilitiesInfo,
  RoomInfo,
  LandInfo,
} from '@/lib/extract-listing-details';

/* ─── Shared Section Shell ────────────────────────────────────────── */
function Section({ id, title, icon, children }: { id?: string; title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section id={id} className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-50 text-[#4F46E5]">
          {icon}
        </span>
        <h2 className="text-2xl font-black tracking-tight text-slate-900">{title}</h2>
      </div>
      <div className="rounded-3xl border border-slate-100 bg-slate-50/50 p-6 sm:p-8">
        {children}
      </div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string | number | null | undefined }) {
  if (!value && value !== 0) return null;
  return (
    <div className="flex justify-between border-b border-slate-100 py-3 last:border-0">
      <span className="text-sm font-bold text-slate-400">{label}</span>
      <span className="text-sm font-black text-slate-800 text-right">{value}</span>
    </div>
  );
}

function TagList({ label, items }: { label?: string; items: string[] | null }) {
  if (!items || items.length === 0) return null;
  return (
    <div className="mb-5 last:mb-0">
      {label && <span className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-400">{label}</span>}
      <div className="flex flex-wrap gap-2">
        {items.map((item, i) => (
          <span key={i} className="rounded-xl bg-white px-3 py-1.5 text-xs font-bold text-slate-600 shadow-sm border border-slate-100">
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function hasAnyValue(obj: Record<string, any> | null | undefined): boolean {
  if (!obj) return false;
  return Object.values(obj).some(v => {
    if (Array.isArray(v)) return v.length > 0;
    return v !== null && v !== undefined;
  });
}

/* ─── Icons ────────────────────────────────────────────────────────── */
const icons = {
  summary: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>,
  building: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>,
  interior: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" /></svg>,
  exterior: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" /></svg>,
  utilities: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>,
  rooms: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>,
  land: <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
};

/* ─── Realtor Compliance Badge ───────────────────────────────────── */
export function RealtorBadge(_props: { 
  moreInformationLink?: string;
  variant?: 'default' | 'full';
}) {
  return null;
}

/* ═══════════════════════════════════════════════════════════════════ */
export function PropertySummarySection({ data }: { data: PropertySummary }) {
  if (!hasAnyValue(data)) return null;
  return (
    <Section id="property-summary" title="Property Summary" icon={icons.summary}>
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-12">
        <Row label="Property Type" value={data.propertyType} />
        <Row label="Building Type" value={data.buildingType} />
        <Row label="Status" value={data.status} />
        <Row label="MLS® Number" value={data.listingId} />
        <Row label="MLS® Board" value={data.mlsBoard} />
        <Row label="Year Built" value={data.yearBuilt} />
        <Row label="Storeys" value={data.storeys} />
        <Row label="Community" value={data.communityName} />
        <Row label="Land Size" value={data.landSize} />
        <Row label="Parking Spaces" value={data.parking} />
        <Row label="Annual Tax" value={data.tax} />
        <Row label="Ownership" value={data.ownershipType} />
        <Row label="Zoning" value={data.zoning} />
        <Row label="Inclusions" value={data.inclusions} />
      </div>
      <TagList label="View" items={data.view} />
      <TagList label="Parking Features" items={data.parkingType} />
    </Section>
  );
}

export function BuildingDetailsSection({ data }: { data: BuildingInfo }) {
  if (!hasAnyValue(data)) return null;
  return (
    <Section id="building-details" title="Building Details" icon={icons.building}>
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-12">
        <Row label="Bedrooms" value={data.bedrooms} />
        <Row label="Bedrooms (Above Grade)" value={data.bedroomsAboveGrade} />
        <Row label="Bedrooms (Below Grade)" value={data.bedroomsBelowGrade} />
        <Row label="Bathrooms" value={data.bathrooms} />
        <Row label="Half Baths" value={data.bathroomsPartial} />
        <Row label="Storeys" value={data.stories} />
        <Row label="Living Area" value={data.livingArea} />
        <Row label="Above Grade Area" value={data.aboveGradeArea} />
        <Row label="Below Grade Area" value={data.belowGradeArea} />
        <Row label="Total Building Area" value={data.totalArea} />
        <Row label="Fireplaces" value={data.fireplaces} />
      </div>
      <TagList label="Architectural Style" items={data.architecturalStyle} />
      <TagList label="Construction Materials" items={data.constructionMaterials} />
      <TagList label="Foundation" items={data.foundationDetails} />
      <TagList label="Fireplace Features" items={data.fireplaceFeatures} />
      <TagList label="Building Features" items={data.buildingFeatures} />
    </Section>
  );
}

export function InteriorFeaturesSection({ data }: { data: InteriorInfo }) {
  if (!hasAnyValue(data)) return null;
  return (
    <Section id="interior-features" title="Interior Features" icon={icons.interior}>
      <TagList label="Appliances" items={data.appliances} />
      <TagList label="Flooring" items={data.flooring} />
      <TagList label="Basement" items={data.basement} />
      <TagList label="Heating" items={data.heating} />
      <TagList label="Cooling" items={data.cooling} />
      <TagList label="Security" items={data.securityFeatures} />
    </Section>
  );
}

export function ExteriorFeaturesSection({ data }: { data: ExteriorInfo }) {
  if (!hasAnyValue(data)) return null;
  return (
    <Section id="exterior-features" title="Exterior & Condition" icon={icons.exterior}>
      <TagList label="Exterior" items={data.exteriorFeatures} />
      <TagList label="Roof" items={data.roofType} />
      <TagList label="Pool" items={data.poolFeatures} />
      <TagList label="Fencing" items={data.fencing} />
      <TagList label="Road Surface" items={data.roadSurface} />
      <TagList label="Property Condition" items={data.propertyCondition} />
    </Section>
  );
}

export function UtilitiesSection({ data }: { data: UtilitiesInfo }) {
  if (!hasAnyValue(data)) return null;
  return (
    <Section id="utilities" title="Utilities & Services" icon={icons.utilities}>
      <TagList label="Water" items={data.water} />
      <TagList label="Sewer" items={data.sewer} />
      <TagList label="Electric" items={data.electric} />
      <TagList label="Utilities" items={data.utilities} />
    </Section>
  );
}

export function RoomsTableSection({ data }: { data: RoomInfo[] }) {
  if (!data || data.length === 0) return null;
  return (
    <Section id="rooms" title="Room Dimensions" icon={icons.rooms}>
      <div className="overflow-x-auto -mx-2">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-slate-200">
              <th className="px-2 pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Room</th>
              <th className="px-2 pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Level</th>
              <th className="px-2 pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400">Dimensions</th>
              <th className="px-2 pb-3 text-[10px] font-black uppercase tracking-widest text-slate-400 hidden sm:table-cell">Features</th>
            </tr>
          </thead>
          <tbody>
            {data.map((room, i) => (
              <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-white/60 transition-colors">
                <td className="px-2 py-3 font-bold text-slate-800">{room.RoomType || '—'}</td>
                <td className="px-2 py-3 text-slate-500">{room.RoomLevel || '—'}</td>
                <td className="px-2 py-3 font-mono text-sm text-slate-600">{room.RoomDimensions || '—'}</td>
                <td className="px-2 py-3 text-slate-500 hidden sm:table-cell">
                  {room.RoomFeatures?.length ? room.RoomFeatures.join(', ') : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export function LandDetailsSection({ data }: { data: LandInfo }) {
  if (!hasAnyValue(data)) return null;
  return (
    <Section id="land-details" title="Land Details" icon={icons.land}>
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-12">
        <Row label="Lot Size" value={data.lotSize} />
        <Row label="Lot Dimensions" value={data.lotDimensions} />
        <Row label="Frontage" value={data.frontage} />
        <Row label="Zoning" value={data.zoning} />
        <Row label="Zoning Description" value={data.zoningDescription} />
      </div>
      <TagList label="Lot Features" items={data.lotFeatures} />
      <TagList label="Current Use" items={data.currentUse} />
      <TagList label="Possible Use" items={data.possibleUse} />
      <TagList label="Waterfront" items={data.waterfront} />
    </Section>
  );
}

/* ─── Association / Condo Fees ─────────────────────────────────────── */
export function AssociationSection({ data }: { data: { fee: string | null; name: string | null; feeIncludes: string[] | null } }) {
  if (!data.fee && !data.name) return null;
  return (
    <Section id="association" title="Association / Condo Fees" icon={icons.summary}>
      <div className="grid grid-cols-1 gap-0 md:grid-cols-2 md:gap-x-12">
        <Row label="Monthly Fee / Frequency" value={data.fee} />
        <Row label="Association Name" value={data.name} />
      </div>
      <TagList label="Fee Includes" items={data.feeIncludes} />
    </Section>
  );
}
