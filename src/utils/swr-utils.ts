"use client"

import axios, {AxiosError, AxiosRequestConfig} from "axios";
import toast from "react-hot-toast";


export type MutatorArgs<T> = {
    arg: {
        body: T
    }
}


export const $get = <R>(token?: string, suppressErrorToast: boolean = false) =>
    (url: string) => axios.get(url, token ? {
        headers: {
            authorization: getBearerString(token)
        }
    } : undefined)
        .then(res => res.data as R)
        .catch(e => {
            if (!suppressErrorToast)
                return handleAxiosError(e)
            else console.error(e)
        })

export const $getWithArgs = <A extends Record<string, string>, R>(token?: string) => async (url: string, args?: MutatorArgs<A>): Promise<R | undefined> => {
    if (args) {
        const filteredBody = {...args.arg.body}
        Object.keys(filteredBody).forEach(key => {
            if (!filteredBody[key])
                delete filteredBody[key]
        })

        return axios.get(url + `?${new URLSearchParams(filteredBody).toString()}`, token ? {
            headers: {
                authorization: getBearerString(token)
            }
        } : undefined)
            .then(res => res.data as R)
            .catch(handleAxiosError)
    } else return $get<R>(token)(url)
}

export const $post = <B, R>(token?: string, config?: AxiosRequestConfig) => (url: string, {arg}: MutatorArgs<B>) => axios.post(url, arg.body, token || config ? {
    ...config,
    headers: {
        authorization: token && getBearerString(token),
        ...config?.headers
    },
} : undefined)
    .then(res => res.data as R)
    .catch(handleAxiosError)

export const $put = <B, R>(token?: string, config?: AxiosRequestConfig) => (url: string, {arg}: MutatorArgs<B>) => axios.put(url, arg.body, token || config ? {
    ...config,
    headers: {
        authorization: token && getBearerString(token),
        ...config?.headers
    },
} : undefined)
    .then(res => res.data as R)
    .catch(handleAxiosError)

export const $postWithoutArgs = <R>(token?: string) => (url: string) => axios.post(url, undefined, token ? {
    headers: {
        authorization: getBearerString(token)
    }
} : undefined)
    .then(res => res.data as R)
    .catch(handleAxiosError)

export const $patch = <B, R>(token?: string) => (url: string, {arg}: MutatorArgs<B>) => axios.patch(url, arg.body, token ? {
    headers: {
        authorization: getBearerString(token)
    }
} : undefined)
    .then(res => res.data as R)
    .catch(handleAxiosError)

export const $deleteWithArgs = <B extends Record<string, string> | undefined, R>(token?: string) => (url: string, args?: MutatorArgs<B>) => axios.delete(`${url}${args ? "?" + new URLSearchParams(args.arg.body).toString() : ""}`, token ? {
    headers: {
        authorization: getBearerString(token)
    }
} : undefined)
    .then(res => res.data as R)
    .catch(handleAxiosError)

export const $delete = <R>(token?: string) => (url: string) => axios.delete(url, token ? {
    headers: {
        authorization: getBearerString(token)
    }
} : undefined)
    .then(res => res.data as R)
    .catch(handleAxiosError)


export const getBearerString = (token: string) => `Bearer ${token}`

export function handleAxiosError(error: any): undefined {
    if (!(error instanceof AxiosError)) {
        console.error(error)
        toast.error("Something went wrong!")
        return undefined;
    }

    toast.error(error.response?.data.message ?? error.response?.statusText ?? "Something went wrong!")
    return undefined
}