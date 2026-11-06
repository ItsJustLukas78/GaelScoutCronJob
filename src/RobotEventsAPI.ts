import Bottleneck from "bottleneck";
import * as dotenv from "dotenv";
import fetch, { Response } from 'node-fetch';
import { logger } from "./server.js";

dotenv.config();

const API_KEY: string = process.env.ROBOT_EVENTS_TOKEN as string;

const throttler = new Bottleneck({
  maxConcurrent: 1,
  minTime: 605,
});

async function apiCall(url: string, headers: object, params?: object): Promise<any> {
  try {
    let parametrized_url: string = url;

    if (params) {
      // @ts-ignore
      Object.keys(params).forEach(key => params[key] == null && delete params[key]);

      params = {...params, per_page: 250};

      const searchParams = new URLSearchParams(params as any);
      parametrized_url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    } else {
      params = {per_page: 250};

      const searchParams = new URLSearchParams(params as any);
      parametrized_url += (url.includes('?') ? '&' : '?') + searchParams.toString();
    }


    const response: Response = await throttler.schedule(() =>
      fetch(parametrized_url, {
        method: 'GET',
        headers: {...headers},
      }
    ));

    if (response.status === 429) {
      const wait_time: number = parseInt(response.headers.get("retry-after") || "5") + 1;
      logger.warn(`Sleeping for ${wait_time} seconds`);
      await new Promise((resolve) => setTimeout(resolve, wait_time * 1000));
      return apiCall(url, headers, params);
    } else if (response.status !== 200) {
      logger.error(`Non-200 API call: ${url} - Params: ${JSON.stringify(params)} - Status: ${response.status}`);
      return null
    }

    const json = await response.json();

    logger.info(`API call: ${url} - Params: ${JSON.stringify(params)} - Rate: ${response.headers.get("x-ratelimit-remaining")}/${response.headers.get("x-ratelimit-limit")}`);

    return json;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

export async function getEventId(event_code: string): Promise<number | null> {
  const url: string = "https://events.vex.com/api/v2/events";
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { sku: event_code };

  try {
    const response = await apiCall(url, new_headers, new_params);

    const team_id: number = response.data[0]?.id;
    if (!team_id) {
      logger.warn("Warning: No id could be found");
      return null;
    }

    return team_id;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

export async function getTeamId(team_number: string): Promise<number | null> {
  const url = "https://events.vex.com/api/v2/teams";
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { number: team_number, registered: true };

  try {
    const response = await apiCall(url, new_headers, new_params);

    const team_id: number = response.data[0]?.id;
    if (!team_id) {
      logger.warn("Warning: No id could be found");
      return null;
    }

    return team_id;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

export async function getTeamObject(team_id: number): Promise<any | null> {
  const url = `https://events.vex.com/api/v2/teams/${team_id}`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };

  try {
    const team = await apiCall(url, new_headers);

    if (!team) {
      logger.warn("Warning: No team could be found");
      return null;
    }

    return team;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

export async function getTeamSeasonId(team_id: number): Promise<number | null> {
  const url = "https://events.vex.com/api/v2/seasons";
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { team: team_id, active: true };

  try {
    const response = await apiCall(url, new_headers, new_params);

    const season_id: number = response.data[0]?.id;
    if (!season_id) {
      logger.warn("Warning: No season id could be found");
      return null;
    }

    return season_id;
  } catch (error) {
    logger.error(error);
    return null;
  }
}

export async function getTeamAwards(team_id: number, season_id?: number): Promise<any | null> {
  const url = `https://events.vex.com/api/v2/teams/${team_id}/awards`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { season: season_id ? season_id : null };

  const team_awards: any[] = [];

  try {
    const response = await apiCall(url, new_headers, new_params);

    if (!response) {
      return [];
    } else if (!response.data || response.data.length === 0) {
      return [];
    }

    team_awards.push(...response.data);

    let next_page_url = response.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.meta.next_page_url;

      team_awards.push(...nextPageResponse.data);
    }

    return team_awards
  } catch (error) {
    logger.error(error);
    return [];
  }
}

export async function getSkillsStandings({seasonId} : {seasonId: number}): Promise<any[]> {
  const url = `https://events.vex.com/api/seasons/${seasonId}/skills?grade_level=High%20School`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };

  try {
    const skillsStandings = await apiCall(url, new_headers);

    if (!skillsStandings) {
      console.error("Warning: No skills standings could be found");
      return [];
    }

    return skillsStandings;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTeamEvents(team_id: number, season_id?: number, level?: string[]): Promise<any[]> {
  const url = `https://events.vex.com/api/v2/teams/${team_id}/events`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { season: season_id ? season_id : null, level: level ? level : null };

  const team_events: any[] = [];

  try {
    const response = await apiCall(url, new_headers, new_params);

    team_events.push(...response.data);

    let next_page_url = response.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.meta.next_page_url;

      team_events.push(...nextPageResponse.data);
    }

    return team_events.filter((event, index, self) => {
      return index === self.findIndex((t) => t.id === event.id);
    });
  } catch (error) {
    logger.error(error);
    return [];
  }
}

export async function getTeamMatches(team_id: number, event_id: string): Promise<any[]> {
  const url = `https://events.vex.com/api/v2/teams/${team_id}/matches`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { event: event_id };

  const team_matches: any[] = [];

  try {
    const response = await apiCall(url, new_headers, new_params);

    team_matches.push(...response.data);

    let next_page_url = response.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.meta.next_page_url;

      team_matches.push(...nextPageResponse.data);
    }

    return team_matches;
  } catch (error) {
    logger.error(error);
    return [];
  }
}

export async function getTeamSkills(team_id: number, seasonId?: number): Promise<any[] | null> {
  const url = `https://events.vex.com/api/v2/teams/${team_id}/skills`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { season: seasonId };

  const skills: any[] = [];

  try {
    const response = await apiCall(url, new_headers, new_params);

    if (!response) {
      return [];
    } else if (!response.data || response.data.length === 0) {
      return [];
    }

    skills.push(...response.data);

    let next_page_url = response.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.meta.next_page_url;

      skills.push(...nextPageResponse.data);
    }

    return skills;
  } catch (error) {
    logger.error(error);
    return [];
  }
}

export async function getEventDivisions(event_id: number): Promise<number[] | null> {
  const url = `https://events.vex.com/api/v2/events/${event_id}`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { event: event_id };

  try {
    const response = await apiCall(url, new_headers, new_params);

    const divisions = response.divisions;

    if (!divisions) {
      logger.warn("Warning: No divisions could be found");
      return null;
    }

    return divisions.map((division: any) => division.id);
  } catch (error) {
    logger.error(error);
    return null;
  }
}

export async function getEvents(seasonId: number) {
  const url = `https://events.vex.com/api/v2/events`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { season: seasonId, eventTypes: "tournament" };

  const events: any[] = [];

  try {
    const response = await apiCall(url, new_headers, new_params);

    events.push(...response.data);

    let next_page_url = response.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.meta.next_page_url;

      events.push(...nextPageResponse.data);
    }

    return events;
  } catch (error) {
    logger.error(error);
    return [];
  }
}

export async function getEventMatches(
    event_id: number,
    division_id: number,
    round?: number,
    matchnum?: number
): Promise<any[]> {
  const url = `https://events.vex.com/api/v2/events/${event_id}/divisions/${division_id}/matches`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };

  const new_params = { round: round ? round : null, matchnum: matchnum ? matchnum : null };

  const division_matches: any[] = [];

  try {
    const response = await apiCall(url, new_headers, new_params);

    division_matches.push(...response.data);

    let next_page_url = response.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.meta.next_page_url;

      division_matches.push(...nextPageResponse.data);
    }

    return division_matches;
  } catch (error) {
    logger.error(error);
    return [];
  }
}

export async function getEventTeams(event_id: number) {
  const url = `https://events.vex.com/api/v2/events/${event_id}/teams`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };

  const event_teams: any[] = [];

  try {
    const response = await apiCall(url, new_headers);

    event_teams.push(...response.data);

    let next_page_url = response.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse = await apiCall(next_page_url, new_headers);

      next_page_url = nextPageResponse.meta.next_page_url;

      event_teams.push(...nextPageResponse.data);
    }

    return event_teams;
  } catch (error) {
    return [];
  }
}

export async function getSeason(seasonId: number) {
  const url = `https://events.vex.com/api/v2/seasons/${seasonId}`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };

  try {
    const response = await apiCall(url, new_headers);

    if (!response) {
      logger.warn("Warning: No Season could be found");
      return null;
    }

    return response;
  } catch (error) {
    logger.error(error);
    return null;
  }
}