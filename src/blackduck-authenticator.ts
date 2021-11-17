import * as core from '@actions/core'
import { IHeaders } from 'typed-rest-client/Interfaces'
import { HttpClient } from 'typed-rest-client/HttpClient'
import { APPLICATION_NAME } from './application-constants'

export async function retrieveBearerTokenFromBlackduck(blackduckUrl: string, blackduckApiToken: string) {
    core.info('Initiating authentication request to Black Duck...')
    const authenticationClient = new HttpClient(APPLICATION_NAME)
    const authorizationHeader: IHeaders = { "Authorization": `token ${blackduckApiToken}` }

    return authenticationClient.post(`${blackduckUrl}/api/tokens/authenticate`, '', authorizationHeader)
        .then(authenticationResponse => authenticationResponse.readBody())
        .then(responseBody => JSON.parse(responseBody))
        .then(responseBodyJson => {
            core.info('Successfully authenticated with Black Duck')
            return responseBodyJson.bearerToken
        })
}