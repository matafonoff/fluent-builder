/**
 * @description
 *
 * Represents a type that a Component or other object is instances of.
 *
 * An example of a `Type` is `MyCustomComponent` class, which in JavaScript is represented by
 * the `MyCustomComponent` constructor function.
 *
 * @publicApi
 */
declare const Type: FunctionConstructor;
export interface Type<T> extends Function {
    new (...args: any[]): T;
}

/**
 * Defines a generic builder interface with a configurable method name.
 * The method is expected to return a result of type `TResult`.
 */
export type IBuilder<TResult = void, TMethodName extends string = 'build'> = {
    [K in TMethodName]: () => TResult;
};

/**
 * Extracts the return type of a method `M` from type `T`.
 */
export type ReturnOfMethod<T, M extends keyof T> =
    T[M] extends (...args: any[]) => infer R ? R : never;

/**
 * Extracts all method names (keys that are functions) from a given type.
 */
export type MethodKeys<T> = {
    [K in keyof T]: T[K] extends (...args: any[]) => any ? K : never;
}[keyof T];

/**
 * Extracts method names starting with "with" that are intended to be called only once.
 */
export type OneTimeMethodNames<T> = Extract<MethodKeys<T>, `with${string}`>;

/**
 * Extracts method names starting with "add", excluding the build method,
 * that are allowed to be called multiple times.
 */
export type MultiMethodNames<T, TBuild extends string> = Exclude<Extract<MethodKeys<T>, `add${string}`>, TBuild>;

/**
 * Extracts keys of nested objects whose values are method groups
 * (i.e. objects with function-valued properties).
 */
export type GroupMethodNames<T> = {
    [K in keyof T]: K extends string
    ? T[K] extends Record<string, (...args: any[]) => any>
    ? K
    : never
    : never;
}[keyof T];

/**
 * Generates proxy types for method groups, allowing chainable access to submethods.
 * Once a group is used, it cannot be reused in the same builder chain.
 */
export type GroupMethods<T extends IBuilder<TResult, TBuild>, TResult, Called extends string, TBuild extends string> = {
    [K in Exclude<GroupMethodNames<T>, Called>]: {
        [M in keyof T[K]]: T[K][M] extends (...args: infer A) => any
        ? (...args: A) => BuilderWrapper<T, TResult, Called | K, TBuild>
        : never;
    };
};

/**
 * Wrapper type for a builder class that enforces:
 * - one-time `withX` methods
 * - multi-use `addX` methods
 * - group methods (e.g. `.settings.toggle()`)
 * - a single build/submit method (`TBuild`)
 */
export type BuilderWrapper<
    T extends IBuilder<TResult, TBuild>,
    TResult = void,
    Called extends string = never,
    TBuild extends string = 'build'
> = {
    [K in Exclude<OneTimeMethodNames<T>, Called>]: T[K] extends (...args: infer A) => any
    ? (...args: A) => BuilderWrapper<T, TResult, Called | K, TBuild>
    : never;
} & {
        [K in MultiMethodNames<T, TBuild>]: T[K];
    } & GroupMethods<T, TResult, Called, TBuild> & {
        [K in TBuild]: () => TResult;
    };