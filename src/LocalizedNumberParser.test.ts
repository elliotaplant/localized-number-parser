import { LocalizedNumberParser, parseLocalizedNumber } from './index';

describe('LocalizedNumberParser', () => {
  it('should parse ar-EG', () => {
    const parser = new LocalizedNumberParser('ar-EG');
    expect(parser.parse('١٬٢٣٤٫٥٦')).toEqual(1234.56);
  });

  it('should parse ar-EG', () => {
    const parser = new LocalizedNumberParser('zh-Hans-CN-u-nu-hanidec');
    expect(parser.parse('一,二三四.五六')).toEqual(1234.56);
  });

  it('should parse en', () => {
    const parser = new LocalizedNumberParser('en');
    expect(parser.parse('12,345,678.90')).toEqual(12345678.9);
  });

  it('should parse de', () => {
    const parser = new LocalizedNumberParser('de');
    expect(parser.parse('12.345.678,9')).toEqual(12345678.9);
  });

  it('should parse en-IN', () => {
    const parser = new LocalizedNumberParser('en-IN');
    expect(parser.parse('1,23,45,678.9')).toEqual(12345678.9);
  });

  it('should parse as a function', () => {
    expect(parseLocalizedNumber('1,23,45,678.9', 'en-IN')).toEqual(12345678.9);
  });

  it('should default to environment localization', () => {
    expect(parseLocalizedNumber('12,345,678.9')).toEqual(12345678.9);
  });
});
