import { MovieReviews } from "./src/movieReviews";
export class NYTjs {
  public MovieReviews: MovieReviews;
  constructor(key?: string) {
    const apikey = key || process.env.NYT_API_KEY;
    if (!apikey)
      throw new Error(
        "No API key was passed, and the environment variable NYT_API_KEY was not set"
      );
    this.MovieReviews = new MovieReviews(apikey);
  }
}
