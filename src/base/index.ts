import { URLSearchParams } from "url";

export class APIBase {
  protected apikey: string;
  constructor(apikey: string) {
    this.apikey = apikey;
  }
  protected baseSearchParams(): URLSearchParams {
    const searchparams = new URLSearchParams();
    searchparams.append("api-key", this.apikey);
    return searchparams;
  }
  protected checkError(status: number, json: any) {
    if (status !== 200) {
      throw new Error(
        `Error code ${status}: ${json.fault.faultstring} (${json.fault.detail.errorcode})`
      );
    }
  }
}
