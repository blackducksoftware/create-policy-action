import * as core from '@actions/core'
import { BearerCredentialHandler } from 'typed-rest-client/handlers'
import { IHeaders } from 'typed-rest-client/Interfaces'
import { RestClient } from 'typed-rest-client/RestClient'
import { APPLICATION_NAME } from './application-constants'
import { PolicyCreator, IPolicyExpressionParams } from './policy-creator'
import { HttpClient } from 'typed-rest-client/HttpClient'

function retrieveNumericInput(inputKey: string, defaultValue: number): number { 
    const inputValue: string = core.getInput(inputKey, { required: false })
    if (!inputValue) {
      return defaultValue
    }

    try {
      return parseInt(inputValue)
    } catch {
      throw new Error(`Invalid value for '${inputKey}': ${inputValue}`)
    }
 }

 function retrievePolicyEpressionParams(): IPolicyExpressionParams {
   return {
      maxCritical: retrieveNumericInput('max-critical', 0),
      maxHigh: retrieveNumericInput('max-high', 0),
      maxMedium: retrieveNumericInput('max-medium', 10),
      maxLow: retrieveNumericInput('max-low', 25)
   }
 }

async function run(): Promise<void> {
  const blackduckUrl = core.getInput('blackduck-url')
  const blackduckApiToken = core.getInput('blackduck-api-token')

  const policyEpressionParams: IPolicyExpressionParams = retrievePolicyEpressionParams()
  
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
  blackduckPolicyCreator.createPolicy('GitHub Action Policy', 'A default policy created for GitHub actions', policyEpressionParams)
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
