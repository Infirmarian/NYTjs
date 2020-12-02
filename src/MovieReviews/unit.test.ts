jest.mock("node-fetch");
import fetch from "node-fetch";
const { Response } = jest.requireActual("node-fetch");

import { MovieReviews } from ".";
afterEach(() => {
  jest.clearAllMocks();
});

test("movie with bad response, 400 error code", async () => {
  //@ts-ignore
  fetch.mockReturnValue(Promise.resolve(new Response("{}", { status: 400 })));
  expect.assertions(3);
  await new MovieReviews("bad-api-key")
    .search()
    .catch((e) => expect(e).toBeDefined());
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith(
    "https://api.nytimes.com/svc/movies/v2/reviews/search.json?api-key=bad-api-key"
  );
});

test("movie with good response", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(
      new Response(
        `{
        "copyright": "copyright",
        "results":[
          {
            "display_title": "Title",
            "mpaa_rating": "",
            "critics_pick": 1,
            "byline": "AUTHOR",
            "headline": "headline",
            "summary_short": "summary",
            "publication_date": "2019-01-01",
            "opening_date": "2019-01-02",
            "date_updated": "2019-03-08 17:44:02",
            "link":{
                "suggested_link_text": "link",
                "type":"article",
                "url": "http://"
            },
            "multimedia": {
                "height": 100,
                "width": 200,
                "type": "multimedia",
                "src": "https://"
            }
          }
        ]
    } `,
        { status: 200 }
      )
    )
  );
  const response = await new MovieReviews("api-key").search();
  expect(fetch).toHaveBeenCalledTimes(1);
  expect(fetch).toHaveBeenCalledWith(
    "https://api.nytimes.com/svc/movies/v2/reviews/search.json?api-key=api-key"
  );
  expect(response.copyright).toEqual("copyright");
  expect(response.results.length).toEqual(1);
  expect(response.results[0].byline).toEqual("AUTHOR");
  expect(response.results[0].criticsPick).toEqual(true);
  expect(response.results[0].displayTitle).toEqual("Title");
  expect(response.results[0].mpaaRating).toEqual("");
  expect(response.results[0].headline).toEqual("headline");
  expect(response.results[0].summaryShort).toEqual("summary");
  expect(response.results[0].publicationDate).toEqual(new Date("2019-01-01"));
  expect(response.results[0].openingDate).toEqual(new Date("2019-01-02"));
  expect(response.results[0].dateUpdated).toEqual(
    new Date("2019-03-08 17:44:02")
  );
  expect(response.results[0].link.suggestedLinkText).toEqual("link");
  expect(response.results[0].link.url).toEqual("http://");
  expect(response.results[0].link.type).toEqual("article");
  expect(response.results[0].multimedia.height).toEqual(100);
  expect(response.results[0].multimedia.width).toEqual(200);
  expect(response.results[0].multimedia.type).toEqual("multimedia");
  expect(response.results[0].multimedia.src).toEqual("https://");
});

test("movies with critic pick", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").search({ criticsPick: true });
  expect(fetch).toBeCalledTimes(1);
  //@ts-ignore
  const arg: string = fetch.mock.calls[0][0];
  expect(arg).toMatch(/critics-pick=Y/);
  expect(arg).not.toMatch(/critics-pick=N/);
});

test("movies with bad offset", async () => {
  //@ts-ignore
  fetch.mockReturnValue(Promise.resolve(new Response("{}", { status: 400 })));
  expect.assertions(1);
  await new MovieReviews("api-key")
    .search({ offset: 21 })
    .catch((e) => expect(e).toBeDefined());
});

test("movies with good offset", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").search({ offset: 20 });
  expect(fetch).toBeCalledTimes(1);
  //@ts-ignore
  const arg: string = fetch.mock.calls[0][0];
  expect(arg).toMatch(/offset=20/);
});

test("movies with opening date start", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").search({
    openingDate: { start: new Date("2020-01-01") },
  });
  expect(fetch).toBeCalledTimes(1);
  //@ts-ignore
  const arg: string = fetch.mock.calls[0][0];
  expect(arg).toMatch(/opening-date=2020-01-01/);
});
test("movies with opening date start+end", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").search({
    openingDate: { start: new Date("2020-01-01"), end: new Date("2020-01-02") },
  });
  expect(fetch).toBeCalledTimes(1);
  //@ts-ignore
  const arg: string = fetch.mock.calls[0][0];
  expect(arg).toMatch(/opening-date=2020-01-01%3B2020-01-02/);
});
test("movies with ordering", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").search({ order: "opening-date" });
  expect(fetch).toBeCalledTimes(1);
  //@ts-ignore
  const arg: string = fetch.mock.calls[0][0];
  expect(arg).toMatch(/order=by-opening-date/);
});

test("movies with publication date start+end", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").search({
    publicationDate: {
      start: new Date("2020-01-01"),
      end: new Date("2020-01-02"),
    },
  });
  expect(fetch).toBeCalledTimes(1);
  //@ts-ignore
  const arg: string = fetch.mock.calls[0][0];
  expect(arg).toMatch(/publication-date=2020-01-01%3B2020-01-02/);
});

test("movies with reviewer", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").search({ reviewer: "George" });
  expect(fetch).toBeCalledTimes(1);
  //@ts-ignore
  const arg: string = fetch.mock.calls[0][0];
  expect(arg).toMatch(/reviewer=George/);
});

test("movies with query", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").search({ query: "Frozen II" });
  expect(fetch).toBeCalledTimes(1);
  //@ts-ignore
  const arg: string = fetch.mock.calls[0][0];
  expect(arg).toMatch(/query=Frozen\+II/);
});

test("movies with next", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": [], "has_more": true}'))
  );
  const result = await new MovieReviews("api-key").search()
  expect(fetch).toBeCalledTimes(1);
  expect(result.next).toBeDefined()
});

test("all, no args", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").all();
  expect(fetch).toBeCalledTimes(1);
  //@ts-ignore
  const arg: string = fetch.mock.calls[0][0];
  expect(arg).toMatch(/\/reviews\/all.json\?/);
});

test("picks, no args", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").picks();
  expect(fetch).toBeCalledTimes(1);
  //@ts-ignore
  const arg: string = fetch.mock.calls[0][0];
  expect(arg).toMatch(/\/reviews\/picks.json\?/);
});

test("picks, offset", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").picks({offset: 20});
  expect(fetch).toBeCalledTimes(1);
  //@ts-ignore
  const arg: string = fetch.mock.calls[0][0];
  expect(arg).toMatch(/offset=20/);
});

test("picks, bad offset", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  expect.assertions(2)
  await new MovieReviews("api-key").picks({offset: 22}).catch(e => expect(e).toBeDefined())
  expect(fetch).toBeCalledTimes(0)
});

test("all, ordering", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": []}'))
  );
  await new MovieReviews("api-key").picks({order:"title"})
  expect(fetch).toBeCalledTimes(1)
    //@ts-ignore
    const arg: string = fetch.mock.calls[0][0];
    expect(arg).toMatch(/order=by-title/);
});

test("all, with next value", async () => {
  //@ts-ignore
  fetch.mockReturnValue(
    Promise.resolve(new Response('{"copyright":"copyright", "results": [], "has_more": true}'))
  );
  const result = await new MovieReviews("api-key").picks()
  expect(fetch).toBeCalledTimes(1)
  expect(result.next).toBeDefined()
});
