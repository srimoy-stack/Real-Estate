/**
 * ─── Agent Data Extraction Utility ─────────────────────────────────
 *
 * Reusable function to extract and normalize agent details from
 * DDF rawData JSON. Handles multiple field name variations across
 * different DDF payload structures.
 *
 * USAGE:
 *   import { extractAgentFromRawData } from '@/lib/extract-agent';
 *   const agent = extractAgentFromRawData(listing.rawData);
 *
 * ────────────────────────────────────────────────────────────────────
 */

export interface AgentData {
  agentName: string | null;
  agentEmail: string | null;
  agentPhone: string | null;
  agentOfficePhone: string | null;
  agentPhoto: string | null;
  agentMemberKey: string | null;
  brokerageName: string | null;
  brokerageKey: string | null;
}

const EMPTY_AGENT: AgentData = {
  agentName: null,
  agentEmail: null,
  agentPhone: null,
  agentOfficePhone: null,
  agentPhoto: null,
  agentMemberKey: null,
  brokerageName: null,
  brokerageKey: null,
};

/**
 * Safely trims a string value, returning null for empty/invalid input.
 */
function safeTrim(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  if (typeof val !== 'string') return String(val).trim() || null;
  const trimmed = val.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * Validates that a URL string looks like a valid image URL.
 */
function isValidPhotoUrl(url: unknown): string | null {
  if (typeof url !== 'string') return null;
  const trimmed = url.trim();
  if (trimmed.length < 10) return null;
  if (!trimmed.startsWith('http')) return null;
  const NON_IMAGE = /\.(pdf|doc|docx|zip|rar|7z)$/i;
  if (NON_IMAGE.test(trimmed)) return null;
  try {
    new URL(trimmed);
    return trimmed;
  } catch {
    return null;
  }
}

/**
 * Extracts the first available value from a raw object for the given field names.
 */
function firstOf(raw: Record<string, any>, ...fields: string[]): unknown {
  for (const f of fields) {
    if (raw[f] !== null && raw[f] !== undefined && raw[f] !== '') {
      return raw[f];
    }
  }
  return null;
}

/**
 * Extracts normalized agent data from a DDF rawData JSON object.
 *
 * Handles field name variations across DDF payload structures:
 * - ListAgentFullName, ListAgentFirstName + ListAgentLastName
 * - Individual -> Name (older DDF format)
 * - Agent / ListingAgent nested objects
 *
 * @param rawData - The rawData JSON field from a Listing record
 * @returns Normalized AgentData object with null-safe fields
 */
export function extractAgentFromRawData(rawData: unknown): AgentData {
  if (!rawData || typeof rawData !== 'object') {
    return { ...EMPTY_AGENT };
  }

  const raw = rawData as Record<string, any>;

  // ─── Agent Name ──────────────────────────────────────────────────
  let agentName = safeTrim(
    firstOf(raw, 'ListAgentFullName', 'AgentFullName', 'ListingAgentName')
  );

  // Fallback: compose from first + last name
  if (!agentName) {
    const first = safeTrim(firstOf(raw, 'ListAgentFirstName', 'AgentFirstName'));
    const last = safeTrim(firstOf(raw, 'ListAgentLastName', 'AgentLastName'));
    if (first || last) {
      agentName = [first, last].filter(Boolean).join(' ');
    }
  }

  // Fallback: Individual object (older DDF format)
  if (!agentName && raw.Individual) {
    const ind = Array.isArray(raw.Individual) ? raw.Individual[0] : raw.Individual;
    if (ind && typeof ind === 'object') {
      const name = ind.Name || ind.FullName;
      if (typeof name === 'string') {
        agentName = safeTrim(name);
      } else if (name && typeof name === 'object') {
        // Name could be { FirstName, LastName }
        const fn = safeTrim(name.FirstName || name.first);
        const ln = safeTrim(name.LastName || name.last);
        if (fn || ln) agentName = [fn, ln].filter(Boolean).join(' ');
      }
    }
  }

  // Fallback: nested Agent / ListingAgent object
  if (!agentName) {
    const nested = raw.Agent || raw.ListingAgent;
    if (nested && typeof nested === 'object') {
      const obj = Array.isArray(nested) ? nested[0] : nested;
      agentName = safeTrim(obj?.FullName || obj?.Name || obj?.AgentName);
    }
  }

  // ─── Agent Email ─────────────────────────────────────────────────
  const agentEmail = safeTrim(
    firstOf(raw, 'ListAgentEmail', 'AgentEmail', 'ListingAgentEmail')
  );

  // ─── Agent Phone ─────────────────────────────────────────────────
  const agentPhone = safeTrim(
    firstOf(raw, 'ListAgentDirectPhone', 'AgentDirectPhone', 'ListingAgentPhone', 'ListAgentPreferredPhone')
  );

  const agentOfficePhone = safeTrim(
    firstOf(raw, 'ListAgentOfficePhone', 'ListOfficePhone', 'AgentOfficePhone')
  );

  // ─── Agent Photo ─────────────────────────────────────────────────
  const agentPhoto = isValidPhotoUrl(
    firstOf(raw, 'ListAgentPhoto', 'AgentPhoto', 'ListAgentPhotoURL')
  );

  // ─── Agent Member Key ───────────────────────────────────────────
  const agentMemberKey = safeTrim(
    firstOf(raw, 'ListAgentKey', 'ListAgentMlsId', 'AgentMemberKey')
  );

  // ─── Brokerage ──────────────────────────────────────────────────
  const brokerageName = safeTrim(
    firstOf(raw, 'ListOfficeName', 'OfficeName', 'BrokerageName', 'ListingOfficeName')
  );

  const brokerageKey = safeTrim(
    firstOf(raw, 'ListOfficeKey', 'OfficeKey', 'BrokerageKey')
  );

  return {
    agentName,
    agentEmail,
    agentPhone,
    agentOfficePhone,
    agentPhoto,
    agentMemberKey,
    brokerageName,
    brokerageKey,
  };
}

/**
 * Checks whether the extracted agent data has any meaningful content.
 */
export function hasAgentData(data: AgentData): boolean {
  return !!(data.agentName || data.agentEmail || data.agentPhone);
}
