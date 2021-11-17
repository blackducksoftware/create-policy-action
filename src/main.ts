import * as core from '@actions/core'
import { BearerCredentialHandler } from 'typed-rest-client/handlers'
import { RestClient } from 'typed-rest-client/RestClient'
import { APPLICATION_NAME } from './application-constants'
import { PolicyCreator, IPolicyExpressionParams } from './policy-creator'
import { retrievePolicyEpressionParams } from './input-retriever'
import { retrieveBearerTokenFromBlackduck } from './blackduck-authenticator'

function connectAndCreatePolicy(blackduckUrl: string, bearerToken: string, policyEpressionParams: IPolicyExpressionParams) {
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
    .then(bearerToken => connectAndCreatePolicy(blackduckUrl, bearerToken, policyExpressionParams))
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
