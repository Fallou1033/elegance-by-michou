import '@testing-library/jest-dom';

jest.mock('next/image', () => ({
  __esModule: true,
  default: (props) => {
    const { fill, src, alt, width, height, className, sizes, style, ...rest } = props;
    const nextProps = {
      src,
      alt,
      width: width ?? (fill ? '100%' : 0),
      height: height ?? (fill ? '100%' : 0),
      className,
      ...rest,
    };
    if (style) nextProps.style = style;
    return <img {...nextProps} />;
  },
}));

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ children, href, ...rest }) => (
    <a href={typeof href === 'string' ? href : '#'} {...rest}>
      {children}
    </a>
  ),
}));

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

global.fetch = jest.fn();