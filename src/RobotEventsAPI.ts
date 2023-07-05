import axios, { AxiosResponse } from "axios";
import Bottleneck from "bottleneck";
import * as dotenv from "dotenv";

dotenv.config();

const API_KEY: string = process.env.ROBOT_EVENTS_TOKEN as string;

const throttler = new Bottleneck({
  maxConcurrent: 1,
  minTime: 800,
});


async function apiCall(url: string, headers: object, params?: object): Promise<AxiosResponse<any>> {
  try {
    console.log(`Making API call to ${url}`);
    const response: AxiosResponse<any> = await throttler.schedule(() => axios.get(url, { headers, params: params ? params : {} }));

    if (response.status === 429) {
      const wait_time: number = parseInt(response.headers["retry-after"] || "5") + 1;
      console.log(`Sleeping for ${wait_time} seconds`);
      await new Promise((resolve) => setTimeout(resolve, wait_time * 1000));
      return apiCall(url, headers, params);
    }

    return response;
  } catch (error) {
    throw error;
  }
}

export async function getEventId(event_code: string): Promise<number | null> {
  const url: string = "https://www.robotevents.com/api/v2/events";
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { sku: event_code };

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers, new_params);

    const team_id: number = response.data.data[0]?.id;
    if (!team_id) {
      console.warn("Warning: No id could be found");
      return null;
    }

    return team_id;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getTeamId(team_number: string): Promise<number | null> {
  const url = "https://www.robotevents.com/api/v2/teams";
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { number: team_number, registered: true };

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers, new_params);

    const team_id: number = response.data.data[0]?.id;
    if (!team_id) {
      console.warn("Warning: No id could be found");
      return null;
    }

    return team_id;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getTeamObject(team_id: number): Promise<any | null> {
  const url = `https://www.robotevents.com/api/v2/teams/${team_id}`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers);

    const team = response.data;
    if (!team) {
      console.warn("Warning: No team could be found");
      return null;
    }

    return team;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getTeamSeasonId(team_id: number): Promise<number | null> {
  const url = "https://www.robotevents.com/api/v2/seasons";
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { team: team_id, active: true };

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers, new_params);

    const season_id: number = response.data.data[0]?.id;
    if (!season_id) {
      console.warn("Warning: No season id could be found");
      return null;
    }

    return season_id;
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getTeamAwards(team_id: number, season_id?: number): Promise<any | null> {
  const url = `https://www.robotevents.com/api/v2/teams/${team_id}/awards`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { season: season_id ? season_id : {} };

  const team_awards: any[] = [];

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers, new_params);

    team_awards.push(...response.data.data);

    let next_page_url = response.data.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.data.meta.next_page_url;

      team_awards.push(...nextPageResponse.data.data);
    }

    return team_awards.filter((event, index, self) => {
      return index === self.findIndex((t) => t.id === event.id);
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTeamEvents(team_id: number, season_id?: number): Promise<any[]> {
  const url = `https://www.robotevents.com/api/v2/teams/${team_id}/events`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { season: season_id ? season_id : {}};

  const team_events: any[] = [];

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers, new_params);

    team_events.push(...response.data.data);

    let next_page_url = response.data.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.data.meta.next_page_url;

      team_events.push(...nextPageResponse.data.data);
    }

    return team_events.filter((event, index, self) => {
      return index === self.findIndex((t) => t.id === event.id);
    });
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTeamMatches(team_id: number, event_id: string): Promise<any[]> {
  const url = `https://www.robotevents.com/api/v2/teams/${team_id}/matches`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { event: event_id };

  const team_matches: any[] = [];

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers, new_params);

    team_matches.push(...response.data.data);

    let next_page_url = response.data.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse: AxiosResponse<any> = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.data.meta.next_page_url;

      team_matches.push(...nextPageResponse.data.data);
    }

    return team_matches;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getTeamSkills(team_id: number, seasonId?: number): Promise<any[] | null> {
  const url = `https://www.robotevents.com/api/v2/teams/${team_id}/skills`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { season: seasonId };

  const skills: any[] = [];

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers, new_params);

    skills.push(...response.data.data);

    let next_page_url = response.data.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse: AxiosResponse<any> = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.data.meta.next_page_url;

      skills.push(...nextPageResponse.data.data);
    }

    return skills;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getEventDivisions(event_id: number): Promise<number[] | null> {
  const url = `https://www.robotevents.com/api/v2/events/${event_id}`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { event: event_id };

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers, new_params);

    const divisions = response.data?.divisions;

    if (!divisions) {
      console.warn("Warning: No divisions could be found");
      return null;
    }

    return divisions.map((division: any) => division.id);
  } catch (error) {
    console.error(error);
    return null;
  }
}

export async function getEvents(seasonId: number) {
  const url = `https://www.robotevents.com/api/v2/events`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };
  const new_params = { season: seasonId };

  const events: any[] = [];

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers, new_params);

    events.push(...response.data.data);

    let next_page_url = response.data.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse: AxiosResponse<any> = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.data.meta.next_page_url;

      events.push(...nextPageResponse.data.data);
    }

    return events;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getEventMatches(
    event_id: number,
    division_id: number,
    round?: number,
    matchnum?: number
): Promise<any[]> {
  const url = `https://www.robotevents.com/api/v2/events/${event_id}/divisions/${division_id}/matches`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };

  const new_params = { round: round ? round : {}, matchnum: matchnum ? matchnum : {} };

  const division_matches: any[] = [];

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers, new_params);

    division_matches.push(...response.data.data);

    let next_page_url = response.data.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse: AxiosResponse<any> = await apiCall(next_page_url, new_headers, new_params);

      next_page_url = nextPageResponse.data.meta.next_page_url;

      division_matches.push(...nextPageResponse.data.data);
    }

    return division_matches;
  } catch (error) {
    console.error(error);
    return [];
  }
}

export async function getEventTeams(event_id: number) {
  const url = `https://www.robotevents.com/api/v2/events/${event_id}/teams`;
  const new_headers = {
    "accept": "application/json",
    "Authorization": "Bearer " + API_KEY,
  };

  const event_teams: any[] = [];

  try {
    const response: AxiosResponse<any> = await apiCall(url, new_headers);

    event_teams.push(...response.data.data);

    let next_page_url = response.data.meta.next_page_url;

    while (next_page_url) {
      const nextPageResponse: AxiosResponse<any> = await apiCall(next_page_url, new_headers);

      next_page_url = nextPageResponse.data.meta.next_page_url;

      event_teams.push(...nextPageResponse.data.data);
    }

    return event_teams;
  } catch (error) {
    console.error(error);
    return [];
  }
}