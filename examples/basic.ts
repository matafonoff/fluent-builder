/**
 * Example: Basic usage of `@xelbera/fluent-builder`
 *
 * This example demonstrates the following features:
 *
 * - Standard build method: `build()`
 * - One-time methods prefixed with `withX(...)` (e.g., `withSize`)
 * - Multi-call methods prefixed with `addX(...)` (e.g., `addTopping`)
 * - Grouped method namespaces (e.g., `preferences.glutenFree()`)
 * - Strict typing throughout the chain (auto-inferred)
 *
 * This pattern is ideal for fluent DSLs like configuration builders,
 * UI component builders, pipelines, or environment bootstrappers.
 */

import { createBuilderFactory } from '@xelbera/fluent-builder';

type PizzaSize = 'small' | 'medium' | 'large';

// Create a builder factory
const createPizza = createBuilderFactory(class {
    private _size: PizzaSize = 'medium';
    private _toppings: string[] = [];

    private options = {
        glutenFree: false,
        extraCheese: false
    };

    withSize(size: PizzaSize) {
        this._size = size;
        return this;
    }

    addTopping(topping: string) {
        this._toppings.push(topping);
        return this;
    }

    preferences = {
        glutenFree: () => {
            this.options.glutenFree = true;
            return this;
        },
        extraCheese: () => {
            this.options.extraCheese = true;
            return this;
        }
    };

    build() {
        return {
            size: this._size,
            toppings: this._toppings,
            options: this.options
        };
    }
});

// Use the fluent builder
const pizza = createPizza()
    .withSize('large')
    .addTopping('pepperoni')
    .addTopping('mushrooms')
    .preferences.extraCheese()
    .build();

console.log(pizza);

/*
  Output:
  {
    size: 'large',
    toppings: ['pepperoni', 'mushrooms'],
    options: {
      glutenFree: false,
      extraCheese: true
    }
  }
*/
