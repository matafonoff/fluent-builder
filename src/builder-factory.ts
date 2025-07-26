import { BuilderWrapper, IBuilder, ReturnOfMethod, Type } from './builder-types';

/**
 * Internal low-level factory function that creates a proxy builder instance
 * for a given class and designated build method.
 *
 * @param cls - The constructor of the builder class.
 * @param buildMethod - The method name to invoke when building.
 * @param args - Arguments passed to the constructor.
 * @returns A chainable proxy implementing the builder pattern.
 */
function createBuilder<
    T extends IBuilder<TResult, TBuild>,
    TResult = void,
    TBuild extends string = 'build'
>(
    cls: Type<T>,
    buildMethod: TBuild,
    ...args: unknown[]
): BuilderWrapper<T, TResult, never, TBuild> {
    const instance = new cls(...args);
    const called = new Set<string>();

    const handler: ProxyHandler<any> = {
        get(target, prop) {
            if (typeof prop !== 'string') return undefined;

            if (prop === buildMethod) return () => target[prop]();

            const value = target[prop];

            if (typeof value === 'function') {
                const isOneTime = prop.startsWith('with');

                if (isOneTime && called.has(prop)) {
                    throw new Error(`Method '${prop}' already called`);
                }

                return (...args: any[]) => {
                    value.apply(target, args);
                    if (isOneTime) called.add(prop);
                    return new Proxy(target, handler);
                };
            }

            if (typeof value === 'object' && value !== null) {
                if (called.has(prop)) {
                    throw new Error(`Group '${prop}' already used`);
                }

                const groupProxy: any = {};
                for (const key in value) {
                    groupProxy[key] = (...args: any[]) => {
                        value[key](...args);
                        called.add(prop);
                        return new Proxy(target, handler);
                    };
                }
                return groupProxy;
            }

            return value;
        }
    };

    return new Proxy(instance, handler) as any;
}

/**
 * Returns a reusable builder factory for a given class and build method name.
 * Useful when you want to generate builder factories manually.
 *
 * @param cls - The builder class constructor.
 * @param buildMethod - The name of the method that finalizes the builder.
 * @returns A factory function that constructs builder instances.
 */
export function createBuilderFactoryFor<
    T extends IBuilder<TResult, TBuild>,
    TResult = void,
    TBuild extends string = 'build',
    C extends Type<T> = Type<T>
>(
    cls: C,
    buildMethod: TBuild
): (...args: ConstructorParameters<C>) => BuilderWrapper<T, TResult, never, TBuild> {
    return (...args: ConstructorParameters<C>) =>
        createBuilder<T, TResult, TBuild>(cls, buildMethod, ...args);
}



/**
 * Creates a builder factory using the default `build()` method.
 *
 * @param cls - A class implementing `IBuilder<ReturnType<build>, 'build'>`
 * @returns A builder factory function.
 */
export function createBuilderFactory<C extends new (...args: any[]) => any>(
    cls: C & (new (...args: any[]) => IBuilder<ReturnOfMethod<InstanceType<C>, 'build'>, 'build'>)
): (...args: ConstructorParameters<C>) => BuilderWrapper<InstanceType<C>, ReturnOfMethod<InstanceType<C>, 'build'>, never, 'build'>;

/**
 * Creates a builder factory using a custom build method (e.g. 'run').
 *
 * @param method - The name of the builder's final method.
 * @param cls - A class implementing `IBuilder<ReturnType<method>, method>`
 * @returns A builder factory function.
 */
export function createBuilderFactory<
    C extends new (...args: any[]) => any,
    T extends InstanceType<C>,
    M extends keyof T & string
>(
    method: M,
    cls: C & (new (...args: any[]) => IBuilder<ReturnOfMethod<T, M>, M>)
): (...args: ConstructorParameters<C>) => BuilderWrapper<T, ReturnOfMethod<T, M>, never, M>;

/**
 * Main runtime implementation for `createBuilderFactory`.
 * Supports both overloads: with or without a build method name.
 */
export function createBuilderFactory(...args: any[]): any {
    let buildMethod: string;
    let cls: new (...args: any[]) => any;

    if (typeof args[0] === 'function') {
        cls = args[0];
        buildMethod = 'build';
    } else {
        buildMethod = args[0];
        cls = args[1];
    }

    return (...ctorArgs: any[]) => createBuilder(cls, buildMethod, ...ctorArgs);
}

/**
 * Internal exports for advanced use (e.g., low-level builder control).
 */
export const advanced = {
    createBuilder,
    createBuilderFactoryFor
};
