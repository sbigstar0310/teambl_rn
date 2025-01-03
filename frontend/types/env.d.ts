/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // 여기에 추가 환경 변수를 정의하세요.
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}