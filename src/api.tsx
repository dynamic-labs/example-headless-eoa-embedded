import { getAuthToken, VERSION as SDKVersion } from "@dynamic-labs/sdk-react-core";
import { Configuration, SDKApi } from "@dynamic-labs/sdk-api-core";
import { FetchService } from "@dynamic-labs/utils";

interface ISettings {
  basePath: string | undefined;
  headers: {
    Authorization?: string;
    "Content-Type": string;
    "x-dyn-api-version"?: string;
    "x-dyn-version"?: string;
  };
}

export const dynamicApi = () => {
  const settings: ISettings = {
    basePath: 'https://app.dynamicauth.com/api/v0',
    headers: {
      "Content-Type": "application/json",
    },
  };

  const minJwt = getAuthToken();
  if (minJwt) {
    settings.headers.Authorization = `Bearer ${minJwt}`;
  }

  settings.headers["x-dyn-version"] = `WalletKit/${SDKVersion}`;
  return new SDKApi(
    new Configuration({
      ...settings,
      fetchApi: FetchService.fetch,
    })
  );
};
