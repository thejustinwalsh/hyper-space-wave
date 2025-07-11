type MeasureEnd = () => void;
type MeasureStart = (fn: Function) => MeasureEnd;

const noop = () => {};

export const measure: MeasureStart =
  process.env.NODE_ENV === 'production'
    ? () => noop
    : fn => {
        if (typeof performance === 'undefined') {
          return () => {};
        }

        const start = performance.now();
        return () => {
          const end = performance.now();
          const duration = end - start;
          performance.measure(fn.name, {
            start,
            end,
            detail: {
              devtools: {
                dataType: 'track-entry',
                track: 'Systems',
                trackGroup: 'Koota',
                color: 'tertiary-dark',
                properties: [
                  ['System', fn.name],
                  ['Duration', `${duration}ms`],
                ],
                tooltipText: fn.name,
              },
            },
          });
        };
      };
