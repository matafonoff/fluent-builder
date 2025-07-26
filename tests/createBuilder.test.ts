import { advanced, createBuilderFactory } from '../src/builder-factory';

describe('createBuilderFactory', () => {
    it('should call build method and return correct result', () => {
        class TestBuilder {
            private _value = '';

            withValue(value: string) {
                this._value = value;
                return this;
            }

            build() {
                return `Hello, ${this._value}!`;
            }
        }

        const factory = createBuilderFactory(TestBuilder);
        const builder = factory();

        const result = builder.withValue('World').build();
        expect(result).toBe('Hello, World!');
    });

    it('should prevent calling withX method twice', () => {
        class TestBuilder {
            withName(name: string) {
                return this;
            }

            build() {
                return true;
            }
        }

        const factory = createBuilderFactory(TestBuilder);
        const builder = factory();

        builder.withName('first');
        expect(() => builder.withName('second')).toThrow("Method 'withName' already called");
    });

    it('should allow calling addX multiple times', () => {
        class TestBuilder {
            log: string[] = [];

            addTag(tag: string) {
                this.log.push(tag);
                return this;
            }

            build() {
                return this.log;
            }
        }

        const factory = createBuilderFactory(TestBuilder);
        const builder = factory();

        const result = builder.addTag('a').addTag('b').build();
        expect(result).toEqual(['a', 'b']);
    });

    it('should support grouped methods and block reuse', () => {
        class TestBuilder {
            result: string[] = [];

            options = {
                enable: () => {
                    this.result.push('enabled');
                    return this;
                },
                disable: () => {
                    this.result.push('disabled');
                    return this;
                }
            };

            build() {
                return this.result;
            }
        }

        const factory = createBuilderFactory(TestBuilder);
        const builder = factory();

        const result = builder.options.enable().build();
        expect(result).toEqual(['enabled']);
        expect(() => builder.options.disable()).toThrow("Group 'options' already used");
    });

    it('should work with createBuilderFactoryFor and custom method name', () => {
        class RunBuilder {
            run() {
                return 'done';
            }
        }

        const factory = advanced.createBuilderFactoryFor(RunBuilder, 'run');
        const builder = factory();

        expect(builder.run()).toBe('done');
    });
});
