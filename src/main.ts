import * as core from '@actions/core'
import { BearerCredentialHandler } from 'typed-rest-client/Handlers'
import { RestClient } from 'typed-rest-client/RestClient'
import { APPLICATION_NAME } from './application-constants'
import { PolicyCreator, IPolicyExpressionParams } from './policy-creator'
import { retrievePolicyEpressionParams } from './input-retriever'
import { retrieveBearerTokenFromBlackduck } from './blackduck-authenticator'

const ERR_CODE_POLICY_EXISTS = 'policy.rule.constraint_violation.uniqueidx_policy_rule_name'
const INPUT_NO_FAIL_FLAG = 'no-fail-if-policy-exists'

function connectAndCreatePolicy(blackduckUrl: string, bearerToken: string, policyName: string, policyDescription: string, policyEpressionParams: IPolicyExpressionParams) {
  const bearerTokenHandler = new BearerCredentialHandler(bearerToken, true)
  const blackduckRestClient = new RestClient(APPLICATION_NAME, blackduckUrl, [bearerTokenHandler])

  core.info('Attempting to create a Black Duck policy...')
  const blackduckPolicyCreator = new PolicyCreator(blackduckRestClient)
  return blackduckPolicyCreator.createPolicy(policyName, policyDescription, policyEpressionParams)
}

async function run(): Promise<void> {
  const blackduckUrl = core.getInput('blackduck-url')
  const blackduckApiToken = core.getInput('blackduck-api-token')

  const noFailIfPolicyExists = core.getBooleanInput(INPUT_NO_FAIL_FLAG) || false

  const policyName = core.getInput('policy-name')
  const policyDescription = core.getInput('policy-description')
  const policyExpressionParams: IPolicyExpressionParams = retrievePolicyEpressionParams()

  retrieveBearerTokenFromBlackduck(blackduckUrl, blackduckApiToken)
    .then(bearerToken => connectAndCreatePolicy(blackduckUrl, bearerToken, policyName, policyDescription, policyExpressionParams))
    .then(response => {
      if (response.statusCode === 201) {
        core.info('Successfully created a Black Duck policy')
      } else {
        core.warning('Policy creation status unknown')
      }
    })
    .catch(err => {
      if (err.message && (err.message as string).startsWith('{')) {
        const errorJson = JSON.parse(err.message)
        if (noFailIfPolicyExists && errorJson.errorCode && errorJson.errorCode.includes(ERR_CODE_POLICY_EXISTS)) {
          core.info(`Policy already exists, but '${INPUT_NO_FAIL_FLAG}' is set.`)
          return
        }
        core.warning(errorJson.errorMessage)
      }

      core.setFailed('Failed to create policy')
    })
}

run()
