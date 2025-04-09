import { AxiosError } from 'axios';

export class ApiError extends AxiosError<
  { message: string | string[]; error: string },
  { message: string | string[]; error: string }
> {
  constructor(e: AxiosError<any, any>) {
    super(e.message, e.code, e.config, e.request, e.response);
  }

  get messages() {
    const message = this.response.data?.message;
    if (!message) {
      return [this.message];
    }
    return Array.isArray(message) ? message : [message];
  }
}
