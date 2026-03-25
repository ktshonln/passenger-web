import axios, { AxiosRequestConfig } from "axios";

export const baseUrl = 'https://example.com/api/v1';

const axiosInstance = axios.create({
    baseURL: baseUrl, //"https://e2689ec1-a734-4f3a-80dd-77f1a45ef528.mock.pstmn.io",
});

class APIClient<TResponse> {
    endpoint: string;
    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }
    getAll = () => {
        return axiosInstance
            .get<TResponse>(this.endpoint)
            .then((res) => res.data);
    };

    get = (id: string | number) => {
        return axiosInstance
            .get<TResponse>(`${this.endpoint}/${id}`)
            .then((res) => res.data);
    };

    post = <TRequest>(input: TRequest) => {
        return axiosInstance
            .post<TResponse>(this.endpoint, input)
            .then((res) => res.data);
    };
    put = <TRequest>(input: TRequest, id: string | number) => {
        return axiosInstance
            .put<TResponse>(`${this.endpoint}/${id}`, input)
            .then((res) => res.data);
    };



    registerUser = <TRequest>(userData: TRequest) => {
        return axiosInstance
            .post<TResponse>(this.endpoint, userData)
            .then((res) => res.data);
    };
    searchDest = async <TRequest>(userData: TRequest) => {
        return axiosInstance
            .post<TResponse>(this.endpoint, userData)
            .then((res) => res.data)
            .catch((error) => {
                if (
                    error.response &&
                    error.response.data &&
                    error.response.data.message
                ) {
                    // Server responded with a message
                    throw new Error(error.response.data.message);
                } else {
                    throw new Error(error.message);
                }
            });
    };
}

export default APIClient;
