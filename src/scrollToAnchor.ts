export default function scrollToAnchor() {
  const { hash } = window.location;
  if (hash) {
    const element = document.getElementById(hash.slice(1));
    if (element) {
      element.scrollIntoView();
    }
  }
}
