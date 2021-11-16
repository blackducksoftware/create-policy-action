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

async function retrieveBearerTokenFromBlackduck(blackduckUrl: string, blackduckApiToken: string) {
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

function createPolicy(blackduckUrl: string, bearerToken: string, policyEpressionParams: IPolicyExpressionParams) {
  const bearerTokenHandler = new BearerCredentialHandler(bearerToken, true)
  const blackduckRestClient = new RestClient(APPLICATION_NAME, blackduckUrl, [bearerTokenHandler])

  core.info('Attempting to create a Black Duck policy...')
  const blackduckPolicyCreator = new PolicyCreator(blackduckRestClient)
  return blackduckPolicyCreator.createPolicy('GitHub Action Policy', 'A default policy created for GitHub actions', policyEpressionParams)
}

async function run(): Promise<void> {
  const blackduckUrl = core.getInput('blackduck-url')
  const blackduckApiToken = core.getInput('blackduck-api-token')

  const policyExpressionParams: IPolicyExpressionParams = retrievePolicyEpressionParams()

  retrieveBearerTokenFromBlackduck(blackduckUrl, blackduckApiToken)
    .then(bearerToken => createPolicy(blackduckUrl, bearerToken, policyExpressionParams))
    .then(response => {
      if (response.statusCode === 201) {
        core.info('Successfully created a Black Duck policy')
      } else {
        core.warning('Policy creation status unknown')
      }
    })
    .catch(err => {
      core.setFailed(`Failed to create policy: ${err}`)
    })
}

run()
