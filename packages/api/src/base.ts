import axios, { AxiosHeaders, AxiosInstance, HttpStatusCode } from 'axios';
import qs from 'qs';
import { Deferred } from './deferred';

export class BaseApi {
  private static deferred?: Deferred<void>;

  private static instance: AxiosInstance;
  static readonly headers = new AxiosHeaders();

  static getToken: () => Promise<{
    token: string;
    nonce: string;
  }>;

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

          const { token, nonce } = await BaseApi.getToken();

          BaseApi.headers.set('X-XSRF-TOKEN', token);
          BaseApi.headers.set('X-XSRF-NONCE', nonce);

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
        const originalRequest = error.config;

        if (
          !BaseApi.getToken ||
          originalRequest.url === '/refresh' ||
          typeof window === 'undefined'
        )
          return Promise.reject(error);

        const hasErrored =
          error.response && error.response.status === HttpStatusCode.Forbidden;

        if (hasErrored && originalRequest && !originalRequest._markForRetry) {
          originalRequest._markForRetry = true;

          try {
            await this.refresh();
            return BaseApi.instance(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        window.location.reload();
        return;
      },
    );

    return this;
  }

  protected static async get<Params, Result>(
    endpoint: string,
    params?: Params,
    headers?: AxiosHeaders,
  ) {
    const response = await BaseApi.instance?.get(endpoint, {
      params,
      headers,
    });

    return {
      data: response.data as Result,
      status: response.status,
    };
  }
  protected static async delete<Params, Result>(
    endpoint: string,
    params?: Params,
    headers?: AxiosHeaders,
  ) {
    const response = await BaseApi.instance?.delete(endpoint, {
      params,
      headers,
    });

    return {
      data: response.data as Result,
      status: response.status,
    };
  }

  protected static async post<Body, Params, Result>(
    endpoint: string,
    data?: Body,
    params?: Params,
    headers?: AxiosHeaders,
  ) {
    const response = await BaseApi.instance?.post(endpoint, data, {
      params,
      headers,
    });

    return {
      data: response.data as Result,
      status: response.status,
    };
  }

  protected static async patch<Body, Params, Result>(
    endpoint: string,
    data?: Body,
    params?: Params,
    headers?: AxiosHeaders,
  ) {
    const response = await BaseApi.instance?.patch(endpoint, data, {
      params,
      headers,
    });

    return {
      data: response.data as Result,
      status: response.status,
    };
  }

  protected static async put<Body, Params, Result>(
    endpoint: string,
    data?: Body,
    params?: Params,
    headers?: AxiosHeaders,
  ) {
    const response = await BaseApi.instance?.put(endpoint, data, {
      params,
      headers,
    });

    return {
      data: response.data as Result,
      status: response.status,
    };
  }

  private static async refresh() {
    if (BaseApi.deferred) return await BaseApi.deferred.promise;

    const deferred = new Deferred<void>();

    BaseApi.deferred = deferred;

    try {
      await BaseApi.get<unknown, unknown>(`/refresh`);
      BaseApi.deferred.resolve();
    } catch (e) {
      BaseApi.deferred.reject(e);
    }

    BaseApi.deferred = undefined;
  }
}
