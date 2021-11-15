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
  
  // Initiate Authentication Request
  core.info('Initiating authentication request...')
  const authenticationClient = new HttpClient(APPLICATION_NAME)
  const authorizationHeader: IHeaders = { "Authorization": `token ${blackduckApiToken}` }
  const authenticationResponse = await authenticationClient.post(`${blackduckUrl}/api/tokens/authenticate`, '', authorizationHeader)

  // Extract Bearer Token
  core.info('Extracting authenticaiton token...')
  const responseBody = await authenticationResponse.readBody()
  const responseBodyJson = JSON.parse(responseBody)
  const bearerToken : string = responseBodyJson.bearerToken

  // Create REST Client w/ Bearer Token
  const bearerTokenHandler = new BearerCredentialHandler(bearerToken, true)
  const blackduckRestClient = new RestClient(APPLICATION_NAME, blackduckUrl, [bearerTokenHandler])
  
  // Create Black Duck Policy
  core.info('Attempting to create a Black Duck policy...')
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
