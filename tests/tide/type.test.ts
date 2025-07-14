import { type_equality_rule, UnsoundType } from '../../src/tide/expression';

test('type_equality_rule_same', () => {
  Array.from({ length: 5 }).forEach((_, v) =>
    expect(type_equality_rule(v + 1, v + 1)).toBe(true),
  );
});

test('type_equality_rule_bottom', () => {
  Array.from({ length: 5 }).forEach((_, v) =>
    expect(type_equality_rule(v + 1, UnsoundType.Bottom)).toBe(false),
  );
});
