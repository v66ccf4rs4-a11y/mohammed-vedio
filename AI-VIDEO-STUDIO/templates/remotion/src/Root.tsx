import {Composition} from 'remotion';
import {ArabicTitle, arabicTitleSchema} from './ArabicTitle';

const defaults = {
  lines: [
    {text: 'هُنا تَبدأُ الحِكاية', from: 0.4, to: 3.2, font: 'Aref Ruqaa Ink'},
    {text: 'في قَلبِ الصَّحراءِ', from: 3.4, to: 6.2, font: 'Amiri'},
    {text: 'يُشرقُ الضَّوءُ مِن جَديد', from: 6.4, to: 9.8, font: 'Reem Kufi'},
  ],
  background: null as string | null,
};

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ArabicTitle" component={ArabicTitle} schema={arabicTitleSchema}
      durationInFrames={300} fps={30} width={1080} height={1920} defaultProps={defaults} />
    <Composition id="ArabicTitleWide" component={ArabicTitle} schema={arabicTitleSchema}
      durationInFrames={300} fps={30} width={1920} height={1080} defaultProps={defaults} />
  </>
);
