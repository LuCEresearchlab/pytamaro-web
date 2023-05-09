export default function downloadSourceCode(source: string, filename = 'main.py') {
  const element = document.createElement('a');
  const file = new Blob([source], { type: 'text/plain' });
  element.href = URL.createObjectURL(file);
  element.download = filename;
  document.body.appendChild(element);
  element.click();
}
