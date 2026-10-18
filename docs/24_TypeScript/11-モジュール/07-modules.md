# モジュールシステム

## 目次
- [[06-functions|← 前章: 関数とジェネリクス]]
- [[08-advanced-types|次章: 高度な型システム →]]

## モジュールの基礎

### ES6モジュール

**モジュール**はコードを分割し、再利用可能な単位にまとめる仕組みです。

```typescript
// math.ts - 数学関数のモジュール
export function add(a: number, b: number): number {
  return a + b;
}

export function subtract(a: number, b: number): number {
  return b - a;
}

export function multiply(a: number, b: number): number {
  return a * b;
}

export function divide(a: number, b: number): number {
  if (b === 0) {
    throw new Error("Division by zero");
  }
  return a / b;
}

// デフォルトエクスポート
export default function calculate(operation: string, a: number, b: number): number {
  switch (operation) {
    case "add":
      return add(a, b);
    case "subtract":
      return subtract(a, b);
    case "multiply":
      return multiply(a, b);
    case "divide":
      return divide(a, b);
    default:
      throw new Error(`Unknown operation: ${operation}`);
  }
}
```

### インポートとエクスポート

```typescript
// main.ts - メインファイル
// 名前付きインポート
import { add, subtract, multiply } from './math';

// デフォルトインポート
import calculate from './math';

// 名前空間インポート
import * as MathUtils from './math';

// エイリアス付きインポート
import { add as addNumbers, subtract as subtractNumbers } from './math';

// 使用例
console.log(add(5, 3)); // 8
console.log(subtract(3, 5)); // 2
console.log(calculate("multiply", 4, 6)); // 24
console.log(MathUtils.divide(10, 2)); // 5
console.log(addNumbers(1, 2)); // 3
```

### 型のエクスポート

```typescript
// types.ts - 型定義のモジュール
export interface User {
  id: number;
  name: string;
  email: string;
  age?: number;
}

export type Status = "active" | "inactive" | "pending";

export interface ApiResponse<T> {
  data: T;
  status: number;
  message: string;
}

// 型のデフォルトエクスポート
export default interface Config {
  host: string;
  port: number;
  database: string;
}

// 型の再エクスポート
export type { User as UserType };
```

```typescript
// user-service.ts - 型を使用するモジュール
import { User, Status, ApiResponse } from './types';
import Config from './types';

class UserService {
  private config: Config;

  constructor(config: Config) {
    this.config = config;
  }

  async getUser(id: number): Promise<ApiResponse<User>> {
    // 実装
    return {
      data: { id, name: "John", email: "john@example.com" },
      status: 200,
      message: "Success"
    };
  }

  async updateUserStatus(id: number, status: Status): Promise<ApiResponse<User>> {
    // 実装
    return {
      data: { id, name: "John", email: "john@example.com" },
      status: 200,
      message: "Status updated"
    };
  }
}

export default UserService;
```

## モジュールの構造

### バレルエクスポート

```typescript
// index.ts - バレルエクスポートファイル
// 数学関数の再エクスポート
export { add, subtract, multiply, divide } from './math';
export { default as calculate } from './math';

// 型の再エクスポート
export type { User, Status, ApiResponse } from './types';
export type { default as Config } from './types';

// サービスの再エクスポート
export { default as UserService } from './user-service';

// 定数のエクスポート
export const API_BASE_URL = 'https://api.example.com';
export const DEFAULT_TIMEOUT = 5000;
```

```typescript
// 使用例
import { 
  add, 
  calculate, 
  User, 
  UserService, 
  API_BASE_URL 
} from './index';

const userService = new UserService({
  host: API_BASE_URL,
  port: 3000,
  database: "myapp"
});
```

### サブモジュール

```typescript
// utils/index.ts
export * from './string-utils';
export * from './array-utils';
export * from './date-utils';

// utils/string-utils.ts
export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

export function truncate(str: string, length: number): string {
  return str.length > length ? str.slice(0, length) + '...' : str;
}

// utils/array-utils.ts
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)];
}

// utils/date-utils.ts
export function formatDate(date: Date, format: string = 'YYYY-MM-DD'): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  
  return format
    .replace('YYYY', String(year))
    .replace('MM', month)
    .replace('DD', day);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
```

## 動的インポート

### 遅延ローディング

```typescript
// lazy-loading.ts
interface ModuleLoader<T> {
  load(): Promise<T>;
  isLoaded: boolean;
}

class LazyModule<T> implements ModuleLoader<T> {
  private module: T | null = null;
  public isLoaded = false;

  constructor(private importFn: () => Promise<T>) {}

  async load(): Promise<T> {
    if (!this.isLoaded) {
      this.module = await this.importFn();
      this.isLoaded = true;
    }
    return this.module!;
  }
}

// 使用例
const mathModule = new LazyModule(() => import('./math'));
const utilsModule = new LazyModule(() => import('./utils'));

async function performCalculations() {
  const math = await mathModule.load();
  const utils = await utilsModule.load();
  
  console.log(math.add(5, 3));
  console.log(utils.capitalize("hello"));
}
```

### 条件付きインポート

```typescript
// conditional-imports.ts
async function loadFeature(featureName: string) {
  switch (featureName) {
    case 'math':
      const math = await import('./math');
      return math.default;
    
    case 'utils':
      const utils = await import('./utils');
      return utils;
    
    case 'user-service':
      const userService = await import('./user-service');
      return userService.default;
    
    default:
      throw new Error(`Unknown feature: ${featureName}`);
  }
}

// 環境に応じたインポート
async function loadEnvironmentSpecificModule() {
  if (process.env.NODE_ENV === 'production') {
    return await import('./production-config');
  } else {
    return await import('./development-config');
  }
}
```

## モジュールの型定義

### 型定義ファイル（.d.ts）

```typescript
// types/global.d.ts
declare global {
  interface Window {
    myApp: {
      version: string;
      config: any;
    };
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'development' | 'production' | 'test';
      API_URL: string;
      DATABASE_URL: string;
    }
  }
}

export {};

// types/module.d.ts
declare module '*.json' {
  const value: any;
  export default value;
}

declare module '*.css' {
  const content: { [className: string]: string };
  export default content;
}

declare module '*.png' {
  const src: string;
  export default src;
}

// types/external-module.d.ts
declare module 'external-library' {
  export interface ExternalConfig {
    apiKey: string;
    endpoint: string;
  }
  
  export class ExternalClient {
    constructor(config: ExternalConfig);
    request(path: string): Promise<any>;
  }
}
```

### モジュール拡張

```typescript
// extensions/express.d.ts
import { Request, Response, NextFunction } from 'express';

declare module 'express' {
  interface Request {
    user?: {
      id: number;
      name: string;
      role: string;
    };
  }
  
  interface Response {
    success(data: any): void;
    error(message: string, status?: number): void;
  }
}

// extensions/lodash.d.ts
import { LoDashStatic } from 'lodash';

declare module 'lodash' {
  interface LoDashStatic {
    deepClone<T>(obj: T): T;
    safeGet<T>(obj: any, path: string, defaultValue?: T): T;
  }
}
```

## モジュールの設定

### tsconfig.jsonの設定

```json
{
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "node",
    "target": "ES2020",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/utils/*": ["utils/*"],
      "@/types/*": ["types/*"]
    },
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": [
    "src/**/*",
    "types/**/*"
  ],
  "exclude": [
    "node_modules",
    "dist"
  ]
}
```

### パスマッピング

```typescript
// src/components/Button.tsx
import { ButtonProps } from '@/types/components';
import { cn } from '@/utils/classnames';

export function Button({ children, className, ...props }: ButtonProps) {
  return (
    <button className={cn('btn', className)} {...props}>
      {children}
    </button>
  );
}

// src/utils/classnames.ts
export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ');
}

// src/types/components.ts
export interface ButtonProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
}
```

## 実践的なモジュール設計

### レイヤーアーキテクチャ

```typescript
// src/domain/entities/User.ts
export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}

export class UserEntity implements User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public createdAt: Date,
    public updatedAt: Date
  ) {}

  static create(data: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): UserEntity {
    const now = new Date();
    return new UserEntity(0, data.name, data.email, now, now);
  }

  update(data: Partial<Pick<User, 'name' | 'email'>>): void {
    if (data.name) this.name = data.name;
    if (data.email) this.email = data.email;
    this.updatedAt = new Date();
  }
}

// src/domain/repositories/UserRepository.ts
import { User } from '../entities/User';

export interface UserRepository {
  findById(id: number): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  save(user: User): Promise<User>;
  update(user: User): Promise<User>;
  delete(id: number): Promise<void>;
}

// src/infrastructure/repositories/UserRepositoryImpl.ts
import { UserRepository } from '@/domain/repositories/UserRepository';
import { User } from '@/domain/entities/User';

export class UserRepositoryImpl implements UserRepository {
  private users: User[] = [];

  async findById(id: number): Promise<User | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find(user => user.email === email) || null;
  }

  async save(user: User): Promise<User> {
    const newUser = { ...user, id: this.users.length + 1 };
    this.users.push(newUser);
    return newUser;
  }

  async update(user: User): Promise<User> {
    const index = this.users.findIndex(u => u.id === user.id);
    if (index === -1) throw new Error('User not found');
    
    this.users[index] = user;
    return user;
  }

  async delete(id: number): Promise<void> {
    const index = this.users.findIndex(u => u.id === id);
    if (index === -1) throw new Error('User not found');
    
    this.users.splice(index, 1);
  }
}

// src/application/services/UserService.ts
import { UserRepository } from '@/domain/repositories/UserRepository';
import { User, UserEntity } from '@/domain/entities/User';

export class UserService {
  constructor(private userRepository: UserRepository) {}

  async createUser(name: string, email: string): Promise<User> {
    const user = UserEntity.create({ name, email });
    return await this.userRepository.save(user);
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.userRepository.findById(id);
  }

  async updateUser(id: number, data: Partial<Pick<User, 'name' | 'email'>>): Promise<User> {
    const user = await this.userRepository.findById(id);
    if (!user) throw new Error('User not found');

    const userEntity = new UserEntity(
      user.id,
      user.name,
      user.email,
      user.createdAt,
      user.updatedAt
    );
    
    userEntity.update(data);
    return await this.userRepository.update(userEntity);
  }

  async deleteUser(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
```

### 依存性注入

```typescript
// src/di/container.ts
import { UserRepository } from '@/domain/repositories/UserRepository';
import { UserRepositoryImpl } from '@/infrastructure/repositories/UserRepositoryImpl';
import { UserService } from '@/application/services/UserService';

export class Container {
  private static instance: Container;
  private services = new Map<string, any>();

  private constructor() {
    this.registerServices();
  }

  static getInstance(): Container {
    if (!Container.instance) {
      Container.instance = new Container();
    }
    return Container.instance;
  }

  private registerServices(): void {
    // リポジトリの登録
    this.services.set('UserRepository', new UserRepositoryImpl());
    
    // サービスの登録
    const userRepository = this.services.get('UserRepository') as UserRepository;
    this.services.set('UserService', new UserService(userRepository));
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service ${serviceName} not found`);
    }
    return service;
  }
}

// src/index.ts
import { Container } from './di/container';
import { UserService } from './application/services/UserService';

const container = Container.getInstance();
const userService = container.get<UserService>('UserService');

// 使用例
async function main() {
  try {
    const user = await userService.createUser('John Doe', 'john@example.com');
    console.log('Created user:', user);
    
    const foundUser = await userService.getUserById(user.id);
    console.log('Found user:', foundUser);
  } catch (error) {
    console.error('Error:', error);
  }
}

main();
```

## 練習問題

### 問題1
1. 基本的なモジュールを作成してください：
   - エクスポートとインポートの実装
   - 型定義のエクスポート
   - バレルエクスポート

### 問題2
1. 高度なモジュール機能を実装してください：
   - 動的インポート
   - 条件付きインポート
   - モジュール拡張

### 問題3
1. 実践的なモジュール設計を実装してください：
   - レイヤーアーキテクチャ
   - 依存性注入
   - 型定義ファイル

## まとめ

- ES6モジュールの基本概念
- エクスポートとインポートの使用方法
- 動的インポートと遅延ローディング
- 型定義ファイルとモジュール拡張
- モジュール設定とパスマッピング
- 実践的なモジュール設計パターン

---

**前の章**: [[06-functions|関数とジェネリクス]]
**次の章**: [[08-advanced-types|高度な型システム]] 