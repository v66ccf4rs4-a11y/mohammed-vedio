import {Gradient, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {all, createRef, easeOutCubic, sequence, waitFor} from '@motion-canvas/core';

// Whole-word animation keeps Arabic letters connected (Canvas text uses HarfBuzz shaping).
const LINES = [
  {text: 'هُنا تَبدأُ الحِكاية', font: 'Aref Ruqaa'},
  {text: 'في قَلبِ الصَّحراءِ', font: 'Amiri'},
  {text: 'يُشرقُ الضَّوءُ مِن جَديد', font: 'Reem Kufi'},
];

export default makeScene2D(function* (view) {
  const bg = createRef<Rect>();
  view.add(
    <Rect ref={bg} width={1300} height={2300} scale={1}
      fill={new Gradient({type: 'linear', from: [0, -1150], to: [0, 1150],
        stops: [{offset: 0, color: '#1b2d4a'}, {offset: 0.5, color: '#6d7f99'},
          {offset: 0.72, color: '#c9a98f'}, {offset: 1, color: '#4a3a30'}]})} />,
  );
  yield bg().scale(1.12, 10);  // slow camera push-in runs during the whole scene (non-blocking below)
  for (const line of LINES) {
    const words = line.text.split(' ');
    const refs = words.map(() => createRef<Txt>());
    const row = (
      <Rect layout direction={'row-reverse'} gap={30} y={420}>
        {words.map((w, i) => (
          <Txt ref={refs[i]} text={w} fontFamily={line.font} fontSize={118} fill={'#F4EFE8'}
            opacity={0} y={40} shadowColor={'rgba(0,0,0,0.5)'} shadowBlur={30} />
        ))}
      </Rect>
    );
    view.add(row);
    yield* sequence(0.25, ...refs.map(r => all(r().opacity(1, 0.6, easeOutCubic), r().y(0, 0.6, easeOutCubic))));
    yield* waitFor(1.4);
    yield* all(...refs.map(r => r().opacity(0, 0.4)));
    row.remove();
  }
  yield* waitFor(0.3);
});
