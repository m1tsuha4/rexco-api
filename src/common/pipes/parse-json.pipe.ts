import { PipeTransform } from '@nestjs/common';

export class ParseJsonPipe implements PipeTransform {
  private jsonFields = [
    'productStore',
    'productDocument',
    'productFeature',
    'productVideos',
  ];

  transform(value: any) {
    if (!value || typeof value !== 'object') {
      return value;
    }
    for (const field of this.jsonFields) {
      if (value[field] && typeof value[field] === 'string') {
        try {
          value[field] = JSON.parse(value[field]);
        } catch (e) {
        }
      }
    }
    return value;
  }
}
