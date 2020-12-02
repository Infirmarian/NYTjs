import fetch from "node-fetch";
import { APIBase } from "../base";

const BASE_URL = "https://api.nytimes.com/svc/books/v3";
export class Books extends APIBase {
  async names(): Promise<any> {
    const url = `${BASE_URL}/lists/names.json?${this.baseSearchParams()}`;
    const response = await fetch(url);
    const json = await response.json();
    this.checkError(response.status, json)
    return json;
  }
}
