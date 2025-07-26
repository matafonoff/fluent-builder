/**
 * Example: Advanced usage of `@xelbera/fluent-builder`
 *
 * This example demonstrates the following features:
 *
 * - Custom build method: `run()` instead of default `build()`
 * - One-time methods prefixed with `withX(...)` (e.g., `withHost`)
 * - Multi-call methods prefixed with `addX(...)` (e.g., `addMiddleware`)
 * - Grouped method namespaces (e.g., `features.enableLogging()`)
 * - Strict typing throughout the chain (auto-inferred)
 *
 * This pattern is ideal for fluent DSLs like configuration builders,
 * UI component builders, pipelines, or environment bootstrappers.
 */

import { createBuilderFactory } from '@xelbera/fluent-builder';

// Define a complex builder with 'run' instead of 'build'
class ServerBuilder {
    private config = {
        host: 'localhost',
        port: 3000,
        secure: false,
        middlewares: [] as string[],
        features: {
            logging: false,
            compression: false
        }
    };

    withHost(host: string) {
        this.config.host = host;
        return this;
    }

    withPort(port: number) {
        this.config.port = port;
        return this;
    }

    withSecure() {
        this.config.secure = true;
        return this;
    }

    addMiddleware(name: string) {
        this.config.middlewares.push(name);
        return this;
    }

    features = {
        enableLogging: () => {
            this.config.features.logging = true;
            return this;
        },
        enableCompression: () => {
            this.config.features.compression = true;
            return this;
        }
    };

    run() {
        return this.config;
    }
}

// Create builder factory with custom final method name: 'run'
const createServer = createBuilderFactory('run', ServerBuilder);

// Use the fluent API
const server = createServer()
    .withHost('api.example.com')
    .withPort(8080)
    .withSecure()
    .addMiddleware('cors')
    .addMiddleware('auth')
    .features.enableLogging()
    .run();

console.log(server);

/*
  Output:
  {
    host: 'api.example.com',
    port: 8080,
    secure: true,
    middlewares: ['cors', 'auth'],
    features: {
      logging: true,
      compression: false
    }
  }
*/
