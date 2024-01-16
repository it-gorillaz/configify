/**
 * The variables expansion class.
 *
 * This is a slightly modified version of the dotenv-expand lib
 * due to the lack of support to variables containing '.' and '-'.
 *
 * Once the dotev-expand lib adds support to '.' and '-' this class can be removed.
 */
export class Variables {
  /**
   * Escaped \$ matcher
   */
  private static readonly ESCAPE_PATTERN: RegExp = /\\\$/g;

  /**
   * Unescaped $ matcher
   */
  private static readonly UNESCAPED_PATTERN: RegExp = /(?!(?<=\\))\$/g;

  /**
   * (
   *   (?!(?<=\\))\$        // only match dollar signs that are not escaped
   *   {?                   // optional opening curly brace
   *     ([\w]+)            // match the variable name
   *     ([\w-.]+)          // match the variable name
   *     (?::-([^}\\]*))?   // match an optional default value
   *   }?                   // optional closing curly brace
   * )
   */
  private static readonly EXPANSION_GROUP_PATTERN: RegExp =
    /((?!(?<=\\))\${?([\w-.]+)(?::-([^}\\]*))?}?)/;

  /**
   * Expands the variables of the given object.
   *
   * @param   {Record<string, any>} record The object
   * @returns {Record<string, any>}        The expanded object
   */
  static expand(record: Record<string, any>): Record<string, any> {
    const expanded = {};
    for (const key in record) {
      const value = record[key];
      expanded[key] = this.escapeSequences(this.interpolate(value, record));
    }
    return expanded;
  }

  /**
   * Replaces ${variable} with actual values recursively.
   *
   * @param value
   * @param record
   * @returns
   */
  private static interpolate(
    value: string,
    record: Record<string, any>,
  ): string {
    const lastUnescapedDollarSignIndex = this.lastIndexOf(
      value,
      this.UNESCAPED_PATTERN,
    );

    if (lastUnescapedDollarSignIndex === -1) return value;

    const rightMostGroup = value.slice(lastUnescapedDollarSignIndex);
    const match = rightMostGroup.match(this.EXPANSION_GROUP_PATTERN);

    if (match != null) {
      const [, group, variableName, defaultValue] = match;
      return this.interpolate(
        value.replace(group, defaultValue || record[variableName] || ''),
        record,
      );
    }

    return value;
  }

  /**
   * Replaces escaped \$ signs with $
   *
   * @param value
   * @returns
   */
  private static escapeSequences(value: string): string {
    return value.replace(this.ESCAPE_PATTERN, '$');
  }

  /**
   * Finds the last index of the matching regex.
   *
   * @param value
   * @param regex
   * @returns
   */
  private static lastIndexOf(value: string, regex: RegExp): number {
    const matches = Array.from(value.matchAll(regex));
    return matches.length > 0 ? matches.slice(-1)[0].index : -1;
  }
}
