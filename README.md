# fluent-builder

> A type-safe, fluent, chainable builder DSL for TypeScript.

## Install

```bash
npm install @xelbera/fluent-builder
```

-or-

```bash
yarn add @xelbera/fluent-builder
```

## Usage

```ts
import { createBuilderFactory } from '@xelbera/fluent-builder';

const builder = createBuilderFactory(class {
  withSomething(value: string) {
    return this;
  }
  build(): string {
    return 'done';
  }
});

builder().withSomething('value').build();
```

## License

MIT © Stepan Matafonov
