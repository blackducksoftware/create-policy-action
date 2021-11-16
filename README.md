# WIP
This action is in development and not ready for production use.

# Create Black Duck Policy Action
A GitHub action that will create a policy within a specified Black Duck instance

# Parameters
## Required
- blackduck-url: string
- blackduck-api-token: string
## Optional
- max-critical: number
  - default: 0
- max-high: number
  - default: 0
- max-medium: number
  - default: 10
- max-low: number
  - default: 25

# Troubleshooting
## Certificates
Currently, importing certificates is only supported on self-hosted runners. To include a trusted certificate, set the environment variable `NODE_EXTRA_CA_CERTS` to the path to the certificate (in _pem_ format).
**Note**: Ensure spaces in the file-path are properly escaped or the certificate may not be properly imported.
### Example
```yaml
jobs:
  create-policy:
    runs-on: self-hosted
    steps:
      - name: Create Black Duck Policy
        env:
          NODE_EXTRA_CA_CERTS: ${{ secrets.LOCAL_CA_CERT_PATH }}
        uses: blackducksoftware/create-policy-action@main
        with:
          blackduck-url: ${{ secrets.TEST_BLACKDUCK_URL }}
          blackduck-api-token: ${{ secrets.TEST_BLACKDUCK_API_TOKEN }}
```