import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import qs from 'qs';
import { Deferred } from './deferred';

export class BaseApi {
  private static deferred?: Deferred<{
    token: string;
    nonce: string;
  }>;

  private static getTokenDeferred?: Deferred<void>;

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

  private static async getAndSetTokenInHeaders() {
    const { token, nonce } = await BaseApi.getToken();

    BaseApi.headers.set('X-XSRF-TOKEN', token);
    BaseApi.headers.set('X-XSRF-NONCE', nonce);

    return {
      token,
      nonce,
    };
  }

  static init(url: string) {
    this.instance = axios.create({
      baseURL: url,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'brackets' });
      },
    });

    this.instance.interceptors.request.use(
      async (config) => {
        if (typeof window === 'undefined') {
          if (!BaseApi.getTokenDeferred && typeof window === 'undefined') {
            this.getTokenDeferred = new Deferred<any>();
            await this.getAndSetTokenInHeaders();
            BaseApi.getTokenDeferred.resolve();
          } else {
            await BaseApi.getTokenDeferred?.promise;
          }
        } else {
          await BaseApi.getAndSetTokenInHeaders();
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

        if (!BaseApi.getToken || originalRequest.url === '/refresh')
          return Promise.reject(error);

        const hasErrored = error.response && error.response.status === 403;

        if (hasErrored && originalRequest && !originalRequest._markForRetry) {
          originalRequest._markForRetry = true;

          try {
            const { token, nonce } = await this.refresh();
            BaseApi.instance.defaults.headers.common['X-XSRF-TOKEN'] = token;
            return BaseApi.instance(originalRequest);
          } catch (err) {
            return Promise.reject(err);
          }
        }

        // Force reload if it errors out
        if (typeof window !== 'undefined') {
          window.location.reload();
          return;
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

    const deferred = new Deferred<any>();

    BaseApi.deferred = deferred;

    await BaseApi.get<unknown, unknown>(`/refresh`);

    const { token, nonce } = await BaseApi.getAndSetTokenInHeaders();

    const data = {
      token,
      nonce,
    };

    BaseApi.deferred.resolve(data);
    BaseApi.deferred = undefined;

    return data;
  }
}
