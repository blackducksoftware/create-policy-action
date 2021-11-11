import * as core from '@actions/core'
import { IRequestHandler, IHttpClient, IRequestInfo, IHttpClientResponse, IHeaders } from "typed-rest-client/Interfaces";

export class BlackDuckApiTokenRequestHandler implements IRequestHandler {
    baseUrl: string
    apiToken: string
    bearerToken?: string
    origin?: string

    constructor(baseUrl: string, apiToken: string) {
        this.baseUrl = baseUrl
        this.apiToken = apiToken
    }

    prepareRequest(options: any) {
        if (!this.origin) {
            this.origin = options.host
        }

        // If this is a redirection, don't set the Authorization header
        if (this.origin === options.host) {
            options.headers['Authorization'] = `Bearer ${this.bearerToken}`
        }

        options.headers['X-TFS-FedAuthRedirect'] = 'Suppress'
    }

    canHandleAuthentication(response: IHttpClientResponse) {
        core.info(`Response: ${response}`)
        core.info(`Response message: ${response?.message}`)
        core.info(`Response status message: ${response?.message?.statusMessage}`)
        return response?.message?.statusCode === 401
    }

    handleAuthentication(httpClient: IHttpClient, requestInfo: IRequestInfo, objs: any) : Promise<IHttpClientResponse> {
        core.info('Handling authentication...')
        return new Promise((resolve, reject) => {
            const authHeader: IHeaders = { "Authorization": this.apiToken }
            httpClient.post(`${this.baseUrl}/api/tokens/authenticate`, '', authHeader)
                .then(response => {
                    core.info(`Authentication response: ${response?.message?.statusCode}`)
                    response.readBody().then(responseBody => {
                        const responseBodyJson = JSON.parse(responseBody)
                        this.bearerToken = responseBodyJson.bearerToken
                })
                .catch(reject)
                .finally(() => resolve(response))
            })
        });
    }


}