// Import your MemoraConfig as before
import MemoraConfig from "./MemoraConfig";
import TestResult from "./TestResult";

// Extend the Window interface to include the api property
declare global {
    interface Window {
        api: WindowApi;
        env: EnvironmentVariables
    }
}

interface EnvironmentVariables {
    isDev: boolean;
}

// Define the WindowApi interface as before
interface WindowApi {
    getImages: () => Promise<string[]>;
    getThumbnail(src: string): Promise<void>;
    setConfig: (config: MemoraConfig) => Promise<void>;
    getConfig: () => Promise<MemoraConfig>;
    connectionTestS3(config: MemoraConfig): Promise<TestResult>;
    connectionTestWebdav(config: MemoraConfig): Promise<TestResult>;
}


// Assign the api property on the window object
const api = window.api;
export const env = window.env;
export default api;
