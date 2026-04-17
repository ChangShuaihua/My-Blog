// next-env.d.ts 或 global.d.ts
/// <reference types="next" />
/// <reference types="next/image-types/global" />

// 声明所有.css文件为合法模块
declare module '*.css';
// 如需支持其他样式文件，可补充：
// declare module '*.scss';
// declare module '*.sass';
// declare module '*.less';