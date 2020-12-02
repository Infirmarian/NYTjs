import fetch from "node-fetch";
import { URLSearchParams } from "url";
import { APIBase } from "../base";

const BASE_URL = "https://api.nytimes.com/svc/movies/v2";

export class MovieReviews extends APIBase {
  async search(parameters?: SearchArgs): Promise<SearchResults> {
    const searchParams = this.encodeURLParameters(parameters || {});
    const response = await fetch(
      `${BASE_URL}/reviews/search.json?${searchParams}`
    );
    const json = await response.json();
    this.checkError(response.status, json);
    return {
      copyright: json.copyright,
      results: this.unpackReviews(json.results),
      next: json.has_more
        ? () =>
            this.search({
              ...parameters,
              offset: (parameters?.offset || 0) + 20,
            })
        : undefined,
    };
  }

  async all(parameters?: ListArgs): Promise<SearchResults> {
    return await this.allAndPicks("all", parameters);
  }

  async picks(parameters?: ListArgs): Promise<SearchResults> {
    return await this.allAndPicks("picks", parameters);
  }
  
  async critics({
    reviewer,
  }: {
    reviewer: "all" | "full-time" | "part-time";
  }): Promise<CriticResults> {
    const response = await fetch(
      `${BASE_URL}/critics/${reviewer}.json?${this.baseSearchParams()}`
    );
    const json = await response.json();
    this.checkError(response.status, json);
    return {
      copyright: json.copyright,
      results: this.unpackCritics(json.results),
    };
  }

  private async allAndPicks(
    query: "all" | "picks",
    parameters?: ListArgs
  ) {
    const { offset, order } = parameters || {}
    const searchparams = this.baseSearchParams();
    if (offset) {
      if (offset % 20 !== 0) throw new Error("Offset MUST be a multiple of 20");
      searchparams.append("offset", offset.toString());
    }
    if (order) searchparams.append("order", `by-${order}`);
    const response = await fetch(
      `${BASE_URL}/reviews/${query}.json?${searchparams}`
    );
    const json = await response.json();
    this.checkError(response.status, json);
    return {
      copyright: json.copyright,
      results: this.unpackReviews(json.results),
      next: json.has_more
        ? () =>
            this.allAndPicks(query, {
              order,
              offset: (offset || 0) + 20,
            })
        : undefined,
    };
  }

  private datesToRange(range: { start: Date; end?: Date }): string {
    let result = range.start.toISOString().substr(0, 10);
    if (range.end) result += ";" + range.end.toISOString().substr(0, 10);
    return result;
  }

  private encodeURLParameters(parameters: SearchArgs): URLSearchParams {
    const searchParams = this.baseSearchParams();
    if (parameters.criticsPick) searchParams.append("critics-pick", "Y");
    if (parameters.offset) {
      if (parameters.offset % 20 !== 0)
        throw new Error("Offset MUST be a multiple of 20");
      searchParams.append("offset", parameters.offset.toString());
    }
    if (parameters.openingDate){
      searchParams.append(
        "opening-date",
        this.datesToRange(parameters.openingDate)
      );
    }
    if (parameters.order)
      searchParams.append("order", `by-${parameters.order}`);
    if (parameters.publicationDate) {
      searchParams.append(
        "publication-date",
        this.datesToRange(parameters.publicationDate)
      );
    }
    if (parameters.reviewer)
      searchParams.append("reviewer", parameters.reviewer);
    if (parameters.query) searchParams.append("query", parameters.query);
    return searchParams;
  }

  private unpackReviews(raw: any[]): Review[] {
    return raw.map(
      (it: any): Review => ({
        byline: it.byline,
        criticsPick: it.critics_pick === 1,
        dateUpdated: new Date(it.date_updated),
        displayTitle: it.display_title,
        headline: it.headline,
        link: {
          suggestedLinkText: it.link.suggested_link_text,
          type: it.link.type,
          url: it.link.url,
        },
        mpaaRating: it.mpaa_rating,
        multimedia: {
          height: it.multimedia.height,
          src: it.multimedia.src,
          type: it.multimedia.type,
          width: it.multimedia.width,
        },
        openingDate: new Date(it.opening_date),
        publicationDate: new Date(it.publication_date),
        summaryShort: it.summary_short,
      })
    );
  }

  private unpackCritics(raw: any[]): Critic[] {
    return raw.map(
      (it: any): Critic => ({
        displayName: it.display_name,
        sortName: it.sort_name,
        status: it.status,
        bio: it.bio,
        seoName: it.seo_name,
        multimedia: it.multimedia
          ? {
              height: it.multimedia.resource.height,
              src: it.multimedia.resource.src,
              type: it.multimedia.resource.type,
              width: it.multimedia.resource.width,
            }
          : null,
      })
    );
  }
}
