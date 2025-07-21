import {
  type_equality_rule,
  UnsoundType,
} from '../../../src/tide/language/typing';

describe('Unit test type_equality', () => {
  it('type_equality_rule_same', () => {
    Array.from({ length: 5 }).forEach((_, v) =>
      expect(type_equality_rule(v + 1, v + 1)).to.eq(true),
    );
  });

  it('type_equality_rule_bottom', () => {
    Array.from({ length: 5 }).forEach((_, v) =>
      expect(type_equality_rule(v + 1, UnsoundType.Bottom)).to.eq(false),
    );
  });
});
