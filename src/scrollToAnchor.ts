export default function scrollToAnchor() {
  const { hash } = window.location;
  if (hash) {
    const element = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (element) {
      element.scrollIntoView();
    }
  }
}
