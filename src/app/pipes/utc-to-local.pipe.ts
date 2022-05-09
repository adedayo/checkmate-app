import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'utcToLocal'
})
export class UtcToLocalPipe implements PipeTransform {

  transform(utcDate: string, format: string): string {
    const browserLanguage = navigator.language;
    switch (format) {
      case 'full':
        return new Date(utcDate).toString();
      case 'shortTime':
        return new Date(utcDate).toLocaleTimeString(browserLanguage);
      case 'shortDate':
        return new Date(utcDate).toLocaleDateString(browserLanguage);
      case 'short':
        const date = new Date(utcDate).toLocaleDateString(browserLanguage);
        const time = new Date(utcDate).toLocaleTimeString(browserLanguage);
        return `${date}, ${time}`;
      default:
        break;
    }
    return new Date(utcDate).toString();
  }

}
