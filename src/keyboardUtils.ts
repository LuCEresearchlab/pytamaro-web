export function hasCmdModifier() {
  // https://developer.mozilla.org/en-US/docs/Web/API/Navigator/platform#determining_the_modifier_key_for_the_users_platform
  return /(Mac|iPhone|iPad)/.test(navigator.platform);
}
