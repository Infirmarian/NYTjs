type order = "opening-date" | "publication-date" | "title";
interface Critic {
  displayName: string;
  sortName: string;
  status: "full-time" | "part-time" | null;
  bio: string | null;
  seoName: string;
  multimedia: Multimedia | null;
}
// https://developer.nytimes.com/docs/movie-reviews-api/1/types/MultiMedia
interface Multimedia {
  type: string;
  height: number;
  width: number;
  src: string;
}

// https://developer.nytimes.com/docs/movie-reviews-api/1/types/Link
interface Link {
  suggestedLinkText: string;
  type: string;
  url: string;
}

// https://developer.nytimes.com/docs/movie-reviews-api/1/types/Review
interface Review {
  byline: string;
  criticsPick: boolean;
  dateUpdated: Date;
  displayTitle: string;
  headline: string;
  mpaaRating: string;
  openingDate: Date;
  publicationDate: Date;
  summaryShort: string;
  link: Link;
  multimedia: Multimedia;
}

interface ListArgs {
  offset?: number; // Divisible by 20
  order?: order;
}

interface SearchArgs {
  criticsPick?: boolean;
  offset?: number; // Divisible by 20
  openingDate?: {
    start: Date;
    end?: Date;
  };
  order?: order;
  publicationDate?: {
    start: Date;
    end?: Date;
  };
  reviewer?: string;
  query?: string;
}

interface SearchResults {
  copyright: string;
  results: Review[];
  next?: () => Promise<SearchResults>;
}
interface CriticResults {
  copyright: string;
  results: Critic[];
}
