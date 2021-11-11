import * as core from '@actions/core'
import { BearerCredentialHandler } from 'typed-rest-client/handlers'
import { IHeaders } from 'typed-rest-client/Interfaces'
import { RestClient } from 'typed-rest-client/RestClient'
import { APPLICATION_NAME } from './applicationConstants'
import { PolicyCreator } from './policyCreator'
import { HttpClient } from 'typed-rest-client/HttpClient'

async function run(): Promise<void> {
  const blackduckUrl = core.getInput('blackduck-url')
  const blackduckApiToken = core.getInput('blackduck-api-token')

  const blackduckUrlSize = blackduckUrl.length
  core.info(`Got Black Duck URL. Length: ${blackduckUrlSize}`)

  const blackduckApiTokenSize = blackduckApiToken.length
  core.info(`Got Black Duck API Token. Length: ${blackduckApiTokenSize}`)
  
  const authenticationClient = new HttpClient(APPLICATION_NAME)
  const authorizationHeader: IHeaders = { "Authorization": `token ${blackduckApiToken}` }
  const authenticationResponse = await authenticationClient.post(`${blackduckUrl}/api/tokens/authenticate`, '', authorizationHeader)

  const responseBody = await authenticationResponse.readBody()
  const responseBodyJson = JSON.parse(responseBody)
  const bearerToken : string = responseBodyJson.bearerToken

  const bearerTokenHandler = new BearerCredentialHandler(bearerToken, true)
  const blackduckRestClient = new RestClient(APPLICATION_NAME, blackduckUrl, [bearerTokenHandler])
  
  const blackduckPolicyCreator = new PolicyCreator(blackduckRestClient)
  blackduckPolicyCreator.createPolicy('GitHub Action Policy', 'A default policy created for GitHub actions')
    .then(response => {
      if (response.statusCode === 201) {
        core.info('Successfully created a policy')
      } else {
        core.warning('Policy creation status unknown')
      }
    })
    .catch(error => {
      core.setFailed(`Failed to create policy: ${error}`)
    })
}

run()
