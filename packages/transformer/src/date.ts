import { format } from 'date-fns';

export class DateTransformer {
  static formatToReadable(date: number | Date) {
    return format(date, 'MMMM dd, yyyy hh:mm:ss aaa');
  }
}
