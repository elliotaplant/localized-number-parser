# Localized Number Parser

A no-dependency number parser that uses the browser's built in number formatting to parse numbers.

Original code created by [Mike Bostock here](https://observablehq.com/@mbostock/localized-number-parsing)

## Parsing numbers

You can either use the `LocalizedNumberParser` class or the `parseLocalizedNumber` method.

### Using LocalizedNumberParser

Create an instance of the parser with the locale you like to parse, and then call the `parse` method of your instance on the localized number-string. If you do not provide a locale, it will default to the environment (either browser or Node) locale.

```
const parserEn = new LocalizedNumberParser('en');
console.log(parserEn.parse('12,345,678.90')); // 12345678.9

const parserDe = new LocalizedNumberParser('de');
console.log(parserDe.parse('12.345.678,9')); // 12345678.9

const parserArEg = new LocalizedNumberParser('ar-EG');
console.log(parserArEg.parse('١٬٢٣٤٫٥٦')); // 1234.56

const parserEnv = new LocalizedNumberParser();
console.log(parserEn.parse('12,345,678.90')); // 12345678.9 if you are in 'en' locale
```

### Using parseLocalizedNumber

Call the `parseLocalizedNumber` with the localized number-string and the locale to use for parsing. If you do not provide a locale, it will default to the environment (either browser or Node) locale.

```
console.log(parseLocalizedNumber('12,345,678.90', 'en')); // 12345678.9
console.log(parseLocalizedNumber('12.345.678,9', 'de')); // 12345678.9
console.log(parseLocalizedNumber('١٬٢٣٤٫٥٦', 'ar-EG')); // 1234.56
console.log(parseLocalizedNumber('12,345,678.90')); // 12345678.9 if you are in 'en' locale
```

## Mike Bostock's Post:

### Localized Number Parsing

The [ECMAScript Internationalization API](https://norbertlindenberg.com/2012/12/ecmascript-internationalization-api/index.html) provides a convenient mechanism for formatting human-readable numbers. For example, these formats are intended for the U.S., Germany, and India:

```
new Intl.NumberFormat("en").format(12345678.90)
> "12,345,678.9"
```

```
new Intl.NumberFormat("de").format(12345678.90)
12.345.678,9
```

```
new Intl.NumberFormat("en-IN").format(12345678.90)
1,23,45,678.9
```

But what about parsing localized numbers? The Internationalization API does not provide specifically for parsing. And as we can see above, assuming that commas are group separators and periods are decimal separators is no good.

Fortunately, there is format.formatToParts, which we can abuse slightly to determine which symbols the locale uses for separators. With that, we can rewrite the localized number according to the ECMAScript language number format.

```
parts = new Intl.NumberFormat("de").formatToParts(1234.5)
> [
  {
    "type": "integer",
    "value": "1"
  },
  {
    "type": "group",
    "value": "."
  },
  {
    "type": "integer",
    "value": "234"
  },
  {
    "type": "decimal",
    "value": ","
  },
  {
    "type": "fraction",
    "value": "5"
  }
]
```

```
group = parts.find(d => d.type === "group").value
> "."
```

```
decimal = parts.find(d => d.type === "decimal").value
> ","
```

To strip the group separators and rewrite the decimal separator, use string.replace.

```
"12.345.678,9".replace(/\./g, "").replace(/,/, ".")
> "12345678.9"
```

And to coerce to a number, use the unary plus operator.

```
+"12345678.9"
> 12345678.9
```

But, we’re not done yet! The ECMAScript language uses [Western Arabic numerals](https://en.wikipedia.org/wiki/Arabic_numerals), so we also need to convert from the locale’s numeral system, such as Eastern Arabic (١٬٢٣٤٫٥٦). If we assume a simple one-to-one mapping from Western Arabic numerals—and I’m not an expert on numeral systems, so I have no idea how reasonable an assumption this is—we can extract the digits.

```
[...new Intl.NumberFormat("ar-EG", {useGrouping: false}).format(9876543210)].reverse()
> ٠,١,٢,٣,٤,٥,٦,٧,٨,٩
```

```
[...new Intl.NumberFormat("zh-Hans-CN-u-nu-hanidec", {useGrouping: false}).format(9876543210)].reverse()
> 〇,一,二,三,四,五,六,七,八,九
```

Here’s a class that implements this technique.

```
class NumberParser {
  constructor(locale) {
    const parts = new Intl.NumberFormat(locale).formatToParts(12345.6);
    const numerals = [...new Intl.NumberFormat(locale, {useGrouping: false}).format(9876543210)].reverse();
    const index = new Map(numerals.map((d, i) => [d, i]));
    this._group = new RegExp(`[${parts.find(d => d.type === "group").value}]`, "g");
    this._decimal = new RegExp(`[${parts.find(d => d.type === "decimal").value}]`);
    this._numeral = new RegExp(`[${numerals.join("")}]`, "g");
    this._index = d => index.get(d);
  }
  parse(string) {
    return (string = string.trim()
      .replace(this._group, "")
      .replace(this._decimal, ".")
      .replace(this._numeral, this._index)) ? +string : NaN;
  }
}
```

Here are a few examples

```
new NumberParser("ar-EG").parse("١٬٢٣٤٫٥٦")
1234.56
```

```
new NumberParser("zh-Hans-CN-u-nu-hanidec").parse("一,二三四.五六")
1234.56
```

```
new NumberParser("en").parse("12,345,678.90")
12345678.9
```

```
new NumberParser("de").parse("12.345.678,9")
12345678.9
```

```
new NumberParser("en-IN").parse("1,23,45,678.9")
12345678.9
```
