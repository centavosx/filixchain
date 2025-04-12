import axios, { AxiosHeaders, AxiosInstance, HttpStatusCode } from 'axios';
import qs from 'qs';
import { Deferred } from './deferred';
import { Session } from '@ph-blockchain/session';
import { ApiError } from './error';

export class BaseApi {
  private static deferred?: Deferred<void>;

  private static instance: AxiosInstance;
  static readonly headers = new AxiosHeaders();

  static getToken: () => Promise<string>;

  static setGetToken(cb: typeof this.getToken) {
    this.getToken = cb;
    return this;
  }

  static init(url: string) {
    this.instance = axios.create({
      withCredentials: true,
      baseURL: url,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'brackets' });
      },
    });

    this.instance.interceptors.request.use(
      async (config) => {
        if (typeof window !== 'undefined') return config;

        if (!BaseApi.deferred) {
          this.deferred = new Deferred<void>();

          const accessToken = await BaseApi.getToken();

          BaseApi.headers.set(Session.HEADER_ACCESS_KEY, accessToken);

          BaseApi.deferred.resolve();
          BaseApi.deferred = undefined;
        } else {
          await BaseApi.deferred?.promise;
        }

        config['headers'] = config.headers.concat(BaseApi.headers);

        return config;
      },
      (error) => Promise.reject(error),
    );

    this.instance.interceptors.response.use(
      (response) => response,
      async (error) => {
        if (typeof window === 'undefined') return Promise.reject(error);
        const isForbidden =
          error.response && error.response.status === HttpStatusCode.Forbidden;

        if (isForbidden) {
          window.location.reload();
        }

        return Promise.reject(error);
      },
    );

    return this;
  }

  protected static async get<Params, Result>(
    endpoint: string,
    params?: Params,
    headers?: AxiosHeaders,
  ) {
    try {
      const response = await BaseApi.instance?.get(endpoint, {
        params,
        headers,
      });

      return response.data as Result;
    } catch (e) {
      throw new ApiError(e);
    }
  }
  protected static async delete<Params, Result>(
    endpoint: string,
    params?: Params,
    headers?: AxiosHeaders,
  ) {
    try {
      const response = await BaseApi.instance?.delete(endpoint, {
        params,
        headers,
      });

      return response.data as Result;
    } catch (e) {
      throw new ApiError(e);
    }
  }

  protected static async post<Body, Params, Result>(
    endpoint: string,
    data?: Body,
    params?: Params,
    headers?: AxiosHeaders,
  ) {
    try {
      const response = await BaseApi.instance?.post(endpoint, data, {
        params,
        headers,
      });

      return response.data as Result;
    } catch (e) {
      throw new ApiError(e);
    }
  }

  protected static async patch<Body, Params, Result>(
    endpoint: string,
    data?: Body,
    params?: Params,
    headers?: AxiosHeaders,
  ) {
    try {
      const response = await BaseApi.instance?.patch(endpoint, data, {
        params,
        headers,
      });

      return response.data as Result;
    } catch (e) {
      throw new ApiError(e);
    }
  }

  protected static async put<Body, Params, Result>(
    endpoint: string,
    data?: Body,
    params?: Params,
    headers?: AxiosHeaders,
  ) {
    try {
      const response = await BaseApi.instance?.put(endpoint, data, {
        params,
        headers,
      });

      return response.data as Result;
    } catch (e) {
      throw new ApiError(e);
    }
  }
}
