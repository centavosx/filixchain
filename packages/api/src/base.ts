import axios, { AxiosHeaders, AxiosInstance } from 'axios';
import qs from 'qs';

export class BaseApi {
  private static instance: AxiosInstance;

  static init(url: string) {
    this.instance = axios.create({
      baseURL: url,
      paramsSerializer: function (params) {
        return qs.stringify(params, { arrayFormat: 'brackets' });
      },
    });
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
}
