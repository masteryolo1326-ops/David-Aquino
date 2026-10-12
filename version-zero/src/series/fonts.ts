// Fonts ship inside node_modules (@fontsource, SIL Open Font License) so rendering never
// depends on a network font service.
import '@fontsource/space-grotesk/500.css';
import '@fontsource/space-grotesk/700.css';
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/jetbrains-mono/700.css';
import {continueRender, delayRender} from 'remotion';

const handle = delayRender('Loading fonts');
Promise.all([
  document.fonts.load('700 64px "Space Grotesk"'),
  document.fonts.load('500 32px "Space Grotesk"'),
  document.fonts.load('700 64px "JetBrains Mono"'),
  document.fonts.load('500 32px "JetBrains Mono"'),
])
  .then(() => continueRender(handle))
  .catch(() => continueRender(handle));
