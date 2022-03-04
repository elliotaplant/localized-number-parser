const emptyValue = { value: '' };

class LocalizedNumberParser {
  private _group: RegExp;
  private _decimal: RegExp;
  private _numeral: RegExp;
  private _index: (numeralGroup: string) => string;

  constructor(locale: string) {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const numerals = [
      ...new Intl.NumberFormat(locale, { useGrouping: false }).format(9876543210),
    ].reverse();
    const index = new Map(numerals.map((d, i) => [d, i]));
    this._group = new RegExp(
      `[${(parts.find((d) => d.type === 'group') ?? emptyValue).value}]`,
      'g',
    );
    this._decimal = new RegExp(
      `[${(parts.find((d) => d.type === 'decimal') ?? emptyValue).value}]`,
    );
    this._numeral = new RegExp(`[${numerals.join('')}]`, 'g');
    this._index = (numeralGroup: string) => (index.get(numeralGroup) ?? -1).toString();
  }

  parse(localizedString: string) {
    const numericString = localizedString
      .trim()
      .replace(this._group, '')
      .replace(this._decimal, '.')
      .replace(this._numeral, this._index);

    return numericString ? Number(numericString) : NaN;
  }
}
