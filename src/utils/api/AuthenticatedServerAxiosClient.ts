import axios, { AxiosInstance } from "axios";

export class AuthenticatedServerAxiosClient {
    readonly client: AxiosInstance;

    constructor(private readonly token: string) {
        this.client = axios.create({
            baseURL: process.env.BASE_URL,
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        });
    }

}