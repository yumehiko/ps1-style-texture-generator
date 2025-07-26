// Web Worker関連の型定義

declare module '*?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

declare module '*?worker&inline' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}

// 特定のWorkerファイルの型定義
declare module '../workers/imageProcessing.worker.ts?worker' {
  const workerConstructor: {
    new (): Worker;
  };
  export default workerConstructor;
}