export class Transform {
  static removePrefix(data: string, prefix: string) {
    return data.replace(new RegExp(`^${prefix}`), '');
  }

  static addPrefix(data: string, prefix: string) {
    return `${prefix}${data}`;
  }
}
