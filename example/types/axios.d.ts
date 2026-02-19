import "axios";

declare module "axios" {
  interface AxiosRequestConfig<D = any> {
    skipAuthRefresh?: boolean;
    useCustomAuthHeader?: boolean;
  }

  interface InternalAxiosRequestConfig<D = any> {
    skipAuthRefresh?: boolean;
    useCustomAuthHeader?: boolean;
  }
}

