import { getServiceSupabase } from '@/lib/supabase';
import { calculateRelevanceScore, extractSmartTags } from '@/lib/scoring';

interface DevpostHackathon {
  id: number;
  title: string;
  displayed_location: { icon: string; location: string };
  open_state: string;
  url: string;
  time_left_to_submission: string;
  submission_period_dates: string;
  themes: Array<{ id: number; name: string }>;
  prize_amount: string;
  registrations_count: number;
  organization_name: string;
  winners_announced: boolean;
  invite_only: boolean;
}

interface DevpostResponse {
  hackathons: DevpostHackathon[];
  meta: { total_count: number; per_page: number };
}

const DEVPOST_API = 'https://devpost.com/api/hackathons';

/**
 * Parse deadline from Devpost submission_period_dates string
 * e.g. "Mar 02 - Apr 07, 2026" → "2026-04-07"
 */
function parseDeadline(dateStr: string): string | null {
  try {
    // Format: "Mar 02 - Apr 07, 2026" or "Mar 08 - 29, 2026"
    const parts = dateStr.split(' - ');
    if (parts.length !== 2) return null;

    const endPart = parts[1].trim(); // "Apr 07, 2026" or "29, 2026"

    // Check if end part has month name
    if (/^[A-Z][a-z]{2}\s/.test(endPart)) {
      // Full format: "Apr 07, 2026"
      const d = new Date(endPart);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    } else {
      // Short format: "29, 2026" — use month from start
      const startMonth = parts[0].trim().split(' ')[0]; // "Mar"
      const d = new Date(`${startMonth} ${endPart}`);
      if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Strip HTML from prize amount
 * "$<span data-currency-value>10,000</span>" → "$10,000"
 */
function cleanPrize(raw: string): string {
  return raw.replace(/<[^>]*>/g, '').trim();
}

export async function crawlDevpost(): Promise<number> {
  const supabase = getServiceSupabase();
  const rows: Record<string, unknown>[] = [];

  // Fetch multiple pages to get more hackathons
  for (let page = 1; page <= 5; page++) {
    try {
      const res = await fetch(
        `${DEVPOST_API}?status[]=open&status[]=upcoming&page=${page}`,
        {
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'NewsCollector/1.0',
          },
        }
      );

      if (!res.ok) {
        console.error(`Devpost API error (page ${page}): ${res.status}`);
        break;
      }

      const data: DevpostResponse = await res.json();
      if (!data.hackathons || data.hackathons.length === 0) break;

      for (const hack of data.hackathons) {
        if (hack.invite_only || hack.winners_announced) continue;

        const themeNames = hack.themes.map(t => t.name.toLowerCase());
        const prize = cleanPrize(hack.prize_amount);
        const location = hack.displayed_location?.location || 'Online';

        const description = [
          `Hackathon by ${hack.organization_name}.`,
          `Themes: ${hack.themes.map(t => t.name).join(', ')}.`,
          `Prize: ${prize}.`,
          `${hack.registrations_count} registrations.`,
          `Location: ${location}.`,
          `Submission: ${hack.submission_period_dates}.`,
          hack.time_left_to_submission ? `Time left: ${hack.time_left_to_submission}.` : '',
        ].filter(Boolean).join(' ');

        const deadline = parseDeadline(hack.submission_period_dates);

        const baseTags = ['hackathon', 'devpost', ...themeNames];
        const score = calculateRelevanceScore(hack.title, description, 'devpost', 'hackathon');
        const tags = extractSmartTags(hack.title, description, baseTags);

        rows.push({
          type: 'hackathon',
          title: hack.title,
          organization: hack.organization_name,
          url: hack.url,
          description,
          location,
          tags,
          eligibility: 'anyone',
          status: 'active',
          deadline,
          source_url: 'https://devpost.com/hackathons',
          crawl_depth: 0,
          relevance_score: score,
          raw_data: {
            devpost_id: hack.id,
            prize,
            registrations: hack.registrations_count,
            themes: hack.themes,
            time_left: hack.time_left_to_submission,
            open_state: hack.open_state,
          },
        });
      }

      await new Promise(r => setTimeout(r, 300));
    } catch (e) {
      console.error(`Devpost crawl error (page ${page}):`, e);
      break;
    }
  }

  if (rows.length > 0) {
    let inserted = 0;
    for (const row of rows) {
      const { data: existing } = await supabase
        .from('opportunities')
        .select('id')
        .eq('url', row.url as string)
        .limit(1);
      if (existing && existing.length > 0) continue;
      const { error } = await supabase.from('opportunities').insert(row);
      if (error) {
        console.error('Devpost insert error:', error.message);
      } else {
        inserted++;
      }
    }
    return inserted;
  }

  return 0;
}
